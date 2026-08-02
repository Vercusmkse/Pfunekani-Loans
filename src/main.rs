use village_loans::*;
use sqlx::postgres::PgPoolOptions;
use dotenvy::dotenv;
use std::{env, net::SocketAddr};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

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

    sqlx::migrate!()
        .run(&pool)
        .await
        .expect("Failed to run database migrations");

    let loan_repo = repository::loan_repository::LoanRepository::new(pool);

    workers::sms_reminder::start_daily_scheduler(loan_repo.clone()).await;
    workers::debit_collection::start_collection_scheduler(loan_repo.clone()).await;

    let app = app(loan_repo);

    let addr = "0.0.0.0:3000";
    tracing::debug!("listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();

    axum::serve(
        listener,
        app.into_make_service_with_connect_info::<SocketAddr>()
    )
        .await
        .unwrap();
}