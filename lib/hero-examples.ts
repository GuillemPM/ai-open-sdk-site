export type HeroCapabilityId = 'generate-text' | 'generate-image';

export type HeroSourceMode = 'providers' | 'custom' | 'test';

export type HeroProviderId =
  | 'anthropic'
  | 'openai'
  | 'gemini'
  | 'xai'
  | 'deepseek'
  | 'moonshot'
  | 'minimax'
  | 'zai'
  | 'opencode-zen'
  | 'mock'
  | 'custom';

export type HeroCapability = {
  id: HeroCapabilityId;
  label: string;
};

export type HeroSourceOption = {
  id: HeroSourceMode;
  label: string;
};

export type HeroProvider = {
  id: HeroProviderId;
  label: string;
  mode: HeroSourceMode;
  capabilities: HeroCapabilityId[];
};

export type HeroSnippetMeta = {
  capabilityId: HeroCapabilityId;
  providerId: HeroProviderId;
  filename: string;
};

export type HeroSnippet = HeroSnippetMeta & {
  code: string;
};

export const HERO_CAPABILITIES: HeroCapability[] = [
  { id: 'generate-text', label: 'Generate Text' },
  { id: 'generate-image', label: 'Generate Image' },
];

export const HERO_SOURCE_OPTIONS: HeroSourceOption[] = [
  { id: 'providers', label: 'Providers' },
  { id: 'custom', label: 'Custom' },
  { id: 'test', label: 'Test' },
];

export const HERO_PROVIDERS: HeroProvider[] = [
  {
    id: 'anthropic',
    label: 'Anthropic',
    mode: 'providers',
    capabilities: ['generate-text'],
  },
  {
    id: 'openai',
    label: 'OpenAI',
    mode: 'providers',
    capabilities: ['generate-text', 'generate-image'],
  },
  {
    id: 'gemini',
    label: 'Gemini',
    mode: 'providers',
    capabilities: ['generate-text'],
  },
  {
    id: 'xai',
    label: 'xAI',
    mode: 'providers',
    capabilities: ['generate-text'],
  },
  {
    id: 'deepseek',
    label: 'DeepSeek',
    mode: 'providers',
    capabilities: ['generate-text'],
  },
  {
    id: 'moonshot',
    label: 'Moonshot',
    mode: 'providers',
    capabilities: ['generate-text'],
  },
  {
    id: 'minimax',
    label: 'MiniMax',
    mode: 'providers',
    capabilities: ['generate-text'],
  },
  {
    id: 'zai',
    label: 'ZAI',
    mode: 'providers',
    capabilities: ['generate-text'],
  },
  {
    id: 'opencode-zen',
    label: 'OpenCode Zen',
    mode: 'providers',
    capabilities: ['generate-text'],
  },
  {
    id: 'custom',
    label: 'Custom',
    mode: 'custom',
    capabilities: ['generate-text', 'generate-image'],
  },
  {
    id: 'mock',
    label: 'Mock',
    mode: 'test',
    capabilities: ['generate-text', 'generate-image'],
  },
];

export const HERO_SNIPPET_META: HeroSnippetMeta[] = [
  {
    capabilityId: 'generate-text',
    providerId: 'anthropic',
    filename: 'GenerateText.al',
  },
  {
    capabilityId: 'generate-text',
    providerId: 'openai',
    filename: 'GenerateText.al',
  },
  {
    capabilityId: 'generate-text',
    providerId: 'gemini',
    filename: 'GenerateText.al',
  },
  {
    capabilityId: 'generate-text',
    providerId: 'xai',
    filename: 'GenerateText.al',
  },
  {
    capabilityId: 'generate-text',
    providerId: 'deepseek',
    filename: 'GenerateText.al',
  },
  {
    capabilityId: 'generate-text',
    providerId: 'moonshot',
    filename: 'GenerateText.al',
  },
  {
    capabilityId: 'generate-text',
    providerId: 'minimax',
    filename: 'GenerateText.al',
  },
  {
    capabilityId: 'generate-text',
    providerId: 'zai',
    filename: 'GenerateText.al',
  },
  {
    capabilityId: 'generate-text',
    providerId: 'opencode-zen',
    filename: 'GenerateText.al',
  },
  {
    capabilityId: 'generate-text',
    providerId: 'mock',
    filename: 'GenerateText.Test.al',
  },
  {
    capabilityId: 'generate-text',
    providerId: 'custom',
    filename: 'MyProvider.al',
  },
  {
    capabilityId: 'generate-image',
    providerId: 'openai',
    filename: 'GenerateImage.al',
  },
  {
    capabilityId: 'generate-image',
    providerId: 'mock',
    filename: 'GenerateImage.Test.al',
  },
  {
    capabilityId: 'generate-image',
    providerId: 'custom',
    filename: 'MyImageProvider.al',
  },
];

export function providersForMode(
  mode: HeroSourceMode,
  capabilityId: HeroCapabilityId,
) {
  return HERO_PROVIDERS.filter(
    (provider) =>
      provider.mode === mode && provider.capabilities.includes(capabilityId),
  );
}
