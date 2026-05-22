mod domain;
mod services;
mod api;
mod repository;

use axum::{routing::post, Router};
use std::net::SocketAddr;
use sqlx::postgres::PgPoolOptions;
use dotenvy::dotenv;
use std::env;

#[tokio::main]
async fn main() {
    // 1. Load environment variables
    dotenv().ok();
    let db_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set in .env");

    // 2. Establish PostgreSQL connection pool
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await
        .expect("Failed to connect to PostgreSQL");

    // 3. Initialize the Repository Pattern
    let loan_repo = repository::loan_repository::LoanRepository::new(pool);

    // 4. Pass the repository into Axum's State
    let app = Router::new()
        .route("/api/loans", post(api::handlers::create_loan_handler))
        .with_state(loan_repo);

    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    println!("Village Loan Backend running on http://{}", addr);

    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}