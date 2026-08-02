# Village Loans

Village Loans is a loan management system built with Rust and Axum, designed to handle both automated online loans and manual community-based loans.

## Architecture

The project is structured as a modular, layered application:

- **`domain`**: Contains the core business logic and data structures.
- **`repository`**: Handles all database interactions.
- **`services`**: Contains the business logic that orchestrates the domain and repository layers.
- **`api`**: Exposes the application's functionality via a RESTful API.
- **`workers`**: Contains background workers for tasks like sending SMS reminders and collecting debit orders.
- **`error`**: Defines the application's centralized error handling mechanism.

## Getting Started

### Prerequisites

- [Rust](https://www.rust-lang.org/tools/install)
- [PostgreSQL](https://www.postgresql.org/download/)
- [just](https://github.com/casey/just) (`cargo install just`)
- [sqlx-cli](https://github.com/launchbadge/sqlx/tree/main/sqlx-cli) (`cargo install sqlx-cli`)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone <repository-url>
    cd village_loans
    ```

2.  **Set up the environment:**
    - Copy the `.env.example` file to `.env` and fill in the required values.

3.  **Set up the database:**
    ```sh
    just db-setup
    ```

4.  **Run the application:**
    ```sh
    just run
    ```

## Development Workflow

This project uses `just` as a command runner to provide a consistent development experience.

- **`just watch`**: Run the backend server in watch mode.
- **`just test`**: Run all backend and frontend tests.
- **`just lint`**: Lint the backend code.
- **`just format`**: Format the backend code.
- **`just db-migrate`**: Run database migrations.
- **`just db-new-migration <name>`**: Create a new migration file.

## API Documentation

### Public API

- **`POST /api/loans`**: Apply for a new loan.

### Admin API

- **`GET /api/admin/loans`**: List all loans.
- **`POST /api/admin/loans/:id/pay`**: Record a payment for a loan.

All admin routes require an `Authorization: Bearer <token>` header.
