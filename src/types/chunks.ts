export interface Chunk {
  id: string;
  documentId: string;
  documentTitle: string;
  /** Source type — used to filter retrieval by context */
  source: "research" | "lab-report" | "fitness" | "profile";
  text: string;
  embedding: number[];
  createdAt: string;
}

export interface ChunkStore {
  chunks: Chunk[];
}
