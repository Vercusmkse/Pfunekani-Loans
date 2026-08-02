use axum::{
    body::{to_bytes, Body},
    extract::ConnectInfo,
    http::{self, Request, StatusCode},
    Router,
};
use std::net::SocketAddr;
use tower::ServiceExt; // for `oneshot`
use village_loans::*;
use sqlx::postgres::PgPoolOptions;
use std::env;

async fn setup_test_app() -> Router {
    // 1. Load .env file
    dotenvy::dotenv().ok();

    // 2. Fallback / fix DATABASE_URL for Windows host testing
    let db_url = env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgres://postgres:%23123Vercus@localhost:5432/village_loans".to_string())
        .replace("host.docker.internal", "localhost");

    // 3. Ensure ADMIN_SECRET_TOKEN is set for test context
    if env::var("ADMIN_SECRET_TOKEN").is_err() {
        unsafe {
            env::set_var("ADMIN_SECRET_TOKEN", "my_super_secret_admin_token_123");
        }
    }

    // 4. Create Postgres Pool
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await
        .expect("Failed to connect to Postgres test database");

    // 5. Build your Axum router with test state
    app(repository::loan_repository::LoanRepository::new(pool))
}

#[tokio::test]
async fn test_create_loan() {
    let app = setup_test_app().await;

    let request = Request::builder()
        .method(http::Method::POST)
        .uri("/api/loans")
        .header(http::header::CONTENT_TYPE, "application/json")
        .extension(ConnectInfo(SocketAddr::from(([127, 0, 0, 1], 8080))))
        .body(Body::from(
            r#"{
                "customer_id": "test_customer",
                "requested_amount": 1000.0,
                "duration_months": 6,
                "loan_type": "OnlineDebitOrder"
            }"#,
        ))
        .unwrap();

    let response = app.oneshot(request).await.unwrap();

    let status = response.status();
    let body_bytes = to_bytes(response.into_body(), usize::MAX).await.unwrap();
    let body_str = String::from_utf8_lossy(&body_bytes);
    println!("\n>>> TEST ERROR DETAILS (create_loan): {}\n", body_str);

    assert_eq!(status, StatusCode::CREATED);
}

#[tokio::test]
async fn test_list_loans_unauthorized() {
    let app = setup_test_app().await;

    let request = Request::builder()
        .method(http::Method::GET)
        .uri("/api/admin/loans")
        .extension(ConnectInfo(SocketAddr::from(([127, 0, 0, 1], 8080))))
        .body(Body::empty())
        .unwrap();

    let response = app.oneshot(request).await.unwrap();

    let status = response.status();
    let body_bytes = to_bytes(response.into_body(), usize::MAX).await.unwrap();
    let body_str = String::from_utf8_lossy(&body_bytes);
    println!("\n>>> TEST ERROR DETAILS (unauthorized): {}\n", body_str);

    assert_eq!(status, StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn test_list_loans_authorized() {
    let app = setup_test_app().await;
    let secret_token = env::var("ADMIN_SECRET_TOKEN").unwrap();

    let request = Request::builder()
        .method(http::Method::GET)
        .uri("/api/admin/loans")
        .header("Authorization", format!("Bearer {}", secret_token))
        .extension(ConnectInfo(SocketAddr::from(([127, 0, 0, 1], 8080))))
        .body(Body::empty())
        .unwrap();

    let response = app.oneshot(request).await.unwrap();

    let status = response.status();
    let body_bytes = to_bytes(response.into_body(), usize::MAX).await.unwrap();
    let body_str = String::from_utf8_lossy(&body_bytes);
    println!("\n>>> TEST ERROR DETAILS (authorized): {}\n", body_str);

    assert_eq!(status, StatusCode::OK);
}