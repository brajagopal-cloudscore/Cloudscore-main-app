'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Copy, Trash2, Plus } from 'lucide-react';

const ApiKeysPage = () => {
  const [apiKey] = useState("DMnFcXXXXXXXXXXXXXXXXXXXX7vmi");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDelete = () => {
    // Handle delete functionality
    console.log('Delete API key');
  };

  const handleGenerateNew = () => {
    // Handle generate new API key
    console.log('Generate new API key');
  };

  return (
    <div className="min-h-screen bg-white text-black p-6">
      {/* API Keys Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-black">API Keys</h1>
          <Button
            onClick={handleGenerateNew}
            className="bg-black hover:bg-gray-900 text-white px-4 py-2 rounded-md font-medium transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Generate New API Key
          </Button>
        </div>

        {/* API Key Card */}
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="secret-key" className="text-sm font-medium text-black mb-2 block">
                  secret_key
                </Label>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 relative">
                    <Input
                      id="secret-key"
                      value={apiKey}
                      readOnly
                      className="font-mono text-sm bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-0"
                    />
                  </div>

                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    size="sm"
                    className="border-gray-200 hover:bg-gray-50 text-black"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>

                  <Button
                    onClick={handleDelete}
                    variant="outline"
                    size="sm"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ApiKeysPage;
