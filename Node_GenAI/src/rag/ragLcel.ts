import {ChatPromptTemplate} from '@langchain/core/prompts';
import {ChatOpenAI} from '@langchain/openai';
import {StringOutputParser} from '@langchain/core/output_parsers';
import {RunnableSequence} from '@langchain/core/runnables';
import { createRetriver } from './retriver';
import { formatDocumentsAsString } from "langchain/util/document";
import { ChatHandler, chat } from '../utils/chat';

const prompt = ChatPromptTemplate.fromMessages([
   [
     "human",
    `You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.
Question: {question} 
Context: {context} 
Answer:`
],

]);

 const llm =new ChatOpenAI({
        // temperature: 1,
        // topP: 1,
        maxTokens: 500,
        model: "gpt-3.5-turbo"
     });

     const outputParser = new StringOutputParser();
     const retriever = await createRetriver();

     const retrievalChain = RunnableSequence.from([
        (input)=>input.question,
        retriever,
        formatDocumentsAsString,

     ]);
     
     const generationChain = RunnableSequence.from([
       {
         question: (input) => input.question,
         context: retrievalChain,
       },
       prompt,
       llm,
       outputParser,
     ]);

     const chatHandler:ChatHandler = async(question: string) =>{
        return{
            answer: generationChain.stream({question})
        }
     }

     chat(chatHandler);
