# **App Name**: MAESTRO Threat Analyzer

## Core Features:

- Architecture Input: Provides a <Textarea> for detailed system architecture descriptions, enabling precise AI threat analysis.
- Use-Case Presets: A <Select> dropdown pre-populated with 10 multi-agent system use-case descriptions (including MCP Server tools and Google Agent to Agent communication examples using agent card JSON files); auto-populates the <Textarea> to streamline user input.
- AI-Powered Threat Identification: Server action to invoke a Genkit flow (`suggestThreatsForLayer`), using the user's architectural description as a tool for the AI to generate a comprehensive threat analysis for each of the 7 MAESTRO layers. The AI will consider Non-Determinism, Autonomy, No Trust Boundary, Dynamic Identity and Access Control, and Agent to Agent interations, delegations, communication complexity, and other factors to identify applicable threats.
- AI-Driven Mitigation Generation: For each threat identified, a Genkit flow (`recommendMitigations`) generates mitigation strategies including recommendation, reasoning, and caveats.
- Real-Time Streaming UI: Stream the threat analysis and mitigation process for real-time UI updates.
- Analysis Progress Display: Update the 'Generate' button to show the status, e.g. 'Analyzing Foundation Models...' and disable user input during processing.
- Detailed Progress Logging: The threat analysis progress card provides detailed, real-time logging (e.g., layer analysis started, AI called, threats identified, etc.).

## Style Guidelines:

- Primary color: Lively green (#57B46F) to symbolize growth and security.
- Background color: Light green (#F0FAF3) for a calming and supportive environment.
- Accent color: Muted reddish-brown (#B46357) to highlight key actions and insights without overwhelming.
- Headline font: 'Space Grotesk' (sans-serif) for a modern, technological feel.
- Body font: 'Inter' (sans-serif) ensures readability and a clean presentation.
- Lucide-react icons: `ShieldAlert` for threats, `ShieldCheck` for recommendations, `Lightbulb` for reasoning, and `AlertTriangle` for caveats. These will ensure the proper information hierarchy.
- 7 `LayerCard` components in a grid format, persistently displayed on the main page. Includes a collapsible left-hand sidebar for user input. Adjust padding to keep layer cards visible when the sidebar changes states.