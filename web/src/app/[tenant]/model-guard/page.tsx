import { Metadata } from 'next';
import ModelGuardPage from './ModelGuardPage';

interface PageProps {
  params: Promise<{ tenant: string }>;
}

export const metadata: Metadata = {
  title: 'Model Guard - AI Model Security Scanner',
  description: 'Scan and validate ML models for security vulnerabilities before deployment',
};

export default async function Page({ params }: PageProps) {
  const { tenant } = await params;
  
  return <ModelGuardPage tenant={tenant} />;
}
