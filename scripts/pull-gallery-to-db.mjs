import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function pullPhotos() {
  console.log('🔄 Starting migration: Downloading Google Drive images, converting to raw bytes, and storing directly in PostgreSQL (BYTEA)...');

  const defaultGallery = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'default-gallery.json'), 'utf8'));

  // Ensure unique IDs
  const uniqueItems = new Map();
  for (const item of defaultGallery) {
    if (!uniqueItems.has(item.id)) {
      uniqueItems.set(item.id, item.name);
    }
  }

  console.log(`Found ${uniqueItems.size} unique event photographs to pull and save into PostgreSQL.`);

  let savedCount = 0;
  for (const [driveId, name] of uniqueItems.entries()) {
    const filename = `gdrive_${driveId}.jpg`;

    // Check if already in media_files
    const checkRes = await pool.query('SELECT id FROM media_files WHERE filename = $1 LIMIT 1', [filename]);
    let mediaId;

    if (checkRes.rows.length > 0) {
      mediaId = checkRes.rows[0].id;
      // console.log(`  [Cached] ${name} (ID: ${mediaId})`);
    } else {
      try {
        const url = `https://lh3.googleusercontent.com/d/${driveId}=w1000`;
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        if (!res.ok) {
          console.warn(`  ⚠️ Could not fetch driveId ${driveId}: HTTP ${res.status}`);
          continue;
        }

        const ab = await res.arrayBuffer();
        if (ab.byteLength < 500) {
          console.warn(`  ⚠️ Drive image ${driveId} empty or blocked`);
          continue;
        }

        const buffer = Buffer.from(ab);
        const ins = await pool.query(
          'INSERT INTO media_files (filename, mime_type, data, size) VALUES ($1, $2, $3, $4) RETURNING id',
          [filename, 'image/jpeg', buffer, buffer.length]
        );
        mediaId = ins.rows[0].id;
        savedCount++;
        console.log(`  ✅ Stored in DB: ${name} (${buffer.length} bytes, Media ID: ${mediaId})`);
      } catch (e) {
        console.warn(`  ⚠️ Error pulling ${driveId}:`, e.message);
        continue;
      }
    }

    // Update or insert into gallery_items with the direct local byte URL /api/images/{mediaId}
    const byteUrl = `/api/images/${mediaId}`;
    await pool.query(`
      INSERT INTO gallery_items (drive_id, name, alt)
      VALUES ($1, $2, $3)
      ON CONFLICT (drive_id) DO UPDATE SET name = $2, alt = $3
    `, [byteUrl, name || 'Event Photo', 'Her Excellence Conference & Awards photograph']);
  }

  // Also download the hero background image: 1TR55q6C-kk-IQy4BLXaIUkGIPsMOv-M0
  const heroDriveId = '1TR55q6C-kk-IQy4BLXaIUkGIPsMOv-M0';
  const heroCheck = await pool.query("SELECT id FROM media_files WHERE filename = 'hero_background.jpg' LIMIT 1");
  if (heroCheck.rows.length === 0) {
    try {
      const heroRes = await fetch(`https://lh3.googleusercontent.com/d/${heroDriveId}=w2000`);
      if (heroRes.ok) {
        const heroBuf = Buffer.from(await heroRes.arrayBuffer());
        const heroIns = await pool.query(
          'INSERT INTO media_files (filename, mime_type, data, size) VALUES ($1, $2, $3, $4) RETURNING id',
          ['hero_background.jpg', 'image/jpeg', heroBuf, heroBuf.length]
        );
        console.log(`  🎉 Hero background saved to DB as Media ID: ${heroIns.rows[0].id}`);
      }
    } catch (e) {
      console.warn('Hero sync error:', e.message);
    }
  }

  console.log(`\n🎉 Sync complete! Newly saved: ${savedCount} images directly to PostgreSQL media_files table.`);
  await pool.end();
}

pullPhotos().catch(console.error);
