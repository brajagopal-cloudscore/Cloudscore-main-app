import React, { useState } from "react";
import { Button } from "../ui/button";
import { Check, Copy } from "lucide-react";
import { successToast } from "@/lib/utils/toast";

import { FaPython, FaNodeJs } from "react-icons/fa";
import { SiCurl } from "react-icons/si";
export default function PolicyIntegration({
  selectedPolicy,
}: {
  selectedPolicy: string;
}) {
  const [copied, setCopied] = useState(false);
  const [requestURL] = useState(
    process.env.NEXT_PUBLIC_PLAYGROUND_REQUEST_URL || "https://demo.kentron.ai"
  );

  const handleCopy = async (type: string, databaseGuardrail: any) => {
    try {
      let data = "";
      if (type === "CURL")
        data = `curl ${requestURL}/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "X-API-KEY: sk_test_YOUR_CONTROLNET_KEY" \\
  -H "Authorization: Bearer sk-proj-YOUR_OPENAI_KEY" \\
  -H "X-Policy-ID: ${selectedPolicy || "policy-uuid-here"}" \\
  -d '{
    "model": "your-model-id",
    "messages": [{"role": "user", "content": "Hello!"}]
  }`;
      else if (type === "PYTHON")
        data = `from openai import OpenAI

# ControlNet Proxy Integration (OpenAI SDK Compatible)
client = OpenAI(
    api_key="sk-proj-YOUR_OPENAI_KEY",  # Your provider key (BYOK)
    base_url="${requestURL}/v1",
    default_headers={
        "X-API-KEY": "sk_test_YOUR_CONTROLNET_KEY",
        "X-Policy-ID": '${selectedPolicy || "policy-uuid-here"}',
    }
)

# Use exactly like normal OpenAI - guardrails applied automatically
response = client.chat.completions.create(
    model="your-model-id",
    messages=[{"role": "user", "content": "Hello!"}]
)`;
      else if (type === "NODEJS")
        data = `import OpenAI from 'openai';

// ControlNet Proxy Integration (OpenAI SDK Compatible)
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,  // Your provider key (BYOK)
  baseURL: '${requestURL}/v1',    
  defaultHeaders: {
    'X-API-KEY': process.env.CONTROLNET_API_KEY,
    'X-Policy-ID': '${selectedPolicy || "policy-uuid-here"}',
  }
});

// Use exactly like normal OpenAI - guardrails applied automatically
const response = await client.chat.completions.create({
  model: 'your-model-id',
  messages: [{ role: 'user', content: 'Hello!' }]
});`;
      await navigator.clipboard.writeText(data);
      setCopied(true);
      successToast("", "", "", "Code copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="relative mt-5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xl font-semibold">Integration</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start ">
        <div className="space-y-2 h-full  w-full border bg-muted p-3 rounded-lg">
          <div className="flex justify-between items-center ">
            <h3 className="font-semibold text-md">Required Headers</h3>
            <Button
              variant="outline"
              size="sm"
              //   onClick={copyToClipboard}
              className="h-8 px-2"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <div className="p-4 rounded-lg space-y-2 text-sm font-mono">
            <div>
              <span className="text-muted-foreground">X-API-KEY:</span>{" "}
              <span className="">Your ControlNet API Key</span>
            </div>
            <div>
              <span className="text-muted-foreground">Authorization:</span>{" "}
              <span className="">Bearer YOUR_PROVIDER_KEY (BYOK)</span>
            </div>
            <div>
              <span className="text-muted-foreground">X-Policy-ID:</span>{" "}
              <span className="">{selectedPolicy || "policy-uuid-here"}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 h-full w-full border bg-muted p-3 rounded-lg">
          <div className="flex justify-between items-center ">
            <h3 className="font-semibold text-md">Copy API Code</h3>
          </div>
          <div className=" p-4 rounded-lg space-y-2 ">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 ">
                <FaPython size={15} />
                <span className="">Python</span>
              </div>
              <Copy
                className="cursor-pointer"
                size={15}
                onClick={() => handleCopy("PYTHON", {})}
              ></Copy>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <FaNodeJs size={15} />
                <span className="">JavaScript</span>
              </div>
              <Copy
                className="cursor-pointer"
                size={15}
                onClick={() => handleCopy("NODEJS", {})}
              ></Copy>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <SiCurl size={15} />
                <span className="">Curl</span>
              </div>
              <Copy
                className="cursor-pointer"
                size={15}
                onClick={() => handleCopy("CURL", {})}
              ></Copy>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
