export const MAESTRO_LAYERS = [
  {
    id: 'foundation-models',
    name: 'Foundation Models',
    description: 'Core AI models (e.g., large language models, custom-trained AI).',
  },
  {
    id: 'data-operations',
    name: 'Data Operations',
    description: 'Data handling for agents, including storage, processing, and vector embeddings.',
  },
  {
    id: 'agent-frameworks',
    name: 'Agent Frameworks',
    description: 'Software frameworks and APIs used to create, orchestrate, and manage agents.',
  },
  {
    id: 'deployment-infrastructure',
    name: 'Deployment & Infrastructure',
    description: 'Servers, networks, containers, and the underlying resources hosting agents and APIs.',
  },
  {
    id: 'evaluation-observability',
    name: 'Evaluation & Observability',
    description: 'Systems to monitor, evaluate, and debug agent behavior.',
  },
  {
    id: 'security-compliance',
    name: 'Security & Compliance',
    description: 'Security controls and compliance measures for the entire agent system.',
  },
  {
    id: 'agent-ecosystem',
    name: 'Agent Ecosystem',
    description: 'The broader environment where multiple agents interact, collaborate, and potentially compete.',
  },
] as const;
