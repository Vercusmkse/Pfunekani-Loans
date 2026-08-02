# A command runner for Pfunekani Loans tasks

# Automatically load variables from .env file
set dotenv-load

# Configure PowerShell as the execution shell on Windows
set windows-shell := ["powershell.exe", "-NoProfile", "-Command"]

# Variables
DB_URL := env_var_or_default('DATABASE_URL', '')

# Default command
default: run

# --- DEVELOPMENT ---
# Run the backend server in watch mode
watch:
    cargo watch -q -c -x run

# Run the backend server
run:
    cargo run

# --- DATABASE ---
# Setup the database: create, migrate, and prepare sqlx cache
db-setup:
    sqlx database create
    sqlx migrate run
    cargo sqlx prepare

# Run database migrations
db-migrate:
    sqlx migrate run

# Create a new migration file
db-new-migration name:
    sqlx migrate add -r {{name}}

# --- TESTING & QUALITY ---
# Run all backend tests
test-backend:
    cargo test

# Run all frontend tests
test-frontend:
    npm --prefix frontend test

# Run all tests
test: test-backend test-frontend

# Lint the backend code
lint:
    cargo clippy -- -D warnings

# Format the backend code
format:
    cargo fmt

# --- BUILD ---
# Build backend for release
build-backend:
    cargo build --release

# Build frontend production bundle
build-frontend:
    npm --prefix frontend run build

# Build both backend and frontend
build: build-backend build-frontend

# --- GIT WORKFLOW ---
# Stage all changes, commit, and push to remote repository
git-push message="update project":
    git add .
    git commit -m "{{message}}"
    git push

# Alias for git-push
push message="update project": (git-push message)

# --- DEPLOYMENT ---
# Full production pre-flight checks and build
deploy: test lint build
    @echo "✅ Production build and validation complete! Ready for release deployment."