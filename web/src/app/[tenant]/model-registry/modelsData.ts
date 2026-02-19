import {
  MessageSquare,
  Code,
  Video,
  Images,
  Mic,
  Volume2,
  Languages,
  Eye as VisionIcon,
  Database,
  FileText,
  Bot,
  Brain,
  Shield
} from 'lucide-react';

export interface ModelData {
  id: string;
  name: string;
  provider: string;
  category: string;
  description: string;
  version: string;
  performance: {
    accuracy: number;
    latency: number;
    cost: number;
    safety: number;
  };
  metrics: {
    usage: number;
    rating: number;
    lastUpdated: string;
  };
  tags: string[];
  status: 'active' | 'deprecated' | 'beta';
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
}

export const modelsData: ModelData[] = [
  // Core GPT models
  {
    id: 'gpt-5',
    name: 'gpt-5',
    provider: 'OpenAI',
    category: 'Language',
    description: 'Chat completion',
    version: '5.0',
    performance: { accuracy: 91, latency: 1200, cost: 3.69, safety: 96 },
    metrics: { usage: 1250, rating: 4.8, lastUpdated: '2024-01-20' },
    tags: ['GPT', 'Language', 'Chat'],
    status: 'active',
    icon: MessageSquare,
    color: 'bg-blue-500'
  },
  {
    id: 'gpt-5-mini',
    name: 'gpt-5-mini',
    provider: 'OpenAI',
    category: 'Language',
    description: 'Chat completion',
    version: '5.0',
    performance: { accuracy: 89, latency: 800, cost: 0.69, safety: 95 },
    metrics: { usage: 1100, rating: 4.7, lastUpdated: '2024-01-18' },
    tags: ['GPT', 'Mini', 'Chat'],
    status: 'active',
    icon: MessageSquare,
    color: 'bg-blue-500'
  },
  {
    id: 'gpt-5-nano',
    name: 'gpt-5-nano',
    provider: 'OpenAI',
    category: 'Language',
    description: 'Chat completion',
    version: '5.0',
    performance: { accuracy: 83, latency: 600, cost: 0.14, safety: 92 },
    metrics: { usage: 950, rating: 4.5, lastUpdated: '2024-01-15' },
    tags: ['GPT', 'Nano', 'Chat'],
    status: 'active',
    icon: MessageSquare,
    color: 'bg-blue-500'
  },
  {
    id: 'gpt-5-chat',
    name: 'gpt-5-chat',
    provider: 'OpenAI',
    category: 'Language',
    description: 'Chat completion',
    version: '5.0',
    performance: { accuracy: 85, latency: 1000, cost: 3.69, safety: 94 },
    metrics: { usage: 800, rating: 4.6, lastUpdated: '2024-01-12' },
    tags: ['GPT', 'Chat', 'Preview'],
    status: 'active',
    icon: MessageSquare,
    color: 'bg-blue-500'
  },
  // O3 models
  {
    id: 'o3-pro',
    name: 'o3-pro',
    provider: 'OpenAI',
    category: 'Language',
    description: 'Responses',
    version: '3.0',
    performance: { accuracy: 91, latency: 1500, cost: 35, safety: 99 },
    metrics: { usage: 700, rating: 4.9, lastUpdated: '2024-01-10' },
    tags: ['O3', 'Pro', 'Reasoning'],
    status: 'active',
    icon: MessageSquare,
    color: 'bg-blue-500'
  },
  {
    id: 'o3-mini',
    name: 'o3-mini',
    provider: 'OpenAI',
    category: 'Language',
    description: 'Chat completion',
    version: '3.0',
    performance: { accuracy: 87, latency: 1200, cost: 1.93, safety: 93 },
    metrics: { usage: 850, rating: 4.7, lastUpdated: '2024-01-08' },
    tags: ['O3', 'Mini', 'Reasoning'],
    status: 'active',
    icon: MessageSquare,
    color: 'bg-blue-500'
  },
  {
    id: 'o4-mini',
    name: 'o4-mini',
    provider: 'OpenAI',
    category: 'Language',
    description: 'Chat completion',
    version: '4.0',
    performance: { accuracy: 89, latency: 1000, cost: 2.5, safety: 95 },
    metrics: { usage: 650, rating: 4.6, lastUpdated: '2024-01-05' },
    tags: ['O4', 'Mini', 'Reasoning'],
    status: 'active',
    icon: MessageSquare,
    color: 'bg-blue-500'
  },
  {
    id: 'o1',
    name: 'o1',
    provider: 'OpenAI',
    category: 'Language',
    description: 'Chat completion',
    version: '1.0',
    performance: { accuracy: 90, latency: 1800, cost: 15, safety: 98 },
    metrics: { usage: 600, rating: 4.8, lastUpdated: '2024-01-03' },
    tags: ['O1', 'Reasoning', 'Chat'],
    status: 'active',
    icon: MessageSquare,
    color: 'bg-blue-500'
  },
  // Image models
  {
    id: 'FLUX-1.1-pro',
    name: 'FLUX-1.1-pro',
    provider: 'Black Forest Labs',
    category: 'Image',
    description: 'Text to image',
    version: '1.1',
    performance: { accuracy: 90, latency: 3000, cost: 0.05, safety: 85 },
    metrics: { usage: 320, rating: 4.4, lastUpdated: '2024-01-12' },
    tags: ['FLUX', 'Image', 'Generation'],
    status: 'active',
    icon: Images,
    color: 'bg-purple-500'
  },
  {
    id: 'dall-e-3',
    name: 'dall-e-3',
    provider: 'OpenAI',
    category: 'Image',
    description: 'Text to image',
    version: '3.0',
    performance: { accuracy: 91, latency: 2500, cost: 0.04, safety: 90 },
    metrics: { usage: 420, rating: 4.5, lastUpdated: '2024-01-03' },
    tags: ['DALL-E', 'Image', 'Generation'],
    status: 'active',
    icon: Images,
    color: 'bg-purple-500'
  },
  // Video models
  {
    id: 'sora',
    name: 'sora',
    provider: 'OpenAI',
    category: 'Video',
    description: 'Video generation',
    version: '1.0',
    performance: { accuracy: 85, latency: 10000, cost: 0.1, safety: 80 },
    metrics: { usage: 150, rating: 4.3, lastUpdated: '2024-01-08' },
    tags: ['Sora', 'Video', 'Generation'],
    status: 'active',
    icon: Video,
    color: 'bg-red-500'
  },
  // Grok models
  {
    id: 'grok-3',
    name: 'grok-3',
    provider: 'xAI',
    category: 'Language',
    description: 'Chat completion',
    version: '3.0',
    performance: { accuracy: 85, latency: 560, cost: 6, safety: 88 },
    metrics: { usage: 650, rating: 4.6, lastUpdated: '2024-01-05' },
    tags: ['Grok', 'Chat', 'Language'],
    status: 'active',
    icon: MessageSquare,
    color: 'bg-gray-900'
  },
  {
    id: 'grok-3-mini',
    name: 'grok-3-mini',
    provider: 'xAI',
    category: 'Language',
    description: 'Chat completion',
    version: '3.0',
    performance: { accuracy: 82, latency: 400, cost: 3, safety: 85 },
    metrics: { usage: 500, rating: 4.4, lastUpdated: '2024-01-03' },
    tags: ['Grok', 'Mini', 'Language'],
    status: 'active',
    icon: MessageSquare,
    color: 'bg-black'
  },
  // DeepSeek models
  {
    id: 'deepseek-r1',
    name: 'DeepSeek-R1-0528',
    provider: 'DeepSeek',
    category: 'Language',
    description: 'Chat completion',
    version: '0528',
    performance: { accuracy: 87, latency: 1120, cost: 2.36, safety: 90 },
    metrics: { usage: 400, rating: 4.5, lastUpdated: '2024-01-01' },
    tags: ['DeepSeek', 'Reasoning', 'Chat'],
    status: 'active',
    icon: Brain,
    color: 'bg-purple-500'
  },
  // Phi models
  {
    id: 'Phi-4',
    name: 'Phi-4',
    provider: 'Microsoft',
    category: 'Language',
    description: 'Chat completion',
    version: '4.0',
    performance: { accuracy: 72, latency: 270, cost: 0.22, safety: 98 },
    metrics: { usage: 600, rating: 4.2, lastUpdated: '2023-12-28' },
    tags: ['Phi', 'Language', 'Chat'],
    status: 'active',
    icon: MessageSquare,
    color: 'bg-yellow-600'
  },
  {
    id: 'Phi-4-mini-instruct',
    name: 'Phi-4-mini-instruct',
    provider: 'Microsoft',
    category: 'Language',
    description: 'Chat completion',
    version: '4.0',
    performance: { accuracy: 70, latency: 200, cost: 0.15, safety: 96 },
    metrics: { usage: 550, rating: 4.1, lastUpdated: '2023-12-25' },
    tags: ['Phi', 'Mini', 'Instruct'],
    status: 'active',
    icon: MessageSquare,
    color: 'bg-yellow-600'
  },
  {
    id: 'Phi-4-reasoning',
    name: 'Phi-4-reasoning',
    provider: 'Microsoft',
    category: 'Language',
    description: 'Chat completion',
    version: '4.0',
    performance: { accuracy: 75, latency: 300, cost: 0.25, safety: 97 },
    metrics: { usage: 450, rating: 4.3, lastUpdated: '2023-12-22' },
    tags: ['Phi', 'Reasoning', 'Chat'],
    status: 'active',
    icon: MessageSquare,
    color: 'bg-yellow-800'
  },
  {
    id: 'Phi-4-mini-reasoning',
    name: 'Phi-4-mini-reasoning',
    provider: 'Microsoft',
    category: 'Language',
    description: 'Chat completion',
    version: '4.0',
    performance: { accuracy: 73, latency: 180, cost: 0.12, safety: 95 },
    metrics: { usage: 400, rating: 4.2, lastUpdated: '2023-12-20' },
    tags: ['Phi', 'Mini', 'Reasoning'],
    status: 'active',
    icon: MessageSquare,
    color: 'bg-yellow-800'
  },
  // Llama models
  {
    id: 'Llama-4-Maverick',
    name: 'Llama-4-Maverick-17B-128E-Instruct-FP8',
    provider: 'Meta',
    category: 'Language',
    description: 'Chat completion',
    version: '4.0',
    performance: { accuracy: 79, latency: 110, cost: 0.62, safety: 85 },
    metrics: { usage: 300, rating: 4.0, lastUpdated: '2023-12-20' },
    tags: ['Llama', 'Maverick', 'Chat'],
    status: 'active',
    icon: MessageSquare,
    color: 'bg-blue-700'
  },
  {
    id: 'Llama-3.3-70B-Instruct',
    name: 'Llama-3.3-70B-Instruct',
    provider: 'Meta',
    category: 'Language',
    description: 'Chat completion',
    version: '3.3',
    performance: { accuracy: 84, latency: 800, cost: 1.2, safety: 90 },
    metrics: { usage: 500, rating: 4.4, lastUpdated: '2023-12-18' },
    tags: ['Llama', '70B', 'Chat'],
    status: 'active',
    icon: MessageSquare,
    color: 'bg-blue-700'
  },
  {
    id: 'Meta-Llama-3-70B-Instruct',
    name: 'Meta-Llama-3-70B-Instruct',
    provider: 'Meta',
    category: 'Language',
    description: 'Chat completion',
    version: '3.0',
    performance: { accuracy: 83, latency: 750, cost: 1.1, safety: 89 },
    metrics: { usage: 480, rating: 4.3, lastUpdated: '2023-12-15' },
    tags: ['Llama', '70B', 'Chat'],
    status: 'active',
    icon: MessageSquare,
    color: 'bg-blue-700'
  },
  // Mistral models
  {
    id: 'Ministral-3B',
    name: 'Ministral-3B',
    provider: 'Mistral',
    category: 'Language',
    description: 'Chat completion',
    version: '3.0',
    performance: { accuracy: 75, latency: 150, cost: 0.1, safety: 90 },
    metrics: { usage: 200, rating: 4.0, lastUpdated: '2023-12-18' },
    tags: ['Ministral', 'Small', 'Chat'],
    status: 'active',
    icon: MessageSquare,
    color: 'bg-orange-600'
  },
  {
    id: 'Mistral-large-2407',
    name: 'Mistral-large-2407',
    provider: 'Mistral',
    category: 'Language',
    description: 'Chat completion',
    version: '2407',
    performance: { accuracy: 86, latency: 600, cost: 2.0, safety: 92 },
    metrics: { usage: 350, rating: 4.5, lastUpdated: '2023-12-10' },
    tags: ['Mistral', 'Large', 'Chat'],
    status: 'active',
    icon: MessageSquare,
    color: 'bg-orange-600'
  },
  {
    id: 'Mistral-Large-2411',
    name: 'Mistral-Large-2411',
    provider: 'Mistral',
    category: 'Language',
    description: 'Chat completion',
    version: '2411',
    performance: { accuracy: 87, latency: 650, cost: 2.1, safety: 93 },
    metrics: { usage: 380, rating: 4.6, lastUpdated: '2023-12-12' },
    tags: ['Mistral', 'Large', 'Chat'],
    status: 'active',
    icon: MessageSquare,
    color: 'bg-orange-600'
  },
  // Code models
  {
    id: 'codex-mini',
    name: 'codex-mini',
    provider: 'OpenAI',
    category: 'Code',
    description: 'Responses',
    version: '1.0',
    performance: { accuracy: 88, latency: 800, cost: 2.0, safety: 92 },
    metrics: { usage: 250, rating: 4.3, lastUpdated: '2024-01-15' },
    tags: ['Codex', 'Code', 'CLI'],
    status: 'active',
    icon: Code,
    color: 'bg-green-500'
  },
  // GPT-4 models
  {
    id: 'gpt-4o',
    name: 'gpt-4o',
    provider: 'OpenAI',
    category: 'Language',
    description: 'Chat completion',
    version: '4.0',
    performance: { accuracy: 88, latency: 900, cost: 2.5, safety: 95 },
    metrics: { usage: 1200, rating: 4.7, lastUpdated: '2024-01-10' },
    tags: ['GPT-4o', 'Multimodal', 'Chat'],
    status: 'active',
    icon: MessageSquare,
    color: 'bg-blue-500'
  },
  {
    id: 'gpt-4o-mini',
    name: 'gpt-4o-mini',
    provider: 'OpenAI',
    category: 'Language',
    description: 'Chat completion',
    version: '4.0',
    performance: { accuracy: 85, latency: 600, cost: 0.6, safety: 93 },
    metrics: { usage: 1000, rating: 4.5, lastUpdated: '2024-01-08' },
    tags: ['GPT-4o', 'Mini', 'Chat'],
    status: 'active',
    icon: MessageSquare,
    color: 'bg-blue-500'
  },
  // Audio/Speech models
  {
    id: 'whisper',
    name: 'whisper',
    provider: 'OpenAI',
    category: 'Audio',
    description: 'Automatic speech recognition',
    version: '1.0',
    performance: { accuracy: 92, latency: 2000, cost: 0.006, safety: 85 },
    metrics: { usage: 800, rating: 4.6, lastUpdated: '2024-01-05' },
    tags: ['Whisper', 'Speech', 'Recognition'],
    status: 'active',
    icon: Mic,
    color: 'bg-blue-500'
  },
  {
    id: 'tts',
    name: 'tts',
    provider: 'OpenAI',
    category: 'Audio',
    description: 'Text to speech',
    version: '1.0',
    performance: { accuracy: 90, latency: 1500, cost: 0.015, safety: 88 },
    metrics: { usage: 600, rating: 4.4, lastUpdated: '2024-01-03' },
    tags: ['TTS', 'Speech', 'Generation'],
    status: 'active',
    icon: Volume2,
    color: 'bg-teal-500'
  },
  {
    id: 'tts-hd',
    name: 'tts-hd',
    provider: 'OpenAI',
    category: 'Audio',
    description: 'Text to speech',
    version: 'HD',
    performance: { accuracy: 95, latency: 2500, cost: 0.03, safety: 90 },
    metrics: { usage: 400, rating: 4.7, lastUpdated: '2024-01-01' },
    tags: ['TTS', 'HD', 'Speech'],
    status: 'active',
    icon: Volume2,
    color: 'bg-teal-500'
  },
  // Embedding models
  {
    id: 'text-embedding-3-large',
    name: 'text-embedding-3-large',
    provider: 'OpenAI',
    category: 'Embeddings',
    description: 'Embeddings',
    version: '3.0',
    performance: { accuracy: 89, latency: 100, cost: 0.00013, safety: 95 },
    metrics: { usage: 900, rating: 4.5, lastUpdated: '2023-12-28' },
    tags: ['Embedding', 'Large', 'Vector'],
    status: 'active',
    icon: Database,
    color: 'bg-gray-500'
  },
  {
    id: 'text-embedding-3-small',
    name: 'text-embedding-3-small',
    provider: 'OpenAI',
    category: 'Embeddings',
    description: 'Embeddings',
    version: '3.0',
    performance: { accuracy: 85, latency: 80, cost: 0.00002, safety: 93 },
    metrics: { usage: 1100, rating: 4.3, lastUpdated: '2023-12-25' },
    tags: ['Embedding', 'Small', 'Vector'],
    status: 'active',
    icon: Database,
    color: 'bg-gray-500'
  },
  // Cohere models
  {
    id: 'Cohere-command-r-plus',
    name: 'Cohere-command-r-plus',
    provider: 'Cohere',
    category: 'Language',
    description: 'Chat completion',
    version: 'r-plus',
    performance: { accuracy: 83, latency: 700, cost: 1.5, safety: 91 },
    metrics: { usage: 300, rating: 4.2, lastUpdated: '2023-12-20' },
    tags: ['Cohere', 'Command', 'Chat'],
    status: 'active',
    icon: MessageSquare,
    color: 'bg-gray-400'
  },
  // Additional models to reach 60+
  {
    id: 'gpt-4-32k',
    name: 'gpt-4-32k',
    provider: 'OpenAI',
    category: 'Language',
    description: 'Chat completion',
    version: '4.0',
    performance: { accuracy: 87, latency: 1200, cost: 3.0, safety: 96 },
    metrics: { usage: 450, rating: 4.6, lastUpdated: '2023-12-15' },
    tags: ['GPT-4', '32K', 'Chat'],
    status: 'active',
    icon: MessageSquare,
    color: 'bg-blue-500'
  },
  {
    id: 'gpt-35-turbo',
    name: 'gpt-35-turbo',
    provider: 'OpenAI',
    category: 'Language',
    description: 'Chat completion',
    version: '3.5',
    performance: { accuracy: 82, latency: 500, cost: 0.5, safety: 90 },
    metrics: { usage: 800, rating: 4.3, lastUpdated: '2023-12-10' },
    tags: ['GPT-3.5', 'Turbo', 'Chat'],
    status: 'active',
    icon: MessageSquare,
    color: 'bg-blue-500'
  },
  {
    id: 'gpt-35-turbo-16k',
    name: 'gpt-35-turbo-16k',
    provider: 'OpenAI',
    category: 'Language',
    description: 'Chat completion',
    version: '3.5',
    performance: { accuracy: 82, latency: 600, cost: 0.75, safety: 90 },
    metrics: { usage: 600, rating: 4.3, lastUpdated: '2023-12-08' },
    tags: ['GPT-3.5', '16K', 'Chat'],
    status: 'active',
    icon: MessageSquare,
    color: 'bg-blue-500'
  },
  {
    id: 'gpt-35-turbo-instruct',
    name: 'gpt-35-turbo-instruct',
    provider: 'OpenAI',
    category: 'Language',
    description: 'Chat completion',
    version: '3.5',
    performance: { accuracy: 81, latency: 450, cost: 0.4, safety: 89 },
    metrics: { usage: 400, rating: 4.2, lastUpdated: '2023-12-05' },
    tags: ['GPT-3.5', 'Instruct', 'Chat'],
    status: 'active',
    icon: MessageSquare,
    color: 'bg-blue-500'
  },
  // Add more models to reach 60+
  {
    id: 'davinci-002',
    name: 'davinci-002',
    provider: 'OpenAI',
    category: 'Language',
    description: 'Completions',
    version: '002',
    performance: { accuracy: 80, latency: 800, cost: 0.02, safety: 88 },
    metrics: { usage: 200, rating: 4.1, lastUpdated: '2023-11-30' },
    tags: ['Davinci', 'Completions', 'Legacy'],
    status: 'active',
    icon: MessageSquare,
    color: 'bg-blue-500'
  },
  {
    id: 'text-embedding-ada-002',
    name: 'text-embedding-ada-002',
    provider: 'OpenAI',
    category: 'Embeddings',
    description: 'Embeddings',
    version: 'ada-002',
    performance: { accuracy: 78, latency: 120, cost: 0.0001, safety: 92 },
    metrics: { usage: 700, rating: 4.2, lastUpdated: '2023-11-25' },
    tags: ['Ada', 'Embedding', 'Legacy'],
    status: 'active',
    icon: Database,
    color: 'bg-gray-500'
  },
  // Continue adding more models...
  {
    id: 'jais-30b-chat',
    name: 'jais-30b-chat',
    provider: 'AI21',
    category: 'Language',
    description: 'Chat completion',
    version: '30B',
    performance: { accuracy: 79, latency: 900, cost: 1.8, safety: 87 },
    metrics: { usage: 150, rating: 4.0, lastUpdated: '2023-11-20' },
    tags: ['JAIS', '30B', 'Chat'],
    status: 'active',
    icon: MessageSquare,
    color: 'bg-purple-700'
  },
  {
    id: 'gpt-audio',
    name: 'gpt-audio',
    provider: 'OpenAI',
    category: 'Audio',
    description: 'Audio generation',
    version: '1.0',
    performance: { accuracy: 88, latency: 3000, cost: 0.05, safety: 85 },
    metrics: { usage: 100, rating: 4.4, lastUpdated: '2023-11-15' },
    tags: ['GPT', 'Audio', 'Generation'],
    status: 'active',
    icon: Mic,
    color: 'bg-blue-500'
  },
  {
    id: 'gpt-realtime',
    name: 'gpt-realtime',
    provider: 'OpenAI',
    category: 'Audio',
    description: 'Audio generation',
    version: '1.0',
    performance: { accuracy: 85, latency: 100, cost: 0.02, safety: 83 },
    metrics: { usage: 80, rating: 4.2, lastUpdated: '2023-11-10' },
    tags: ['GPT', 'Realtime', 'Audio'],
    status: 'active',
    icon: Mic,
    color: 'bg-blue-500'
  },
  // Add more models to reach 60+ total
  {
    id: 'Azure-AI-Language',
    name: 'Azure-AI-Language',
    provider: 'Microsoft',
    category: 'Language',
    description: 'Language Analytics',
    version: '1.0',
    performance: { accuracy: 84, latency: 400, cost: 0.5, safety: 94 },
    metrics: { usage: 350, rating: 4.3, lastUpdated: '2023-11-05' },
    tags: ['Azure', 'Language', 'Analytics'],
    status: 'active',
    icon: Brain,
    color: 'bg-yellow-500'
  },
  {
    id: 'Azure-AI-Translator',
    name: 'Azure-AI-Translator',
    provider: 'Microsoft',
    category: 'Translation',
    description: 'Translation',
    version: '1.0',
    performance: { accuracy: 92, latency: 200, cost: 0.1, safety: 95 },
    metrics: { usage: 500, rating: 4.6, lastUpdated: '2023-11-01' },
    tags: ['Azure', 'Translation', 'Language'],
    status: 'active',
    icon: Languages,
    color: 'bg-yellow-500'
  },
  {
    id: 'Azure-AI-Speech',
    name: 'Azure-AI-Speech',
    provider: 'Microsoft',
    category: 'Speech',
    description: 'Speech Recognition',
    version: '1.0',
    performance: { accuracy: 90, latency: 300, cost: 0.05, safety: 92 },
    metrics: { usage: 400, rating: 4.4, lastUpdated: '2023-10-28' },
    tags: ['Azure', 'Speech', 'Recognition'],
    status: 'active',
    icon: Mic,
    color: 'bg-yellow-500'
  },
  {
    id: 'Azure-AI-Vision',
    name: 'Azure-AI-Vision',
    provider: 'Microsoft',
    category: 'Vision',
    description: 'Vision Processing',
    version: '1.0',
    performance: { accuracy: 87, latency: 500, cost: 0.15, safety: 93 },
    metrics: { usage: 300, rating: 4.3, lastUpdated: '2023-10-25' },
    tags: ['Azure', 'Vision', 'Processing'],
    status: 'active',
    icon: VisionIcon,
    color: 'bg-yellow-500'
  },
  {
    id: 'Azure-AI-Content-Understanding',
    name: 'Azure-AI-Content-Understanding',
    provider: 'Microsoft',
    category: 'Content Processing',
    description: 'Content Processing',
    version: '1.0',
    performance: { accuracy: 83, latency: 600, cost: 0.2, safety: 91 },
    metrics: { usage: 250, rating: 4.2, lastUpdated: '2023-10-22' },
    tags: ['Azure', 'Content', 'Processing'],
    status: 'active',
    icon: FileText,
    color: 'bg-yellow-500'
  },
  {
    id: 'Azure-AI-Document-Intelligence',
    name: 'Azure-AI-Document-Intelligence',
    provider: 'Microsoft',
    category: 'Content Processing',
    description: 'Content Processing',
    version: '1.0',
    performance: { accuracy: 86, latency: 800, cost: 0.3, safety: 94 },
    metrics: { usage: 200, rating: 4.4, lastUpdated: '2023-10-20' },
    tags: ['Azure', 'Document', 'Intelligence'],
    status: 'active',
    icon: FileText,
    color: 'bg-yellow-500'
  },
  {
    id: 'Azure-AI-Content-Safety',
    name: 'Azure-AI-Content-Safety',
    provider: 'Microsoft',
    category: 'Content Safety',
    description: 'Content Safety',
    version: '1.0',
    performance: { accuracy: 89, latency: 200, cost: 0.08, safety: 97 },
    metrics: { usage: 400, rating: 4.5, lastUpdated: '2023-10-18' },
    tags: ['Azure', 'Content', 'Safety'],
    status: 'active',
    icon: Shield,
    color: 'bg-yellow-500'
  }
];

// Leaderboard data for interactive functionality
export const leaderboardData = {
  quality: [
    { name: 'o3-pro', score: 91, rank: 1 },
    { name: 'gpt-5', score: 91, rank: 2 },
    { name: 'o1', score: 90, rank: 3 }
  ],
  safety: [
    { name: 'o3-pro', score: 99, rank: 1 },
    { name: 'Phi-4', score: 98, rank: 2 },
    { name: 'o1', score: 98, rank: 3 }
  ],
  cost: [
    { name: 'Ministral-3B', score: 0.1, rank: 1 },
    { name: 'Phi-4-mini-reasoning', score: 0.12, rank: 2 },
    { name: 'Phi-4-mini-instruct', score: 0.15, rank: 3 }
  ],
  throughput: [
    { name: 'grok-3-mini', score: 400, rank: 1 },
    { name: 'Llama-4-Maverick', score: 110, rank: 2 },
    { name: 'o3-mini', score: 1200, rank: 3 }
  ]
};
