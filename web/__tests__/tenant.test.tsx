// Testing the tenant page
import Tenant from '../src/app/workspaces/page';
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

describe('Tenant Component', () => {
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
        <Tenant />
      </DataContext.Provider>
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });
});
