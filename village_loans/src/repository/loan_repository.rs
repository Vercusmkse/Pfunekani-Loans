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