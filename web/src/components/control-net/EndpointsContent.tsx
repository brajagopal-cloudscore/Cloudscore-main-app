'use client';

import { useState } from 'react';
import EndpointsTab from './Endpoints';

interface Endpoint {
  id: string;
  name: string;
  modelName: string;
  type: string;
  lastModified: string;
}

interface EndpointsContentProps {
  initialEndpoints: Endpoint[];
}

export default function EndpointsContent({ initialEndpoints }: EndpointsContentProps) {
  const [endpoints, setEndpoints] = useState<Endpoint[]>(initialEndpoints);

  const handleAddEndpoint = (endpointData?: any) => {
    const newEndpoint: Endpoint = endpointData || {
      id: `endpoint-${Date.now()}`,
      name: `gpt-4o-config-${endpoints.length + 1}`,
      modelName: 'gpt-4o',
      type: 'foundationModels',
      lastModified: new Date().toLocaleDateString() + ' & ' + new Date().toLocaleTimeString(),
    };

    if (endpointData) {
      const finalEndpoint: Endpoint = {
        id: `endpoint-${Date.now()}`,
        ...endpointData,
      };
      setEndpoints([...endpoints, finalEndpoint]);
    } else {
      setEndpoints([...endpoints, newEndpoint]);
    }
  };

  return <EndpointsTab endpoints={endpoints} onAddEndpoint={handleAddEndpoint} />;
}

