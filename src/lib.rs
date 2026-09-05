pub mod domain;
pub mod services;
pub mod api;
pub mod repository;
pub mod workers;
pub mod error;

use axum::{routing::{get, post}, Router, middleware};
use std::sync::Arc;
use tower_http::cors::{CorsLayer, Any};
use tower_http::trace::TraceLayer;
use crate::repository::loan_repository::LoanRepository;
use tower_governor::{governor::GovernorConfigBuilder, GovernorLayer, key_extractor::SmartIpKeyExtractor};

pub fn app(repo: LoanRepository) -> Router {
    // 1. Wrap in Arc::new
    let governor_conf = Arc::new(
        GovernorConfigBuilder::default()
            .key_extractor(SmartIpKeyExtractor)
            .per_second(5)
            .burst_size(10)
            .finish()
            .unwrap(),
    );

    let admin_routes = Router::new()
        .route("/loans", get(api::handlers::list_loans_handler))
        .route("/loans/:id/pay", post(api::handlers::record_payment_handler))
        .route_layer(middleware::from_fn(api::handlers::admin_auth_middleware));

    Router::new()
        .route("/", get(|| async { "Pfunekani Loans API is live" }))
        .route("/health", get(|| async { "OK" }))
        .route("/api/loans", post(api::handlers::create_loan_handler))
        .route("/api/webhooks/gateway", post(api::handlers::gateway_webhook_handler))
        .nest("/api/admin", admin_routes)
        .layer(CorsLayer::new().allow_origin(Any).allow_methods(Any).allow_headers(Any))
        .layer(TraceLayer::new_for_http())
        // 2. Pass the Arc directly to GovernorLayer
        .layer(GovernorLayer {
            config: governor_conf,
        })
        .with_state(repo)
}