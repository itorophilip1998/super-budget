#!/bin/sh

echo "Waiting for database to be ready..."
sleep 5

echo "Running Prisma migrations..."
# Always push schema to ensure database is up to date
# This will create tables if they don't exist
npx prisma db push --accept-data-loss --skip-generate

echo "Running Prisma seed (if configured)..."
npx prisma db seed || echo "No seed script configured"

echo "Starting NestJS application..."
exec npm run start:dev

