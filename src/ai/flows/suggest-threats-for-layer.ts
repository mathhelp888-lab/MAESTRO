'use server';
/**
 * @fileOverview Generates a comprehensive threat analysis for a specific MAESTRO layer
 * based on a provided system architecture description.
 *
 * - suggestThreatsForLayer - A function that initiates the threat analysis process.
 * - SuggestThreatsForLayerInput - The input type for the suggestThreatsForLayer function.
 * - SuggestThreatsForLayerOutput - The return type for the suggestThreatsForLayer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestThreatsForLayerInputSchema = z.object({
  architectureDescription: z
    .string()
    .describe('A detailed description of the system architecture.'),
  layerName: z.string().describe('The name of the MAESTRO layer to analyze.'),
});
export type SuggestThreatsForLayerInput = z.infer<
  typeof SuggestThreatsForLayerInputSchema
>;

const SuggestThreatsForLayerOutputSchema = z.object({
  threatAnalysis: z
    .string()
    .describe('A comprehensive threat analysis for the specified layer.'),
});
export type SuggestThreatsForLayerOutput = z.infer<
  typeof SuggestThreatsForLayerOutputSchema
>;

export async function suggestThreatsForLayer(
  input: SuggestThreatsForLayerInput
): Promise<SuggestThreatsForLayerOutput> {
  return suggestThreatsForLayerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestThreatsForLayerPrompt',
  input: {schema: SuggestThreatsForLayerInputSchema},
  output: {schema: SuggestThreatsForLayerOutputSchema},
  prompt: `You are a security analyst specializing in identifying potential security vulnerabilities in multi-agent systems, with a focus on the MAESTRO architecture.

You will use the provided system architecture description to generate a comprehensive threat analysis for the {{layerName}} layer. Consider factors such as Non-Determinism, Autonomy, No Trust Boundary, Dynamic Identity and Access Control, and Agent to Agent interactions, delegations, and communication complexity.

System Architecture Description: {{{architectureDescription}}}

Threat Analysis:`,
});

const suggestThreatsForLayerFlow = ai.defineFlow(
  {
    name: 'suggestThreatsForLayerFlow',
    inputSchema: SuggestThreatsForLayerInputSchema,
    outputSchema: SuggestThreatsForLayerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
