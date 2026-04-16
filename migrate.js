import knex from 'knex';
import 'dotenv/config';

const config = {
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST || 'mysql',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'traffic_incident_monitor'
  },
  migrations: {
    directory: './migrations'
  }
};

const db = knex(config);

async function runMigrations() {
  try {
    console.log('Running migrations...');
    await db.migrate.latest();
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

runMigrations();