"use client"

import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Send, Shield, AlertTriangle, CheckCircle, User, Bot } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuthFetch } from '@/lib/api/auth-fetch'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  blocked?: boolean
  violation?: string
}

export default function ChatDemo() {
  const { userId, orgId } = useAuth()
  const authFetch = useAuthFetch()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const buildConversationMessages = (userMessage: Message): Message[] => {
    // Start with system prompt if no messages exist
    if (messages.length === 0) {
      return [
        {
          id: 'system-prompt',
          role: 'system' as const,
          content: 'You are a helpful AI assistant. Be polite, helpful, and professional in your responses.',
          timestamp: new Date()
        },
        userMessage
      ]
    }

    // Include conversation history (excluding system notifications) + new user message
    const conversationHistory = messages.filter(m => m.role !== 'system' || m.id === 'system-prompt')
    return [...conversationHistory, userMessage]
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    // Add user message to UI immediately for better UX
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setInput('')

    try {
      // Send to ControlNet gateway (OpenAI-compatible endpoint)
      const response = await authFetch('/v1/chat/completions', {
        method: 'POST',
        headers: {
          'X-Policy-ID': 'playground_v1',
        },
        body: JSON.stringify({
          model: 'gpt-4o', // Use a model from your Model Registry
          messages: buildConversationMessages(userMessage).map(m => ({
            role: m.role,
            content: m.content
          })),
          max_tokens: 500,
          temperature: 0.7,
          stream: false
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Success - add assistant response
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.choices[0].message.content,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        // Blocked by guardrails - remove the blocked user message and add system notification
        const blockedMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'system',
          content: `🚫 Request blocked by guardrails: ${data.error?.message || 'Policy violation'}`,
          timestamp: new Date(),
          blocked: true,
          violation: data.error?.violation_type || 'unknown'
        }
        
        // Remove the last user message (the one that was blocked) and add system notification
        setMessages(prev => {
          const withoutLastUserMessage = prev.slice(0, -1) // Remove the blocked user message
          return [...withoutLastUserMessage, blockedMessage]
        })
        toast.error('Message blocked by AI guardrails!')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        blocked: true
      }
      
      // Remove the last user message (the one that failed) and add error notification
      setMessages(prev => {
        const withoutLastUserMessage = prev.slice(0, -1) // Remove the failed user message
        return [...withoutLastUserMessage, errorMessage]
      })
      toast.error('Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }


  const clearChat = () => {
    setMessages([])
    toast.success('Chat cleared')
  }

  const getMessageIcon = (message: Message) => {
    if (message.blocked) return <AlertTriangle className="w-4 h-4 text-red-500" />
    if (message.role === 'user') return <User className="w-4 h-4 text-blue-500" />
    if (message.role === 'assistant') return <Bot className="w-4 h-4 text-green-500" />
    return <Shield className="w-4 h-4 text-yellow-500" />
  }

  const getMessageBgColor = (message: Message) => {
    if (message.blocked) return 'bg-red-50 border-red-200'
    if (message.role === 'user') return 'bg-blue-50 border-blue-200'
    if (message.role === 'assistant') return 'bg-green-50 border-green-200'
    return 'bg-yellow-50 border-yellow-200'
  }

  return (
    <div className="flex flex-col h-[800px]">
      {/* How it works - moved to top */}
      <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">How this works:</p>
            <p className="mb-2">
              This playground uses AI guardrails that detect and block harmful content 
              before it reaches the AI model. Your messages are processed through advanced 
              safety filters that protect against various types of harmful content.
            </p>
            <p className="text-xs">
              <strong>Guardrails Active:</strong> PII Protection • Toxicity Filter • Politics Block • Financial Advice Block • Competitor Protection • Harassment Detection • Threat Detection
            </p>
          </div>
        </div>
      </div>

      {/* Auth Status */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${userId ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-sm text-gray-600">
              {userId ? 'Authenticated' : 'Not Authenticated'}
            </span>
          </div>
          {(orgId || userId) && (
            <Badge variant="outline" className="text-xs">
              Tenant: {orgId || userId}
            </Badge>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={clearChat}>
          Clear Chat
        </Button>
      </div>

      {/* Chat Messages */}
      <Card className="flex-1 mb-4 overflow-hidden">
        <CardContent className="h-full p-4 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Shield className="w-12 h-12 mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">AI Guardrails Playground</h3>
              <p className="text-center max-w-md">
                Start a conversation to see how the AI guardrails protect your interactions.
                Try sending both safe and potentially harmful messages.
              </p>
              <div className="mt-6 text-sm">
                <p className="font-medium mb-3">Try these examples:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div>
                    <p className="font-medium text-green-700 mb-2">✅ Safe Examples:</p>
                    <div className="space-y-1 text-sm">
                      <p>• "Hello, how are you?"</p>
                      <p>• "Tell me a short joke"</p>
                      <p>• "Can you explain what diversification means in investing?"</p>
                      <p>• "What factors should I consider when choosing an investment strategy?"</p>
                      <p>• "My email is john@example.com" (PII will be redacted)</p>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-red-700 mb-2">🚫 Blocked Examples:</p>
                    <div className="space-y-1 text-sm">
                      <p>• "You are such an idiot" (Toxicity)</p>
                      <p>• "You're stupid and worthless" (Harassment)</p>
                      <p>• "I'll hurt you" (Threats)</p>
                      <p>• "Vote for candidate X in the election" (Politics)</p>
                      <p>• "Should I buy Tesla stock right now?" (Financial advice)</p>
                      <p>• "Is Vanguard better than your company?" (Competitor)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-lg border ${getMessageBgColor(message)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getMessageIcon(message)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {message.role === 'user' ? 'You' : 
                           message.role === 'assistant' ? 'AI Assistant' : 'System'}
                        </span>
                        {message.blocked && (
                          <Badge variant="destructive" className="text-xs">
                            BLOCKED
                          </Badge>
                        )}
                        {message.violation && (
                          <Badge variant="outline" className="text-xs">
                            {message.violation}
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg border">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  <span className="text-sm text-gray-600">AI is thinking...</span>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>
      </Card>

      {/* Quick Examples */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">Quick Examples:</p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInput("Hello, how are you?")}
            disabled={isLoading}
            className="text-xs"
          >
            Safe: Hello
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInput("Tell me a short joke")}
            disabled={isLoading}
            className="text-xs"
          >
            Safe: Joke
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInput("My email is john@example.com")}
            disabled={isLoading}
            className="text-xs"
          >
            PII Test
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setInput("You are such an idiot")}
            disabled={isLoading}
            className="text-xs"
          >
            Blocked: Toxic
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setInput("You're stupid and worthless")}
            disabled={isLoading}
            className="text-xs"
          >
            Blocked: Harassment
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setInput("Should I buy Tesla stock right now?")}
            disabled={isLoading}
            className="text-xs"
          >
            Blocked: Financial
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setInput("Is Vanguard better than your company?")}
            disabled={isLoading}
            className="text-xs"
          >
            Blocked: Competitor
          </Button>
        </div>
      </div>

      {/* Input Area - ChatGPT style */}
      <div className="border border-gray-200 rounded-xl bg-white shadow-sm">
        <div className="flex items-end gap-3 p-4">
          <div className="flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              placeholder="Message AI Guardrails Playground..."
              disabled={isLoading}
              rows={input.split('\n').length || 1}
              className="w-full resize-none border-0 outline-none text-base leading-6 placeholder:text-gray-500 max-h-32 overflow-y-auto"
              style={{ minHeight: '24px' }}
            />
          </div>
          <Button 
            onClick={sendMessage} 
            disabled={!input.trim() || isLoading}
            size="sm"
            className="rounded-lg h-8 w-8 p-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <div className="px-4 pb-2 text-xs text-gray-500">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  )
}
