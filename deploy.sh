#!/usr/bin/env bash
#
# Make a backup
mkdir backups
sudo su postgres
alias dd='date +%Y-%m-%d'
pg_dump -U postgres -p 5432 firsttime_production > /tmp/firsttime_production_`dd`.sql
exit
cp /tmp/firsttime_production*.sql ./backups

# Create orders and lineitems tables.
# psql -U postgres -p 5432 firsttime_production < migrations/05*.sql
