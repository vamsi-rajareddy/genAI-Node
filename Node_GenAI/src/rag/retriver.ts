import {VectorStoreRetriever} from '@langchain/core/vectorstores';
import { OpenAIEmbeddings} from '@langchain/openai';
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import dotenv from "dotenv";

dotenv.config();

export async function createRetriver(){
    const embeddingLLM =new OpenAIEmbeddings({
    model: "text-embedding-3-small",
});

const pinecone =new Pinecone();
const pineconeIndex= pinecone.index("langchain-docs");
const vectorStore = await PineconeStore.fromExistingIndex(embeddingLLM,{
    pineconeIndex
});
return vectorStore.asRetriever();
}

const retriever= await createRetriver();
const context = await retriever.invoke("what is langchain?");

console.log("context" , context);