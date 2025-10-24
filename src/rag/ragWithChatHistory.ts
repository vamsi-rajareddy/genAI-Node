import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { createRetriver } from './retriver';
import { formatDocumentsAsString } from "langchain/util/document";
import { ChatHandler, chat } from '../utils/chat';
import { BaseMessage, AIMessage, HumanMessage } from "@langchain/core/messages";

const prompt = ChatPromptTemplate.fromMessages([
    [
        "human",
        `You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.
Question: {question} 
Context: {context} 
Answer:`
    ],
    new MessagesPlaceholder("chat_history"),
    ["human", "{question}"],

]);

const llm = new ChatOpenAI({
    // temperature: 1,
    // topP: 1,
    maxTokens: 500,
    model: "gpt-3.5-turbo"
});

const outputParser = new StringOutputParser();
const retriever = await createRetriver();

const retrievalChain = RunnableSequence.from([
    (input) => input.question,
    retriever,
    formatDocumentsAsString,

]);

const generationChain = RunnableSequence.from([
    {
        question: (input) => input.question,
        context: retrievalChain,
        chat_history: (input)=>input.chat_history
    },
    prompt,
    llm,
    outputParser,
]);

const qcSystemPrompt = `Given a chat history and the latest user question
which might reference context in the chat history, formulate a standalone question
which can be understood without the chat history. Do NOT answer the question,
just reformulate it if needed and otherwise return it as is.`;


const qcPrompt = ChatPromptTemplate.fromMessages([
    ["system", qcSystemPrompt],
    ["human", "{question}"]
]);

const qcChain = RunnableSequence.from([qcPrompt, llm, outputParser]);


const chatHistory: BaseMessage[] = [];

const chatHandler: ChatHandler = async (question: string) => {
    let contQuest = null;
    if (chatHistory.length > 0) {
        contQuest = await qcChain.invoke({
            question,
            chat_history: chatHistory
        });
        console.log(`contextualized question: ${contQuest}`);
    }
    return {
        answer: generationChain.stream({
            question: contQuest || question,
            chat_history: chatHistory,
        }),
        answerCallBack: async (answerText: string) => {
            chatHistory.push(new HumanMessage(contQuest || question));
            chatHistory.push(new AIMessage(answerText));
        }
    }
}

chat(chatHandler);
