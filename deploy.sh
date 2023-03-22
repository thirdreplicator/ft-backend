#!/usr/bin/env bash
alias dd='date +%Y-%m-%d'
# Back up database first
pg_dump -U postgres -p 5432 firsttime_production > ./backups/firsttime_production_`dd`.sql
npm run migrate:prod
npm run seed:options:prod
psql -U postgres -p 5433 firsttime_dev < prisma/add_created_at_to_option_table.sql
