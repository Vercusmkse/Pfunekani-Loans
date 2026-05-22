use crate::domain::loan::{Loan, NewLoan};
use crate::repository::loan_repository::LoanRepository;

pub async fn create_loan(repo: LoanRepository, new_loan: NewLoan) -> Result<String, String> {
    let loan = Loan::new(
        new_loan.customer_id,
        new_loan.requested_amount,
        new_loan.duration_months,
        new_loan.loan_type,
    )?;

    repo.save(&loan).await.map_err(|e| e.to_string())?;

    Ok(loan.id().to_string())
}