import { DataAPIClient } from "@datastax/astra-db-ts";
import OpenAI from "openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import fs from "fs";
import path from "path";
import "dotenv/config";

type SimilarityMetric = "dot_product" | "cosine" | "euclidean";

const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
  OPENAI_API_KEY,
} = process.env;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 100,
});

const createCollection = async (
  similarityMetric: SimilarityMetric = "dot_product"
) => {
  const res = await db.createCollection(ASTRA_DB_COLLECTION, {
    vector: {
      dimension: 1536,
      metric: similarityMetric,
    },
  });
  console.log("Collection created:", res);
};

const processMedicalHistory = async () => {
  // Load medical data from data.json
  const filePath = path.join(__dirname, "..", "data", "data.json");
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const medicalHistory = JSON.parse(fileContent);

  const collection = await db.collection(ASTRA_DB_COLLECTION);

  // Flatten the JSON data into text chunks for embedding
  const dataToProcess = [];
  const processObject = (obj, prefix = "") => {
    for (const key in obj) {
      if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
        processObject(obj[key], `${prefix}${key}.`);
      } else {
        dataToProcess.push(`${prefix}${key}: ${JSON.stringify(obj[key])}`);
      }
    }
  };

  processObject(medicalHistory);

  for (const item of dataToProcess) {
    const chunks = await splitter.splitText(item);

    for (const chunk of chunks) {
      const embedding = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: chunk,
      });

      const vector = embedding.data[0].embedding;

      const res = await collection.insertOne({
        $vector: vector,
        text: chunk,
      });
      console.log("Inserted chunk:", res);
    }
  }
};

const initializeDatabase = async () => {
  try {
    await createCollection();
    await processMedicalHistory();
    console.log("Database initialized with medical history.");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};

initializeDatabase();
