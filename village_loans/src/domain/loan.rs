use serde::{Deserialize, Serialize};
use chrono::{NaiveDate, Utc};

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum LoanType {
    OnlineDebitOrder,
    ManualVillageDeal,
}

impl LoanType {
    pub fn as_str(&self) -> &'static str {
        match self {
            LoanType::OnlineDebitOrder => "OnlineDebitOrder",
            LoanType::ManualVillageDeal => "ManualVillageDeal",
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Loan {
    id: String,
    customer_id: String,
    principal_amount: f64,
    interest_fee: f64,
    total_due: f64,
    duration_months: i32, // Changed to i32 for DB compatibility
    loan_type: LoanType,
    created_at: NaiveDate,
}

// This is the DTO for creating a new loan
#[derive(Deserialize)]
pub struct NewLoan {
    pub customer_id: String,
    pub requested_amount: f64,
    pub duration_months: i32,
    pub loan_type: LoanType,
}

impl Loan {
    pub fn new(customer_id: String, requested_amount: f64, duration_months: i32, loan_type: LoanType) -> Result<Self, String> {
        if requested_amount > 8000.0 { return Err("Maximum loan amount is R8000".to_string()); }
        if requested_amount <= 0.0 { return Err("Amount must be greater than 0".to_string()); }
        if duration_months > 6 { return Err("Maximum duration is 6 months".to_string()); }
        if duration_months <= 0 { return Err("Duration must be at least 1 month".to_string()); }

        let interest_fee = requested_amount * 0.30;
        let total_due = requested_amount + interest_fee;

        Ok(Self {
            id: uuid::Uuid::new_v4().to_string(),
            customer_id,
            principal_amount: requested_amount,
            interest_fee,
            total_due,
            duration_months,
            loan_type,
            created_at: Utc::now().date_naive(),
        })
    }

    // --- Getters for the Repository ---
    pub fn id(&self) -> &str { &self.id }
    pub fn customer_id(&self) -> &str { &self.customer_id }
    pub fn principal_amount(&self) -> f64 { self.principal_amount }
    pub fn interest_fee(&self) -> f64 { self.interest_fee }
    pub fn total_due(&self) -> f64 { self.total_due }
    pub fn duration_months(&self) -> i32 { self.duration_months }
    pub fn loan_type_str(&self) -> &'static str { self.loan_type.as_str() }
    pub fn created_at(&self) -> NaiveDate { self.created_at }
}