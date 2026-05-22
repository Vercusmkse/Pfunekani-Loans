use axum::{Json, extract::State, http::StatusCode, response::IntoResponse};
use serde::Deserialize;
use crate::repository::loan_repository::LoanRepository;

// The payload sent by the payment gateway
#[derive(Deserialize)]
pub struct GatewayWebhookPayload {
    pub mandate_id: String,       // Matches our database debit_order id
    pub gateway_reference: String, // Tracking number from the provider
    pub event_type: String,       // e.g., "MANDATE_AUTHORIZED", "MANDATE_REJECTED"
}

pub async fn gateway_webhook_handler(
    State(repo): State<LoanRepository>,
    Json(payload): Json<GatewayWebhookPayload>,
) -> impl IntoResponse {
    println!("[Webhook] Received event: {} for Mandate: {}", payload.event_type, payload.mandate_id);

    // 1. Look up the debit order from the database
    match repo.find_debit_order_by_id(&payload.mandate_id).await {
        Ok(Some(mut debit_order)) => {

            // 2. Apply Domain State Machine Rules based on the gateway event
            match payload.event_type.as_str() {
                "MANDATE_AUTHORIZED" => {
                    if let Err(err) = debit_order.authorize() {
                        return (StatusCode::BAD_REQUEST, Json(err)).into_response();
                    }
                    println!("[Webhook] Mandate successfully Authorized in domain system!");
                }
                "MANDATE_REJECTED" => {
                    debit_order.reject();
                    println!("[Webhook] Mandate rejected by customer banking application.");
                }
                _ => return (StatusCode::BAD_REQUEST, Json("Unknown event type")).into_response(),
            }

            // 3. Persist the state machine change back to PostgreSQL
            if let Err(db_err) = repo.update_debit_order_status(debit_order.id(), debit_order.status_str()).await {
                eprintln!("[Webhook] Database persistence failed: {}", db_err);
                return (StatusCode::INTERNAL_SERVER_ERROR, Json("Internal database update failure")).into_response();
            }

            // 4. (Optional Trigger) If Authorized, you can now trigger your payout system/API
            if debit_order.status_str() == "Authorized" {
                // Example: payout_service::disburse_funds_via_eft(&debit_order).await;
            }

            (StatusCode::OK, Json("Webhook processed successfully")).into_response()
        }
        Ok(None) => {
            eprintln!("[Webhook] Critical error: Mandate ID {} not found in system.", payload.mandate_id);
            (StatusCode::NOT_FOUND, Json("Mandate record not found")).into_response()
        }
        Err(e) => {
            eprintln!("[Webhook] Failed to query database: {}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, Json("Database error")).into_response()
        }
    }
}