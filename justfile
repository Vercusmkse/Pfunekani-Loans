# Use PowerShell on Windows, and sh on other systems
set shell := ["powershell", "-c"]

# --- DEVELOPMENT ---
run:
    cd village_loans; cargo run

# --- DATABASE ---
db-setup:
    cd village_loans; sqlx database create; sqlx migrate run

db-migrate:
    cd village_loans; sqlx migrate run

db-new-migration name:
    cd village_loans; sqlx migrate add -r {{name}}

# --- TESTING & QUALITY ---
test-backend:
    cd village_loans; cargo test

test-frontend:
    cd village_loans/frontend; npm test

test:
    just test-backend; just test-frontend

lint:
    cd village_loans; cargo clippy -- -D warnings

format:
    cd village_loans; cargo fmt
