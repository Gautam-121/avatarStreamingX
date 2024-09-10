import Groq from "groq-sdk";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const groq = new Groq({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY });
  console.log("Guasta" , req.body)
  const { messages } = await req.json();

  const stream = await groq.chat.completions.create({
    messages: messages,
    model: "llama3-8b-8192",
    stream: true,
  });
console.log(messages);

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