# Build stage
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
COPY tsconfig.json tsconfig.server.json knexfile.cjs ./
COPY src ./src
COPY client ./client
COPY migrations ./migrations

RUN npm ci
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app

COPY package.json package-lock.json* ./
COPY knexfile.cjs ./
COPY migrate.js ./
COPY migrations ./migrations

RUN npm ci --only=production

COPY --from=build /app/dist ./dist

# Set environment variables
ENV NODE_ENV=production
ENV DB_HOST=${DB_HOST:-mysql}
ENV DB_PORT=${DB_PORT:-3306}
ENV DB_USER=${DB_USER:-root}
ENV DB_PASSWORD=${DB_PASSWORD:-root}
ENV DB_NAME=${DB_NAME:-traffic_incident_monitor}

EXPOSE 4000

# Run migrations and start server
CMD node migrate.js && node dist/server/index.js
