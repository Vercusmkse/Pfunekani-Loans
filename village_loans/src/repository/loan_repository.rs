use sqlx::PgPool;
use crate::domain::loan::Loan;
use serde::{Serialize, Deserialize};
use crate::domain::debit_order::DebitOrder;

// DTO for the admin dashboard
#[derive(Serialize, Deserialize, sqlx::FromRow)]
pub struct AdminLoanView {
    pub id: String,
    pub customer_id: String,
    pub total_due: f64,
    pub loan_type: String,
}

// A lightweight struct just for the background worker
#[derive(Debug, sqlx::FromRow)]
pub struct DueLoanNotification {
    pub customer_id: String,
    pub total_due: f64,
}

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
        //noinspection SqlResolve,SqlMissingDataSourceInspection,SqlDialectInspection
        sqlx::query(
            r#"
            INSERT INTO loans
            (id, customer_id, principal_amount, interest_fee, total_due, duration_months, loan_type, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            "#,
        )
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

    // Fetch all active loans for the dashboard
    pub async fn get_all_loans(&self) -> Result<Vec<AdminLoanView>, sqlx::Error> {
        //noinspection SqlResolve,SqlMissingDataSourceInspection,SqlDialectInspection
        let loans = sqlx::query_as(
            r#"
                SELECT id, customer_id, total_due, loan_type
                FROM loans
            "#
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(loans)
    }

    pub async fn record_payment(&self, loan_id: &str, amount: f64) -> Result<(), sqlx::Error> {
        // In a real app, this would update the balance. For now, it's a placeholder.
        println!("Recorded payment of {} for loan {}", amount, loan_id);
        Ok(())
    }

    // Fetches manual loans that need a reminder today
    pub async fn get_manual_loans_due_for_reminder(&self) -> Result<Vec<DueLoanNotification>, sqlx::Error> {
        //noinspection SqlResolve,SqlMissingDataSourceInspection,SqlDialectInspection
        let due_loans = sqlx::query_as(
            r#"
                SELECT customer_id, total_due
                FROM loans
                WHERE loan_type = 'ManualVillageDeal'
            "#
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(due_loans)
    }

    // 1. Fetch a debit order mandate by its ID
    pub async fn find_debit_order_by_id(&self, id: &str) -> Result<Option<DebitOrder>, sqlx::Error> {
        //noinspection SqlResolve,SqlMissingDataSourceInspection,SqlDialectInspection
        let row = sqlx::query(
            r#"
                SELECT id, loan_id, bank_name, account_number, monthly_amount as "monthly_amount!", mandate_status as "mandate_status!"
                FROM debit_orders
                WHERE id = $1
            "#,
        )
        .bind(id)
        .map(|r: sqlx::postgres::PgRow| {
            use sqlx::Row;
            DebitOrder::new_from_db(
                r.get("id"),
                r.get("loan_id"),
                r.get("bank_name"),
                r.get("account_number"),
                r.get("monthly_amount!"), // Use the name as specified in the alias in some ways
                r.get("mandate_status!"),
            )
        })
        .fetch_optional(&self.pool)
        .await?;

        Ok(row)
    }

    // 2. Update the status of a debit order mandate
    pub async fn update_debit_order_status(&self, id: &str, status: &str) -> Result<(), sqlx::Error> {
        //noinspection SqlResolve,SqlMissingDataSourceInspection,SqlDialectInspection
        sqlx::query(
            r#"
                UPDATE debit_orders
                SET mandate_status = $2
                WHERE id = $1
            "#,
        )
        .bind(id)
        .bind(status)
        .execute(&self.pool)
        .await?;

        Ok(())
    }
}