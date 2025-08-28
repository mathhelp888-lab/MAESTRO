// recommend-mitigations.ts
'use server';
/**
 * @fileOverview AI-driven mitigation strategies for identified threats.
 *
 * - recommendMitigations - A function that generates mitigation strategies.
 * - RecommendMitigationsInput - The input type for the recommendMitigations function.
 * - RecommendMitigationsOutput - The return type for the recommendMitigations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendMitigationsInputSchema = z.object({
  threatDescription: z.string().describe('Description of the identified threat.'),
  layer: z.string().describe('The MAESTRO layer the threat belongs to.'),
});
export type RecommendMitigationsInput = z.infer<typeof RecommendMitigationsInputSchema>;

const RecommendMitigationsOutputSchema = z.object({
  recommendation: z.string().describe('Recommended mitigation strategy.'),
  reasoning: z.string().describe('Reasoning behind the recommendation.'),
  caveats: z.string().describe('Caveats or limitations of the mitigation strategy.'),
});
export type RecommendMitigationsOutput = z.infer<typeof RecommendMitigationsOutputSchema>;

export async function recommendMitigations(input: RecommendMitigationsInput): Promise<RecommendMitigationsOutput> {
  return recommendMitigationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendMitigationsPrompt',
  input: {schema: RecommendMitigationsInputSchema},
  output: {schema: RecommendMitigationsOutputSchema},
  prompt: `You are a cybersecurity expert providing mitigation strategies for identified threats in a MAESTRO architecture.

  For the threat described below, provide a recommendation for mitigation, the reasoning behind that recommendation, and any caveats or limitations of the strategy.

  Threat Description: {{{threatDescription}}}
  MAESTRO Layer: {{{layer}}}

  Ensure the response includes the recommendation, reasoning, and caveats, clearly and concisely.
`,
});

const recommendMitigationsFlow = ai.defineFlow(
  {
    name: 'recommendMitigationsFlow',
    inputSchema: RecommendMitigationsInputSchema,
    outputSchema: RecommendMitigationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
