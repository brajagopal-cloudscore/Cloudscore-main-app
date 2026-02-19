"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check, AlertTriangle } from "lucide-react";

interface Props {
  isOpen: boolean;
  apiKey: string;
  onClose: () => void;
}

export function ApiKeyDisplayModal({ isOpen, apiKey, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Save Your API Key
          </DialogTitle>
          <DialogDescription>
            This is the only time you'll see this key. Copy it now and store it
            securely.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 bg-amber-500/10 border  rounded-md">
            <p className="text-sm text-amber-500 font-medium mb-2">
              ⚠️ Important: This key will never be shown again!
            </p>
            <p className="text-sm text-amber-500/70">
              Make sure to copy it now. You won't be able to retrieve it later.
            </p>
          </div>

          <div className="space-y-2 ">
            <Label className="text-sm font-medium">Your API Key</Label>
            <div className="flex gap-2 items-center">
              <code className="flex-1 text-sm bg-muted p-2.5 rounded-md font-mono break-all">
                {apiKey}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={copyToClipboard}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-700">
            <p className="font-medium mb-1">How to use:</p>
            <code className="block bg-white p-2 rounded mt-2">
              curl -H "Authorization: Bearer {apiKey}" \<br />
              &nbsp;&nbsp;https://api.yourplatform.com/v1/endpoint
            </code>
          </div> */}
        </div>

        <div className="flex justify-end gap-2">
          <Button onClick={onClose} variant={"outline"}>
            I've Saved the Key
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Label({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}
