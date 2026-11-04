import { PgBoss } from 'pg-boss';

let bossInstance: PgBoss | null = null;
let isStarted = false;

export async function getQueue(): Promise<PgBoss | null> {
  if (bossInstance && isStarted) return bossInstance;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn('⚠️ No DATABASE_URL for pg-boss background queue');
    return null;
  }

  try {
    if (!bossInstance) {
      bossInstance = new PgBoss({
        connectionString,
        ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
        schema: 'pgboss',
      });

      bossInstance.on('error', (err: any) => {
        console.warn('pg-boss queue warning:', err.message);
      });
    }

    if (!isStarted) {
      await bossInstance.start();
      isStarted = true;
      console.log('✅ pg-boss background job queue started successfully');

      // Register background workers
      await bossInstance.work('media-process', async (jobs: any[]) => {
        const job = jobs[0];
        console.log(`[Queue Worker] Processing media job #${job?.id || 'unknown'}`);
        return { processed: true, at: new Date().toISOString() };
      });

      await bossInstance.work('gallery-sync', async (jobs: any[]) => {
        const job = jobs[0];
        console.log(`[Queue Worker] Processing gallery sync job #${job?.id || 'unknown'}`);
        return { synced: true, at: new Date().toISOString() };
      });
    }

    return bossInstance;
  } catch (err: any) {
    console.warn('⚠️ pg-boss initialization error:', err.message);
    return null;
  }
}

export async function sendJob(name: string, data: any): Promise<string | null> {
  try {
    const boss = await getQueue();
    if (!boss) return null;
    const jobId = await boss.send(name, data);
    return jobId;
  } catch (err: any) {
    console.warn(`⚠️ Failed to enqueue job ${name}:`, err.message);
    return null;
  }
}
