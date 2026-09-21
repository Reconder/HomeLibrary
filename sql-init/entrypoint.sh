#!/bin/bash
set -e

# Start SQL Server in background
/opt/mssql/bin/sqlservr &
SERVER_PID=$!

# Wait for SQL Server to be ready
sleep 30

# Run init script using the Go-based sqlcmd alternative or use timeout
timeout 60 bash -c 'until /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong@Password123" -Q "SELECT 1" &>/dev/null; do echo "Waiting for SQL Server..."; sleep 2; done'

# Execute the init script
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong@Password123" -i /sql-init/001-init.sql

# Keep the container running
wait $SERVER_PID
