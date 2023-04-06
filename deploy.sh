#!/usr/bin/env bash
mkdir backups
sudo su postgres
alias dd='date +%Y-%m-%d'
pg_dump -U postgres -p 5432 firsttime_production > /tmp/firsttime_production_`dd`.sql
exit
cp /tmp/firsttime_production*.sql ./backups
npm run migrate:prod
psql -U postgres -p 5432 firsttime_production < migrations/04_create_users.sql
npm run seed:options:prod
