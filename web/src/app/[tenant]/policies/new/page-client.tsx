"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, FileCode, Shield, Loader2 } from "lucide-react"
import { CompositionBuilder, type CompositionNode } from "@/components/control-net/CompositionBuilder"
import { useAuthFetch } from "@/lib/api/auth-fetch"
import { toast } from "react-hot-toast"
import { getToastErrorMessage } from "@/lib/utils/policy-error-parser"

interface Guardrail {
  id: string
  key: string
  name: string
  tier: string
  description: string
}

interface PolicyCreationClientProps {
  tenantSlug: string
  userId: string
  availableGuardrails: Guardrail[]
}

export function PolicyCreationClient({
  tenantSlug,
  userId,
  availableGuardrails,
}: PolicyCreationClientProps) {
  const router = useRouter()
  const authFetch = useAuthFetch()
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    inputComposition: [] as CompositionNode[],
    outputComposition: [] as CompositionNode[],
  })

  // Validation state
  const [errors, setErrors] = useState({
    name: false,
    description: false,
    guardrails: false,
  })

  const validateForm = () => {
    const newErrors = {
      name: !formData.name.trim(),
      description: !formData.description.trim(),
      guardrails: formData.inputComposition.length === 0 && formData.outputComposition.length === 0,
    }
    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error)
  }

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields and add at least one guardrail")
      return
    }

    setIsSaving(true)
    try {
      // Convert compositions to guardrail links format
      const allGuardrailLinks: any[] = []
      let orderIndex = 0

      // Process input composition
      for (const node of formData.inputComposition) {
        const guardrail = availableGuardrails.find(g => g.key === node.guardrailKey)
        if (guardrail) {
          allGuardrailLinks.push({
            guardrail_id: guardrail.id,
            phase: "input",
            order_index: orderIndex++,
            params: node.params || {},
            enabled: true
          })
        }
      }

      // Process output composition
      for (const node of formData.outputComposition) {
        const guardrail = availableGuardrails.find(g => g.key === node.guardrailKey)
        if (guardrail) {
          allGuardrailLinks.push({
            guardrail_id: guardrail.id,
            phase: "output",
            order_index: orderIndex++,
            params: node.params || {},
            enabled: true
          })
        }
      }

      // Call Python API to create policy (generates YAML)
      const response = await authFetch('/v1/policies', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          version: "v1",
          guardrails: allGuardrailLinks,
          composition: {
            input: "allOf",
            output: "allOf",
            tool_args: "allOf",
            tool_result: "allOf"
          },
          status: "active",
          is_active: true  // Must be true for gateway to find it
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
        throw new Error(errorData.detail || "Failed to create policy")
      }

      const policy = await response.json()
      toast.success("Policy created successfully!")
      router.push(`/${tenantSlug}/policies`)
    } catch (error: any) {
      console.error("Failed to create policy:", error)
      
      // Use utility function to parse and display user-friendly error message
      const errorMessage = getToastErrorMessage(error)
      toast.error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  const totalGuardrails =
    formData.inputComposition.length +
    formData.outputComposition.length

  // Transform guardrails for composition builder
  const guardrailOptions = availableGuardrails.map(g => ({
    key: g.key,
    name: g.name || g.key,
    tier: g.tier,
    description: g.description || "",
    default_params: g.defaultParams || {},  // Include default parameters
  }))

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-[#18181B]">Create New Policy</h1>
            <p className="text-sm text-gray-600 mt-1">
              Compose guardrails into a comprehensive policy
            </p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving || !formData.name.trim() || !formData.description.trim() || totalGuardrails === 0}
          className="bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Create Policy
            </>
          )}
        </Button>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Policy Information</CardTitle>
          <CardDescription>
            Basic details about this policy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">
              Policy Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value })
                if (errors.name) setErrors({ ...errors, name: false })
              }}
              placeholder="e.g., HIPAA Compliance Policy"
              className={`mt-1 ${errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">Policy name is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value })
                if (errors.description) setErrors({ ...errors, description: false })
              }}
              placeholder="Describe the purpose and scope of this policy..."
              rows={3}
              className={`mt-1 ${errors.description ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">Description is required</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Guardrails</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#18181B]">{totalGuardrails}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Input Phase</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#18181B]">{formData.inputComposition.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Output Phase</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#18181B]">{formData.outputComposition.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Available Guards</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#18181B]">
              {availableGuardrails.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Composition Builder */}
      <Card className={errors.guardrails ? 'border-red-500' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Guardrail Composition <span className="text-red-500">*</span>
          </CardTitle>
          <CardDescription>
            Select guardrails for each phase. Our system automatically optimizes execution for best performance.
          </CardDescription>
          {errors.guardrails && (
            <p className="text-sm text-red-500 mt-2">Please add at least one guardrail</p>
          )}
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="input" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="input">
                Input
                {formData.inputComposition.length > 0 && (
                  <Badge className="ml-2" variant="secondary">
                    {formData.inputComposition.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="output">
                Output
                {formData.outputComposition.length > 0 && (
                  <Badge className="ml-2" variant="secondary">
                    {formData.outputComposition.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="input" className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-sm text-[#18181B] mb-2">Input Phase</h4>
                <p className="text-sm text-gray-700">
                  Guards run on user input before sending to the LLM. Use for PII detection,
                  jailbreak prevention, and input validation.
                </p>
              </div>
              <CompositionBuilder
                availableGuardrails={guardrailOptions}
                value={formData.inputComposition}
                onChange={(nodes) => {
                  setFormData({ ...formData, inputComposition: nodes })
                  if (errors.guardrails && (nodes.length > 0 || formData.outputComposition.length > 0)) {
                    setErrors({ ...errors, guardrails: false })
                  }
                }}
                phase="input"
              />
            </TabsContent>

            <TabsContent value="output" className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-sm text-[#18181B] mb-2">Output Phase</h4>
                <p className="text-sm text-gray-700">
                  Guards run on LLM output before returning to user. Use for toxicity detection,
                  factuality checks, and output formatting.
                </p>
              </div>
              <CompositionBuilder
                availableGuardrails={guardrailOptions}
                value={formData.outputComposition}
                onChange={(nodes) => {
                  setFormData({ ...formData, outputComposition: nodes })
                  if (errors.guardrails && (nodes.length > 0 || formData.inputComposition.length > 0)) {
                    setErrors({ ...errors, guardrails: false })
                  }
                }}
                phase="output"
              />
            </TabsContent>

          </Tabs>
        </CardContent>
      </Card>

      {/* Save Button (sticky bottom) */}
      <div className="sticky bottom-0 bg-white border-t pt-4">
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !formData.name.trim() || !formData.description.trim() || totalGuardrails === 0}
            className="bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Policy
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
