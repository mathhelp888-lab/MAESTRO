import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import openAI from '@genkit-ai/compat-oai/openai';
import {ollama} from 'genkitx-ollama';

const provider = process.env.LLM_PROVIDER ?? 'google';

let plugins;
let model;

switch (provider) {
  case 'openai':
    plugins = [openAI({apiKey: process.env.OPENAI_API_KEY})];
    model = process.env.LLM_MODEL || 'openai/gpt-4o-mini';
    break;
  case 'ollama':
    plugins = [ollama()];
    model = process.env.LLM_MODEL || 'ollama/llama3.1';
    break;
  default:
    plugins = [googleAI()];
    model = process.env.LLM_MODEL || 'googleai/gemini-2.5-flash';
}

export const ai = genkit({
  plugins,
  model,
});

