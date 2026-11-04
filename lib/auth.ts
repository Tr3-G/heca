import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { getStaffByEmail, getStaffById, updateStaffPassword, StaffMember } from './db';

// In-memory active sessions: token -> { id, email, name, role, phone, expiresAt }
interface SessionData {
  id: string | number;
  email: string;
  name: string;
  role: string;
  phone: string;
  expiresAt: number;
}

const sessions = new Map<string, SessionData>();

export function createSession(staff: StaffMember): string {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  sessions.set(token, {
    id: staff.id,
    email: staff.email,
    name: staff.name,
    role: staff.role,
    phone: staff.phone,
    expiresAt,
  });
  return token;
}

export function getSession(token: string | null | undefined): SessionData | null {
  if (!token) return null;
  const cleanToken = token.startsWith('Bearer ') ? token.slice(7).trim() : token.trim();
  const session = sessions.get(cleanToken);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    sessions.delete(cleanToken);
    return null;
  }
  return session;
}

export function removeSession(token: string | null | undefined): boolean {
  if (!token) return false;
  const cleanToken = token.startsWith('Bearer ') ? token.slice(7).trim() : token.trim();
  return sessions.delete(cleanToken);
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
    phone: tempPassword
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
