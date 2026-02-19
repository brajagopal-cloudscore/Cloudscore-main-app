// __tests__/page.test.tsx

import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '../src/app/page';
import { DataContext } from '@/contexts/DataContext';
import { login } from '@/lib/utils/api/auth';

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

// Mock the login function
jest.mock('@/lib/utils/api/auth', () => ({
  login: jest.fn(),
}));

import { DataContextType } from '@/types';

describe('Home Component', () => {
  const mockContextValue: DataContextType = {
    selectedWorkspace: null,
    setSelectedWorkspace: jest.fn(),
    allWorkspaces: [],
    setAllWorkspaces: jest.fn(),
    allConnectors: [],
    setAllConnectors: jest.fn(),
    allEnterpriseSources: [],
    fetchAllDataSourceData: jest.fn(),
    openModal: '',
    setOpenModal: jest.fn(),
    OrganizationInfo: null,
    fetchOrganisationInfo: jest.fn(),
    allSharedWorkspaces: [],
    checkRefreshToken: jest.fn(),
  };

  const renderComponent = () =>
    render(
      <DataContext.Provider value={mockContextValue}>
        <Home />
      </DataContext.Provider>
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the component', () => {
    renderComponent();
    expect(
      screen.getByRole('heading', { name: 'Kentron' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Navigate Complexity, Discover Clarity')
    ).toBeInTheDocument();
  });

  test('renders all bullet points', () => {
    renderComponent();
    const bulletPoints = [
      'Advanced Analytics and Insight',
      'Better Compliance and Risk Management',
      'Risk Mitigation',
      'Secure Data Handling',
    ];
    bulletPoints.forEach((point) => {
      expect(screen.getByText(point)).toBeInTheDocument();
    });
  });

  test('handles form input changes', () => {
    renderComponent();
    const orgNameInput = screen.getByLabelText('Organisation Name*');
    const emailInput = screen.getByLabelText('Bussiness Email*');
    const passwordInput = screen.getByLabelText('Password*');

    fireEvent.change(orgNameInput, { target: { value: 'Test Org' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(orgNameInput).toHaveValue('Test Org');
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  test('displays error messages for empty fields', async () => {
    renderComponent();
    const loginButton = screen.getByText('Login');

    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(
        screen.getByText('Organization name is required!')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Bussiness email is required!')
      ).toBeInTheDocument();
      expect(screen.getByText('Password is required!')).toBeInTheDocument();
    });
  });

  test('calls login function with correct data on form submission', async () => {
    (login as jest.Mock).mockResolvedValue({
      data: { access: 'token', refresh: 'refresh' },
    });
    renderComponent();

    const orgNameInput = screen.getByLabelText('Organisation Name*');
    const emailInput = screen.getByLabelText('Bussiness Email*');
    const passwordInput = screen.getByLabelText('Password*');
    const loginButton = screen.getByText('Login');

    fireEvent.change(orgNameInput, { target: { value: 'Test Org' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });

    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith(
        'test@example.com',
        'Password123!',
        'test org'
      );
    });
  });

  test('toggles password visibility', () => {
    renderComponent();
    const passwordInput = screen.getByLabelText('Password*');
    const toggleButton = passwordInput.nextElementSibling as HTMLElement;

    expect(passwordInput).toHaveAttribute('type', 'password');
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
