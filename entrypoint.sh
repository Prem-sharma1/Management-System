#!/bin/sh
set -e

# Extract host and port from DATABASE_URL if available
if [ -n "$DATABASE_URL" ]; then
  # Strip single/double quotes if present
  DATABASE_URL=$(echo "$DATABASE_URL" | tr -d "'\"")
  export DATABASE_URL
  
  # Strip protocol
  url_without_proto="${DATABASE_URL#*://}"
  # Strip path and options
  url_without_path="${url_without_proto%%/*}"
  # Strip credentials
  host_and_port="${url_without_path#*@}"
  
  DB_HOST="${host_and_port%%:*}"
  DB_PORT="${host_and_port#*:}"
  
  if [ "$DB_PORT" = "$DB_HOST" ]; then
    DB_PORT=5432
  fi
fi

DB_HOST=${DB_HOST:-db}
DB_PORT=${DB_PORT:-5432}

# Skip nc wait loop if connecting to remote cloud database (e.g. prisma.io)
if echo "$DB_HOST" | grep -q "\."; then
  echo "Connecting to remote database at ${DB_HOST}..."
else
  echo "Waiting for database to be ready at ${DB_HOST}:${DB_PORT}..."
  MAX_RETRIES=3
  RETRY_COUNT=0
  until nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null || [ $RETRY_COUNT -ge $MAX_RETRIES ]; do
    sleep 1
    RETRY_COUNT=$((RETRY_COUNT + 1))
  done
fi
echo "Database ready check finished. Proceeding..."

echo "Running prisma migrations..."
npx prisma migrate deploy || echo "Migrations already applied or baselined. Continuing..."

# Check if database is empty to run seeding
echo "Checking if database needs seeding..."
SHOULD_SEED=$(NODE_ENV=production node -e "
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

prisma.user.count()
  .then(count => {
    console.log(count === 0 ? 'true' : 'false');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error checking database status:', err.message);
    process.exit(1);
  });
" || echo "false")

if [ "$SHOULD_SEED" = "true" ]; then
  echo "Database is empty. Running seeding..."
  node prisma/seed.js
  
  # Also check if seed-plans.js or seed-tl.js should be run
  if [ -f "seed-plans.js" ]; then
    echo "Running seed-plans.js..."
    node seed-plans.js || echo "Failed to run seed-plans.js, continuing..."
  fi
  if [ -f "seed-tl.js" ]; then
    echo "Running seed-tl.js..."
    node seed-tl.js || echo "Failed to run seed-tl.js, continuing..."
  fi
else
  echo "Database already has records. Skipping seeding."
fi

if [ -f "update_admin_credentials.js" ]; then
  echo "Updating admin credentials..."
  node update_admin_credentials.js || echo "Failed to run update_admin_credentials.js, continuing..."
fi

echo "Starting Next.js production server..."
npm run start
