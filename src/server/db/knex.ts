import type { Knex } from 'knex';
import knexModule from 'knex';
import 'dotenv/config';

const knex = knexModule.default || knexModule;

const config: Knex.Config = {
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'traffic_incident_monitor'
  },
  pool: { min: 2, max: 10 }
};

const db: Knex = knex(config);

export default db;
