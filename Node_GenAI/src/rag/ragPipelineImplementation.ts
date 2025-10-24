import 'dotenv/config';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings, OpenAI } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';
import { Pinecone } from '@pinecone-database/pinecone';

// The new "create" helpers (JS docs show createStuffDocumentsChain / createRetrievalChain patterns).
// We'll implement a simple "stuff" style chain manually using a prompt template + LLM call.
// This avoids use of RetrievalQAChain which is deprecated.

import {PromptTemplate} from '@langchain/core/prompts';
import {RunnableSequence} from '@langchain/core/runnables';
import { Document } from 'langchain/document';

async function run() {
  // 1) Load and split documents
  const loader = new TextLoader('./data.txt');
  const docs = await loader.load(); // returns Document[]
  const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 800, chunkOverlap: 100 });
  const splitDocs = await splitter.splitDocuments(docs);

  // 2) Init Pinecone client and ensure index exists
  const pineconeClient = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
    environment: process.env.PINECONE_ENVIRONMENT,
  });

  const indexName = process.env.PINECONE_INDEX_NAME;
  const existing = await pineconeClient.listIndexes();
  if (!existing.includes(indexName)) {
    console.log('Creating index:', indexName);
    await pineconeClient.createIndex({
      name: indexName,
      dimension: 1536, // OpenAI embedding dimension
      metric: 'cosine',
    });
    // small pause while index initializes (optional in many cases)
    await new Promise((r) => setTimeout(r, 30000));
  }
  const index = pineconeClient.index(indexName);

  // 3) Embeddings + upsert into Pinecone (via PineconeStore helper)
  const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY });

  // Upsert docs into Pinecone (PineconeStore.fromDocuments handles embedding + upsert)
  console.log('Uploading embeddings to Pinecone...');
  await PineconeStore.fromDocuments(splitDocs, embeddings, { pineconeIndex: index });

  // 4) Build a retriever around the Pinecone store
  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, { pineconeIndex: index });
  const retriever = vectorStore.asRetriever(5); // return top 5 docs

  // 5) Build the "stuff" prompt template (packs retrieved docs into the prompt)
  const promptTemplate = `You are an expert assistant. Use the following context to answer the question.
Context:
{context}

Question: {question}

Answer concisely and cite short parts of the context if relevant.`;

  const prompt = new PromptTemplate({
    template: promptTemplate,
    inputVariables: ['context', 'question'],
  });

  // 6) LLM runnable
  const llm = new OpenAI({ temperature: 0.0, modelName: 'gpt-3.5-turbo' });

  // 7) Compose a runnable that: retrieve -> format -> llm
  // We'll implement the flow manually:
  async function answerQuestion(question) {
    // Retrieve relevant docs
    const results = await retriever.getRelevantDocuments(question);
    // Prepare context string by concatenating the document pages (the "stuff" strategy).
    const contextText = results.map((d, i) => `Source ${i+1}:\n${d.pageContent}`).join('\n\n---\n\n');

    // Format prompt
    const promptInput = await prompt.format({ context: contextText, question });

    // Invoke the LLM directly with the filled prompt
    // Note: depending on your LangChain version you might use llm.invoke or llm.call
    const response = await llm.invoke(promptInput);
    // response is usually an object (runnable output); to get text, convert to string
    return response.toString();
  }

  // 8) Try a question
  const q = 'What is RAG and how does Pinecone help implement it?';
  console.log('Question:', q);
  const ans = await answerQuestion(q);
  console.log('Answer:', ans);
}

run().catch((err) => {
  console.error('Error running RAG pipeline:', err);
});
