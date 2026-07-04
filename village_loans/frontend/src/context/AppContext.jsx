import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

const INITIAL_LOANS = [
    {
        id: "PL-5591",
        borrowerName: "Thabo Khumalo",
        borrowerTier: "First-Timer",
        phone: "0825551234",
        amount: 500,
        interest: 200,
        totalRepayable: 700,
        remainingBalance: 700,
        interestPaid: 0,
        dateApplied: "2026-06-28",
        dueDate: "2026-07-28",
        status: "Active"
    },
    {
        id: "PL-9024",
        borrowerName: "Lerato Spaza Hub",
        borrowerTier: "Senior",
        phone: "0713339876",
        amount: 7500,
        interest: 3000,
        totalRepayable: 10500,
        remainingBalance: 10500,
        interestPaid: 3000,
        dateApplied: "2026-06-05",
        dueDate: "2026-07-05",
        status: "Active"
    },
    {
        id: "PL-1102",
        borrowerName: "Ndivhuwo Bakery",
        borrowerTier: "Senior",
        phone: "0642221100",
        amount: 10000,
        interest: 4000,
        totalRepayable: 14000,
        remainingBalance: 0,
        interestPaid: 4000,
        dateApplied: "2026-05-01",
        dueDate: "2026-05-31",
        status: "Settled"
    }
];

export function AppProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loans, setLoans] = useState(() => {
        const saved = localStorage.getItem('pfunekani_loans');
        return saved ? JSON.parse(saved) : INITIAL_LOANS;
    });

    const targetWhatsApp = "0790397516";

    useEffect(() => {
        localStorage.setItem('pfunekani_loans', JSON.stringify(loans));
    }, [loans]);

    const createLoanRequest = (user, requestedAmount, description) => {
        const limit = user.tier === 'Senior' ? 10000 : 500;
        if (requestedAmount > limit) {
            return { success: false, msg: `Tier restriction: Max borrowing capacity is R${limit}` };
        }

        const interestFee = requestedAmount * 0.40;
        const totalRepayable = requestedAmount + interestFee;

        const today = new Date();
        const futureDue = new Date();
        futureDue.setDate(today.getDate() + 30);

        const newApplication = {
            id: `PL-${Math.floor(1000 + Math.random() * 9000)}`,
            borrowerName: user.name,
            borrowerTier: user.tier,
            phone: user.phone || "0790397516",
            amount: requestedAmount,
            interest: interestFee,
            totalRepayable: totalRepayable,
            remainingBalance: totalRepayable,
            interestPaid: 0,
            dateApplied: today.toISOString().split('T')[0],
            dueDate: futureDue.toISOString().split('T')[0],
            purpose: description || "Operational Cash Bridge",
            status: "Pending Approval"
        };

        setLoans(prev => [newApplication, ...prev]);
        return { success: true, loan: newApplication };
    };

    const approveLoan = (loanId) => {
        setLoans(prev => prev.map(l => l.id === loanId ? { ...l, status: "Active" } : l));
        const targetLoan = loans.find(l => l.id === loanId);

        if (targetLoan) {
            const payloadMessage = `⚡ Pfunekani Loans Notification ⚡\n\nHello ${targetLoan.borrowerName},\nYour application ${targetLoan.id} has been APPROVED! 🎉\n\n• Principal: R${targetLoan.amount}\n• Fee (40%): R${targetLoan.interest}\n• Due Date (30 Days): ${targetLoan.dueDate}\n• Total Repayable: R${targetLoan.totalRepayable}\n\nOur system agent will dispatch funds directly. Thank you for building your community rating!`;
            window.open(`https://wa.me/${targetWhatsApp}?text=${encodeURIComponent(payloadMessage)}`, '_blank');
        }
    };

    const clearLoanAsPaid = (loanId) => {
        setLoans(prev => prev.map(l => l.id === loanId ? { ...l, remainingBalance: 0, status: "Settled" } : l));
    };

    const payClientInterestOnly = (loanId) => {
        setLoans(prev => prev.map(l => {
            if (l.id === loanId) {
                const remainingAfterInterest = Math.max(l.amount, l.remainingBalance - l.interest);
                return {
                    ...l,
                    interestPaid: l.interest,
                    remainingBalance: remainingAfterInterest
                };
            }
            return l;
        }));
    };

    const extendLoanDuration30Days = (loanId) => {
        const activeLoan = loans.find(l => l.id === loanId);
        if (!activeLoan) return { success: false, msg: "Transaction vector missing." };

        if (activeLoan.interestPaid < activeLoan.interest) {
            return {
                success: false,
                msg: `Rejected: Extension requires a verified payment of the 40% cycle interest (R${activeLoan.interest}).`
            };
        }

        setLoans(prev => prev.map(l => {
            if (l.id === loanId) {
                const parseCurrentDue = new Date(l.dueDate);
                parseCurrentDue.setDate(parseCurrentDue.getDate() + 30);

                const recurringInterestLayer = l.amount * 0.40;
                return {
                    ...l,
                    dueDate: parseCurrentDue.toISOString().split('T')[0],
                    interest: l.interest + recurringInterestLayer,
                    totalRepayable: l.totalRepayable + recurringInterestLayer,
                    remainingBalance: l.remainingBalance + recurringInterestLayer,
                    interestPaid: 0,
                    status: "Extended"
                };
            }
            return l;
        }));

        return { success: true };
    };

    const sendProximityReminderMessage = (loanId) => {
        const targetLoan = loans.find(l => l.id === loanId);
        if (targetLoan) {
            const warningMessage = `⚠️ Pfunekani Cycle Reminder ⚠️\n\nDear ${targetLoan.borrowerName},\nYour active loan ${targetLoan.id} matures in less than 5 days (${targetLoan.dueDate}).\n\nOutstanding Settlement: R${targetLoan.remainingBalance}\n\nTo apply for a 30-Day extension, please ensure your baseline 40% interest fee (R${targetLoan.interest}) is transferred immediately to prevent portfolio defaults.`;
            window.open(`https://wa.me/${targetWhatsApp}?text=${encodeURIComponent(warningMessage)}`, '_blank');
        }
    };

    return (
        <AppContext.Provider value={{
            currentUser, setCurrentUser,
            loans, setLoans,
            targetWhatsApp,
            createLoanRequest, approveLoan, clearLoanAsPaid, extendLoanDuration30Days, payClientInterestOnly, sendProximityReminderMessage
        }}>
            {children}
        </AppContext.Provider>
    );
}

export const useApp = () => useContext(AppContext);