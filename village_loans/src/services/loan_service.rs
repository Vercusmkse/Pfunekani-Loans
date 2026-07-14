use crate::domain::loan::{Loan, NewLoan};
use crate::repository::loan_repository::LoanRepository;
use crate::error::{Result, Error};

pub async fn create_loan(repo: LoanRepository, new_loan: NewLoan) -> Result<String> {
    let loan = Loan::new(
        new_loan.customer_id,
        new_loan.requested_amount,
        new_loan.duration_months,
        new_loan.loan_type,
    ).map_err(Error::LoanCreationError)?;

    repo.save(&loan).await?;

    Ok(loan.id().to_string())
}