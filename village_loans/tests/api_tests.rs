use axum::{
    body::Body,
    http::{self, Request, StatusCode},
};
use tower::ServiceExt; // for `oneshot`
use village_loans::api;
use village_loans::repository::loan_repository::LoanRepository;
use sqlx::PgPool;
use std::env;

async fn setup() -> LoanRepository {
    dotenvy::dotenv().ok();
    let db_url = env::var("DATABASE_URL").expect("DATABASE_URL missing");
    let pool = PgPool::connect(&db_url).await.unwrap();
    LoanRepository::new(pool)
}

#[tokio::test]
async fn test_create_loan() {
    let repo = setup().await;
    let app = api::app(repo);

    let response = app
        .oneshot(
            Request::builder()
                .method(http::Method::POST)
                .uri("/api/loans")
                .header(http::header::CONTENT_TYPE, "application/json")
                .body(Body::from(
                    r#"{
                        "customer_id": "test_customer",
                        "requested_amount": 1000.0,
                        "duration_months": 6,
                        "loan_type": "OnlineDebitOrder"
                    }"#,
                ))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::CREATED);
}

#[tokio::test]
async fn test_list_loans_unauthorized() {
    let repo = setup().await;
    let app = api::app(repo);

    let response = app
        .oneshot(
            Request::builder()
                .method(http::Method::GET)
                .uri("/api/admin/loans")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn test_list_loans_authorized() {
    let repo = setup().await;
    let app = api::app(repo);
    let secret_token = env::var("ADMIN_SECRET_TOKEN").unwrap();

    let response = app
        .oneshot(
            Request::builder()
                .method(http::Method::GET)
                .uri("/api/admin/loans")
                .header("Authorization", format!("Bearer {}", secret_token))
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);
}
