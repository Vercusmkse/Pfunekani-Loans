use tokio_cron_scheduler::{Job, JobScheduler};
use crate::repository::loan_repository::LoanRepository;
use std::sync::Arc;
use std::env;
use std::collections::HashMap;

pub async fn start_daily_scheduler(repo: LoanRepository) {
    let sched = JobScheduler::new().await.expect("Failed to initialize scheduler");

    let shared_repo = Arc::new(repo);

    sched.add(
        Job::new_async("0 0 8 * * *", move |_uuid, _locked| {
            let repo_clone = Arc::clone(&shared_repo);

            Box::pin(async move {
                println!("[Worker] Running daily SMS reminder check...");

                // 1. Fetch credentials securely from .env
                let at_username = env::var("AT_USERNAME").unwrap_or_else(|_| "sandbox".to_string());
                let at_api_key = env::var("AT_API_KEY").expect("AT_API_KEY must be set in .env");

                // 2. Automatically switch between Sandbox and Live URLs
                let url = if at_username == "sandbox" {
                    "https://api.sandbox.africastalking.com/version1/messaging"
                } else {
                    "https://api.africastalking.com/version1/messaging"
                };

                match repo_clone.get_manual_loans_due_for_reminder().await {
                    Ok(loans) => {
                        let client = reqwest::Client::new();

                        for loan in loans {
                            // Ensure your customer_id in the DB is saved as a full number (e.g., +27821234567)
                            let phone_number = loan.customer_id;

                            let message = format!(
                                "Village Loans: Friendly reminder, your payment of R{:.2} is due soon. Please have the cash ready.",
                                loan.total_due
                            );

                            println!("[Worker] Sending SMS to {}...", phone_number);

                            // 3. Africa's Talking requires Form Data, NOT JSON
                            let mut params = HashMap::new();
                            params.insert("username", at_username.as_str());
                            params.insert("to", phone_number.as_str());
                            params.insert("message", message.as_str());

                            // 4. Fire the request
                            let res = client.post(url)
                                .header("apiKey", &at_api_key)
                                .header("Accept", "application/json")
                                .form(&params) // This correctly encodes it as x-www-form-urlencoded
                                .send()
                                .await;

                            match res {
                                Ok(response) => {
                                    if response.status().is_success() {
                                        println!("[Worker] SMS Sent Successfully to {}", phone_number);
                                    } else {
                                        let error_text = response.text().await.unwrap_or_else(|_| String::new());
                                        eprintln!("[Worker] SMS Failed. Status: {}. Details: {}", error_text, error_text);
                                    }
                                }
                                Err(err) => eprintln!("[Worker] HTTP Request completely failed: {}", err),
                            }
                        }
                    },
                    Err(e) => eprintln!("[Worker] Failed to fetch due loans from DB: {}", e),
                }
            })
        }).expect("Failed to create async job")
    ).await.expect("Failed to add job to scheduler");

    sched.start().await.expect("Failed to start scheduler");
    println!("Background SMS Scheduler started. Target time: 08:00 AM daily.");
}