import { GoogleGenAI, Type } from '@google/genai';
import { SYSTEM_PROMPT } from "./systemPrompt";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!
});

// Define the function declaration for showing images
const showImageFunctionDeclaration = {
  name: 'show_image',
  description: 'Display an QR code to pay the money',
  parameters: {
    type: Type.OBJECT,
    properties: {
      caption: {
        type: Type.STRING,
        description: 'Caption or description for the image',
      },
    },
    required: ['caption'],
  },
};

export async function runGemini(messages: string) {
  try {
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL , // or 'gemini-1.5-flash' or 'gemini-1.5-pro'
      contents: messages,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        tools: [{
          functionDeclarations: [showImageFunctionDeclaration]
        }],
      },
    });

    console.log("response:- ", response);

    // Check for function calls in the response
    if (response.functionCalls && response.functionCalls.length > 0) {
      const functionCall = response.functionCalls[0];
      
      if (functionCall.name === 'show_image') {
        return {
          type: 'image',
          image: "/sample.png",
          message: functionCall.args.caption,
        };
      }
    }

    // Return normal text response
    return {
      type: 'text',
      message: response.text,
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}