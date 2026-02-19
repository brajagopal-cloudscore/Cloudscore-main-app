"use client";

import type React from "react";
import { useState } from "react";
import {
  Upload,
  Save,
  Paperclip,
  X,
  FileText,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type Status = "Not started" | "In Progress" | "Done";
export type Priority = "low priority" | "medium priority" | "high priority";

export interface FieldData {
  content: string;
  status: Status;
  priority: Priority;
  files: string[];
}

export interface FieldSectionProps {
  title: string;
  fieldKey: string;
  placeholder?: string;
  field: FieldData;
  onUpdateField: (fieldKey: string, updates: Partial<FieldData>) => void;
  onSave: (fieldKey: string) => void;
  onFileUpload: (
    fieldKey: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  isDropdown?: boolean;
  dropdownOptions?: any;
}

export const StatusSelect: React.FC<{
  value: Status;
  onChange: (status: Status) => void;
}> = ({ value, onChange }) => {
  const getStatusColor = (status: Status) => {
    switch (status) {
      case "Not started":
        return "text-muted-foreground";
      case "In Progress":
        return "text-accent";
      case "Done":
        return "text-primary";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[140px] h-9 bg-card border-border hover:bg-muted/50 transition-colors">
        <SelectValue className={getStatusColor(value)} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Not started">Not started</SelectItem>
        <SelectItem value="In Progress">In Progress</SelectItem>
        <SelectItem value="Done">Done</SelectItem>
      </SelectContent>
    </Select>
  );
};

export const PriorityBadge: React.FC<{
  priority: Priority;
  onChange?: (priority: Priority) => void;
  editable?: boolean;
}> = ({ priority, onChange, editable = false }) => {
  const getVariant = () => {
    switch (priority) {
      case "high priority":
        return "default"; // Primary background
      case "medium priority":
        return "secondary"; // Secondary background
      case "low priority":
        return "outline"; // Outline style
      default:
        return "outline";
    }
  };

  if (editable && onChange) {
    return (
      <Select value={priority} onValueChange={onChange}>
        <SelectTrigger className="w-[140px] h-9 bg-card border-border hover:bg-muted/50 transition-colors capitalize">
          {priority}
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="low priority">Low Priority</SelectItem>
          <SelectItem value="medium priority">Medium Priority</SelectItem>
          <SelectItem value="high priority">High Priority</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  return (
    <Badge variant={getVariant()} className="text-xs font-medium">
      {priority}
    </Badge>
  );
};

const CustomDropdown: React.FC<{
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}> = ({ value, onChange, options, placeholder }) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="bg-input border-border hover:bg-muted/50 transition-colors">
        <SelectValue placeholder={placeholder || "Select option..."} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option: any) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const FieldSection: React.FC<FieldSectionProps> = ({
  title,
  fieldKey,
  placeholder = "Enter your content here...",
  field,
  onUpdateField,
  onSave,
  onFileUpload,
  isDropdown = false,
  dropdownOptions = [],
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const mockEvent = {
        target: { files: e.dataTransfer.files },
      } as React.ChangeEvent<HTMLInputElement>;
      onFileUpload(fieldKey, mockEvent);
    }
  };

  const removeFile = (indexToRemove: number) => {
    const updatedFiles = field.files.filter(
      (_, index) => index !== indexToRemove
    );
    onUpdateField(fieldKey, { files: updatedFiles });
  };

  return (
    <div className="w-full">
      <Card className="border-border shadow-sm hover:shadow-md transition-all duration-200 bg-card">
        <CardHeader className="pb-6 border-b border-border">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1 space-y-2">
              <div className="flex items-start gap-3">
                <h2 className="text-lg font-semibold text-foreground leading-tight text-pretty">
                  {title}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                {/* <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Status:</span>
                  <StatusSelect value={field.status} onChange={(status) => onUpdateField(fieldKey, { status })} />
                </div> */}
                {/* <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Priority:
                  </span>
                  <PriorityBadge
                    priority={field.priority}
                    onChange={(priority) =>
                      onUpdateField(fieldKey, { priority })
                    }
                    editable
                  />
                </div> */}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {isDropdown ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <CustomDropdown
                  value={field.content}
                  onChange={(value) =>
                    onUpdateField(fieldKey, { content: value })
                  }
                  options={dropdownOptions}
                  placeholder={placeholder}
                />

                {dropdownOptions.find((opt: any) => opt.value === field.content)
                  ?.link && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const selectedOption = dropdownOptions.find(
                        (opt: any) => opt.value === field.content
                      );
                      if (selectedOption?.link) {
                        window.open(selectedOption.link, "_blank");
                      }
                    }}
                    className="px-3"
                    title="Visit website"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div
                className={`relative transition-all duration-200 ${
                  isDragOver
                    ? "ring-2 ring-accent ring-opacity-50 rounded-lg"
                    : ""
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Textarea
                  value={field.content}
                  onChange={(e) =>
                    onUpdateField(fieldKey, { content: e.target.value })
                  }
                  placeholder={placeholder}
                  className="min-h-60px] resize-vertical bg-input border-border focus:ring-accent focus:border-accent transition-colors"
                />
                {isDragOver && (
                  <div className="absolute inset-0 bg-accent/5 rounded-lg flex items-center justify-center border-2 border-dashed border-accent">
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-accent mx-auto mb-2" />
                      <p className="text-sm font-medium text-accent">
                        Drop files here
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {!isDropdown && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 border-t border-border">
              <div className="flex items-center gap-4">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    multiple
                    onChange={(e) => onFileUpload(fieldKey, e)}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-card hover:bg-muted border-border"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Add Files
                  </Button>
                </label>

                {field.files.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="w-4 h-4" />
                    <span className="font-medium">
                      {field.files.length} file
                      {field.files.length !== 1 ? "s" : ""} attached
                    </span>
                  </div>
                )}
              </div>

              <Button
                onClick={() => onSave(fieldKey)}
          
                size="sm"
              >
                Save
              </Button>
            </div>
          )}

          {field.files.length > 0 && (
            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Paperclip className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">
                  Attached Files
                </p>
              </div>
              <div className="grid gap-2">
                {field.files.map((fileName, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-card rounded-md px-3 py-2 border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-sm text-foreground truncate">
                        {fileName}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isDropdown && (
            <div className="flex justify-end pt-2 border-t border-border">
              <Button onClick={() => onSave(fieldKey)} size="sm">
                Save
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FieldSection;
