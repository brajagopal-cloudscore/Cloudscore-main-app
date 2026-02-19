import React from 'react';
import { Loader } from 'lucide-react';

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
import { AIModel } from '@/contexts/AIModelContext';

interface AddModelData {
  model_name: string;
  model_id: string;
  model_owner: string;
  business_unit: string;
  model_type: string;
  model_version: string;
  model_source: string;
}

interface ValidationError {
  model_name?: string;
  model_id?: string;
  model_owner?: string;
  business_unit?: string;
  model_type?: string;
  model_version?: string;
  model_source?: string;
}

interface ModelModalsProps {
  // Modal state
  openModal: string;

  // Data
  editModelData: AIModel | null;
  addModelData: AddModelData;
  errors: ValidationError;

  // Loading states
  isEditPending: boolean;
  isCreatePending: boolean;

  // Event handlers
  onEditClose: () => void;
  onCreateClose: () => void;
  onEditSave: (model: AIModel) => void;
  onCreateSave: () => void;
  onEditModelChange: (model: AIModel) => void;
  onCreateInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const ModelModals: React.FC<ModelModalsProps> = ({
  // Modal state
  openModal,

  // Data
  editModelData,
  addModelData,
  errors,

  // Loading states
  isEditPending,
  isCreatePending,

  // Event handlers
  onEditClose,
  onCreateClose,
  onEditSave,
  onCreateSave,
  onEditModelChange,
  onCreateInputChange,
}) => {
  const handleEditInputChange = (field: keyof AIModel, value: string) => {
    if (editModelData) {
      onEditModelChange({
        ...editModelData,
        [field]: value,
      });
    }
  };

  return (
    <>
      {/* Edit Model Modal */}
      <Dialog
        open={openModal === 'edit model'}
        onOpenChange={(open) => !open && onEditClose()}
      >
        <DialogTitle className="sr-only">Edit AI Vault</DialogTitle>
        <DialogContent className="sm:max-w-[600px] text-black p-0 gap-0 z-50">
          <div className="p-6 pb-4 space-y-1 border-b">
            <h3 className="text-lg font-semibold leading-none tracking-tight">
              Edit AI Vault
            </h3>
          </div>

          {editModelData && (
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-model-name" className="text-sm font-medium">
                    Model Name*
                  </Label>
                  <Input
                    id="edit-model-name"
                    className={`${errors.model_name ? 'border-destructive' : ''} h-9`}
                    value={editModelData.model_name || ''}
                    onChange={(e) => handleEditInputChange('model_name', e.target.value)}
                    placeholder="Enter model name"
                  />
                  {errors.model_name && (
                    <p className="text-sm text-red-500 text-destructive">
                      {errors.model_name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-model-id" className="text-sm font-medium">
                    Model ID*
                  </Label>
                  <Input
                    id="edit-model-id"
                    className={`${errors.model_id ? 'border-destructive' : ''} h-9`}
                    value={editModelData.model_id || ''}
                    onChange={(e) => handleEditInputChange('model_id', e.target.value)}
                    placeholder="Enter model ID"
                  />
                  {errors.model_id && (
                    <p className="text-sm text-red-500 text-destructive">
                      {errors.model_id}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-model-owner" className="text-sm font-medium">
                    Model Owner*
                  </Label>
                  <Input
                    id="edit-model-owner"
                    className={`${errors.model_owner ? 'border-destructive' : ''} h-9`}
                    value={editModelData.model_owner || ''}
                    onChange={(e) => handleEditInputChange('model_owner', e.target.value)}
                    placeholder="Enter model owner"
                  />
                  {errors.model_owner && (
                    <p className="text-sm text-red-500 text-destructive">
                      {errors.model_owner}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-business-unit" className="text-sm font-medium">
                    Business Unit*
                  </Label>
                  <Input
                    id="edit-business-unit"
                    className={`${errors.business_unit ? 'border-destructive' : ''} h-9`}
                    value={editModelData.business_unit || ''}
                    onChange={(e) => handleEditInputChange('business_unit', e.target.value)}
                    placeholder="Enter business unit"
                  />
                  {errors.business_unit && (
                    <p className="text-sm text-red-500 text-destructive">
                      {errors.business_unit}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-model-type" className="text-sm font-medium">
                    Model Type*
                  </Label>
                  <Input
                    id="edit-model-type"
                    className={`${errors.model_type ? 'border-destructive' : ''} h-9`}
                    value={editModelData.model_type || ''}
                    onChange={(e) => handleEditInputChange('model_type', e.target.value)}
                    placeholder="Enter model type"
                  />
                  {errors.model_type && (
                    <p className="text-sm text-red-500 text-destructive">
                      {errors.model_type}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-model-version" className="text-sm font-medium">
                    Version*
                  </Label>
                  <Input
                    id="edit-model-version"
                    className={`${errors.model_version ? 'border-destructive' : ''} h-9`}
                    value={editModelData.model_version || ''}
                    onChange={(e) => handleEditInputChange('model_version', e.target.value)}
                    placeholder="Enter version"
                  />
                  {errors.model_version && (
                    <p className="text-sm text-red-500 text-destructive">
                      {errors.model_version}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-model-source" className="text-sm font-medium">
                    Source*
                  </Label>
                  <Input
                    id="edit-model-source"
                    className={`${errors.model_source ? 'border-destructive' : ''} h-9`}
                    value={editModelData.model_source || ''}
                    onChange={(e) => handleEditInputChange('model_source', e.target.value)}
                    placeholder="Enter source"
                  />
                  {errors.model_source && (
                    <p className="text-sm text-red-500 text-destructive">
                      {errors.model_source}
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
              onClick={() => editModelData && onEditSave(editModelData)}
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

      {/* Create Model Modal */}
      <Dialog
        open={openModal === 'create model'}
        onOpenChange={(open) => !open && onCreateClose()}
      >
        <DialogTitle className="sr-only">Create AI Vault</DialogTitle>
        <DialogContent className="sm:max-w-[600px] text-black p-0 gap-0">
          <div className="p-6 pb-4 space-y-1 border-b">
            <h3 className="text-lg font-semibold leading-none tracking-tight">
              Create AI Vault
            </h3>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="model-name" className="text-sm font-medium">
                  Model Name*
                </Label>
                <Input
                  id="model-name"
                  placeholder="Enter model name"
                  type="text"
                  className={`${errors.model_name ? 'border-red-500 focus-visible:border-red-500 border-destructive' : ''} h-9`}
                  value={addModelData.model_name}
                  name="model_name"
                  onChange={onCreateInputChange}
                />
                {errors.model_name && (
                  <p className="text-sm text-red-500 text-destructive">
                    {errors.model_name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="model-id" className="text-sm font-medium">
                  Model ID*
                </Label>
                <Input
                  id="model-id"
                  placeholder="Enter model ID"
                  type='text'
                  className={`${errors.model_id ? 'border-red-500 focus-visible:border-red-500 border-destructive' : ''} h-9`}
                  value={addModelData.model_id}
                  name="model_id"
                  onChange={onCreateInputChange}
                />
                {errors.model_id && (
                  <p className="text-sm text-red-500 text-destructive">
                    {errors.model_id}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="model-owner" className="text-sm font-medium">
                  Model Owner*
                </Label>
                <Input
                  id="model-owner"
                  placeholder="Enter model owner"
                  type="text"
                  className={`${errors.model_owner ? 'border-red-500 focus-visible:border-red-500 border-destructive' : ''} h-9`}
                  value={addModelData.model_owner}
                  name="model_owner"
                  onChange={onCreateInputChange}
                />
                {errors.model_owner && (
                  <p className="text-sm text-red-500 text-destructive">
                    {errors.model_owner}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="business-unit" className="text-sm font-medium">
                  Business Unit*
                </Label>
                <Input
                  id="business-unit"
                  placeholder="Enter business unit"
                  type="text"
                  className={`${errors.business_unit ? 'border-red-500 focus-visible:border-red-500 border-destructive' : ''} h-9`}
                  value={addModelData.business_unit}
                  name="business_unit"
                  onChange={onCreateInputChange}
                />
                {errors.business_unit && (
                  <p className="text-sm text-red-500 text-destructive">
                    {errors.business_unit}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="model-type" className="text-sm font-medium">
                  Model Type*
                </Label>
                <Input
                  id="model-type"
                  placeholder="Enter model type"
                  type="text"
                  className={`${errors.model_type ? 'border-red-500 focus-visible:border-red-500 border-destructive' : ''} h-9`}
                  value={addModelData.model_type}
                  name="model_type"
                  onChange={onCreateInputChange}
                />
                {errors.model_type && (
                  <p className="text-sm text-red-500 text-destructive">
                    {errors.model_type}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="model-version" className="text-sm font-medium">
                  Version*
                </Label>
                <Input
                  id="model-version"
                  placeholder="Enter version"
                  type="text"
                  className={`${errors.model_version ? 'border-red-500 focus-visible:border-red-500 border-destructive' : ''} h-9`}
                  value={addModelData.model_version}
                  name="model_version"
                  onChange={onCreateInputChange}
                />
                {errors.model_version && (
                  <p className="text-sm text-red-500 text-destructive">
                    {errors.model_version}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="model-source" className="text-sm font-medium">
                  Source*
                </Label>
                <Input
                  id="model-source"
                  placeholder="Enter source"
                  type="text"
                  className={`${errors.model_source ? 'border-red-500 focus-visible:border-red-500 border-destructive' : ''} h-9`}
                  value={addModelData.model_source}
                  name="model_source"
                  onChange={onCreateInputChange}
                />
                {errors.model_source && (
                  <p className="text-sm text-red-500 text-destructive">
                    {errors.model_source}
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

export default ModelModals;
