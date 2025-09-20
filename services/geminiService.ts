import { GoogleGenAI, Type } from "@google/genai";
import type { Person, Task, BudgetItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface RiderParseResult {
    tasks: Omit<Task, 'id' | 'completed'>[];
    budgetItems: Omit<BudgetItem, 'id'>[];
}

export async function parseRiderWithGemini(riderText: string, people: Person[]): Promise<RiderParseResult> {
    const productionPeople = people.filter(p => p.role === 'Production' || p.role === 'Tour Manager');
    const assignees = productionPeople.map(p => `"${p.id}" (${p.name})`).join(', ');

    const prompt = `
        You are an expert tour manager's assistant. Your task is to analyze an artist's technical rider text and extract actionable tasks and budget items.

        **Instructions:**
        1.  Read the provided rider text carefully.
        2.  Identify specific, actionable tasks related to production, gear, hospitality, or logistics. For each task, create a concise description. Assign it to the most relevant person from the provided list of production staff.
        3.  Identify specific items that will incur a cost. For each item, determine a logical category (e.g., 'Production', 'Hospitality', 'Equipment Rental') and estimate the cost if possible, otherwise use 0.
        4.  Return the data ONLY in the specified JSON format. Do not include any other text or explanations.

        **Available Production Staff for Task Assignment:**
        ${assignees}

        **Rider Text to Analyze:**
        ---
        ${riderText}
        ---
    `;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            tasks: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        text: {
                            type: Type.STRING,
                            description: 'A concise description of the actionable task.'
                        },
                        assignedTo: {
                            type: Type.STRING,
                            description: `The ID of the person from the provided list who is most responsible for this task. Available IDs: ${assignees}`
                        }
                    },
                    required: ['text', 'assignedTo']
                }
            },
            budgetItems: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        category: {
                            type: Type.STRING,
                            description: "The financial category for the item (e.g., 'Production', 'Hospitality', 'Backline')."
                        },
                        amount: {
                            type: Type.NUMBER,
                            description: 'An estimated cost for the item. If not specified, use 0.'
                        }
                    },
                    required: ['category', 'amount']
                }
            }
        },
        required: ['tasks', 'budgetItems']
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });
        
        const jsonText = response.text.trim();
        // A simple validation to ensure we have a parseable object.
        if (jsonText.startsWith('{') && jsonText.endsWith('}')) {
             return JSON.parse(jsonText) as RiderParseResult;
        } else {
            console.error("Gemini did not return valid JSON:", jsonText);
            throw new Error("Invalid JSON format from AI response.");
        }

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw error;
    }
}