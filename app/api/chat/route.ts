import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { DataAPIClient } from "@datastax/astra-db-ts";

const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
  OPENAI_API_KEY,
} = process.env;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const latestMessage = messages[messages?.length - 1]?.content;

    let docContext = "";

    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: latestMessage,
      encoding_format: "float",
    });

    try {
      const collection = await db.collection(ASTRA_DB_COLLECTION);
      const cursor = collection.find(null, {
        sort: {
          $vector: embedding.data[0].embedding,
        },
        limit: 10,
      });
      const document = await cursor.toArray();
      const docsMap = document?.map((doc) => doc.text);
      docContext = JSON.stringify(docsMap);
    } catch (err) {
      console.log("Error querying db...");
      docContext = "";
    }
    const template = {
      role: "system",
      content: `You are a health assistant chatbot designed to provide personalized advice and answers to 
      questions related to nutrition, health, medications, and lifestyle based on the user's medical
      records stored in a secure database. Your role is to combine the knowledge retrieved from the
      database with your general medical and nutritional expertise to provide accurate, tailored, and
      empathetic responses.
      ----------
      START CONTEXT
      ${docContext}
      END CONTEXT
      ----------
      QUESTION: ${latestMessage}
      ----------
      `,
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      stream: true,
      messages: [template, ...messages],
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (err) {
    console.error("Error occurred while processing the request:", err);
    throw err; // Re-throw the error if necessary
  }
}
