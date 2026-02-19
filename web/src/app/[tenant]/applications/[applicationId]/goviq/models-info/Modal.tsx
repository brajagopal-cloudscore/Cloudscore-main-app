import React, { useState, useEffect } from 'react';
import { Loader, Upload, X, File, ExternalLink } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TechnicalDetail } from '@/lib/api/technicalDetails';
import { useQuery } from '@tanstack/react-query';
import { getModelsByProvider } from '@/lib/actions/model-register';

interface AddTechnicalDetailData {
  sVendor: string;
  sModel: string;
  sHostingLocation: string;
  sModelArchitecture: string;
  sObjectives: string;
  sComputeInfrastructure: string;
  sTrainingDuration: string;
  sModelSize: string;
  sTrainingDataSize: string;
  sInferenceLatency: string;
  sHardwareRequirements: string;
  sSoftware: string;
  sPromptRegistry: string;
}

interface ValidationError {
  sVendor?: string;
  sModel?: string;
  sHostingLocation?: string;
  sModelArchitecture?: string;
  sObjectives?: string;
  sComputeInfrastructure?: string;
  sTrainingDuration?: string;
  sModelSize?: string;
  sTrainingDataSize?: string;
  sInferenceLatency?: string;
  sHardwareRequirements?: string;
  sSoftware?: string;
  sPromptRegistry?: string;
}

interface TechnicalDetailsModalsProps {
  openModal: string;
  editTechnicalDetailData: TechnicalDetail | null;
  addTechnicalDetailData: AddTechnicalDetailData;
  errors: ValidationError;
  isEditPending: boolean;
  isCreatePending: boolean;
  onEditClose: () => void;
  onCreateClose: () => void;
  onEditSave: (detail: TechnicalDetail) => void;
  onCreateSave: () => void;
  onEditTechnicalDetailChange: (detail: TechnicalDetail) => void;
  onCreateInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

// Integration options data with links
const SOFTWARE_INTEGRATIONS = [
  { value: 'github', label: 'GitHub', link: 'https://github.com' },
  { value: 'gitlab', label: 'GitLab', link: 'https://gitlab.com' },
  { value: 'azure-devops', label: 'Azure DevOps', link: 'https://dev.azure.com' },
  { value: 'jenkins', label: 'Jenkins', link: 'https://www.jenkins.io' },
  { value: 'docker-hub', label: 'Docker Hub', link: 'https://hub.docker.com' },
  { value: 'kubernetes', label: 'Kubernetes', link: 'https://kubernetes.io' },
  { value: 'terraform', label: 'Terraform', link: 'https://www.terraform.io' },
  { value: 'aws-codecommit', label: 'AWS CodeCommit', link: 'https://aws.amazon.com/codecommit/' },
  { value: 'gcp-source-repos', label: 'Google Cloud Source Repositories', link: 'https://cloud.google.com/source-repositories' },
  { value: 'bitbucket', label: 'Bitbucket', link: 'https://bitbucket.org' },
  { value: 'jfrog-artifactory', label: 'JFrog Artifactory', link: 'https://jfrog.com/artifactory/' },
  { value: 'nexus-repository', label: 'Nexus Repository', link: 'https://www.sonatype.com/products/nexus-repository' },
  { value: 'custom', label: 'Custom/Other', link: null },
];

const HOSTING_INTEGRATIONS = [
  { value: 'aws', label: 'AWS', link: 'https://aws.amazon.com' },
  { value: 'azure-foundry', label: 'Azure Foundry', link: 'https://azure.microsoft.com' },
  { value: 'gcp', label: 'Google Cloud Platform (GCP)', link: 'https://cloud.google.com' },
  { value: 'azure', label: 'Microsoft Azure', link: 'https://azure.microsoft.com' },
  { value: 'databricks', label: 'Databricks', link: 'https://databricks.com' },
  { value: 'ibm-cloud', label: 'IBM Cloud', link: 'https://www.ibm.com/cloud' },
  { value: 'oracle-cloud', label: 'Oracle Cloud', link: 'https://www.oracle.com/cloud/' },
  { value: 'digitalocean', label: 'DigitalOcean', link: 'https://www.digitalocean.com' },
  { value: 'linode', label: 'Linode', link: 'https://www.linode.com' },
  { value: 'vultr', label: 'Vultr', link: 'https://www.vultr.com' },
  { value: 'alibaba-cloud', label: 'Alibaba Cloud', link: 'https://www.alibabacloud.com' },
  { value: 'on-premises', label: 'On-Premises', link: null },
  { value: 'hybrid-cloud', label: 'Hybrid Cloud', link: null },
  { value: 'edge-computing', label: 'Edge Computing', link: null },
  { value: 'custom', label: 'Custom/Other', link: null },
];

// Platform-specific location options
const PLATFORM_LOCATIONS = {
  'aws': [
    'us-east-1 (N. Virginia)',
    'us-east-2 (Ohio)',
    'us-west-1 (N. California)',
    'us-west-2 (Oregon)',
    'eu-west-1 (Ireland)',
    'eu-west-2 (London)',
    'eu-central-1 (Frankfurt)',
    'ap-southeast-1 (Singapore)',
    'ap-southeast-2 (Sydney)',
    'ap-northeast-1 (Tokyo)',
  ],
  'azure-foundry': [
    'East US',
    'East US 2',
    'West US',
    'West US 2',
    'Central US',
    'North Central US',
    'South Central US',
    'West Central US',
    'Canada Central',
    'Canada East',
    'Brazil South',
    'North Europe',
    'West Europe',
    'UK South',
    'UK West',
    'France Central',
    'Germany West Central',
    'Switzerland North',
    'Norway East',
    'UAE North',
    'South Africa North',
    'Australia East',
    'Australia Southeast',
    'Central India',
    'South India',
    'West India',
    'Japan East',
    'Japan West',
    'Korea Central',
    'Korea South',
    'Southeast Asia',
    'East Asia',
  ],
  'gcp': [
    'us-central1 (Iowa)',
    'us-east1 (South Carolina)',
    'us-east4 (Northern Virginia)',
    'us-west1 (Oregon)',
    'us-west2 (Los Angeles)',
    'us-west3 (Salt Lake City)',
    'us-west4 (Las Vegas)',
    'northamerica-northeast1 (Montreal)',
    'europe-west1 (Belgium)',
    'europe-west2 (London)',
    'europe-west3 (Frankfurt)',
    'europe-west4 (Netherlands)',
    'europe-west6 (Zurich)',
    'europe-north1 (Finland)',
    'asia-east1 (Taiwan)',
    'asia-northeast1 (Tokyo)',
    'asia-southeast1 (Singapore)',
    'australia-southeast1 (Sydney)',
  ],
  'azure': [
    'East US',
    'East US 2',
    'West US',
    'West US 2',
    'Central US',
    'North Europe',
    'West Europe',
    'Southeast Asia',
    'East Asia',
    'Australia East',
    'Australia Southeast',
  ],
  'databricks': [
    'US East (Virginia)',
    'US West (Oregon)',
    'EU West (Ireland)',
    'EU Central (Frankfurt)',
    'Asia Pacific (Singapore)',
    'Asia Pacific (Sydney)',
    'Asia Pacific (Tokyo)',
  ],
  'ibm-cloud': [
    'Dallas',
    'Washington DC',
    'London',
    'Frankfurt',
    'Tokyo',
    'Sydney',
    'Toronto',
  ],
  'oracle-cloud': [
    'US East (Ashburn)',
    'US West (Phoenix)',
    'UK South (London)',
    'Germany Central (Frankfurt)',
    'Japan East (Tokyo)',
    'Australia Southeast (Melbourne)',
  ],
  'digitalocean': [
    'New York 1',
    'New York 3',
    'San Francisco 1',
    'San Francisco 2',
    'Toronto 1',
    'London 1',
    'Frankfurt 1',
    'Amsterdam 2',
    'Amsterdam 3',
    'Singapore 1',
    'Bangalore 1',
  ],
  'linode': [
    'Newark, NJ',
    'Atlanta, GA',
    'Dallas, TX',
    'Fremont, CA',
    'London, UK',
    'Frankfurt, DE',
    'Singapore, SG',
    'Tokyo, JP',
    'Mumbai, IN',
  ],
  'vultr': [
    'New Jersey',
    'Chicago',
    'Dallas',
    'Seattle',
    'Los Angeles',
    'Atlanta',
    'Miami',
    'London',
    'Paris',
    'Frankfurt',
    'Amsterdam',
    'Tokyo',
    'Singapore',
    'Sydney',
  ],
  'alibaba-cloud': [
    'US East 1 (Virginia)',
    'US West 1 (Silicon Valley)',
    'EU Central 1 (Frankfurt)',
    'UK (London)',
    'Asia Pacific SE 1 (Singapore)',
    'Asia Pacific NE 1 (Tokyo)',
    'Asia Pacific SE 2 (Sydney)',
  ],
};

const PROMPT_REGISTRY_INTEGRATIONS = [
  { value: 'mlflow', label: 'MLflow', link: 'https://mlflow.org' },
  { value: 'wandb', label: 'Weights & Biases', link: 'https://wandb.ai' },
  { value: 'neptune', label: 'Neptune', link: 'https://neptune.ai' },
  { value: 'dvc', label: 'DVC', link: 'https://dvc.org' },
  { value: 'clearml', label: 'ClearML', link: 'https://clear.ml' },
  { value: 'kubeflow', label: 'Kubeflow', link: 'https://www.kubeflow.org' },
  { value: 'airflow', label: 'Apache Airflow', link: 'https://airflow.apache.org' },
  { value: 'prefect', label: 'Prefect', link: 'https://www.prefect.io' },
  { value: 'custom-registry', label: 'Custom Registry', link: null },
  { value: 'huggingface', label: 'HuggingFace Hub', link: 'https://huggingface.co' },
  { value: 'github', label: 'GitHub', link: 'https://github.com' },
  { value: 'azure-ml', label: 'Azure ML', link: 'https://azure.microsoft.com/en-us/products/machine-learning/' },
  { value: 'custom', label: 'Custom/Other', link: null },
];

// Provider options matching model-registry
const PROVIDER_OPTIONS = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'vertex', label: 'Google (Vertex AI)' },
  { value: 'bedrock', label: 'AWS (Bedrock)', disabled: true },
  { value: 'azure_openai', label: 'Azure OpenAI', disabled: true },
  { value: 'groq', label: 'Groq', disabled: true },
  { value: 'ollama', label: 'Ollama', disabled: true },
  { value: 'huggingface', label: 'Hugging Face' },
  { value: 'custom', label: 'Custom', disabled: true },
];

const TechnicalDetailsModals: React.FC<TechnicalDetailsModalsProps> = ({
  openModal,
  editTechnicalDetailData,
  addTechnicalDetailData,
  errors,
  isEditPending,
  isCreatePending,
  onEditClose,
  onCreateClose,
  onEditSave,
  onCreateSave,
  onEditTechnicalDetailChange,
  onCreateInputChange,
}) => {
  const [selectedVendorModels, setSelectedVendorModels] = useState<Array<{ id: string; displayName: string }>>([]);
  const [editSelectedVendorModels, setEditSelectedVendorModels] = useState<Array<{ id: string; displayName: string }>>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  // File upload states
  const [createArchitectureFiles, setCreateArchitectureFiles] = useState<File[]>([]);
  const [editArchitectureFiles, setEditArchitectureFiles] = useState<File[]>([]);

  // Custom input states for integrations
  const [createSoftwareCustom, setCreateSoftwareCustom] = useState('');
  const [createPromptRegistryCustom, setCreatePromptRegistryCustom] = useState('');
  const [editSoftwareCustom, setEditSoftwareCustom] = useState('');
  const [editPromptRegistryCustom, setEditPromptRegistryCustom] = useState('');

  // Hosting platform and location states
  const [createSelectedHostingPlatform, setCreateSelectedHostingPlatform] = useState('');
  const [createSelectedHostingLocation, setCreateSelectedHostingLocation] = useState('');
  const [editSelectedHostingPlatform, setEditSelectedHostingPlatform] = useState('');
  const [editSelectedHostingLocation, setEditSelectedHostingLocation] = useState('');

  // States to track when custom is selected
  const [createSoftwareIsCustom, setCreateSoftwareIsCustom] = useState(false);
  const [createPromptRegistryIsCustom, setCreatePromptRegistryIsCustom] = useState(false);
  const [editSoftwareIsCustom, setEditSoftwareIsCustom] = useState(false);
  const [editPromptRegistryIsCustom, setEditPromptRegistryIsCustom] = useState(false);

  // Load models when vendor selection changes for create modal
  useEffect(() => {
    const loadModels = async () => {
      if (addTechnicalDetailData.sVendor && addTechnicalDetailData.sVendor !== 'huggingface') {
        setLoadingModels(true);
        try {
          const res = await getModelsByProvider(addTechnicalDetailData.sVendor);
          if (res.status && res.models) {
            setSelectedVendorModels(res.models.map((model: any) => ({
              id: model.id,
              displayName: model.displayName
            })));
          } else {
            setSelectedVendorModels([]);
          }
        } catch (error) {
          console.error('Error loading models:', error);
          setSelectedVendorModels([]);
        } finally {
          setLoadingModels(false);
        }
      } else {
        setSelectedVendorModels([]);
      }
    };

    loadModels();
  }, [addTechnicalDetailData.sVendor]);

  // Load models when vendor selection changes for edit modal
  useEffect(() => {
    const loadModels = async () => {
      if (editTechnicalDetailData?.sVendor && editTechnicalDetailData.sVendor !== 'huggingface') {
        setLoadingModels(true);
        try {
          const res = await getModelsByProvider(editTechnicalDetailData.sVendor);
          if (res.status && res.models) {
            setEditSelectedVendorModels(res.models.map((model: any) => ({
              id: model.id,
              displayName: model.displayName
            })));
          } else {
            setEditSelectedVendorModels([]);
          }
        } catch (error) {
          console.error('Error loading models:', error);
          setEditSelectedVendorModels([]);
        } finally {
          setLoadingModels(false);
        }
      } else {
        setEditSelectedVendorModels([]);
      }
    };

    if (openModal === 'edit technical detail') {
      loadModels();
    }
  }, [editTechnicalDetailData?.sVendor, openModal]);

  // Parse existing hosting location value to platform and location
  useEffect(() => {
    if (addTechnicalDetailData.sHostingLocation) {
      const parts = addTechnicalDetailData.sHostingLocation.split(' - ');
      if (parts.length === 2) {
        setCreateSelectedHostingPlatform(parts[0]);
        setCreateSelectedHostingLocation(parts[1]);
      }
    }
  }, [addTechnicalDetailData.sHostingLocation]);

  useEffect(() => {
    if (editTechnicalDetailData?.sHostingLocation) {
      const parts = editTechnicalDetailData.sHostingLocation.split(' - ');
      if (parts.length === 2) {
        setEditSelectedHostingPlatform(parts[0]);
        setEditSelectedHostingLocation(parts[1]);
      }
    }
  }, [editTechnicalDetailData?.sHostingLocation]);

  const handleEditInputChange = (field: keyof TechnicalDetail, value: string) => {
    if (editTechnicalDetailData) {
      onEditTechnicalDetailChange({
        ...editTechnicalDetailData,
        [field]: value,
      });
    }
  };

  const handleCreateVendorChange = (value: string) => {
    const syntheticEvent = {
      target: {
        name: 'sVendor',
        value: value
      }
    } as React.ChangeEvent<HTMLInputElement>;

    onCreateInputChange(syntheticEvent);

    // Reset model selection when vendor changes
    const modelResetEvent = {
      target: {
        name: 'sModel',
        value: ''
      }
    } as React.ChangeEvent<HTMLInputElement>;

    onCreateInputChange(modelResetEvent);
  };

  const handleCreateModelChange = (value: string) => {
    const syntheticEvent = {
      target: {
        name: 'sModel',
        value: value
      }
    } as React.ChangeEvent<HTMLInputElement>;

    onCreateInputChange(syntheticEvent);
  };

  const handleEditVendorChange = (value: string) => {
    if (editTechnicalDetailData) {
      onEditTechnicalDetailChange({
        ...editTechnicalDetailData,
        sVendor: value,
        sModel: '' // Reset model when vendor changes
      });
    }
  };

  // Hosting platform handlers
  const handleCreateHostingPlatformChange = (platform: string) => {
    setCreateSelectedHostingPlatform(platform);
    setCreateSelectedHostingLocation(''); // Reset location when platform changes

    const syntheticEvent = {
      target: {
        name: 'sHostingLocation',
        value: platform // Set platform as initial value
      }
    } as React.ChangeEvent<HTMLInputElement>;

    onCreateInputChange(syntheticEvent);
  };

  const handleCreateHostingLocationChange = (location: string) => {
    setCreateSelectedHostingLocation(location);

    const fullValue = `${createSelectedHostingPlatform} - ${location}`;
    const syntheticEvent = {
      target: {
        name: 'sHostingLocation',
        value: fullValue
      }
    } as React.ChangeEvent<HTMLInputElement>;

    onCreateInputChange(syntheticEvent);
  };

  const handleEditHostingPlatformChange = (platform: string) => {
    setEditSelectedHostingPlatform(platform);
    setEditSelectedHostingLocation(''); // Reset location when platform changes

    handleEditInputChange('sHostingLocation', platform);
  };

  const handleEditHostingLocationChange = (location: string) => {
    setEditSelectedHostingLocation(location);

    const fullValue = `${editSelectedHostingPlatform} - ${location}`;
    handleEditInputChange('sHostingLocation', fullValue);
  };

  // File upload handlers
  const handleCreateFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setCreateArchitectureFiles(prev => [...prev, ...files]);
  };

  const handleEditFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setEditArchitectureFiles(prev => [...prev, ...files]);
  };

  const removeCreateFile = (index: number) => {
    setCreateArchitectureFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeEditFile = (index: number) => {
    setEditArchitectureFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Integration handlers for create modal
  const handleCreateIntegrationChange = (field: string, value: string) => {
    if (value === 'custom') {
      // Set custom state to true
      if (field === 'sSoftware') setCreateSoftwareIsCustom(true);
      if (field === 'sPromptRegistry') setCreatePromptRegistryIsCustom(true);
      return;
    }

    // Reset custom states when selecting predefined options
    if (field === 'sSoftware') {
      setCreateSoftwareIsCustom(false);
      setCreateSoftwareCustom('');
    }
    if (field === 'sPromptRegistry') {
      setCreatePromptRegistryIsCustom(false);
      setCreatePromptRegistryCustom('');
    }

    const syntheticEvent = {
      target: {
        name: field,
        value: value
      }
    } as React.ChangeEvent<HTMLInputElement>;

    onCreateInputChange(syntheticEvent);
  };

  const handleCreateCustomIntegrationSubmit = (field: string, customValue: string) => {
    if (!customValue.trim()) return;

    const syntheticEvent = {
      target: {
        name: field,
        value: customValue
      }
    } as React.ChangeEvent<HTMLInputElement>;

    onCreateInputChange(syntheticEvent);

    // Clear custom input and reset custom state
    if (field === 'sSoftware') {
      setCreateSoftwareCustom('');
      setCreateSoftwareIsCustom(false);
    }
    if (field === 'sPromptRegistry') {
      setCreatePromptRegistryCustom('');
      setCreatePromptRegistryIsCustom(false);
    }
  };

  // Integration handlers for edit modal
  const handleEditIntegrationChange = (field: keyof TechnicalDetail, value: string) => {
    if (value === 'custom') {
      // Set custom state to true
      if (field === 'sSoftware') setEditSoftwareIsCustom(true);
      if (field === 'sPromptRegistry') setEditPromptRegistryIsCustom(true);
      return;
    }

    // Reset custom states when selecting predefined options
    if (field === 'sSoftware') {
      setEditSoftwareIsCustom(false);
      setEditSoftwareCustom('');
    }
    if (field === 'sPromptRegistry') {
      setEditPromptRegistryIsCustom(false);
      setEditPromptRegistryCustom('');
    }

    handleEditInputChange(field, value);
  };

  const handleEditCustomIntegrationSubmit = (field: keyof TechnicalDetail, customValue: string) => {
    if (!customValue.trim()) return;

    handleEditInputChange(field, customValue);

    // Clear custom input and reset custom state
    if (field === 'sSoftware') {
      setEditSoftwareCustom('');
      setEditSoftwareIsCustom(false);
    }
    if (field === 'sPromptRegistry') {
      setEditPromptRegistryCustom('');
      setEditPromptRegistryIsCustom(false);
    }
  };

  const renderIntegrationSelect = (
    value: string,
    onValueChange: (value: string) => void,
    options: Array<{ value: string, label: string, link: string | null }>,
    placeholder: string,
    hasError: boolean,
    customValue: string,
    onCustomChange: (value: string) => void,
    onCustomSubmit: () => void,
    fieldName: string,
    isCustomSelected: boolean
  ) => {
    const selectedOption = options.find(opt => opt.value === value);

    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <Select
            value={isCustomSelected ? 'custom' : value}
            onValueChange={onValueChange}
          >
            <SelectTrigger className={`${hasError ? 'border-red-500 focus-visible:border-red-500 border-destructive' : ''} h-9 flex-1`}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="max-w-md">
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value} className="py-3">
                  <div className="flex flex-col gap-1 w-full">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option.label}</span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedOption?.link && !isCustomSelected && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.open(selectedOption.link!, '_blank')}
              className="px-3"
              title={`Visit ${selectedOption.label} website`}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>

        {isCustomSelected && (
          <div className="flex gap-2">
            <Input
              placeholder={`Enter custom ${fieldName.toLowerCase()}`}
              value={customValue}
              onChange={(e) => onCustomChange(e.target.value)}
              className="flex-1"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  onCustomSubmit();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCustomSubmit}
              disabled={!customValue.trim()}
            >
              Add
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Edit Technical Detail Modal */}
      <Dialog
        open={openModal === 'edit technical detail'}
        onOpenChange={(open) => !open && onEditClose()}
      >
        <DialogContent className="sm:max-w-[800px] text-black p-0 gap-0 z-50 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Edit Technical Detail</DialogTitle>
          </DialogHeader>
          <div className="p-6 pb-4 space-y-1 border-b">
            <h3 className="text-lg font-semibold leading-none tracking-tight">
              Edit Technical Detail
            </h3>
          </div>

          {editTechnicalDetailData && (
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-vendor" className="text-sm font-medium">
                    Vendor (Optional)
                  </Label>
                  <Select
                    value={editTechnicalDetailData.sVendor || ''}
                    onValueChange={handleEditVendorChange}
                  >
                    <SelectTrigger className={`${errors.sVendor ? 'border-destructive' : ''} h-9`}>
                      <SelectValue placeholder="Select a vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROVIDER_OPTIONS.map((provider) => (
                        <SelectItem key={provider.value} value={provider.value} disabled={provider.disabled}>
                          {provider.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.sVendor && (
                    <p className="text-sm text-red-500 text-destructive">
                      {errors.sVendor}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-model" className="text-sm font-medium">
                    Model (Optional)
                  </Label>
                  <Select
                    value={editTechnicalDetailData.sModel || ''}
                    onValueChange={(value) => handleEditInputChange('sModel', value)}
                    disabled={!editTechnicalDetailData.sVendor}
                  >
                    <SelectTrigger className={`${errors.sModel ? 'border-destructive' : ''} h-9`}>
                      <SelectValue placeholder={
                        !editTechnicalDetailData.sVendor
                          ? "Select vendor first"
                          : editSelectedVendorModels.length === 0
                            ? "No models available"
                            : "Select a model"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingModels ? (
                        <div className="px-2 py-1.5 text-sm text-gray-500">Loading models...</div>
                      ) : editSelectedVendorModels.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-gray-500">No models available</div>
                      ) : (
                        editSelectedVendorModels.map((model) => (
                          <SelectItem key={model.id} value={model.displayName}>
                            {model.displayName}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {errors.sModel && (
                    <p className="text-sm text-red-500 text-destructive">
                      {errors.sModel}
                    </p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="edit-hosting-location" className="text-sm font-medium">
                    Hosting Location*
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-600">Platform</Label>
                      <Select
                        value={editSelectedHostingPlatform}
                        onValueChange={handleEditHostingPlatformChange}
                      >
                        <SelectTrigger className={`${errors.sHostingLocation ? 'border-destructive' : ''} h-9`}>
                          <SelectValue placeholder="Select hosting platform" />
                        </SelectTrigger>
                        <SelectContent className="max-w-md">
                          {HOSTING_INTEGRATIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value} className="py-3">
                              <div className="flex flex-col gap-1 w-full">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{option.label}</span>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-gray-600">Location</Label>
                      <Select
                        value={editSelectedHostingLocation}
                        onValueChange={handleEditHostingLocationChange}
                        disabled={!editSelectedHostingPlatform || !PLATFORM_LOCATIONS[editSelectedHostingPlatform as keyof typeof PLATFORM_LOCATIONS]}
                      >
                        <SelectTrigger className={`${errors.sHostingLocation ? 'border-destructive' : ''} h-9`}>
                          <SelectValue placeholder={
                            !editSelectedHostingPlatform
                              ? "Select platform first"
                              : !PLATFORM_LOCATIONS[editSelectedHostingPlatform as keyof typeof PLATFORM_LOCATIONS]
                                ? "No locations available"
                                : "Select location"
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {editSelectedHostingPlatform && PLATFORM_LOCATIONS[editSelectedHostingPlatform as keyof typeof PLATFORM_LOCATIONS]?.map((location) => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {errors.sHostingLocation && (
                    <p className="text-sm text-red-500 text-destructive">
                      {errors.sHostingLocation}
                    </p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="edit-model-architecture" className="text-sm font-medium">
                    Model Architecture* (Upload Files)
                  </Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        id="edit-model-architecture"
                        multiple
                        accept=".pdf,.json,.yaml,.yml,.png,.jpg,.jpeg,.svg,.txt,.md,.xml,.zip"
                        onChange={handleEditFileUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('edit-model-architecture')?.click()}
                        className="w-full"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Architecture Files
                      </Button>
                    </div>
                    {editArchitectureFiles.length > 0 && (
                      <div className="space-y-2">
                        {editArchitectureFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                            <div className="flex items-center gap-2">
                              <File className="h-4 w-4" />
                              <span className="text-sm truncate">{file.name}</span>
                              <span className="text-xs text-gray-500">
                                ({(file.size / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeEditFile(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.sModelArchitecture && (
                    <p className="text-sm text-red-500 text-destructive">
                      {errors.sModelArchitecture}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-objectives" className="text-sm font-medium">
                    Objectives*
                  </Label>
                  <Textarea
                    id="edit-objectives"
                    className={`${errors.sObjectives ? 'border-destructive' : ''} min-h-[80px]`}
                    value={editTechnicalDetailData.sObjectives || ''}
                    onChange={(e) => handleEditInputChange('sObjectives', e.target.value)}
                    placeholder="Enter objectives"
                  />
                  {errors.sObjectives && (
                    <p className="text-sm text-red-500 text-destructive">
                      {errors.sObjectives}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-compute-infrastructure" className="text-sm font-medium">
                    Compute Infrastructure*
                  </Label>
                  <Textarea
                    id="edit-compute-infrastructure"
                    className={`${errors.sComputeInfrastructure ? 'border-destructive' : ''} min-h-[80px]`}
                    value={editTechnicalDetailData.sComputeInfrastructure || ''}
                    onChange={(e) => handleEditInputChange('sComputeInfrastructure', e.target.value)}
                    placeholder="Enter compute infrastructure"
                  />
                  {errors.sComputeInfrastructure && (
                    <p className="text-sm text-red-500 text-destructive">
                      {errors.sComputeInfrastructure}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-training-duration" className="text-sm font-medium">
                    Training Duration*
                  </Label>
                  <Input
                    id="edit-training-duration"
                    className={errors.sTrainingDuration ? 'border-destructive' : ''}
                    value={editTechnicalDetailData.sTrainingDuration || ''}
                    onChange={(e) => handleEditInputChange('sTrainingDuration', e.target.value)}
                    placeholder="Enter training duration"
                  />
                  {errors.sTrainingDuration && (
                    <p className="text-sm text-red-500 text-destructive">
                      {errors.sTrainingDuration}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-model-size" className="text-sm font-medium">
                    Model Size*
                  </Label>
                  <Input
                    id="edit-model-size"
                    className={errors.sModelSize ? 'border-destructive' : ''}
                    value={editTechnicalDetailData.sModelSize || ''}
                    onChange={(e) => handleEditInputChange('sModelSize', e.target.value)}
                    placeholder="Enter model size"
                  />
                  {errors.sModelSize && (
                    <p className="text-sm text-red-500 text-destructive">
                      {errors.sModelSize}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-training-data-size" className="text-sm font-medium">
                    Training Data Size*
                  </Label>
                  <Input
                    id="edit-training-data-size"
                    className={errors.sTrainingDataSize ? 'border-destructive' : ''}
                    value={editTechnicalDetailData.sTrainingDataSize || ''}
                    onChange={(e) => handleEditInputChange('sTrainingDataSize', e.target.value)}
                    placeholder="Enter training data size"
                  />
                  {errors.sTrainingDataSize && (
                    <p className="text-sm text-red-500 text-destructive">
                      {errors.sTrainingDataSize}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-inference-latency" className="text-sm font-medium">
                    Inference Latency*
                  </Label>
                  <Input
                    id="edit-inference-latency"
                    className={errors.sInferenceLatency ? 'border-destructive' : ''}
                    value={editTechnicalDetailData.sInferenceLatency || ''}
                    onChange={(e) => handleEditInputChange('sInferenceLatency', e.target.value)}
                    placeholder="Enter inference latency"
                  />
                  {errors.sInferenceLatency && (
                    <p className="text-sm text-red-500 text-destructive">
                      {errors.sInferenceLatency}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-hardware-requirements" className="text-sm font-medium">
                    Hardware Requirements*
                  </Label>
                  <Textarea
                    id="edit-hardware-requirements"
                    className={`${errors.sHardwareRequirements ? 'border-destructive' : ''} min-h-[80px]`}
                    value={editTechnicalDetailData.sHardwareRequirements || ''}
                    onChange={(e) => handleEditInputChange('sHardwareRequirements', e.target.value)}
                    placeholder="Enter hardware requirements"
                  />
                  {errors.sHardwareRequirements && (
                    <p className="text-sm text-red-500 text-destructive">
                      {errors.sHardwareRequirements}
                    </p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="edit-software" className="text-sm font-medium">
                    Dev Application Location*
                  </Label>
                  {renderIntegrationSelect(
                    editTechnicalDetailData.sSoftware || '',
                    (value) => handleEditIntegrationChange('sSoftware', value),
                    SOFTWARE_INTEGRATIONS,
                    "Select software integration",
                    !!errors.sSoftware,
                    editSoftwareCustom,
                    setEditSoftwareCustom,
                    () => handleEditCustomIntegrationSubmit('sSoftware', editSoftwareCustom),
                    "software",
                    editSoftwareIsCustom
                  )}
                  {errors.sSoftware && (
                    <p className="text-sm text-red-500 text-destructive">
                      {errors.sSoftware}
                    </p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="edit-prompt-registry" className="text-sm font-medium">
                    Prompt Registry*
                  </Label>
                  {renderIntegrationSelect(
                    (editTechnicalDetailData as any).sPromptRegistry || '',
                    (value) => handleEditIntegrationChange('sPromptRegistry' as keyof TechnicalDetail, value),
                    PROMPT_REGISTRY_INTEGRATIONS,
                    "Select prompt registry",
                    !!errors.sPromptRegistry,
                    editPromptRegistryCustom,
                    setEditPromptRegistryCustom,
                    () => handleEditCustomIntegrationSubmit('sPromptRegistry' as keyof TechnicalDetail, editPromptRegistryCustom),
                    "prompt registry",
                    editPromptRegistryIsCustom
                  )}
                  {errors.sPromptRegistry && (
                    <p className="text-sm text-red-500 text-destructive">
                      {errors.sPromptRegistry}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="p-6 pt-4 border-t">
            <Button variant="outline" onClick={onEditClose}>
              Cancel
            </Button>
            <Button
              className="bg-black text-white hover:bg-gray-600 dark:bg-gray-900 dark:hover:bg-blue-900 transition-colors"
              variant="secondary"
              disabled={isEditPending}
              onClick={() => editTechnicalDetailData && onEditSave(editTechnicalDetailData)}
            >
              {isEditPending ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Technical Detail Modal */}
      <Dialog
        open={openModal === 'create technical detail'}
        onOpenChange={(open) => !open && onCreateClose()}
      >
        <DialogContent className="sm:max-w-[800px] text-black p-0 gap-0 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Create Technical Detail</DialogTitle>
          </DialogHeader>
          <div className="p-6 pb-4 space-y-1 border-b">
            <h3 className="text-lg font-semibold leading-none tracking-tight">
              Create Technical Detail
            </h3>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vendor" className="text-sm font-medium">
                  Vendor (Optional)
                </Label>
                <Select
                  value={addTechnicalDetailData.sVendor}
                  onValueChange={handleCreateVendorChange}
                >
                  <SelectTrigger className={`${errors.sVendor ? 'border-red-500 focus-visible:border-red-500 border-destructive' : ''} h-9`}>
                    <SelectValue placeholder="Select a vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDER_OPTIONS.map((provider) => (
                      <SelectItem key={provider.value} value={provider.value} disabled={provider.disabled}>
                        {provider.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.sVendor && (
                  <p className="text-sm text-red-500 text-destructive">
                    {errors.sVendor}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="model" className="text-sm font-medium">
                  Model (Optional)
                </Label>
                <Select
                  value={addTechnicalDetailData.sModel}
                  onValueChange={handleCreateModelChange}
                  disabled={!addTechnicalDetailData.sVendor}
                >
                  <SelectTrigger className={`${errors.sModel ? 'border-red-500 focus-visible:border-red-500 border-destructive' : ''} h-9`}>
                    <SelectValue placeholder={
                      !addTechnicalDetailData.sVendor
                        ? "Select vendor first"
                        : selectedVendorModels.length === 0
                          ? "No models available"
                          : "Select a model"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingModels ? (
                      <div className="px-2 py-1.5 text-sm text-gray-500">Loading models...</div>
                    ) : selectedVendorModels.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-gray-500">No models available</div>
                    ) : (
                      selectedVendorModels.map((model) => (
                        <SelectItem key={model.id} value={model.displayName}>
                          {model.displayName}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.sModel && (
                  <p className="text-sm text-red-500 text-destructive">
                    {errors.sModel}
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="hosting-location" className="text-sm font-medium">
                  Hosting Location*
                </Label>
                <div className="flex gap-2">
                  <Select
                    value={addTechnicalDetailData.sHostingLocation}
                    onValueChange={(value) => {
                      const syntheticEvent = {
                        target: {
                          name: 'sHostingLocation',
                          value: value
                        }
                      } as React.ChangeEvent<HTMLInputElement>;
                      onCreateInputChange(syntheticEvent);
                    }}
                  >
                    <SelectTrigger className={`${errors.sHostingLocation ? 'border-red-500 focus-visible:border-red-500 border-destructive' : ''} h-9 flex-1`}>
                      <SelectValue placeholder="Select hosting location" />
                    </SelectTrigger>
                    <SelectContent className="max-w-md">
                      {HOSTING_INTEGRATIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="py-3">
                          <div className="flex flex-col gap-1 w-full">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{option.label}</span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {HOSTING_INTEGRATIONS.find(opt => opt.value === addTechnicalDetailData.sHostingLocation)?.link && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const selectedOption = HOSTING_INTEGRATIONS.find(opt => opt.value === addTechnicalDetailData.sHostingLocation);
                        if (selectedOption?.link) {
                          window.open(selectedOption.link, '_blank');
                        }
                      }}
                      className="px-3"
                      title="Visit website"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {errors.sHostingLocation && (
                  <p className="text-sm text-red-500 text-destructive">
                    {errors.sHostingLocation}
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="model-architecture" className="text-sm font-medium">
                  Model Architecture* (Upload Files)
                </Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      id="model-architecture"
                      multiple
                      accept=".pdf,.json,.yaml,.yml,.png,.jpg,.jpeg,.svg,.txt,.md,.xml,.zip"
                      onChange={handleCreateFileUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('model-architecture')?.click()}
                      className="w-full"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Architecture Files
                    </Button>
                  </div>
                  {createArchitectureFiles.length > 0 && (
                    <div className="space-y-2">
                      {createArchitectureFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                          <div className="flex items-center gap-2">
                            <File className="h-4 w-4" />
                            <span className="text-sm truncate">{file.name}</span>
                            <span className="text-xs text-gray-500">
                              ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCreateFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {errors.sModelArchitecture && (
                  <p className="text-sm text-red-500 text-destructive">
                    {errors.sModelArchitecture}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="objectives" className="text-sm font-medium">
                  Objectives*
                </Label>
                <Textarea
                  id="objectives"
                  placeholder="Enter objectives"
                  className={`${errors.sObjectives ? 'border-red-500 focus-visible:border-red-500 border-destructive' : ''} min-h-[80px]`}
                  value={addTechnicalDetailData.sObjectives}
                  name="sObjectives"
                  onChange={onCreateInputChange}
                />
                {errors.sObjectives && (
                  <p className="text-sm text-red-500 text-destructive">
                    {errors.sObjectives}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="compute-infrastructure" className="text-sm font-medium">
                  Compute Infrastructure*
                </Label>
                <Textarea
                  id="compute-infrastructure"
                  placeholder="Enter compute infrastructure"
                  className={`${errors.sComputeInfrastructure ? 'border-red-500 focus-visible:border-red-500 border-destructive' : ''} min-h-[80px]`}
                  value={addTechnicalDetailData.sComputeInfrastructure}
                  name="sComputeInfrastructure"
                  onChange={onCreateInputChange}
                />
                {errors.sComputeInfrastructure && (
                  <p className="text-sm text-red-500 text-destructive">
                    {errors.sComputeInfrastructure}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="training-duration" className="text-sm font-medium">
                  Training Duration*
                </Label>
                <Input
                  id="training-duration"
                  placeholder="Enter training duration"
                  className={errors.sTrainingDuration ? 'border-red-500 focus-visible:border-red-500 border-destructive' : ''}
                  value={addTechnicalDetailData.sTrainingDuration}
                  name="sTrainingDuration"
                  onChange={onCreateInputChange}
                />
                {errors.sTrainingDuration && (
                  <p className="text-sm text-red-500 text-destructive">
                    {errors.sTrainingDuration}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="model-size" className="text-sm font-medium">
                  Model Size*
                </Label>
                <Input
                  id="model-size"
                  placeholder="Enter model size"
                  className={errors.sModelSize ? 'border-red-500 focus-visible:border-red-500 border-destructive' : ''}
                  value={addTechnicalDetailData.sModelSize}
                  name="sModelSize"
                  onChange={onCreateInputChange}
                />
                {errors.sModelSize && (
                  <p className="text-sm text-red-500 text-destructive">
                    {errors.sModelSize}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="training-data-size" className="text-sm font-medium">
                  Training Data Size*
                </Label>
                <Input
                  id="training-data-size"
                  placeholder="Enter training data size"
                  className={errors.sTrainingDataSize ? 'border-red-500 focus-visible:border-red-500 border-destructive' : ''}
                  value={addTechnicalDetailData.sTrainingDataSize}
                  name="sTrainingDataSize"
                  onChange={onCreateInputChange}
                />
                {errors.sTrainingDataSize && (
                  <p className="text-sm text-red-500 text-destructive">
                    {errors.sTrainingDataSize}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="inference-latency" className="text-sm font-medium">
                  Inference Latency*
                </Label>
                <Input
                  id="inference-latency"
                  placeholder="Enter inference latency"
                  className={errors.sInferenceLatency ? 'border-red-500 focus-visible:border-red-500 border-destructive' : ''}
                  value={addTechnicalDetailData.sInferenceLatency}
                  name="sInferenceLatency"
                  onChange={onCreateInputChange}
                />
                {errors.sInferenceLatency && (
                  <p className="text-sm text-red-500 text-destructive">
                    {errors.sInferenceLatency}
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="hardware-requirements" className="text-sm font-medium">
                  Hardware Requirements*
                </Label>
                <Textarea
                  id="hardware-requirements"
                  placeholder="Enter hardware requirements"
                  className={`${errors.sHardwareRequirements ? 'border-red-500 focus-visible:border-red-500 border-destructive' : ''} min-h-[80px]`}
                  value={addTechnicalDetailData.sHardwareRequirements}
                  name="sHardwareRequirements"
                  onChange={onCreateInputChange}
                />
                {errors.sHardwareRequirements && (
                  <p className="text-sm text-red-500 text-destructive">
                    {errors.sHardwareRequirements}
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="software" className="text-sm font-medium">
                  Dev Application Location*
                </Label>
                {renderIntegrationSelect(
                  addTechnicalDetailData.sSoftware,
                  (value) => handleCreateIntegrationChange('sSoftware', value),
                  SOFTWARE_INTEGRATIONS,
                  "Select software integration",
                  !!errors.sSoftware,
                  createSoftwareCustom,
                  setCreateSoftwareCustom,
                  () => handleCreateCustomIntegrationSubmit('sSoftware', createSoftwareCustom),
                  "software",
                  createSoftwareIsCustom
                )}
                {errors.sSoftware && (
                  <p className="text-sm text-red-500 text-destructive">
                    {errors.sSoftware}
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="prompt-registry" className="text-sm font-medium">
                  Prompt Registry*
                </Label>
                {renderIntegrationSelect(
                  addTechnicalDetailData.sPromptRegistry,
                  (value) => handleCreateIntegrationChange('sPromptRegistry', value),
                  PROMPT_REGISTRY_INTEGRATIONS,
                  "Select prompt registry",
                  !!errors.sPromptRegistry,
                  createPromptRegistryCustom,
                  setCreatePromptRegistryCustom,
                  () => handleCreateCustomIntegrationSubmit('sPromptRegistry', createPromptRegistryCustom),
                  "prompt registry",
                  createPromptRegistryIsCustom
                )}
                {errors.sPromptRegistry && (
                  <p className="text-sm text-red-500 text-destructive">
                    {errors.sPromptRegistry}
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 pt-4 border-t">
            <Button variant="outline" onClick={onCreateClose}>
              Cancel
            </Button>
            <Button
              variant="default"
              className="bg-black text-white hover:bg-gray-600 dark:bg-gray-900 dark:hover:bg-blue-900 transition-colors"
              disabled={isCreatePending}
              onClick={onCreateSave}
            >
              {isCreatePending ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" /> Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TechnicalDetailsModals;
