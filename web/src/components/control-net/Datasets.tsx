"use client";

import type React from "react";
import { useState } from "react";
import { Plus, Database, Calendar, FileText, Upload, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

export interface Dataset {
  id: string;
  name: string;
  description: string;
  recordCount: number;
  size: string;
  type: "training" | "validation" | "test" | "production";
  lastUpdated: string;
  tags: string[];
  status: "active" | "processing" | "archived";
}

interface DatasetsTabProps {
  datasets: Dataset[];
}

const DatasetsTab: React.FC<DatasetsTabProps> = ({ datasets }) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "training" as Dataset["type"],
    tags: "",
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!formData.name) {
        setFormData((prev) => ({
          ...prev,
          name: file.name.replace(/\.[^/.]+$/, ""),
        }));
      }
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile) return;

    console.log("[v0] Uploading dataset:", {
      file: selectedFile,
      ...formData,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    });

    setSelectedFile(null);
    setFormData({ name: "", description: "", type: "training", tags: "" });
    setIsUploadModalOpen(false);
  };

  const handleAddDatasetClick = () => {
    setIsUploadModalOpen(true);
  };

  const getStatusColor = (status: Dataset["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: Dataset["type"]) => {
    switch (type) {
      case "training":
        return "bg-blue-100 text-blue-800";
      case "validation":
        return "bg-purple-100 text-purple-800";
      case "test":
        return "bg-orange-100 text-orange-800";
      case "production":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Datasets</h1>
          <p className="text-gray-600 mt-1">
            Manage your training and validation datasets
          </p>
        </div>
        <Button
          onClick={handleAddDatasetClick}
          className="bg-black text-white hover:bg-gray-800"
        >
          <Plus size={16} className="mr-2" />
          Add Dataset
        </Button>
      </div>

      {datasets.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Database size={48} className="text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No datasets yet
            </h3>
            <p className="text-gray-500 text-center mb-4 max-w-md">
              Get started by adding your first dataset. You can upload training
              data, validation sets, or production datasets.
            </p>
            <Button
              onClick={handleAddDatasetClick}
              className="bg-black text-white hover:bg-gray-800"
            >
              <Plus size={16} className="mr-2" />
              Add Your First Dataset
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {datasets.map((dataset) => (
            <Card
              key={dataset.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Database size={20} className="text-gray-600" />
                    <CardTitle className="text-lg">{dataset.name}</CardTitle>
                  </div>
                  <Badge className={getStatusColor(dataset.status)}>
                    {dataset.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm line-clamp-2">
                  {dataset.description}
                </p>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-gray-500">
                    <FileText size={14} />
                    <span>{dataset.recordCount.toLocaleString()} records</span>
                  </div>
                  <span className="text-gray-500">{dataset.size}</span>
                </div>

                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Calendar size={14} />
                  <span>Updated {dataset.lastUpdated}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge className={getTypeColor(dataset.type)}>
                    {dataset.type}
                  </Badge>
                  {dataset?.tags?.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent"
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Dataset</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 text-black">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Dataset File</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  id="file-upload"
                  type="file"
                  accept=".csv,.json,.jsonl,.txt,.parquet"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileText size={20} className="text-green-600" />
                      <span className="text-sm font-medium">
                        {selectedFile.name}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedFile(null);
                        }}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload
                        size={24}
                        className="mx-auto text-gray-400 mb-2"
                      />
                      <p className="text-sm text-gray-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        CSV, JSON, JSONL, TXT, Parquet files
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataset-name">Dataset Name</Label>
              <Input
                id="dataset-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter dataset name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataset-type">Dataset Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: Dataset["type"]) =>
                  setFormData((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="validation">Validation</SelectItem>
                  <SelectItem value="test">Test</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataset-description">Description</Label>
              <Textarea
                id="dataset-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe your dataset..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataset-tags">Tags (comma-separated)</Label>
              <Input
                id="dataset-tags"
                value={formData.tags}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, tags: e.target.value }))
                }
                placeholder="nlp, text-classification, english"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsUploadModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!selectedFile || !formData.name}
                className="flex-1 bg-black text-white hover:bg-gray-800"
              >
                Upload Dataset
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DatasetsTab;
