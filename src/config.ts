import { GlobalConfig, LLMProviderType, LLMConfig } from './types';

// In-memory configuration store (Use environment variables in production!)
let globalConfig: GlobalConfig = {
    providers: {},
};

export function configure(config: Partial<GlobalConfig>) {
    globalConfig = {
        providers: { ...globalConfig.providers, ...config.providers },
        defaultProvider: config.defaultProvider ?? globalConfig.defaultProvider,
    };
    console.log("LLM Prompt Library Configured:", { defaultProvider: globalConfig.defaultProvider, configuredProviders: Object.keys(globalConfig.providers) });
}

export function getConfig(): Readonly<GlobalConfig> {
    return globalConfig;
}

export function getProviderConfig(providerType: LLMProviderType): LLMConfig | undefined {
    return globalConfig.providers[providerType];
}

export function getDefaultProvider(): LLMProviderType | undefined {
     return globalConfig.defaultProvider;
}
