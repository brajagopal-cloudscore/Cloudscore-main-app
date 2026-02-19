'use client';

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
import { Switch } from '@/components/ui/switch';
import { CreateApplicationData, ValidationError } from '@/hooks/useApplications';

export type ApplicationModalMode = 'create' | 'edit';

interface ApplicationModalProps {
  isOpen: boolean;
  mode: ApplicationModalMode;
  applicationData: CreateApplicationData;
  errors: ValidationError;
  isLoading: boolean;
  onClose: () => void;
  onSave: () => void;
  onDataChange: (field: keyof CreateApplicationData, value: string | boolean) => void;
}

const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  mode,
  applicationData,
  errors,
  isLoading,
  onClose,
  onSave,
  onDataChange,
}) => {
  const isEditMode = mode === 'edit';
  const title = isEditMode ? 'Edit Application' : 'Create Application';
  const saveButtonText = isEditMode ? 'Save' : 'Create';
  const loadingText = isEditMode ? 'Saving...' : 'Creating...';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onDataChange(name as keyof CreateApplicationData, value);
  };

  const handleSwitchChange = (field: keyof CreateApplicationData, checked: boolean) => {
    onDataChange(field, checked);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogTitle className="sr-only">{title}</DialogTitle>
      <DialogContent className="sm:max-w-[600px] text-black p-0 gap-0 z-50 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="p-6 pb-4 space-y-1 border-b">
          <h3 className="text-lg font-semibold leading-none tracking-tight">
            {title}
          </h3>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Application Name Field */}
          <div className="space-y-2">
            <Label htmlFor="application-name" className="text-sm font-medium">
              Application Name*
            </Label>
            <Input
              id="application-name"
              placeholder="Enter application name"
              type="text"
              className={`${errors.sProjectName ? 'border-red-500 focus-visible:border-red-500' : ''} h-9`}
              value={applicationData.sProjectName}
              name="sProjectName"
              onChange={handleInputChange}
            />
            {errors.sProjectName && (
              <p className="text-sm text-red-500">
                {errors.sProjectName}
              </p>
            )}
          </div>

          {/* Module Selection Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Modules* <span className="text-gray-500 text-xs">(Select at least one)</span>
              </Label>

              <div className="grid grid-cols-2 gap-4 p-4 border rounded-md bg-gray-50">
                {/* GovIQ Module */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="goviq-module" className="text-sm font-medium text-gray-700">
                      GovIQ
                    </Label>
                    <Switch
                      id="goviq-module"
                      checked={!!applicationData.bGovIQ}
                      onCheckedChange={(checked) => handleSwitchChange('bGovIQ', checked)}
                      className="data-[state=checked]:bg-black data-[state=checked]:border-black"
                    />
                  </div>
                </div>

                {/* ControlNet Module */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="controlnet-module" className="text-sm font-medium text-gray-700">
                      ControlNet
                    </Label>
                    <Switch
                      id="controlnet-module"
                      checked={!!applicationData.bControlNet}
                      onCheckedChange={(checked) => handleSwitchChange('bControlNet', checked)}
                      className=" data-[state=checked]:bg-black data-[state=checked]:border-black"
                    />
                  </div>
                </div>
              </div>

              {errors.modules && (
                <p className="text-sm text-red-500">
                  {errors.modules}
                </p>
              )}
            </div>

            {/* Selection Summary */}
            {(applicationData.bGovIQ || applicationData.bControlNet) && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm font-medium text-blue-800 mb-1">Selected Modules:</p>
                <div className="flex gap-2">
                  {applicationData.bGovIQ && (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      GovIQ
                    </span>
                  )}
                  {applicationData.bControlNet && (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      ControlNet
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="p-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            className="bg-black text-white hover:bg-gray-600 transition-colors"
            disabled={isLoading}
            onClick={onSave}
          >
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                {loadingText}
              </>
            ) : (
              saveButtonText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationModal;