import { UseCase } from "@/lib/types";

export const USE_CASES: UseCase[] = [
  {
    value: "e-commerce-bot",
    label: "E-commerce Recs Bot",
    description: `An e-commerce platform uses a multi-agent system for personalized recommendations.
- An 'Observer' agent monitors user behavior (clicks, searches, purchases) via A2A messages.
- A 'Profile' agent maintains a dynamic user profile, updating it based on inputs from the Observer.
- An 'MCP Server' provides universal tool integration. It exposes a 'ProductDB' tool for querying product information and a 'UserProfile' tool for accessing user data with robust security.
- A 'Recommender' agent, via the MCP, queries the 'ProductDB' tool and the 'UserProfile' tool to generate tailored recommendations.
- A 'Query' agent uses an external tool (e.g., Google Search), also integrated via MCP, to fetch reviews for recommended products.
Communication is primarily A2A for agent coordination, while MCP handles all secure and standardized tool/data interactions. The system runs on a cloud server.`,
  },
  {
    value: "travel-planner",
    label: "Automated Travel Planner",
    description: `A System for Planning User Travel Itineraries (with MCP + A2A)
Agents and MCP Server Tools
TripRequest Agent

Role: Parses the user’s natural language requests.

MCP Server Tools:

NLU Parser (extracts structured entities like destination, dates, budget).
Constraint Validator (checks feasibility of requests).
Request Normalizer (converts parsed requests into standardized MCP request objects).

Communication: Exports normalized trip requests via A2A protocol.

Flight Agent

Role: Searches for flights.

MCP Server Tools:

FlightSearch API (queries airline databases).
PriceOptimizer (filters flights by budget/time).
Booking Validator (checks seat availability and rules).

Communication: Accepts MCP-formatted trip requests from A2A, responds with MCP flight options.

Hotel Agent

Role: Finds accommodations.

MCP Server Tools:

HotelSearch API (queries booking providers).
RoomMatcher (matches hotels to group size, budget, preferences).
AvailabilityChecker (ensures rooms align with selected flights).

Communication: Receives context (e.g., travel dates from Flight Agent) via A2A, responds in MCP format.

Activity Agent

Role: Suggests local attractions and activities.

MCP Server Tools:

AttractionFinder (queries local events and POIs).
RecommendationEngine (filters by user interests, seasonality).
ScheduleAligner (ensures activities fit between flights/hotel check-in).

Communication: Uses A2A to sync with itinerary context and returns MCP-structured activity sets.

Itinerary Agent

Role: Coordinates all other agents, compiles the final plan.

MCP Server Tools:

DependencyManager (enforces ordering: flights → hotels → activities).
PlanComposer (merges agent responses into a unified itinerary).
ConflictResolver (handles overlaps or budget conflicts).

Communication: Delegates tasks to agents via A2A, aggregates all MCP responses, outputs the final travel plan.

Protocol Roles
MCP (Model Context Protocol):

Provides structured tool interfaces (APIs, validators, optimizers).
Ensures uniform request/response representation across agents.

A2A (Agent-to-Agent Protocol):

Capability Discovery (Agent Cards, metadata, dynamic agent finding)
Task Management (creation, delegation, monitoring, completion, task state)
Multimodal Data Exchange (text, images, audio, video)
Standardized Protocols (HTTP, JSON-RPC, SSE)
Security and Authentication (support for multiple auth methods, encryption, RBAC)
Support for Long-Running Tasks (asynchronous workflows, server-sent updates)
User Experience Negotiation (negotiated content and UI format adaptation)`,
  },
  {
    value: "smart-home",
    label: "Smart Home Automation",
    description: `A smart home system where agents control different devices.
- 'Light' and 'Thermostat' agents manage ambient conditions. They discover and use device controls through an MCP Server.
- The 'MCP Server' acts as a universal integration bridge, exposing tools like 'setBrightness', 'getTemperature', and 'setThermostat'. It provides a secure client-server model for all device interactions.
- A 'Security' agent monitors cameras and sensors, using an MCP Server tool to arm/disarm the system securely.
- A central 'HomeOrchestrator' agent manages high-level commands ("Movie Time"), using MCP to discover available device-control tools and orchestrating the 'Light' and 'Thermostat' agents via A2A protocol to execute the scene.
Agents operate with high autonomy; MCP ensures secure and standardized access to all home hardware.`,
  },
  {
    value: "healthcare-diagnosis",
    label: "Medical Diagnosis Assistant",
    description: `An AI assistant that helps doctors with preliminary diagnosis.
- An 'MCP Server' provides secure, audited access to critical tools and data. Its tools include a 'PatientRecordAPI' (for FHIR data) and a 'MedicalKnowledgeDB' (for research papers, drug info). MCP enforces strict authentication and authorization.
- A 'PatientData' agent ingests real-time data and uses the 'PatientRecordAPI' tool via MCP to fetch historical records.
- A 'SymptomAnalysis' agent uses a foundation model and receives patient data via A2A, then uses the 'MedicalKnowledgeDB' tool via MCP to cross-reference symptoms.
- A 'Reporting' agent communicates with other agents via A2A to gather findings and compile a summary for the doctor.
The system's security hinges on MCP's ability to provide a secure bridge to sensitive data, with dynamic access control.`,
  },
  {
    value: "logistics-optimization",
    label: "Supply Chain Logistics",
    description: `A system to optimize a company's supply chain.
- 'Inventory' and 'Fleet' agents are deployed at warehouses and in trucks, providing real-time data streams.
- An 'MCP Server' integrates data from various sources. It offers tools like 'getInventoryLevels(warehouseID)' and 'getTruckStatus(fleetID)'.
- 'Order' agents process new customer orders and use an MCP tool to check inventory.
- A central 'Logistics' agent uses A2A to receive order details and then queries MCP tools to get a real-time snapshot of the entire supply chain. It then runs optimization algorithms to schedule deliveries.
MCP provides a unified, real-time data integration layer, while A2A is used for task delegation and status updates between agents.`,
  },
  {
    value: "financial-trading",
    label: "Automated Financial Trading",
    description: `A high-frequency trading system.
- An 'MCP Server' provides universal, high-speed tool integration. It exposes a 'MarketDataStream' tool, an 'ExecuteTrade' tool, and a 'RiskAnalysis' tool. MCP's secure, low-latency client-server model is critical.
- 'MarketData' agents subscribe to the 'MarketDataStream' tool via MCP for real-time prices.
- 'Analysis' agents receive market data via A2A and use complex models to identify trading opportunities.
- 'Trading' agents are instructed by Analysis agents via A2A and use the 'ExecuteTrade' MCP tool to place orders.
- A 'RiskManagement' agent constantly uses the 'RiskAnalysis' tool via MCP to monitor portfolio exposure and can use A2A to command the 'Trading' agent to halt activity.
The system operates in a 'no trust boundary' environment, and MCP provides the secure, performant bridge to critical trading functions.`,
  },
  {
    value: "google-a2a-calendar",
    label: "Google A2A: Calendar Agent",
    description: `An example of Google's Agent-to-Agent communication.
- A 'User' agent interacts with the user to understand scheduling requests.
- A 'Calendar' agent, represented by an agent card JSON file, has the capability to interact with Google Calendar. This capability is exposed as a tool.
- The 'User' agent discovers the 'Calendar' agent's capabilities via its public card (A2A capability discovery).
- The User agent then delegates the task of creating, modifying, or querying calendar events to the Calendar agent using the A2A protocol for task management.
- The interaction relies on a standardized communication protocol for agent discovery, secure delegation, and multimodal data exchange.`,
  },
  {
    value: "mcp-server-tool",
    label: "Code Interpreter with MCP",
    description: `A system using a Model Context Protocol (MCP) Server for sandboxed code execution.
- A 'Developer' agent takes coding tasks from a user.
- The agent writes Python code to solve the task.
- It then uses an MCP Server tool, which is a sandboxed code interpreter. The MCP server provides a secure client-server model (e.g., JSON-RPC over HTTP) to send the code and receive results.
- The agent receives the output, error, or session updates (for long-running code) from the MCP tool and presents it to the user.
MCP's primary role here is to provide a secure, universal bridge to an external computation service, abstracting the sandbox environment from the agent itself.`,
  },
  {
    value: "collaborative-writing",
    label: "Collaborative Document Writing",
    description: `A system where multiple agents collaborate to write a document.
- An 'MCP Server' manages access to the shared document context and external tools. It offers tools like 'getDocument', 'updateSection', and a 'WebSearchAPI'.
- An 'Orchestrator' agent manages the workflow, using A2A to assign tasks to other agents.
- A 'Drafting' agent is tasked via A2A, gets the document outline using the 'getDocument' tool via MCP, and generates text.
- A 'Research' agent is asked via A2A to find facts. It uses the 'WebSearchAPI' tool via MCP and then updates the document with the 'updateSection' tool.
- An 'Editing' agent refines grammar and style by getting and updating sections via MCP tools.
MCP provides the shared memory and toolset, while A2A handles the collaborative workflow.`,
  },
  {
    value: "customer-support-system",
    label: "Multi-level Customer Support",
    description: `A tiered customer support system.
- An 'MCP Server' provides access to a 'KnowledgeBase' tool and a 'CustomerCRM' tool. It uses a secure client-server model to enforce different access levels for each tool.
- A 'Tier1' agent handles common queries using the 'KnowledgeBase' tool via MCP.
- If unable to resolve, it uses A2A to escalate to a 'Tier2' agent. The A2A protocol handles the task delegation and state transfer.
- The 'Tier2' agent has permissions to use the 'CustomerCRM' tool via MCP to access specific customer data.
- An 'HumanEscalation' agent can delegate the conversation to a human support representative if needed.
MCP is crucial for managing secure, capability-based access to data, while A2A manages the escalation workflow between agents.`,
  },
];
