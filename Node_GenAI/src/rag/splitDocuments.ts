import {Document} from '@langchain/core/documents';
import { RecursiveCharacterTextSplitter} from "langchain/text_splitter";
import { loadDocuments } from './loadDocuments';

export async function splitDocuments(
    rawDocuments: Document[]
){
    const splitter = RecursiveCharacterTextSplitter.fromLanguage('html',{
        chunkSize: 500,
        chunkOverlap: 100
    });
    const documetChunks = await splitter.splitDocuments(rawDocuments);
    console.log(`${rawDocuments.length} documents split into ${documetChunks.length} chunks`)
return documetChunks;
}

// const rawDocuments = await loadDocuments();
// await splitDocuments(rawDocuments);