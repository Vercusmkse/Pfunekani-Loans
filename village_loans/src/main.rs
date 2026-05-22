mod domain;
mod services;
mod api;
mod repository;
mod workers;

use axum::{routing::{get, post}, Router, middleware};
use sqlx::postgres::PgPoolOptions;
use dotenvy::dotenv;
use std::env;
use tower_http::cors::{CorsLayer, Any};

#[tokio::main]
async fn main() {
    dotenv().ok();
    let db_url = env::var("DATABASE_URL").expect("DATABASE_URL missing");

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await
        .expect("Failed to connect to PostgreSQL");

    let loan_repo = repository::loan_repository::LoanRepository::new(pool);

    // --- START BACKGROUND WORKERS ---
    workers::sms_reminder::start_daily_scheduler(loan_repo.clone()).await;
    workers::debit_collection::start_collection_scheduler(loan_repo.clone()).await;

    // --- SETUP SECURITY & CORS ---
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // --- SETUP ADMIN ROUTES ---
    let admin_routes = Router::new()
        .route("/loans", get(api::handlers::list_loans_handler))
        .route("/loans/:id/pay", post(api::handlers::record_payment_handler))
        .route_layer(middleware::from_fn(api::handlers::admin_auth_middleware));

    // --- MAIN APP ROUTER ---
    let app = Router::new()
        .route("/api/loans", post(api::handlers::create_loan_handler))
        .route("/api/webhooks/gateway", post(api::handlers::gateway_webhook_handler))
        .nest("/api/admin", admin_routes)
        .layer(cors)
        .with_state(loan_repo);

    let addr = "127.0.0.1:3000";
    println!("Village Loan Backend running on https://{}", addr);

    // --- FIXED SERVER BOOT (Axum 0.7 format) ---
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
