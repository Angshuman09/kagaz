import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    
    console.log("Received prompt, starting stream...");

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContentStream(prompt);

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        try {
          console.log("Stream started");
          
          for await (const chunk of result.stream) {
            const text = chunk.text();
            console.log("Chunk:", text); // Debug log
            
            // Send as Server-Sent Events format
            const data = JSON.stringify({ text });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
          
          console.log("Stream completed");
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate response" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
