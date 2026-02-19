'use client';

import { useState } from 'react';
import PoliciesTab from './Polices';

interface PoliciesContentProps {
  initialPolicies: any[];
}

export default function PoliciesContent({ initialPolicies }: PoliciesContentProps) {
  const [policies, setPolicies] = useState<any[]>(initialPolicies);

  const handleAddPolicy = (policyData?: any) => {
    const newPolicy = policyData || {
      id: `policy-${Date.now()}`,
      name: `Policy ${policies.length + 1}`,
      lastModified: new Date().toLocaleDateString(),
    };
    setPolicies([...policies, newPolicy]);
  };

  return <PoliciesTab />;
}

