import dotenv from "dotenv";
import { OpenAIEmbeddings} from '@langchain/openai';
import { splitDocuments } from "./splitDocuments";
import { loadDocuments } from "./loadDocuments";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import cliProgress from "cli-progress";

dotenv.config();

const rawDocuments = await loadDocuments();
const chunkedDocs = await splitDocuments(rawDocuments);

const embeddingLLM =new OpenAIEmbeddings({
    model: "text-embedding-3-small",
});

const pinecone =new Pinecone();
const pineconeIndex= pinecone.index("langchain-docs");
console.log("Starting Vecrotization...");
const progressBar = new cliProgress.SingleBar({});
progressBar.start(chunkedDocs.length, 0);

for(let i=0; i< chunkedDocs.length; i=i+100){
    const batch = chunkedDocs.slice(i, i+100);
    await PineconeStore.fromDocuments(batch,embeddingLLM, {
        pineconeIndex,
    });
    progressBar.increment(batch.length);
}
progressBar.stop();
console.log("chunkedDocs stored in pinecone");