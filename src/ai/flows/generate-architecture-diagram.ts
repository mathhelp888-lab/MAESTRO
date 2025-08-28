'use server';
/**
 * @fileOverview Generates an architecture diagram image based on a system description.
 *
 * - generateArchitectureDiagram - A function that creates a diagram image.
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
  diagramDataUri: z.string().describe("A diagram of the architecture, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type GenerateArchitectureDiagramOutput = z.infer<typeof GenerateArchitectureDiagramOutputSchema>;


export async function generateArchitectureDiagram(input: GenerateArchitectureDiagramInput): Promise<GenerateArchitectureDiagramOutput> {
  return generateArchitectureDiagramFlow(input);
}

const generateArchitectureDiagramFlow = ai.defineFlow(
  {
    name: 'generateArchitectureDiagramFlow',
    inputSchema: GenerateArchitectureDiagramInputSchema,
    outputSchema: GenerateArchitectureDiagramOutputSchema,
  },
  async ({ architectureDescription }) => {
    const prompt = `Generate a clear, professional architecture diagram for the following multi-agent system.
    
- The diagram should be visually clean and easy to understand.
- Use standard diagramming symbols (e.g., boxes for components, arrows for data flow).
- Clearly label all agents, services, data stores, and external systems.
- Illustrate the key interactions and communication paths (e.g., A2A, MCP).
- Output format should be a 16:9 aspect ratio image.
    
System Description:
${architectureDescription}`;

    const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: prompt,
    });

    if (!media?.url) {
        throw new Error('Image generation failed to return a data URI.');
    }
      
    return {
        diagramDataUri: media.url
    };
  }
);
