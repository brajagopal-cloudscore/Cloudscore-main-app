import React from 'react';
import { Badge } from '@/components/ui/badge';

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  riskCount: number;
  isUseCaseTabValid: boolean;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  setActiveTab,
  riskCount,
  isUseCaseTabValid
}) => {
  const handleRiskTabClick = () => {
    // Only allow switching to risks tab if use case tab is valid
    if (isUseCaseTabValid) {
      setActiveTab('risks');
    }
  };

  return (
    <div className="border-b border-gray-200 px-6">
      <nav className="-mb-px flex space-x-8">
        <button
          onClick={() => setActiveTab('usecase')}
          className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'usecase'
            ? 'border-black text-black'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
        >
          Use Case
        </button>
        <button
          onClick={handleRiskTabClick}
          className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'risks'
            ? 'border-black text-black'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } ${!isUseCaseTabValid ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          disabled={!isUseCaseTabValid}
        >
          Risk
          {riskCount > 0 && (
            <Badge variant="outline" className="ml-2 text-xs">
              {riskCount}
            </Badge>
          )}
        </button>

        <button
          onClick={() => setActiveTab('transparency-user-information')}
          className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'transparency-user-information'
            ? 'border-black text-black'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } ${!isUseCaseTabValid ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          disabled={!isUseCaseTabValid}
        >
          Transparency & User Information
        </button>

        <button
          onClick={() => setActiveTab('human-oversight')}
          className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'human-oversight'
            ? 'border-black text-black'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } ${!isUseCaseTabValid ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          disabled={!isUseCaseTabValid}
        >
          Human Oversight
        </button>

        <button
          onClick={() => setActiveTab('bias-and-fairness')}
          className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'bias-and-fairness'
            ? 'border-black text-black'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } ${!isUseCaseTabValid ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          disabled={!isUseCaseTabValid}
        >
          Bias & fairness
        </button>

        <button
          onClick={() => setActiveTab('bias-monitoring-and-mitigation')}
          className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'bias-monitoring-and-mitigation'
            ? 'border-black text-black'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } ${!isUseCaseTabValid ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          disabled={!isUseCaseTabValid}
        >
          Bias Monitoring and Mitigation
        </button>

        <button
          onClick={() => setActiveTab('explainability')}
          className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'explainability'
            ? 'border-black text-black'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } ${!isUseCaseTabValid ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          disabled={!isUseCaseTabValid}
        >
          Explainability
        </button>

        <button
          onClick={() => setActiveTab('environmental-impact')}
          className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'environmental-impact'
            ? 'border-black text-black'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } ${!isUseCaseTabValid ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          disabled={!isUseCaseTabValid}
        >
          Environmental Impact
        </button>
      </nav>
    </div>
  );
};
