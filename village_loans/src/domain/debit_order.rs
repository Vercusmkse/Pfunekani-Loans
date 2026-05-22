use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum MandateStatus {
    PendingAuthorization, // Waiting for user to click 'Accept' on their phone
    Authorized,           // The bank approved it, we can collect
    Rejected,             // User explicitly clicked 'Decline'
    Failed,               // The actual monthly collection bounced
}

impl MandateStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            MandateStatus::PendingAuthorization => "PendingAuthorization",
            MandateStatus::Authorized => "Authorized",
            MandateStatus::Rejected => "Rejected",
            MandateStatus::Failed => "Failed",
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DebitOrder {
    id: String,
    loan_id: String,
    bank_name: String,
    account_number: String,
    monthly_amount: f64,
    status: MandateStatus,
}

impl DebitOrder {
    // Constructor: All new mandates MUST start as PendingAuthorization
    pub fn new(loan_id: String, bank_name: String, account_number: String, monthly_amount: f64) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            loan_id,
            bank_name,
            account_number,
            monthly_amount,
            status: MandateStatus::PendingAuthorization,
        }
    }

    // State Transition: Approve
    pub fn authorize(&mut self) -> Result<(), String> {
        if self.status != MandateStatus::PendingAuthorization {
            return Err("Only pending mandates can be authorized.".to_string());
        }
        self.status = MandateStatus::Authorized;
        Ok(())
    }

    // State Transition: Reject
    pub fn reject(&mut self) {
        self.status = MandateStatus::Rejected;
    }

    // Getters for the Repository layer
    pub fn id(&self) -> &str { &self.id }
    pub fn loan_id(&self) -> &str { &self.loan_id }
    pub fn bank_name(&self) -> &str { &self.bank_name }
    pub fn account_number(&self) -> &str { &self.account_number }
    pub fn monthly_amount(&self) -> f64 { self.monthly_amount }
    pub fn status_str(&self) -> &'static str { self.status.as_str() }

    // Add this inside impl DebitOrder in src/domain/debit_order.rs
    pub fn new_from_db(id: String, loan_id: String, bank_name: String, account_number: String, monthly_amount: f64, status_str: String) -> Self {
        let status = match status_str.as_str() {
            "Authorized" => MandateStatus::Authorized,
            "Rejected" => MandateStatus::Rejected,
            "Failed" => MandateStatus::Failed,
            _ => MandateStatus::PendingAuthorization,
        };
        Self { id, loan_id, bank_name, account_number, monthly_amount, status }
    }
}