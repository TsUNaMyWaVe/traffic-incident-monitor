require('dotenv/config');

/**
 * @type {import('knex').Knex.Config}
 */
const config = {
  development: {
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
  }
};

module.exports = config;
