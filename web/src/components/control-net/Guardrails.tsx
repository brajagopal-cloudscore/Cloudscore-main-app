"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Shield, Play, Edit, Trash2, MoreHorizontal, Copy, Settings, Zap, AlertTriangle, CheckCircle, Clock, Activity, Loader2 } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { useTenant } from "@/contexts/TenantContext"
import { fetchGuardrails, type Guardrail } from "@/lib/api/guardrails"
import { GuardTier } from "@/types/guardrails"

function GuardrailsComponent() {
  const { user } = useUser()
  const { tenant } = useTenant()
  const [guardrails, setGuardrails] = useState<Guardrail[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)

  // Load guardrails from API
  useEffect(() => {
    const loadGuardrails = async () => {
      if (!tenant?.id || !user?.id) return

      try {
        setIsLoading(true)
        const guardrailsData = await fetchGuardrails(tenant.slug)
        setGuardrails(guardrailsData)
      } catch (error) {
        console.error('Error loading guardrails:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadGuardrails()
  }, [tenant?.id, user?.id])

  const handleEdit = (guardrail: Guardrail) => {
    // TODO: Implement edit functionality
    console.log('Edit guardrail:', guardrail)
    setOpenDropdownId(null)
  }

  const handleTest = (guardrail: Guardrail) => {
    // TODO: Implement test functionality
    console.log('Test guardrail:', guardrail)
    setOpenDropdownId(null)
  }

  const handleDelete = (guardrailId: string) => {
    // TODO: Implement delete functionality
    console.log('Delete guardrail:', guardrailId)
    setOpenDropdownId(null)
  }

  const handleDuplicate = (guardrail: Guardrail) => {
    // TODO: Implement duplicate functionality
    console.log('Duplicate guardrail:', guardrail)
    setOpenDropdownId(null)
  }

  const handleDropdownOpenChange = (open: boolean, guardrailId: string) => {
    if (open) {
      setOpenDropdownId(guardrailId)
    } else {
      setOpenDropdownId(null)
    }
  }

  const handleDropdownAction = (action: () => void, guardrailId: string) => {
    return (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      handleDropdownOpenChange(false, guardrailId)
      setTimeout(() => {
        action()
      }, 50)
    }
  }

  const getTierColor = (tier: GuardTier) => {
    switch (tier) {
      case 'T0': return 'bg-green-100 text-green-800'
      case 'T1': return 'bg-blue-100 text-blue-800'
      case 'T2': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'security': return 'bg-red-100 text-red-800'
      case 'privacy': return 'bg-blue-100 text-blue-800'
      case 'compliance': return 'bg-yellow-100 text-yellow-800'
      case 'moderation': return 'bg-orange-100 text-orange-800'
      case 'integrity': return 'bg-purple-100 text-purple-800'
      case 'business': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (isEnabled: boolean) => {
    return isEnabled ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <AlertTriangle className="w-4 h-4 text-yellow-600" />
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center py-12">
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading guardrails...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#18181B] mb-2">Guardrails</h1>
          <p className="text-gray-600">
            Manage and monitor your AI guardrail configurations
          </p>
        </div>
      </div>

      {guardrails.length === 0 ? (
        <Card className="border-[#E4E4E7]">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2 text-[#18181B]">No Guardrails</h3>
            <p className="text-gray-600 text-center mb-4 text-sm font-normal">
              No guardrails have been configured yet. Contact your administrator to set up guardrails.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guardrails.map((guardrail) => (
            <Card key={guardrail.id} className="hover:shadow-md transition-shadow border-[#E4E4E7]">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-5 w-5 text-gray-600" />
                      <CardTitle className="text-lg text-[#18181B]">{guardrail.key}</CardTitle>
                      {getStatusIcon(guardrail.is_enabled)}
                    </div>
                    <CardDescription className="text-sm text-gray-600">
                      {guardrail.description || 'No description provided'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge className={getTierColor(guardrail.tier)}>
                    {guardrail.tier}
                  </Badge>
                  {guardrail.category && (
                    <Badge className={getCategoryColor(guardrail.category)}>
                      {guardrail.category}
                    </Badge>
                  )}
                  {guardrail.requires_onnx && (
                    <Badge className="bg-purple-100 text-purple-800">
                      <Zap className="w-3 h-3 mr-1" />
                      ONNX
                    </Badge>
                  )}
                </div>

                <Separator />

                {/* Metadata */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Pack</span>
                    <span className="font-medium text-[#18181B]">
                      {guardrail.pack_name || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Function</span>
                    <span className="font-medium text-[#18181B]">
                      {guardrail.function_name || 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default GuardrailsComponent