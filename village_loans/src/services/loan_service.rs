use crate::domain::loan::{Loan, LoanType};
use crate::domain::debit_order::DebitOrder;
// use crate::repository::loan_repository::LoanRepository;

pub struct LoanService;

impl LoanService {
    pub async fn process_application(
        // repo: &LoanRepository,
        customer_id: String,
        amount: f64,
        duration: i32,
        is_manual: bool,
        bank_name: Option<String>,       // NEW: Required for online apps
        account_number: Option<String>,  // NEW: Required for online apps
    ) -> Result<(Loan, Option<DebitOrder>), String> {

        let loan_type = if is_manual { LoanType::ManualVillageDeal } else { LoanType::OnlineDebitOrder };

        // 1. Create the base loan
        let new_loan = Loan::new(customer_id, amount, duration, loan_type.clone())?;

        // 2. If it's an online loan, enforce banking details and create the Mandate
        let mut mandate = None;

        if loan_type == LoanType::OnlineDebitOrder {
            let bank = bank_name.ok_or("Bank name is required for online loans")?;
            let acc_num = account_number.ok_or("Account number is required for online loans")?;

            // Calculate the exact monthly deduction amount
            let monthly_installment = new_loan.total_due() / (new_loan.duration_months() as f64);

            let new_mandate = DebitOrder::new(
                new_loan.id().to_string(),
                bank,
                acc_num,
                monthly_installment
            );

            mandate = Some(new_mandate);

            // NOTE: In a live system, this is where you would make an HTTP request
            // to a gateway like Netcash or Stitch to register the DebiCheck mandate with the bank.
        }

        // 3. Save to database (You would update your repo to save both records in a single SQL transaction)
        // repo.save_loan_and_mandate(&new_loan, &mandate).await?;

        Ok((new_loan, mandate))
    }
}