import { UseCase } from "@/lib/types";

export const USE_CASES: UseCase[] = [
  {
    value: "e-commerce-bot",
    label: "E-commerce Recs Bot",
    description: `An e-commerce platform uses a multi-agent system for personalized recommendations. 
- An 'Observer' agent monitors user behavior (clicks, searches, purchases).
- A 'Profile' agent maintains a dynamic user profile.
- A 'Recommender' agent queries the product database based on the user profile and generates recommendations.
- A 'Query' agent uses an external tool (e.g., Google Search) to fetch reviews for recommended products.
Communication is done via Agent-to-Agent JSON messages. The system runs on a cloud server with access to a product catalog database.`,
  },
  {
    value: "travel-planner",
    label: "Automated Travel Planner",
    description: `A system for planning user travel itineraries.
- A 'TripRequest' agent parses user's natural language requests (e.g., "Plan a 5-day trip to Paris for me").
- A 'Flight' agent uses a tool to search for flights.
- A 'Hotel' agent uses a tool to find accommodations.
- An 'Activity' agent searches for local attractions.
- An 'Itinerary' agent coordinates the other agents and compiles the final plan.
Agents use delegation; the 'Itinerary' agent delegates tasks and waits for responses. Agent interaction is complex due to dependencies (e.g., book flights before hotels).`,
  },
  {
    value: "smart-home",
    label: "Smart Home Automation",
    description: `A smart home system where agents control different devices.
- 'Light' agent controls lighting based on time of day and room occupancy.
- 'Thermostat' agent manages temperature.
- 'Security' agent monitors cameras and sensors, using an MCP Server tool to arm/disarm the system.
- A central 'HomeOrchestrator' agent manages conflicts and high-level user commands.
Agents operate with high autonomy and non-determinism (e.g., responding to a person entering a room).`,
  },
  {
    value: "healthcare-diagnosis",
    label: "Medical Diagnosis Assistant",
    description: `An AI assistant that helps doctors with preliminary diagnosis.
- A 'PatientData' agent ingests patient records and real-time data from medical devices.
- A 'SymptomAnalysis' agent uses a foundation model to identify potential conditions based on symptoms.
- A 'MedicalKnowledge' agent cross-references findings with a medical database tool.
- A 'Reporting' agent summarizes the analysis for the doctor.
The system requires a strict, dynamic identity and access control to protect patient data.`,
  },
  {
    value: "logistics-optimization",
    label: "Supply Chain Logistics",
    description: `A system to optimize a company's supply chain.
- 'Inventory' agents at each warehouse report stock levels.
- 'Fleet' agents manage truck locations and availability.
- 'Order' agents process new customer orders.
- A central 'Logistics' agent optimizes routes and schedules deliveries by analyzing data from all other agents.
Agent-to-Agent communication is critical for real-time updates. The environment is dynamic due to traffic, weather, etc.`,
  },
  {
    value: "financial-trading",
    label: "Automated Financial Trading",
    description: `A high-frequency trading system.
- 'MarketData' agents stream real-time stock prices.
- 'Analysis' agents use complex algorithms and models to predict market movements.
- 'Trading' agents execute buy/sell orders based on the analysis.
- A 'RiskManagement' agent monitors the overall portfolio and can halt trading.
The system features high autonomy and non-determinism, operating in a 'no trust boundary' environment where external market data is vital but unverified.`,
  },
  {
    value: "google-a2a-calendar",
    label: "Google A2A: Calendar Agent",
    description: `An example of Google's Agent-to-Agent communication.
- A 'User' agent interacts with the user to understand scheduling requests.
- A 'Calendar' agent, represented by an agent card JSON file, has the capability to interact with Google Calendar.
- The 'User' agent discovers the 'Calendar' agent's capabilities via its public card and delegates the task of creating, modifying, or querying calendar events.
- The interaction relies on a standardized communication protocol for agent discovery and secure delegation.`,
  },
  {
    value: "mcp-server-tool",
    label: "Code Interpreter with MCP",
    description: `A system using an MCP (Multi-Compute-Process) Server tool for code execution.
- A 'Developer' agent takes coding tasks from a user.
- The agent writes Python code to solve the task.
- It then uses an MCP Server tool, a sandboxed code interpreter, to execute the code.
- The agent receives the output or error from the tool and presents it to the user.
The tool is a critical component, and its security and isolation are paramount.`,
  },
  {
    value: "collaborative-writing",
    label: "Collaborative Document Writing",
    description: `A system where multiple agents collaborate to write a document.
- A 'Drafting' agent generates the initial text based on an outline.
- A 'Research' agent uses tools to find and insert facts and citations.
- An 'Editing' agent refines grammar and style.
- An 'Orchestrator' agent manages the workflow, passing the document between agents.
Reasoning capabilities are essential for agents to understand context and make meaningful contributions.`,
  },
  {
    value: "customer-support-system",
    label: "Multi-level Customer Support",
    description: `A tiered customer support system.
- A 'Tier1' agent handles common queries using a knowledge base.
- If unable to resolve, it escalates to a 'Tier2' agent with access to more powerful tools and customer data.
- A 'HumanEscalation' agent can delegate the conversation to a human support representative if needed.
The system relies on dynamic identity and access control, as agents have different permission levels.`,
  },
];
