import {PromptTemplate} from '@langchain/core/prompts';
import {ChatOpenAI} from '@langchain/openai';
import dotenv from "dotenv";
import {StringOutputParser} from '@langchain/core/output_parsers';
// import {LLMChain} from 'langchain/chains';
import {RunnableSequence} from '@langchain/core/runnables';
dotenv.config();

async function personalisedPitch(
    courses: string,
    role: string,
    wordLimit: string,
){
    const promptTemplate = new PromptTemplate({
        template: "Describe the importance of learning {courses} for a {role} in {wordLimit} words.",
        inputVariables: ["courses", "role", "wordLimit"],
     });
     
     const formattedPrompt = await promptTemplate.format({
         courses,
         role,
         wordLimit,
     });
     
     console.log("formattedPrompt", formattedPrompt);
     const llm =new ChatOpenAI({
        // temperature: 1,
        topP: 1,
        maxTokens: 20,
        model: "gpt-3.5-turbo"
     });
     const output = new StringOutputParser();
    //  const legacyChain = new LLMChain();

    // const lcelChain = promptTemplate.pipe(llm).pipe(output);

    const lcelChain =RunnableSequence.from([
        promptTemplate,
        llm,
        output
    ])
    const lcelResponse= await lcelChain.invoke({
        courses,
         role,
         wordLimit,
    });
    console.log("Answer from LCEL", lcelResponse);

};

await personalisedPitch('gen AI', 'JS Developer', '55');
  