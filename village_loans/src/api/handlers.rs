use axum::{
    Json,
    extract::{State, Path, Request},
    http::StatusCode,
    response::IntoResponse,
    middleware::Next
};
use crate::repository::loan_repository::LoanRepository;
use crate::services::loan_service;
use crate::domain::loan::NewLoan;
use serde::Deserialize;
use serde_json;

pub async fn create_loan_handler(
    State(repo): State<LoanRepository>,
    Json(payload): Json<NewLoan>,
) -> impl IntoResponse {
    match loan_service::create_loan(repo, payload).await {
        Ok(loan_id) => (StatusCode::CREATED, Json(loan_id)).into_response(),
        Err(_) => (StatusCode::INTERNAL_SERVER_ERROR).into_response(),
    }
}

pub async fn gateway_webhook_handler(
    State(repo): State<LoanRepository>,
    Json(payload): Json<serde_json::Value>,
) -> impl IntoResponse {
    // Implement webhook logic here
    (StatusCode::OK).into_response()
}

pub async fn admin_auth_middleware(req: Request, next: Next) -> Result<impl IntoResponse, StatusCode> {
    let auth_header = req.headers().get("Authorization")
        .and_then(|header| header.to_str().ok());

    let secret_token = "Bearer my_super_secret_admin_token_123";

    if auth_header == Some(secret_token) {
        Ok(next.run(req).await)
    } else {
        Err(StatusCode::UNAUTHORIZED)
    }
}

pub async fn list_loans_handler(State(repo): State<LoanRepository>) -> impl IntoResponse {
    match repo.get_all_loans().await {
        Ok(loans) => (StatusCode::OK, Json(loans)).into_response(),
        Err(e) => {
            eprintln!("DB Error: {}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, Json("Failed to fetch loans")).into_response()
        }
    }
}

#[derive(Deserialize)]
pub struct PaymentRequest {
    pub amount: f64,
}

pub async fn record_payment_handler(
    State(repo): State<LoanRepository>,
    Path(loan_id): Path<String>,
    Json(payload): Json<PaymentRequest>,
) -> impl IntoResponse {
    match repo.record_payment(&loan_id, payload.amount).await {
        Ok(_) => (StatusCode::OK, Json("Payment recorded successfully")).into_response(),
        Err(e) => {
            eprintln!("DB Error: {}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, Json("Database error")).into_response()
        }
    }
}