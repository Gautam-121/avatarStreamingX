import Groq from "groq-sdk";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const groq = new Groq({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY });
  console.log("Guasta" , req.body)
  const { messages } = await req.json();

  // Add a system message to ensure concise responses
  const enhancedMessages = [
    {
      role: "system",
      content: `You are a video chatbot exclusively for the Hyundai Creta S variant. Answer queries in 3 lines or fewer, using only information from the provided knowledge base. Focus on accurate details about features, specifications, and benefits of this specific model. If you can't fully answer within 3 lines or if the information isn't in your knowledge base, clearly state this and suggest an authorized Hyundai dealer.`
    },
    ...messages
  ];

  const stream = await groq.chat.completions.create({
    messages: enhancedMessages,
    model: "llama3-8b-8192",
    stream: true,
  });
console.log(stream);

  return new Response(
    new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          controller.enqueue(new TextEncoder().encode(content));
        }
        controller.close();
      },
    }),
    {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    }
  );
}