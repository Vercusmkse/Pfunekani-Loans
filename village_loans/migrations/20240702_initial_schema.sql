-- Create the loans table
CREATE TABLE loans (
    id UUID PRIMARY KEY,
    customer_id TEXT NOT NULL,
    principal_amount REAL NOT NULL,
    interest_fee REAL NOT NULL,
    total_due REAL NOT NULL,
    duration_months INTEGER NOT NULL,
    loan_type TEXT NOT NULL,
    created_at DATE NOT NULL
);

-- Create the debit_orders table
CREATE TABLE debit_orders (
    id UUID PRIMARY KEY,
    loan_id UUID NOT NULL REFERENCES loans(id),
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    monthly_amount REAL NOT NULL,
    mandate_status TEXT NOT NULL
);
