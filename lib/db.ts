import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { getCachedMedia, setCachedMedia } from './cache';

const DATA_DIR = path.join(process.cwd(), 'data');
const LOCAL_POSTS_FILE = path.join(DATA_DIR, 'posts.json');
const LOCAL_NOMINATIONS_FILE = path.join(DATA_DIR, 'nominations.json');
const DEFAULT_GALLERY_FILE = path.join(DATA_DIR, 'default-gallery.json');
const LOCAL_STAFF_FILE = path.join(DATA_DIR, 'staff.json');
const LOCAL_MEDIA_FILE = path.join(DATA_DIR, 'media.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.warn('Data dir creation warning:', e);
  }
}

let pool: Pool | null = null;
let isPostgresReady = false;

if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '') {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('localhost')
        ? false
        : { rejectUnauthorized: false },
    });
  } catch (err: any) {
    console.error('Failed to initialize PostgreSQL pool:', err.message);
  }
}

// Fallback local file helpers
function readLocal<T = any>(filePath: string): T[] {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (e: any) {
    console.error('Error reading local file:', filePath, e.message);
  }
  return [];
}

function writeLocal(filePath: string, data: any) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e: any) {
    console.error('Error writing local file:', filePath, e.message);
  }
}

let dbInitialized = false;

export async function initDb() {
  if (dbInitialized) return;

  if (pool) {
    try {
      const client = await pool.connect();
      try {
        // Create tables
        await client.query(`
          CREATE TABLE IF NOT EXISTS staff (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            phone VARCHAR(100) NOT NULL,
            password TEXT NOT NULL,
            role VARCHAR(50) DEFAULT 'staff',
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS blog_posts (
            id SERIAL PRIMARY KEY,
            slug VARCHAR(255) UNIQUE,
            title TEXT NOT NULL,
            author VARCHAR(255),
            date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            excerpt TEXT,
            body TEXT NOT NULL,
            cover_id TEXT,
            views INTEGER DEFAULT 0,
            likes INTEGER DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS gallery_items (
            id SERIAL PRIMARY KEY,
            drive_id TEXT NOT NULL UNIQUE,
            name TEXT,
            alt TEXT,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS nominations (
            id SERIAL PRIMARY KEY,
            nominee_name TEXT NOT NULL,
            nominee_email TEXT,
            nominee_phone TEXT,
            organisation TEXT,
            category TEXT NOT NULL,
            biography TEXT,
            achievements TEXT,
            impact TEXT,
            reasons TEXT,
            supporting TEXT,
            nominator_name TEXT NOT NULL,
            nominator_email TEXT,
            nominator_phone TEXT,
            status VARCHAR(50) DEFAULT 'Pending Review',
            notes TEXT,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS media_files (
            id SERIAL PRIMARY KEY,
            filename TEXT NOT NULL,
            mime_type TEXT NOT NULL,
            data BYTEA NOT NULL,
            size INTEGER NOT NULL,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
          );
        `);

        // Ensure views and likes columns exist if blog_posts already existed
        await client.query(`
          ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
          ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;
        `);

        // Check if admin staff exists, if not seed it
        const adminCheck = await client.query('SELECT * FROM staff WHERE LOWER(email) = LOWER($1)', ['admin@heca.ng']);
        if (adminCheck.rows.length === 0) {
          const hashedPass = await bcrypt.hash('Heca123!!!', 10);
          await client.query(`
            INSERT INTO staff (name, email, phone, password, role)
            VALUES ($1, $2, $3, $4, $5)
          `, ['administrator', 'admin@heca.ng', '+2348069552027', hashedPass, 'admin']);
          console.log('✅ Pre-seeded administrator staff: admin@heca.ng / Heca123!!!');
        }

        // Seed initial blog posts from posts.json if table is empty
        const postCheck = await client.query('SELECT COUNT(*) FROM blog_posts');
        if (parseInt(postCheck.rows[0].count, 10) === 0) {
          const localPosts = readLocal(LOCAL_POSTS_FILE);
          for (const p of localPosts) {
            await client.query(`
              INSERT INTO blog_posts (title, author, date, excerpt, body, cover_id, views, likes)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [p.title, p.author, p.date || new Date(), p.excerpt, p.body, p.coverId || null, p.views || 0, p.likes || 0]);
          }
          console.log(`✅ Seeded ${localPosts.length} initial blog posts`);
        }

        isPostgresReady = true;
        dbInitialized = true;
        console.log('✅ PostgreSQL database and media_files BYTEA table verified.');
      } finally {
        client.release();
      }
    } catch (err: any) {
      console.warn('⚠️ PostgreSQL connection failed:', err.message);
      isPostgresReady = false;
    }
  }

  // Local fallback seeding if Postgres is unavailable
  if (!isPostgresReady) {
    const staffList = readLocal(LOCAL_STAFF_FILE);
    if (!staffList.some((s: any) => s.email?.toLowerCase() === 'admin@heca.ng')) {
      const hashedPass = await bcrypt.hash('Heca123!!!', 10);
      staffList.push({
        id: 1,
        name: 'administrator',
        email: 'admin@heca.ng',
        phone: '+2348069552027',
        password: hashedPass,
        role: 'admin',
        createdAt: new Date().toISOString()
      });
      writeLocal(LOCAL_STAFF_FILE, staffList);
    }
    dbInitialized = true;
  }
}

// -------------------------------------------------------------
// Media Files / Binary Image Storage (BYTEA)
// -------------------------------------------------------------
export interface MediaRecord {
  id: number;
  filename: string;
  mimeType: string;
  data: Buffer;
  size: number;
  createdAt?: string;
}

export async function saveMediaFile(filename: string, mimeType: string, buffer: Buffer): Promise<{ id: number; url: string }> {
  await initDb();
  if (isPostgresReady && pool) {
    const res = await pool.query(`
      INSERT INTO media_files (filename, mime_type, data, size)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, [filename, mimeType, buffer, buffer.length]);
    const id = res.rows[0].id;
    setCachedMedia(id, { filename, mimeType, data: buffer, size: buffer.length });
    return { id, url: `/api/images/${id}` };
  }

  // Local fallback storing base64
  const localMedia = readLocal(LOCAL_MEDIA_FILE);
  const id = Date.now();
  localMedia.push({
    id,
    filename,
    mimeType,
    data: buffer.toString('base64'),
    size: buffer.length,
    createdAt: new Date().toISOString()
  });
  writeLocal(LOCAL_MEDIA_FILE, localMedia);
  setCachedMedia(id, { filename, mimeType, data: buffer, size: buffer.length });
  return { id, url: `/api/images/${id}` };
}

export async function getMediaFile(id: number | string): Promise<{ filename: string; mimeType: string; data: Buffer; size: number } | null> {
  // Check LRU memory cache first!
  const cached = getCachedMedia(id);
  if (cached) return cached;

  await initDb();
  if (isPostgresReady && pool) {
    try {
      const res = await pool.query(`
        SELECT id, filename, mime_type AS "mimeType", data, size
        FROM media_files
        WHERE id = $1
      `, [Number(id)]);
      if (res.rows.length > 0) {
        const row = res.rows[0];
        const record = {
          filename: row.filename,
          mimeType: row.mimeType,
          data: row.data as Buffer,
          size: row.size
        };
        setCachedMedia(id, record);
        return record;
      }
    } catch (err: any) {
      console.error('getMediaFile error:', err.message);
    }
  }

  // Local fallback
  const localMedia = readLocal(LOCAL_MEDIA_FILE);
  const found = localMedia.find((m: any) => String(m.id) === String(id));
  if (found) {
    const record = {
      filename: found.filename,
      mimeType: found.mimeType,
      data: Buffer.from(found.data, 'base64'),
      size: found.size
    };
    setCachedMedia(id, record);
    return record;
  }
  return null;
}

// -------------------------------------------------------------
// Staff Operations
// -------------------------------------------------------------
export interface StaffMember {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: string;
  createdAt?: string;
}

export async function getStaffByEmail(email: string): Promise<StaffMember | null> {
  await initDb();
  if (isPostgresReady && pool) {
    const res = await pool.query('SELECT * FROM staff WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    if (res.rows.length > 0) {
      const r = res.rows[0];
      return {
        id: r.id,
        name: r.name,
        email: r.email,
        phone: r.phone,
        password: r.password,
        role: r.role,
        createdAt: r.created_at
      };
    }
    return null;
  }

  const list = readLocal<StaffMember>(LOCAL_STAFF_FILE);
  return list.find(s => s.email?.toLowerCase() === email.trim().toLowerCase()) || null;
}

export async function getStaffById(id: string | number): Promise<StaffMember | null> {
  await initDb();
  if (isPostgresReady && pool) {
    const res = await pool.query('SELECT * FROM staff WHERE id::text = $1', [String(id)]);
    if (res.rows.length > 0) {
      const r = res.rows[0];
      return {
        id: r.id,
        name: r.name,
        email: r.email,
        phone: r.phone,
        password: r.password,
        role: r.role,
        createdAt: r.created_at
      };
    }
    return null;
  }

  const list = readLocal<StaffMember>(LOCAL_STAFF_FILE);
  return list.find(s => String(s.id) === String(id)) || null;
}

export async function getAllStaff(): Promise<StaffMember[]> {
  await initDb();
  if (isPostgresReady && pool) {
    const res = await pool.query(`
      SELECT id, name, email, phone, role, created_at AS "createdAt"
      FROM staff
      ORDER BY id ASC
    `);
    return res.rows;
  }

  const list = readLocal<StaffMember>(LOCAL_STAFF_FILE);
  return list.map(({ password, ...rest }) => rest as StaffMember);
}

export async function createStaff(data: { name: string; email: string; phone: string; password: string; role?: string }): Promise<StaffMember> {
  await initDb();
  const hashed = await bcrypt.hash(data.password, 10);
  const role = data.role || 'staff';

  if (isPostgresReady && pool) {
    const res = await pool.query(`
      INSERT INTO staff (name, email, phone, password, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, email, phone, role, created_at AS "createdAt"
    `, [data.name, data.email.toLowerCase(), data.phone, hashed, role]);
    return res.rows[0];
  }

  const list = readLocal<StaffMember>(LOCAL_STAFF_FILE);
  const newStaff: StaffMember = {
    id: Date.now(),
    name: data.name,
    email: data.email.toLowerCase(),
    phone: data.phone,
    password: hashed,
    role,
    createdAt: new Date().toISOString()
  };
  list.push(newStaff);
  writeLocal(LOCAL_STAFF_FILE, list);
  const { password, ...safe } = newStaff;
  return safe as StaffMember;
}

export async function updateStaffPassword(id: string | number, newPassword: string): Promise<boolean> {
  await initDb();
  const hashed = await bcrypt.hash(newPassword, 10);

  if (isPostgresReady && pool) {
    await pool.query('UPDATE staff SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id::text = $2', [hashed, String(id)]);
    return true;
  }

  const list = readLocal<StaffMember>(LOCAL_STAFF_FILE);
  const staff = list.find(s => String(s.id) === String(id));
  if (staff) {
    staff.password = hashed;
    writeLocal(LOCAL_STAFF_FILE, list);
    return true;
  }
  return false;
}

export async function deleteStaff(id: string | number): Promise<boolean> {
  await initDb();
  if (isPostgresReady && pool) {
    await pool.query('DELETE FROM staff WHERE id::text = $1', [String(id)]);
    return true;
  }

  const list = readLocal<StaffMember>(LOCAL_STAFF_FILE);
  const filtered = list.filter(s => String(s.id) !== String(id));
  writeLocal(LOCAL_STAFF_FILE, filtered);
  return true;
}

// -------------------------------------------------------------
// Blog Post Operations
// -------------------------------------------------------------
export interface BlogPost {
  id: string | number;
  slug?: string;
  title: string;
  author: string;
  date: string;
  excerpt: string;
  body: string;
  coverId?: string | null;
  views: number;
  likes: number;
  createdAt?: string;
}

export async function getPosts(): Promise<BlogPost[]> {
  await initDb();
  if (isPostgresReady && pool) {
    try {
      const res = await pool.query(`
        SELECT 
          id::text,
          title,
          author,
          date,
          excerpt,
          body,
          cover_id AS "coverId",
          COALESCE(views, 0) AS views,
          COALESCE(likes, 0) AS likes,
          created_at AS "createdAt"
        FROM blog_posts
        ORDER BY date DESC, id DESC
      `);
      return res.rows;
    } catch (err: any) {
      console.error('PostgreSQL getPosts error:', err.message);
    }
  }

  const local = readLocal<BlogPost>(LOCAL_POSTS_FILE);
  return local.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
}

export async function getPostById(id: string | number, incrementView = false): Promise<BlogPost | null> {
  await initDb();
  if (isPostgresReady && pool) {
    try {
      if (incrementView) {
        await pool.query('UPDATE blog_posts SET views = COALESCE(views, 0) + 1 WHERE id::text = $1', [String(id)]);
      }
      const res = await pool.query(`
        SELECT 
          id::text,
          title,
          author,
          date,
          excerpt,
          body,
          cover_id AS "coverId",
          COALESCE(views, 0) AS views,
          COALESCE(likes, 0) AS likes,
          created_at AS "createdAt"
        FROM blog_posts
        WHERE id::text = $1
      `, [String(id)]);
      if (res.rows.length > 0) return res.rows[0];
    } catch (err: any) {
      console.error('PostgreSQL getPostById error:', err.message);
    }
  }

  const local = readLocal<BlogPost>(LOCAL_POSTS_FILE);
  const p = local.find(x => String(x.id) === String(id));
  if (p) {
    if (incrementView) {
      p.views = (p.views || 0) + 1;
      writeLocal(LOCAL_POSTS_FILE, local);
    }
    return p;
  }
  return null;
}

export async function likePost(id: string | number): Promise<number | null> {
  await initDb();
  if (isPostgresReady && pool) {
    try {
      const res = await pool.query(`
        UPDATE blog_posts
        SET likes = COALESCE(likes, 0) + 1
        WHERE id::text = $1
        RETURNING likes
      `, [String(id)]);
      if (res.rows.length > 0) return res.rows[0].likes;
    } catch (err: any) {
      console.error('PostgreSQL likePost error:', err.message);
    }
  }

  const local = readLocal<BlogPost>(LOCAL_POSTS_FILE);
  const p = local.find(x => String(x.id) === String(id));
  if (p) {
    p.likes = (p.likes || 0) + 1;
    writeLocal(LOCAL_POSTS_FILE, local);
    return p.likes;
  }
  return null;
}

export async function createPost(post: { title: string; author?: string; date?: string; excerpt?: string; body: string; coverId?: string }): Promise<BlogPost> {
  await initDb();
  const slug = post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 80) + '-' + Date.now().toString().slice(-4);
  const postDate = post.date || new Date().toISOString();

  if (isPostgresReady && pool) {
    const res = await pool.query(`
      INSERT INTO blog_posts (slug, title, author, date, excerpt, body, cover_id, views, likes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 0)
      RETURNING id::text, title, author, date, excerpt, body, cover_id AS "coverId", views, likes, created_at AS "createdAt"
    `, [slug, post.title, post.author || 'Secretariat', postDate, post.excerpt || '', post.body, post.coverId || null]);
    return res.rows[0];
  }

  const list = readLocal<BlogPost>(LOCAL_POSTS_FILE);
  const newP: BlogPost = {
    id: Date.now().toString(),
    title: post.title,
    author: post.author || 'Secretariat',
    date: postDate,
    excerpt: post.excerpt || '',
    body: post.body,
    coverId: post.coverId || null,
    views: 0,
    likes: 0
  };
  list.unshift(newP);
  writeLocal(LOCAL_POSTS_FILE, list);
  return newP;
}

export async function deletePost(id: string | number): Promise<boolean> {
  await initDb();
  if (isPostgresReady && pool) {
    await pool.query('DELETE FROM blog_posts WHERE id::text = $1', [String(id)]);
    return true;
  }
  const list = readLocal<BlogPost>(LOCAL_POSTS_FILE);
  const filtered = list.filter(p => String(p.id) !== String(id));
  writeLocal(LOCAL_POSTS_FILE, filtered);
  return true;
}

export async function updatePost(
  id: string | number,
  data: { title?: string; author?: string; date?: string; excerpt?: string; body?: string; coverId?: string | null }
): Promise<BlogPost | null> {
  await initDb();
  if (isPostgresReady && pool) {
    const res = await pool.query(`
      UPDATE blog_posts
      SET title = COALESCE($1, title),
          author = COALESCE($2, author),
          date = COALESCE($3::timestamptz, date),
          excerpt = COALESCE($4, excerpt),
          body = COALESCE($5, body),
          cover_id = COALESCE($6, cover_id)
      WHERE id::text = $7
      RETURNING 
        id::text,
        slug,
        title,
        author,
        date::text,
        excerpt,
        body,
        cover_id AS "coverId",
        views,
        likes,
        created_at AS "createdAt"
    `, [
      data.title ?? null,
      data.author ?? null,
      data.date ? new Date(data.date).toISOString() : null,
      data.excerpt ?? null,
      data.body ?? null,
      data.coverId !== undefined ? data.coverId : null,
      String(id)
    ]);
    if (res.rows.length > 0) return res.rows[0];
    return null;
  }

  const list = readLocal<BlogPost>(LOCAL_POSTS_FILE);
  const p = list.find(x => String(x.id) === String(id));
  if (p) {
    if (data.title !== undefined) p.title = data.title;
    if (data.author !== undefined) p.author = data.author;
    if (data.date !== undefined) p.date = data.date;
    if (data.excerpt !== undefined) p.excerpt = data.excerpt;
    if (data.body !== undefined) p.body = data.body;
    if (data.coverId !== undefined) p.coverId = data.coverId;
    writeLocal(LOCAL_POSTS_FILE, list);
    return p;
  }
  return null;
}

// -------------------------------------------------------------
// Nominations Operations
// -------------------------------------------------------------
export interface Nomination {
  id: string | number;
  nomineeName: string;
  nomineeEmail?: string;
  nomineePhone?: string;
  organisation?: string;
  category: string;
  biography?: string;
  achievements?: string;
  impact?: string;
  reasons?: string;
  supporting?: string;
  nominatorName: string;
  nominatorEmail?: string;
  nominatorPhone?: string;
  status: string;
  notes?: string;
  createdAt?: string;
}

export async function createNomination(nom: Omit<Nomination, 'id' | 'status'> & { status?: string }): Promise<Nomination> {
  await initDb();
  const status = nom.status || 'Pending Review';

  if (isPostgresReady && pool) {
    const res = await pool.query(`
      INSERT INTO nominations (
        nominee_name, nominee_email, nominee_phone, organisation, category,
        biography, achievements, impact, reasons, supporting,
        nominator_name, nominator_email, nominator_phone, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING 
        id::text,
        nominee_name AS "nomineeName",
        nominee_email AS "nomineeEmail",
        nominee_phone AS "nomineePhone",
        organisation,
        category,
        biography,
        achievements,
        impact,
        reasons,
        supporting,
        nominator_name AS "nominatorName",
        nominator_email AS "nominatorEmail",
        nominator_phone AS "nominatorPhone",
        status,
        notes,
        created_at AS "createdAt"
    `, [
      nom.nomineeName, nom.nomineeEmail || '', nom.nomineePhone || '', nom.organisation || '', nom.category,
      nom.biography || '', nom.achievements || '', nom.impact || '', nom.reasons || '', nom.supporting || '',
      nom.nominatorName, nom.nominatorEmail || '', nom.nominatorPhone || '', status
    ]);
    return res.rows[0];
  }

  const list = readLocal<Nomination>(LOCAL_NOMINATIONS_FILE);
  const newNom: Nomination = {
    id: 'NOM-' + Date.now().toString().slice(-6),
    nomineeName: nom.nomineeName,
    nomineeEmail: nom.nomineeEmail || '',
    nomineePhone: nom.nomineePhone || '',
    organisation: nom.organisation || '',
    category: nom.category,
    biography: nom.biography || '',
    achievements: nom.achievements || '',
    impact: nom.impact || '',
    reasons: nom.reasons || '',
    supporting: nom.supporting || '',
    nominatorName: nom.nominatorName,
    nominatorEmail: nom.nominatorEmail || '',
    nominatorPhone: nom.nominatorPhone || '',
    status: status,
    notes: '',
    createdAt: new Date().toISOString()
  };
  list.unshift(newNom);
  writeLocal(LOCAL_NOMINATIONS_FILE, list);
  return newNom;
}

export async function getNominations(filters?: { status?: string; category?: string; search?: string }): Promise<Nomination[]> {
  await initDb();
  if (isPostgresReady && pool) {
    let q = `
      SELECT 
        id::text,
        nominee_name AS "nomineeName",
        nominee_email AS "nomineeEmail",
        nominee_phone AS "nomineePhone",
        organisation,
        category,
        biography,
        achievements,
        impact,
        reasons,
        supporting,
        nominator_name AS "nominatorName",
        nominator_email AS "nominatorEmail",
        nominator_phone AS "nominatorPhone",
        status,
        notes,
        created_at AS "createdAt"
      FROM nominations
      WHERE 1=1
    `;
    const params: any[] = [];
    if (filters?.status) {
      params.push(filters.status);
      q += ` AND status = $${params.length}`;
    }
    if (filters?.category) {
      params.push(filters.category);
      q += ` AND category = $${params.length}`;
    }
    if (filters?.search) {
      params.push(`%${filters.search}%`);
      q += ` AND (nominee_name ILIKE $${params.length} OR nominator_name ILIKE $${params.length} OR organisation ILIKE $${params.length})`;
    }
    q += ` ORDER BY created_at DESC, id DESC`;
    const res = await pool.query(q, params);
    return res.rows;
  }

  let list = readLocal<Nomination>(LOCAL_NOMINATIONS_FILE);
  if (filters?.status) list = list.filter(n => n.status === filters.status);
  if (filters?.category) list = list.filter(n => n.category === filters.category);
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    list = list.filter(n => 
      n.nomineeName?.toLowerCase().includes(s) || 
      n.nominatorName?.toLowerCase().includes(s) || 
      n.organisation?.toLowerCase().includes(s)
    );
  }
  return list;
}

export async function getNominationById(id: string | number): Promise<Nomination | null> {
  await initDb();
  if (isPostgresReady && pool) {
    const res = await pool.query(`
      SELECT 
        id::text,
        nominee_name AS "nomineeName",
        nominee_email AS "nomineeEmail",
        nominee_phone AS "nomineePhone",
        organisation,
        category,
        biography,
        achievements,
        impact,
        reasons,
        supporting,
        nominator_name AS "nominatorName",
        nominator_email AS "nominatorEmail",
        nominator_phone AS "nominatorPhone",
        status,
        notes,
        created_at AS "createdAt"
      FROM nominations
      WHERE id::text = $1
    `, [String(id)]);
    if (res.rows.length > 0) return res.rows[0];
    return null;
  }

  const list = readLocal<Nomination>(LOCAL_NOMINATIONS_FILE);
  return list.find(n => String(n.id) === String(id)) || null;
}

export async function updateNominationStatus(id: string | number, status?: string, notes?: string): Promise<Nomination | null> {
  await initDb();
  if (isPostgresReady && pool) {
    const res = await pool.query(`
      UPDATE nominations
      SET status = COALESCE($1, status),
          notes = COALESCE($2, notes)
      WHERE id::text = $3
      RETURNING 
        id::text,
        nominee_name AS "nomineeName",
        nominee_email AS "nomineeEmail",
        nominee_phone AS "nomineePhone",
        organisation,
        category,
        biography,
        achievements,
        impact,
        reasons,
        supporting,
        nominator_name AS "nominatorName",
        nominator_email AS "nominatorEmail",
        nominator_phone AS "nominatorPhone",
        status,
        notes,
        created_at AS "createdAt"
    `, [status, notes, String(id)]);
    if (res.rows.length > 0) return res.rows[0];
    return null;
  }

  const list = readLocal<Nomination>(LOCAL_NOMINATIONS_FILE);
  const item = list.find(n => String(n.id) === String(id));
  if (item) {
    if (status !== undefined) item.status = status;
    if (notes !== undefined) item.notes = notes;
    writeLocal(LOCAL_NOMINATIONS_FILE, list);
    return item;
  }
  return null;
}

export async function updateNomination(
  id: string | number,
  data: Partial<Omit<Nomination, 'id' | 'createdAt'>>
): Promise<Nomination | null> {
  await initDb();
  if (isPostgresReady && pool) {
    const res = await pool.query(`
      UPDATE nominations
      SET nominee_name = COALESCE($1, nominee_name),
          nominee_email = COALESCE($2, nominee_email),
          nominee_phone = COALESCE($3, nominee_phone),
          organisation = COALESCE($4, organisation),
          category = COALESCE($5, category),
          biography = COALESCE($6, biography),
          achievements = COALESCE($7, achievements),
          impact = COALESCE($8, impact),
          reasons = COALESCE($9, reasons),
          supporting = COALESCE($10, supporting),
          nominator_name = COALESCE($11, nominator_name),
          nominator_email = COALESCE($12, nominator_email),
          nominator_phone = COALESCE($13, nominator_phone),
          status = COALESCE($14, status),
          notes = COALESCE($15, notes)
      WHERE id::text = $16
      RETURNING 
        id::text,
        nominee_name AS "nomineeName",
        nominee_email AS "nomineeEmail",
        nominee_phone AS "nomineePhone",
        organisation,
        category,
        biography,
        achievements,
        impact,
        reasons,
        supporting,
        nominator_name AS "nominatorName",
        nominator_email AS "nominatorEmail",
        nominator_phone AS "nominatorPhone",
        status,
        notes,
        created_at AS "createdAt"
    `, [
      data.nomineeName ?? null,
      data.nomineeEmail ?? null,
      data.nomineePhone ?? null,
      data.organisation ?? null,
      data.category ?? null,
      data.biography ?? null,
      data.achievements ?? null,
      data.impact ?? null,
      data.reasons ?? null,
      data.supporting ?? null,
      data.nominatorName ?? null,
      data.nominatorEmail ?? null,
      data.nominatorPhone ?? null,
      data.status ?? null,
      data.notes ?? null,
      String(id)
    ]);
    if (res.rows.length > 0) return res.rows[0];
    return null;
  }

  const list = readLocal<Nomination>(LOCAL_NOMINATIONS_FILE);
  const item = list.find(n => String(n.id) === String(id));
  if (item) {
    Object.assign(item, data);
    writeLocal(LOCAL_NOMINATIONS_FILE, list);
    return item;
  }
  return null;
}

export async function deleteNomination(id: string | number): Promise<boolean> {
  await initDb();
  if (isPostgresReady && pool) {
    await pool.query('DELETE FROM nominations WHERE id::text = $1', [String(id)]);
    return true;
  }
  const list = readLocal<Nomination>(LOCAL_NOMINATIONS_FILE);
  const filtered = list.filter(n => String(n.id) !== String(id));
  writeLocal(LOCAL_NOMINATIONS_FILE, filtered);
  return true;
}

export async function getNominationStats() {
  const list = await getNominations();
  const total = list.length;
  const statusCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};

  list.forEach(item => {
    const s = item.status || 'Pending Review';
    statusCounts[s] = (statusCounts[s] || 0) + 1;
    const c = item.category || 'Uncategorized';
    categoryCounts[c] = (categoryCounts[c] || 0) + 1;
  });

  return {
    total,
    byStatus: statusCounts,
    byCategory: categoryCounts,
    recentCount: list.filter(n => {
      const d = new Date(n.createdAt || 0);
      return Date.now() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
    }).length
  };
}

// -------------------------------------------------------------
// Gallery Operations
// -------------------------------------------------------------
export interface GalleryItem {
  id: string;
  name?: string;
  alt?: string;
  created?: string;
}

export function getDefaultGalleryImages(): GalleryItem[] {
  return readLocal<GalleryItem>(DEFAULT_GALLERY_FILE);
}

export async function getGalleryImages(): Promise<GalleryItem[]> {
  await initDb();
  const defaults = getDefaultGalleryImages();
  let dbImages: GalleryItem[] = [];

  if (isPostgresReady && pool) {
    try {
      const res = await pool.query(`
        SELECT drive_id AS id, name, alt, created_at AS created
        FROM gallery_items
        ORDER BY id ASC
      `);
      dbImages = res.rows;
    } catch (err: any) {
      console.error('PostgreSQL getGalleryImages error:', err.message);
    }
  }

  const map = new Map<string, GalleryItem>();
  dbImages.forEach(img => map.set(img.id, img));
  defaults.forEach(img => {
    if (!map.has(img.id)) {
      map.set(img.id, {
        id: img.id,
        name: img.name,
        alt: 'Her Excellence Conference & Awards photograph'
      });
    }
  });

  return Array.from(map.values());
}

export async function addGalleryImage(driveId: string, name?: string, alt?: string): Promise<boolean> {
  await initDb();
  if (isPostgresReady && pool) {
    try {
      await pool.query(`
        INSERT INTO gallery_items (drive_id, name, alt)
        VALUES ($1, $2, $3)
        ON CONFLICT (drive_id) DO NOTHING
      `, [driveId, name || 'Drive Image', alt || 'Her Excellence Conference & Awards photograph']);
      return true;
    } catch (err: any) {
      console.error('PostgreSQL addGalleryImage error:', err.message);
    }
  }

  const defaults = getDefaultGalleryImages();
  if (!defaults.some(x => x.id === driveId)) {
    defaults.unshift({ id: driveId, name: name || 'Photo', alt: alt || 'Photo' });
    writeLocal(DEFAULT_GALLERY_FILE, defaults);
  }
  return true;
}

export async function deleteGalleryImage(id: string): Promise<boolean> {
  await initDb();
  if (isPostgresReady && pool) {
    try {
      await pool.query('DELETE FROM gallery_items WHERE drive_id = $1', [id]);
    } catch (err: any) {
      console.error('PostgreSQL deleteGalleryImage error:', err.message);
    }
  }
  const defaults = getDefaultGalleryImages().filter(x => x.id !== id);
  writeLocal(DEFAULT_GALLERY_FILE, defaults);
  return true;
}

export { isPostgresReady };
