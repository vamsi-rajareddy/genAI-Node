import { Document } from "@langchain/core/documents";
import { crawlLangchainDocsUrls } from "./crawlDocuments";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
export async function loadDocuments() {
    const langchainDocUrls = await crawlLangchainDocsUrls();

    const rawDocuments: Document[] =[];
    for(const url of langchainDocUrls){

        const loader= new CheerioWebBaseLoader(url);
        const docs = await loader.load();
        rawDocuments.push(...docs);

    }
    return rawDocuments;
}

// const rawDocuments = await loadDocuments();

// console.log(rawDocuments);