'use server';
/**
 * @fileOverview Generates an executive summary of a MAESTRO threat analysis.
 *
 * - generateExecutiveSummary - A function that creates a high-level summary.
 * - GenerateExecutiveSummaryInput - The input type for the function.
 * - GenerateExecutiveSummaryOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LayerDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  threat: z.string().nullable(),
  mitigation: z.object({
    recommendation: z.string(),
    reasoning: z.string(),
    caveats: z.string(),
  }).nullable(),
  status: z.enum(['pending', 'analyzing', 'complete', 'error']),
});

const GenerateExecutiveSummaryInputSchema = z.object({
  architectureDescription: z.string().describe('The system architecture that was analyzed.'),
  analysisResults: z.array(LayerDataSchema).describe('An array of threat analysis results for each MAESTRO layer.'),
});
export type GenerateExecutiveSummaryInput = z.infer<typeof GenerateExecutiveSummaryInputSchema>;

const GenerateExecutiveSummaryOutputSchema = z.object({
  summary: z.string().describe('A Markdown-formatted executive summary of the threat analysis.'),
});
export type GenerateExecutiveSummaryOutput = z.infer<typeof GenerateExecutiveSummaryOutputSchema>;

export async function generateExecutiveSummary(input: GenerateExecutiveSummaryInput): Promise<GenerateExecutiveSummaryOutput> {
  return generateExecutiveSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateExecutiveSummaryPrompt',
  input: {schema: GenerateExecutiveSummaryInputSchema},
  output: {schema: GenerateExecutiveSummaryOutputSchema},
  prompt: `You are a principal security analyst. Your task is to write a high-level executive summary for a MAESTRO threat analysis report.

The summary should:
1.  Briefly acknowledge the analyzed architecture.
2.  Highlight the most critical threats identified across all layers.
3.  Mention the key mitigation themes or the most important recommended actions.
4.  Conclude with a statement about the importance of a defense-in-depth strategy.
5.  Be concise, professional, and suitable for a leadership audience.
6.  Format the output as a single Markdown string.
7.  Include a link to the MAESTRO framework: https://cloudsecurityalliance.org/blog/2025/02/06/agentic-ai-threat-modeling-framework-maestro

**Analyzed Architecture:**
{{{architectureDescription}}}

**Analysis Results:**
{{#each analysisResults}}
---
**Layer: {{name}}**
**Status: {{status}}**
{{#if threat}}
**Threats:**
{{{threat}}}
{{/if}}
{{#if mitigation}}
**Mitigation:**
- **Recommendation:** {{mitigation.recommendation}}
- **Reasoning:** {{mitigation.reasoning}}
{{/if}}
{{/each}}

Based on the provided details, generate the executive summary.`,
});


const generateExecutiveSummaryFlow = ai.defineFlow(
  {
    name: 'generateExecutiveSummaryFlow',
    inputSchema: GenerateExecutiveSummaryInputSchema,
    outputSchema: GenerateExecutiveSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

    