pub mod domain;
pub mod services;
pub mod api;
pub mod repository;
pub mod workers;
pub mod error;

use axum::{routing::{get, post}, Router, middleware};
use sqlx::postgres::PgPoolOptions;
use dotenvy::dotenv;
use std::env;
use tower_http::cors::{CorsLayer, Any};
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use crate::repository::loan_repository::LoanRepository;
use tower_governor::{governor::GovernorConfigBuilder, GovernorLayer};
use once_cell::sync::Lazy;

static GOVERNOR_CONF: Lazy<Box<tower_governor::GovernorConfig>> = Lazy::new(|| {
    Box::new(
        GovernorConfigBuilder::default()
            .per_second(5)
            .burst_size(10)
            .finish()
            .unwrap(),
    )
});

pub fn app(repo: LoanRepository) -> Router {
    let admin_routes = Router::new()
        .route("/loans", get(api::handlers::list_loans_handler))
        .route("/loans/:id/pay", post(api::handlers::record_payment_handler))
        .route_layer(middleware::from_fn(api::handlers::admin_auth_middleware));

    Router::new()
        .route("/api/loans", post(api::handlers::create_loan_handler))
        .route("/api/webhooks/gateway", post(api::handlers::gateway_webhook_handler))
        .nest("/api/admin", admin_routes)
        .layer(CorsLayer::new().allow_origin(Any).allow_methods(Any).allow_headers(Any))
        .layer(TraceLayer::new_for_http())
        .layer(GovernorLayer { config: &GOVERNOR_CONF })
        .with_state(repo)
}

#[tokio::main]
async fn main() {
    dotenv().ok();

    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "village_loans=debug,tower_http=debug".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let db_url = env::var("DATABASE_URL").expect("DATABASE_URL missing");

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await
        .expect("Failed to connect to PostgreSQL");

    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("Failed to run database migrations");

    let loan_repo = LoanRepository::new(pool);

    workers::sms_reminder::start_daily_scheduler(loan_repo.clone()).await;
    workers::debit_collection::start_collection_scheduler(loan_repo.clone()).await;

    let app = app(loan_repo);

    let addr = "127.0.0.1:3000";
    tracing::debug!("listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}