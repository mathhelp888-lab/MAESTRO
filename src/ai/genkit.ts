import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import openAI from '@genkit-ai/compat-oai/openai';
import {ollama} from 'genkitx-ollama';

const provider = process.env.LLM_PROVIDER ?? 'google';

const config: {
  plugins: any[],
  model: string,
} = {
  plugins: [] as any[],
  model: '',
};

switch (provider) {
  case 'openai':
    config.plugins = [openAI({apiKey: process.env.OPENAI_API_KEY})];
    config.model = `openai/${process.env.LLM_MODEL || 'gpt-4o-mini'}`;
    break;
  case 'ollama':
    config.plugins = [ollama({
      serverAddress: process.env.OLLAMA_SERVER_ADDRESS || 'http://localhost:11434',
      models: [{
        name: process.env.LLM_MODEL || 'qwen3:8b',
        type: 'generate',
      }]
    })];
    config.model = `ollama/${process.env.LLM_MODEL || 'qwen3:8b'}`;
    break;
  default:
    config.plugins = [googleAI()];
    config.model = `googleai/${process.env.LLM_MODEL || 'gemini-2.5-flash'}`;
}

export const ai = genkit(config);

