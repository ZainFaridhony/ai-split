
import { GoogleGenAI, Type } from "@google/genai";
import type { Receipt, ReceiptItem, Bill, AssignmentResponse } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = (base64: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64,
      mimeType
    },
  };
};

export const analyzeReceipt = async (base64Image: string, mimeType: string): Promise<Receipt> => {
  const imagePart = fileToGenerativePart(base64Image, mimeType);
  const textPart = {
    text: `Analyze this receipt. Extract all line items with their quantity and price. Also, identify the subtotal, tax, and total. Respond in the specified JSON format. If a value is not found, use 0.`
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, textPart] },
    config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  quantity: { type: Type.INTEGER },
                  price: { type: Type.NUMBER },
                },
                required: ["name", "quantity", "price"]
              }
            },
            subtotal: { type: Type.NUMBER },
            tax: { type: Type.NUMBER },
            total: { type: Type.NUMBER }
          },
          required: ["items", "subtotal", "tax", "total"]
        }
    }
  });

  const jsonText = response.text.trim();
  try {
    return JSON.parse(jsonText) as Receipt;
  } catch(e) {
    console.error("Failed to parse JSON from Gemini:", jsonText);
    throw new Error("AI response was not valid JSON.");
  }
};

export const processAssignment = async (command: string, items: ReceiptItem[], currentBill: Bill): Promise<AssignmentResponse> => {
    const unassignedItems = currentBill['Unassigned']?.items || [];
    const contextPrompt = `
    You are a bill splitting assistant.
    The user is assigning items from a receipt to people.
    
    Here are the remaining unassigned items:
    ${unassignedItems.map(item => `- ${item.name} ($${item.price.toFixed(2)})`).join('\n')}

    User command: "${command}"

    Your task is to determine which item(s) are being assigned to which person(s).
    A user might assign an item to one person or split it among multiple people.
    Identify the item by its name from the list. If multiple items have similar names, pick the most likely one.
    Respond ONLY with a JSON object. Do not include any other text.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contextPrompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    updates: {
                        type: Type.ARRAY,
                        description: "List of assignment updates based on the user command.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                itemName: { type: Type.STRING, description: "The name of the item from the list being assigned." },
                                personName: { type: Type.STRING, description: "The primary person the item is assigned to. If shared, this can be one of the people." },
                                isShared: { type: Type.BOOLEAN, description: "True if the item is split among multiple people." },
                                sharedWith: { 
                                    type: Type.ARRAY, 
                                    description: "An array of all people's names sharing the item. Empty if not shared.",
                                    items: { type: Type.STRING }
                                }
                            },
                            required: ["itemName", "personName", "isShared", "sharedWith"]
                        }
                    },
                    newPeople: {
                        type: Type.ARRAY,
                        description: "A list of any new people mentioned who are not yet in the bill.",
                        items: { type: Type.STRING }
                    }
                },
                required: ["updates"]
            }
        }
    });
    
    const jsonText = response.text.trim();
    try {
        return JSON.parse(jsonText) as AssignmentResponse;
    } catch(e) {
        console.error("Failed to parse JSON from Gemini for assignment:", jsonText);
        throw new Error("AI assignment response was not valid JSON.");
    }
};
