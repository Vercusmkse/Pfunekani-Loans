import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '@/pages/admin/Dashboard.tsx';
import { api } from '@/services/api';
import { vi } from 'vitest';

// Mock the api module
vi.mock('@/services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    interceptors: {
        request: {
            use: vi.fn()
        }
    }
  },
}));

const mockLoans = [
  { id: '1', customer_id: 'cust1', total_due: 1200, loan_type: 'OnlineDebitOrder' },
  { id: '2', customer_id: 'cust2', total_due: 2400, loan_type: 'ManualVillageDeal' },
];

describe('Dashboard', () => {
  it('fetches and displays loans', async () => {
    // @ts-ignore
    api.get.mockResolvedValue({ data: mockLoans });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(await screen.findByText('cust1')).toBeInTheDocument();
    expect(screen.getByText('cust2')).toBeInTheDocument();
  });

  it('records a payment', async () => {
    // @ts-ignore
    api.get.mockResolvedValue({ data: mockLoans });
    // @ts-ignore
    api.post.mockResolvedValue({ data: 'Payment recorded successfully' });
    window.prompt = vi.fn(() => '100');

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    const recordButtons = await screen.findAllByText('Record Payment');
    fireEvent.click(recordButtons[0]);

    expect(api.post).toHaveBeenCalledWith('/admin/loans/1/pay', { amount: 100 });
  });
});
