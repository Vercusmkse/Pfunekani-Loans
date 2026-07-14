use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use std::fmt;

pub type Result<T> = std::result::Result<T, Error>;

#[derive(Debug)]
pub enum Error {
    // -- App Errors
    LoanCreationError(String),

    // -- External Errors
    Sqlx(sqlx::Error),
    Reqwest(reqwest::Error),

    // -- Auth Errors
    Auth,
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{:?}", self)
    }
}

impl IntoResponse for Error {
    fn into_response(self) -> Response {
        let (status, error_message) = match self {
            Error::LoanCreationError(msg) => (StatusCode::BAD_REQUEST, msg),
            Error::Sqlx(_) => (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()),
            Error::Reqwest(_) => (StatusCode::INTERNAL_SERVER_ERROR, "External service error".to_string()),
            Error::Auth => (StatusCode::UNAUTHORIZED, "Unauthorized".to_string()),
        };

        let body = Json(json!({ "error": error_message }));
        (status, body).into_response()
    }
}

impl From<sqlx::Error> for Error {
    fn from(err: sqlx::Error) -> Self {
        Error::Sqlx(err)
    }
}

impl From<reqwest::Error> for Error {
    fn from(err: reqwest::Error) -> Self {
        Error::Reqwest(err)
    }
}
