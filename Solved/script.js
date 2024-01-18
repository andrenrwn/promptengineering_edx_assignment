// Dependencies: langchain, inquirer, dotenv
const { OpenAI } = require("langchain/llms/openai");
const inquirer = require('inquirer');
require('dotenv').config();

// The following dependencies are not required for this script to run, but are used to format the output
const { PromptTemplate } = require("langchain/prompts");
const { StructuredOutputParser } = require("langchain/output_parsers");

// Initialize the OpenAI model
const model = new OpenAI({ temperature: 0, openAIApiKey: process.env.OPENAI_API_KEY, model: 'gpt-3.5-turbo' });

// With a `StructuredOutputParser` we can define a schema for the output.
const parser = StructuredOutputParser.fromNamesAndDescriptions({
  // Define the output variables and their descriptions
    korean: "the user's word or phrase translated in korean",
    french: "the user's word or phrase translated in french",
    spanish: "the user's word or phrase translated in spanish",
    german: "the user's word or phrase translated in german"
});

// Get the format instructions from the parser
const formatInstructions = parser.getFormatInstructions();

// Create a prompt function that takes the user input and passes it through the call method
const promptFunc = async(input) => {
    try {
        const prompt = new PromptTemplate({
          // Define the template for the prompt
          template: "You are a helpful translator that understands all of the current languages in the world. You will translate anything that is asked of you while also understanding that phrases and addages may get lost in translation. In those cases, you will return a translated version of the user's phrase in a close approximation.\n{format_instructions}\n{question}",
          inputVariables: ["question"],
          partialVariables: { format_instructions: formatInstructions },
        });

        // Format the prompt with the user input
        const promptInput = await prompt.format({
          question: input
        });

        // Call the model with the formatted prompt
        const res = await model.call(promptInput);
        console.log(await parser.parse(res));
        
     // Catch any errors and log them to the console   
    } catch (err) {
        console.log(err);
    };
}

// Initialization function that uses inquirer to prompt the user and returns a promise. It takes the user input and passes it through the call method
const init = () => {
    inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'What would you like translated?',
      },
    ]).then((inquirerResponse) => {
      promptFunc(inquirerResponse.name)
    });
  }
  
  // Calls the intialization function and starts the script
  init();
