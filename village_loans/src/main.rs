mod domain;
mod services;
mod api;
mod repository;
mod workers; // Added the new workers module

use axum::{routing::post, Router};
use std::net::SocketAddr;
use sqlx::postgres::PgPoolOptions;
use dotenvy::dotenv;
use std::env;

#[tokio::main]
async fn main() {
    dotenv().ok();
    let db_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set in .env");

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await
        .expect("Failed to connect to PostgreSQL");

    let loan_repo = repository::loan_repository::LoanRepository::new(pool);

    // --- START BACKGROUND WORKER ---
    // We clone the repo to give the background worker its own reference to the DB pool
    workers::sms_reminder::start_daily_scheduler(loan_repo.clone()).await;
    // -------------------------------

    // Inside src/main.rs, update your Router map:

    let app = Router::new()
        .route("/api/loans", post(api::handlers::create_loan_handler))
        // NEW: Public endpoint for the South African banking gateway to talk to
        .route("/api/webhooks/gateway", post(api::handlers::gateway_webhook_handler))
        .with_state(loan_repo);

    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    println!("Village Loan Backend running on http://{}", addr);

    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}