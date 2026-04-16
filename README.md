# Traffic Incident Monitor

A small TypeScript-backed application with an Express API, Knex/MySQL database access, and a React frontend powered by Vite.
It was built with the help of the free version of copilot. A partial conversation log with the agent can be found in this repository as well.

## What is included

- `src/server`: Express API server with TypeScript
- `knexfile.ts`: Knex configuration for MySQL
- `migrations/`: sample database migration
- `client/`: React + Vite frontend
- `tsconfig` for shared TypeScript configuration

## Prerequisites

Before running the application locally, ensure you have the following installed:

- **Node.js** (version 16 or higher recommended)
- **npm** (comes with Node.js)
- **MySQL Server** (version 8.0 or higher) - Ensure the MySQL service is running

## Setup

1. Copy `.env.example` to `.env` and update your database credentials.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create the database and run migrations:
   ```bash
   npm run migrate
   ```

## Running the Application

### Locally

To run in development mode:

```bash
npm run dev:server
npm run dev:client
```

The backend runs on `http://localhost:4000` and the frontend runs on `http://localhost:5173`.

### Using Docker

Ensure Docker and Docker Compose are installed.

Run the application:

```bash
docker-compose up --build
```

The backend will run on `http://localhost:4000` and the frontend will run on `http://localhost:3000`.
