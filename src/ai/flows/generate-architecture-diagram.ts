'use server';
/**
 * @fileOverview Generates a Mermaid syntax diagram for a system architecture.
 *
 * - generateArchitectureDiagram - A function that creates a Mermaid diagram script.
 * - GenerateArchitectureDiagramInput - The input type for the function.
 * - GenerateArchitectureDiagramOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateArchitectureDiagramInputSchema = z.object({
  architectureDescription: z.string().describe('The system architecture to be visualized.'),
});
export type GenerateArchitectureDiagramInput = z.infer<typeof GenerateArchitectureDiagramInputSchema>;

const GenerateArchitectureDiagramOutputSchema = z.object({
  mermaidCode: z.string().describe("A Mermaid.js syntax script representing the architecture diagram. Must be enclosed in a ```mermaid ... ``` code block."),
});
export type GenerateArchitectureDiagramOutput = z.infer<typeof GenerateArchitectureDiagramOutputSchema>;


export async function generateArchitectureDiagram(input: GenerateArchitectureDiagramInput): Promise<GenerateArchitectureDiagramOutput> {
  return generateArchitectureDiagramFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateArchitectureDiagramPrompt',
    input: { schema: GenerateArchitectureDiagramInputSchema },
    output: { schema: GenerateArchitectureDiagramOutputSchema },
    prompt: `You are an expert in system architecture and the Mermaid diagramming syntax. Your task is to convert a system description into a simplified Mermaid script.

    **System Description:**
    {{{architectureDescription}}}
    
    **Instructions:**
    1.  Generate a \`graph TD\` (Top-Down) diagram.
    2.  Keep the syntax simple. Use node IDs and text labels (e.g., \`A[Agent]\`).
    3.  Use simple arrow connectors like \`-->\` for interactions.
    4.  **Crucially, DO NOT use parentheses, brackets, or any other special characters in node text labels.** For example, use 'Agent A' NOT 'Agent A (Observer)'. This is to avoid rendering errors.
    5.  Represent the key components (agents, services, databases) and their relationships.
    6.  The final output must be ONLY the Mermaid code, enclosed in a Markdown code block like this:
    \`\`\`mermaid
    graph TD;
        Node1[Label One] --> Node2[Label Two];
    \`\`\`
    `,
});

const generateArchitectureDiagramFlow = ai.defineFlow(
  {
    name: 'generateArchitectureDiagramFlow',
    inputSchema: GenerateArchitectureDiagramInputSchema,
    outputSchema: GenerateArchitectureDiagramOutputSchema,
  },
  async (input) => {
    try {
        const { output } = await prompt(input);
        
        if (!output?.mermaidCode) {
            throw new Error("AI did not return any Mermaid code.");
        }

        const mermaidCode = output.mermaidCode.replace(/```mermaid\n|```/g, '').trim();

        return {
            mermaidCode: mermaidCode
        };

    } catch(e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        console.error("Error in generateArchitectureDiagramFlow:", errorMessage);
        throw new Error(`Failed to generate diagram script. Reason: ${errorMessage}`);
    }
  }
);
