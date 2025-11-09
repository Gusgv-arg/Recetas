import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Recipe, Substitution } from '../types';
import { decode } from '../utils/audioUtils';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

const recipeSchema = {
  type: Type.OBJECT,
  properties: {
    recipeName: { type: Type.STRING, description: 'El nombre de la receta.' },
    difficulty: { type: Type.STRING, enum: ['Fácil', 'Media', 'Difícil'], description: 'El nivel de dificultad.' },
    prepTime: { type: Type.STRING, description: 'Tiempo de preparación estimado, ej., "30 min".' },
    calories: { type: Type.NUMBER, description: 'Recuento estimado de calorías.' },
    servings: { type: Type.STRING, description: 'Número estimado de porciones que rinde la receta, ej., "4 porciones".' },
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          quantity: { type: Type.STRING }
        },
        required: ['name', 'quantity']
      },
      description: 'Lista COMPLETA de todos los ingredientes con sus cantidades requeridas para la receta.'
    },
    steps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Instrucciones de cocina paso a paso.'
    },
  },
  required: ['recipeName', 'difficulty', 'prepTime', 'calories', 'servings', 'ingredients', 'steps']
};

const kitchenResponseSchema = {
    type: Type.OBJECT,
    properties: {
        identifiedIngredients: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Una lista de todos los ingredientes identificados en la entrada del usuario, normalizados a su forma base (por ejemplo, singular, en minúsculas)."
        },
        suggestedRecipes: {
            type: Type.ARRAY,
            items: recipeSchema,
            description: "Una lista de recetas sugeridas basadas en los ingredientes identificados."
        }
    },
    required: ['identifiedIngredients', 'suggestedRecipes']
}

const substitutionSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: 'El nombre del ingrediente sustituto.' },
      amount: { type: Type.STRING, description: 'La cantidad del sustituto a usar, ej., "1 taza".' },
      notes: { type: Type.STRING, description: 'Breves notas sobre cómo esta sustitución podría afectar el plato final.' }
    },
    required: ['name', 'amount']
  }
};

export async function suggestRecipes(input: { type: 'image' | 'audio' | 'text', data: string }, filters: string[]): Promise<{ identifiedIngredients: string[], suggestedRecipes: Recipe[] }> {
  const filterText = filters.length > 0 ? `Por favor, asegúrate de que todas las recetas sugeridas sean adecuadas para las siguientes dietas: ${filters.join(', ')}.` : '';

  const commonInstructions = `Primero, identifica todos los ingredientes de la entrada del usuario. Normaliza cada ingrediente a su forma base (por ejemplo, 'tomates' a 'tomate', 'huevos' a 'huevo'). Luego, basándote en los ingredientes identificados, sugiere 5 recetas diversas. Responde en español. ${filterText} Para cada receta, proporciona una lista COMPLETA de todos los ingredientes requeridos. No hagas ninguna suposición sobre una despensa estándar. Responde ÚNICAMENTE con un objeto JSON válido que se ajuste al esquema proporcionado, que espera una lista de ingredientes identificados y una lista de sugerencias de recetas. No incluyas ningún texto antes o después del objeto JSON.`

  let prompt: string;
  let parts: any[] = [];
  const model = 'gemini-2.5-flash';

  switch (input.type) {
    case 'image':
      prompt = `Analiza esta imagen del contenido de una nevera. ${commonInstructions}`;
      parts.push({ inlineData: { mimeType: 'image/jpeg', data: input.data } });
      parts.push({ text: prompt });
      break;
    case 'text':
      prompt = `Analiza la siguiente lista de ingredientes de una nevera: "${input.data}". ${commonInstructions}`;
      parts.push({ text: prompt });
      break;
    case 'audio':
      prompt = `Escucha este clip de audio donde un usuario describe el contenido de su nevera. ${commonInstructions}`;
      parts.push({ inlineData: { mimeType: 'audio/webm', data: input.data } });
      parts.push({ text: prompt });
      break;
    default:
      throw new Error("Tipo de entrada no soportado");
  }

  const response = await ai.models.generateContent({
    model: model,
    contents: { parts: parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: kitchenResponseSchema,
    },
  });

  try {
    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    return result;
  } catch (error) {
    console.error("Failed to parse Gemini response:", response.text);
    throw new Error("No se pudieron entender las sugerencias de recetas de la IA. El formato fue inesperado.");
  }
}

export async function getIngredientSubstitutions(ingredientName: string, ingredientQuantity: string, recipeName: string): Promise<Substitution[]> {
    const prompt = `Eres un útil asistente culinario. Un usuario está preparando la receta de "${recipeName}" y necesita un sustituto para "${ingredientQuantity} de ${ingredientName}". Por favor, sugiere hasta 3 sustituciones culinarias comunes y apropiadas. Responde en español. Para cada sustitución, proporciona el nombre, la cantidad equivalente a usar y una breve nota sobre cómo podría cambiar el sabor o la textura del plato. Responde ÚNICAMENTE con un array JSON válido que se ajuste al esquema proporcionado. No incluyas ningún texto antes o después del array JSON.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: substitutionSchema,
        },
    });

    try {
        const jsonText = response.text.trim();
        const substitutions = JSON.parse(jsonText);
        return substitutions as Substitution[];
    } catch (error) {
        console.error("Failed to parse Gemini substitution response:", response.text);
        throw new Error("No se pudieron obtener sustituciones de ingredientes de la IA. El formato fue inesperado.");
    }
}


export async function textToSpeech(text: string): Promise<AudioBuffer> {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
        },
    });

    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
        throw new Error("No se recibieron datos de audio de la API.");
    }
    
    const audioData = decode(base64Audio);
    const dataInt16 = new Int16Array(audioData.buffer);
    const frameCount = dataInt16.length / 1; // 1 channel
    const buffer = outputAudioContext.createBuffer(1, frameCount, 24000);
    const channelData = buffer.getChannelData(0);
    
    for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
    }

    return buffer;
}