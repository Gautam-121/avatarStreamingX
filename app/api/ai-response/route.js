// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req) {
  try {

    const { messages } = await req.json();

    // // Extract the user input (eassumes the last message is user input)
    // const userMessage = messags[messages.length - 1]?.content;

    if (!messages) {
      return new Response("No user message provided", { status: 400 });
    }

    // Construct the payload for the external API
    const payload = {
        question: messages  // Assuming the API expects a "text" field with the user's message
    };

    // Send the request to the external API (replace with your actual endpoint)
    const externalApiResponse = await fetch("https://document-qa.apprikart.com/api/rag.qa_chain/run", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
    });

    if (!externalApiResponse.ok) {
      return new Response("Failed to fetch from external API", { status: 500 });
    }

    const data = await externalApiResponse.json();

    // Check for the presence of the response text
    const outputText = data?.result || ''; // Assuming 'text' is the field in the response that contains the output

    return new Response(
      new ReadableStream({
        async start(controller) {
          // Stream the output text chunk by chunk
          const encoder = new TextEncoder();
          const chunkSize = 100; // Adjust chunk size as needed

          for (let i = 0; i < outputText.length; i += chunkSize) {
            const chunk = outputText.slice(i, i + chunkSize);
            controller.enqueue(encoder.encode(chunk));
          }

          controller.close(); // Close the stream when done
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
  } catch (error) {
    console.error("Error handling request:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
