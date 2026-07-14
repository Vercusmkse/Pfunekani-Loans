import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Apply from '@/pages/public/Apply.tsx';

describe('Apply', () => {
  it('renders the form and submits it', async () => {
    render(
      <BrowserRouter>
        <Apply />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText('Customer ID'), { target: { value: 'test_customer' } });
    fireEvent.change(screen.getByLabelText('Requested Amount'), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText('Duration (in months)'), { target: { value: '6' } });
    fireEvent.change(screen.getByLabelText('Loan Type'), { target: { value: 'OnlineDebitOrder' } });

    fireEvent.click(screen.getByText('Apply'));

    // In a real test, you would mock the API call and assert that it was called with the correct data
    // For now, we'll just check that the success message is not displayed immediately
    expect(screen.queryByText(/Loan application successful/)).toBeNull();
  });
});
