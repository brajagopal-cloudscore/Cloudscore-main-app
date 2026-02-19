/**
 * Test for the use-cases-by-risk API route
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/tenants/[tenant]/reports/use-cases-by-risk/route';

// Mock the database and auth modules
jest.mock('@db', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
  },
  tenants: { slug: 'tenant_slug' },
  risks: { riskLevel: 'risk_level', useCaseId: 'use_case_id' },
  useCases: { id: 'use_case_id', tenantId: 'tenant_id', applicationId: 'application_id', deletedAt: 'deleted_at' },
  applications: { id: 'application_id', tenantId: 'tenant_id', deletedAt: 'deleted_at' },
}));

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn().mockResolvedValue({ userId: 'test-user-id' }),
}));

jest.mock('drizzle-orm', () => ({
  eq: jest.fn(),
  and: jest.fn(),
  isNull: jest.fn(),
  sql: jest.fn(),
}));

describe('/api/tenants/[tenant]/reports/use-cases-by-risk', () => {
  const mockParams = { tenant: 'test-tenant' };
  const mockRequest = new NextRequest('http://localhost:3000/api/tenants/test-tenant/reports/use-cases-by-risk');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 when tenant is not found', async () => {
    // Mock empty tenant result
    const { db } = require('@db');
    db.select.mockResolvedValue([]);

    const response = await GET(mockRequest, { params: Promise.resolve(mockParams) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Tenant not found');
  });

  it('should return risk classification data when tenant exists', async () => {
    // Mock tenant found
    const { db } = require('@db');
    db.select
      .mockResolvedValueOnce([{ id: 'tenant-id' }]) // Tenant lookup
      .mockResolvedValueOnce([{ totalCount: 10 }]) // Total use cases
      .mockResolvedValueOnce([{ count: 2 }]); // Use cases without risks

    // Mock use cases by risk data
    db.innerJoin.mockResolvedValue([
      { riskLevel: 'High', useCaseCount: 3 },
      { riskLevel: 'Medium', useCaseCount: 2 },
      { riskLevel: 'Low', useCaseCount: 1 },
    ]);

    const response = await GET(mockRequest, { params: Promise.resolve(mockParams) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('riskClassification');
    expect(data.data).toHaveProperty('totalUseCases');
    expect(data.data).toHaveProperty('summary');
    
    // Check that risk classification has the expected structure
    expect(data.data.riskClassification).toHaveProperty('High');
    expect(data.data.riskClassification).toHaveProperty('Medium');
    expect(data.data.riskClassification).toHaveProperty('Low');
    expect(data.data.riskClassification).toHaveProperty('No Risk');
  });

  it('should handle database errors gracefully', async () => {
    // Mock database error
    const { db } = require('@db');
    db.select.mockRejectedValue(new Error('Database connection failed'));

    const response = await GET(mockRequest, { params: Promise.resolve(mockParams) });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to fetch use cases by risk data');
  });
});
