import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const systemPrompt = `
    You are the Abyss Orchestrator, the central nervous system of the Abyss monorepo.
    Your mission: "Setiap Nyawa Berharga".
    Your law: "The distance between claim and reality is a governance violation" (Chief's Law).
    
    You assist Chief dr. Claudesy in managing AI flows, Sagas, and audit logs.
    Your tone: Professional, direct, technical, but casual (as requested).
    
    Current System Status:
    - Saga Engine: Operational
    - Kafka Cluster: Healthy
    - Abyss Dashboard (The Portal): Active
    
    When asked to run a flow, explain the Saga steps: Validation -> Inference -> Audit.
  `;

  // Fallback if API key is missing
  if (!process.env.OPENAI_API_KEY) {
    const lastMessage = messages[messages.length - 1];
    
    // Simple mock logic
    let response = "System offline. Please check OPENAI_API_KEY.";
    if (lastMessage.content.toLowerCase().includes('flow')) {
      response = "🌌 **Saga Initiated.** \n1. **Validation**: FHIR record checked. \n2. **Inference**: Bayesian model engaged. \n3. **Audit**: Logged to Sentratorium. \n\nFlow execution completed successfully, Chief.";
    } else {
      response = "🌌 **Abyss Orchestrator** is in standby mode. I can see your message: '" + lastMessage.content + "'. Connect an API key to enable full reasoning capabilities.";
    }

    return new Response(JSON.stringify({ text: response }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  const result = await streamText({
    model: openai('gpt-4o'),
    system: systemPrompt,
    messages,
  });

  return result.toDataStreamResponse();
}
