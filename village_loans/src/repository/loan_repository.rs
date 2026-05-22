use sqlx::PgPool;
use crate::domain::loan::Loan;

#[derive(Clone)]
pub struct LoanRepository {
    pool: PgPool,
}

impl LoanRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    // Asynchronously insert the Domain Object into PostgreSQL
    pub async fn save(&self, loan: &Loan) -> Result<(), sqlx::Error> {
        let query = r#"
            INSERT INTO loans
            (id, customer_id, principal_amount, interest_fee, total_due, duration_months, loan_type, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        "#;

        sqlx::query(query)
            .bind(loan.id())
            .bind(loan.customer_id())
            .bind(loan.principal_amount())
            .bind(loan.interest_fee())
            .bind(loan.total_due())
            .bind(loan.duration_months())
            .bind(loan.loan_type_str())
            .bind(loan.created_at())
            .execute(&self.pool)
            .await?;

        Ok(())
    }
}
// Add this to your existing loan_repository.rs

// A lightweight struct just for the background worker
#[derive(Debug)]
pub struct DueLoanNotification {
    pub customer_id: String,
    pub total_due: f64,
}

impl LoanRepository {
    // Fetches manual loans that need a reminder today
    pub async fn get_manual_loans_due_for_reminder(&self) -> Result<Vec<DueLoanNotification>, sqlx::Error> {
        // In a production scenario, you would filter by a 'next_payment_date'.
        // For this example, we fetch 'ManualVillageDeal' loans.
        let query = r#"
            SELECT customer_id, total_due
            FROM loans
            WHERE loan_type = 'ManualVillageDeal'
        "#;

        let due_loans = sqlx::query_as!(
            DueLoanNotification,
            query
        )
            .fetch_all(&self.pool)
            .await?;

        Ok(due_loans)
    }
}

// Add these to your existing LoanRepository implementation block

impl LoanRepository {
    // 1. Fetch a debit order mandate by its ID
    pub async fn find_debit_order_by_id(&self, id: &str) -> Result<Option<crate::domain::debit_order::DebitOrder>, sqlx::Error> {
        let query = r#"
            SELECT id, loan_id, bank_name, account_number, monthly_amount, mandate_status
            FROM debit_orders
            WHERE id = $1
        "#;

        // Map the flat row back into your rich Domain Object
        let row = sqlx::query!(query, id)
            .fetch_optional(&self.pool)
            .await?;

        if let Some(r) = row {
            // Reconstruct the Domain Object using a mapping mechanism
            // (You might need to expose a public constructor or fields for reconstruction depending on your visibility rules)
            Ok(Some(crate::domain::debit_order::DebitOrder::new_from_db(
                r.id,
                r.loan_id,
                r.bank_name,
                r.account_number,
                r.monthly_amount,
                r.mandate_status,
            )))
        } else {
            Ok(None)
        }
    }

    // 2. Update the status of a debit order mandate
    pub async fn update_debit_order_status(&self, id: &str, status: &str) -> Result<(), sqlx::Error> {
        let query = r#"
            UPDATE debit_orders
            SET mandate_status = $2
            WHERE id = $1
        "#;

        sqlx::query(query)
            .bind(id)
            .bind(status)
            .execute(&self.pool)
            .await?;

        Ok(())
    }
}