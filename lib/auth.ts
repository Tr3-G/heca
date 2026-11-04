import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { getStaffByEmail, getStaffById, updateStaffPassword, StaffMember } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'heca-secret-token-key-2027-pan-african-excellence';

export interface TokenPayload {
  id: string | number;
  email: string;
  name: string;
  role: string;
  phone: string;
  exp: number; // Unix timestamp in seconds
}

function base64UrlEncode(input: string | Buffer): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input, 'utf-8');
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf-8');
}

/**
 * Creates a stateless signed JWT token using HMAC SHA-256.
 * The token contains the staff member's credentials and expires in 7 days.
 */
export function createToken(staff: StaffMember): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days in seconds
  const payload: TokenPayload = {
    id: staff.id,
    email: staff.email,
    name: staff.name,
    role: staff.role,
    phone: staff.phone,
    exp,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest();
  const encodedSignature = base64UrlEncode(signature);

  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

/**
 * Verifies the HMAC SHA-256 signature and expiration of a JWT token string.
 */
export function verifyToken(token: string | null | undefined): TokenPayload | null {
  if (!token) return null;
  let cleanToken = token.startsWith('Bearer ') ? token.slice(7).trim() : token.trim();

  // If token is URL-encoded, decode it
  if (cleanToken.includes('%')) {
    try {
      cleanToken = decodeURIComponent(cleanToken);
    } catch {}
  }

  const parts = cleanToken.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, encodedSignature] = parts;

  // Compute expected signature
  const expectedSignature = base64UrlEncode(
    crypto.createHmac('sha256', JWT_SECRET).update(`${encodedHeader}.${encodedPayload}`).digest()
  );

  // Timing-safe comparison to guard against timing attacks
  if (expectedSignature.length !== encodedSignature.length) return null;
  try {
    const isSignatureValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(encodedSignature)
    );
    if (!isSignatureValid) return null;
  } catch {
    return null;
  }

  try {
    const payloadStr = base64UrlDecode(encodedPayload);
    const payload: TokenPayload = JSON.parse(payloadStr);

    // Verify token expiry
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Extracts and verifies authentication token directly from request cookies or headers.
 * Checks cookies: 'heca_token', 'token', 'heca_session'.
 * Checks headers: 'Authorization: Bearer <token>', 'x-admin-token'.
 */
export function getAuthFromRequest(req: Request): TokenPayload | null {
  // 1. Check Cookie header (token stored in cookie)
  const cookieHeader = req.headers.get('cookie') || '';
  if (cookieHeader) {
    // Match heca_token=..., token=..., or heca_session=...
    const matches = cookieHeader.match(/(?:heca_token|token|heca_session)=([^;]+)/g);
    if (matches) {
      for (const m of matches) {
        const val = m.split('=')[1]?.trim();
        if (val) {
          const verified = verifyToken(val);
          if (verified) return verified;
        }
      }
    }
  }

  // 2. Check Authorization or x-admin-token header
  const authHeader = req.headers.get('authorization') || req.headers.get('x-admin-token');
  if (authHeader) {
    const verified = verifyToken(authHeader);
    if (verified) return verified;
  }

  return null;
}

// Aliases for seamless backward compatibility
export const createSession = createToken;
export const getSession = (tokenOrReq: any): TokenPayload | null => {
  if (!tokenOrReq) return null;
  if (typeof tokenOrReq === 'object' && typeof tokenOrReq.headers?.get === 'function') {
    return getAuthFromRequest(tokenOrReq);
  }
  return verifyToken(String(tokenOrReq));
};
export function removeSession(token?: string | null): boolean {
  return true;
}

export async function verifyStaffCredentials(email: string, password: string): Promise<StaffMember | null> {
  const staff = await getStaffByEmail(email);
  if (!staff || !staff.password) return null;

  // 1. Try bcrypt compare
  const isBcryptMatch = await bcrypt.compare(password, staff.password).catch(() => false);
  if (isBcryptMatch) return staff;

  // 2. Direct string match (e.g. if plain text or temporarily reset)
  if (staff.password === password) {
    // Re-hash for safety
    await updateStaffPassword(staff.id, password);
    return staff;
  }

  // 3. Temporary phone number password match (in case password was stored as phone number)
  if (password.trim() === staff.phone.trim()) {
    // Update hash to bcrypt
    await updateStaffPassword(staff.id, password);
    return staff;
  }

  return null;
}

export async function handleForgotPassword(email: string): Promise<{ success: boolean; message: string; phone?: string }> {
  const staff = await getStaffByEmail(email);
  if (!staff) {
    return {
      success: false,
      message: 'No staff account found with this email address.',
    };
  }

  // Temporarily set their password to their current phone number
  const tempPassword = staff.phone.trim();
  await updateStaffPassword(staff.id, tempPassword);

  return {
    success: true,
    message: `Your password has been temporarily reset to your phone number (${tempPassword}). You can now log in using this temporary password and proceed to the Change Password page.`,
    phone: tempPassword,
  };
}

export async function handleChangePassword(
  staffId: string | number,
  oldPass: string,
  newPass: string
): Promise<{ success: boolean; message: string }> {
  const staff = await getStaffById(staffId);
  if (!staff || !staff.password) {
    return { success: false, message: 'Staff record not found.' };
  }

  // Verify old password
  const isMatch = await bcrypt.compare(oldPass, staff.password).catch(() => false);
  const isDirect = staff.password === oldPass || staff.phone.trim() === oldPass.trim();

  if (!isMatch && !isDirect) {
    return { success: false, message: 'The current password you entered is incorrect.' };
  }

  if (newPass.length < 6) {
    return { success: false, message: 'New password must be at least 6 characters long.' };
  }

  await updateStaffPassword(staff.id, newPass);
  return { success: true, message: 'Password has been updated successfully. Please use your new password next time.' };
}
