use tokio_cron_scheduler::{Job, JobScheduler};
use crate::repository::loan_repository::LoanRepository;
use std::sync::Arc;

pub async fn start_collection_scheduler(repo: LoanRepository) {
    let sched = JobScheduler::new().await.expect("Failed to initialize scheduler");

    let _shared_repo = Arc::new(repo);

    sched.add(
        Job::new_async("0 0 2 * * *", move |_uuid, _locked| {
            let _repo_clone = Arc::clone(&_shared_repo);

            Box::pin(async move {
                tracing::info!("[Worker] Running daily debit collection check...");

                // In a real system, you would fetch loans that are due for debit collection
                // For now, we'll just log a message
                tracing::info!("[Worker] No debit orders to process today.");
            })
        }).expect("Failed to create async job")
    ).await.expect("Failed to add job to scheduler");

    sched.start().await.expect("Failed to start scheduler");
    tracing::info!("Background Debit Collection Scheduler started. Target time: 02:00 AM daily.");
}