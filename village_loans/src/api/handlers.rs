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
use std::env;
use crate::error::{Result, Error};

pub async fn create_loan_handler(
    State(repo): State<LoanRepository>,
    Json(payload): Json<NewLoan>,
) -> Result<impl IntoResponse> {
    let loan_id = loan_service::create_loan(repo, payload).await?;
    Ok((StatusCode::CREATED, Json(loan_id)))
}

pub async fn gateway_webhook_handler(
    State(_repo): State<LoanRepository>,
    Json(_payload): Json<serde_json::Value>,
) -> Result<impl IntoResponse> {
    // Implement webhook logic here
    Ok(StatusCode::OK)
}

pub async fn admin_auth_middleware(req: Request, next: Next) -> Result<impl IntoResponse> {
    let auth_header = req.headers().get("Authorization")
        .and_then(|header| header.to_str().ok());

    let secret_token = env::var("ADMIN_SECRET_TOKEN").unwrap_or_else(|_| "default_token".to_string());
    let expected_token = format!("Bearer {}", secret_token);

    if auth_header == Some(&expected_token) {
        Ok(next.run(req).await)
    } else {
        Err(Error::Auth)
    }
}

pub async fn list_loans_handler(State(repo): State<LoanRepository>) -> Result<impl IntoResponse> {
    let loans = repo.get_all_loans().await?;
    Ok((StatusCode::OK, Json(loans)))
}

#[derive(Deserialize)]
pub struct PaymentRequest {
    pub amount: f64,
}

pub async fn record_payment_handler(
    State(repo): State<LoanRepository>,
    Path(loan_id): Path<String>,
    Json(payload): Json<PaymentRequest>,
) -> Result<impl IntoResponse> {
    repo.record_payment(&loan_id, payload.amount).await?;
    Ok((StatusCode::OK, Json("Payment recorded successfully")))
}