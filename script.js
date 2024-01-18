require('dotenv').config();
const inquirer = require('inquirer');
const { OpenAI } = require('langchain/llms/openai');
const { PromptTemplate } = require("langchain/prompts");
const { StructuredOutputParser } = require("langchain/output_parsers");

console.log(process.env.OPENAI_API_KEY);

const model = new OpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0,
    model: 'gpt-3.5-turbo'
});

// Show the version of langchain OpenAI model
console.log({ model });

// Example API call
const promptFunc = async (input) => {
    try {

        // Instantiation of a new object called "prompt" using the "PromptTemplate" class
        // const prompt = new PromptTemplate({
        //     template: "You are a javascript expert and will answer the user’s coding questions thoroughly as possible.\n{question}",
        //     inputVariables: ["question"],
        // });

        // With a `StructuredOutputParser` we can define a schema for the output.
        // const parser = StructuredOutputParser.fromNamesAndDescriptions({
        //     code: "Javascript code that answers the user's question",
        //     explanation: "detailed explanation of the example code provided",
        // });
        const parser = StructuredOutputParser.fromNamesAndDescriptions({
            json: "An array containing the list of answers to the user's question",
            explanation: "A array containing the detailed explanations of why each element is selected",
        });
        const formatInstructions = parser.getFormatInstructions();

        const prompt = new PromptTemplate({
            // template: "You are a javascript expert and will answer the user’s coding questions thoroughly as possible.\n{format_instructions}\n{question}",
            template: "You are a tour guide.\n{format_instructions}\n{question}",
            inputVariables: ["question"],
            partialVariables: { format_instructions: formatInstructions }
        });

        const promptInput = await prompt.format({
            question: input
        });

        console.log("Resulting Question:\n", promptInput, "\n");

        const res = await model.call(promptInput);

        console.log(await parser.parse(res));
        // console.log(res);
    }
    catch (err) {
        console.error(err);
    }
};

// promptFunc();


const init = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Ask a coding question:',
        },
    ]).then((inquirerResponse) => {
        promptFunc(inquirerResponse.name)
    });
};

init();


