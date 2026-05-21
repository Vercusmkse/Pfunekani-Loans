use serde::{Deserialize, Serialize};
use chrono::{NaiveDate, Utc};

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum LoanType {
    OnlineDebitOrder,
    ManualVillageDeal,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Loan {
    // Private fields: Encapsulation prevents external tampering
    id: String,
    customer_id: String,
    principal_amount: f64,
    interest_fee: f64,
    total_due: f64,
    duration_months: u8,
    loan_type: LoanType,
    created_at: NaiveDate,
}

impl Loan {
    // Constructor method enforcing your exact business rules
    pub fn new(
        customer_id: String,
        requested_amount: f64,
        duration_months: u8,
        loan_type: LoanType,
    ) -> Result<Self, String> {
        if requested_amount > 8000.0 {
            return Err("Maximum loan amount is R8000".to_string());
        }
        if requested_amount <= 0.0 {
            return Err("Amount must be greater than 0".to_string());
        }
        if duration_months > 6 {
            return Err("Maximum duration is 6 months".to_string());
        }
        if duration_months == 0 {
            return Err("Duration must be at least 1 month".to_string());
        }

        let interest_fee = requested_amount * 0.30; // 30% fixed interest
        let total_due = requested_amount + interest_fee;

        Ok(Self {
            id: uuid::Uuid::new_v4().to_string(), // Requires 'cargo add uuid --features v4'
            customer_id,
            principal_amount: requested_amount,
            interest_fee,
            total_due,
            duration_months,
            loan_type,
            created_at: Utc::now().naive_utc(),
        })
    }

    // Getters
    pub fn total_due(&self) -> f64 {
        self.total_due
    }

    pub fn is_online(&self) -> bool {
        self.loan_type == LoanType::OnlineDebitOrder
    }
}