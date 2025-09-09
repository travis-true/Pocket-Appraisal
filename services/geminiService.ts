import { GoogleGenAI, Type } from "@google/genai";
import type { IdentifiedCardInfo, ManualCardInput, PricingData } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = (base64: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64.split(',')[1],
      mimeType,
    },
  };
};

export const identifyCardFromImages = async (
  frontImage: { base64: string; mimeType: string },
  backImage: { base64: string; mimeType: string }
): Promise<IdentifiedCardInfo> => {
  const model = "gemini-2.5-flash";

  const prompt = `You are a sports card expert, specializing in both identification and professional grading. Based on the provided front and back images of this sports card, perform two tasks:

1.  **Identification**: Identify the Year, Manufacturer/Set, Player Name, and Card Number. Also, identify if this is a specific parallel or variation. If it is a parallel, describe it (e.g., 'Refractor', 'Prizm Silver', 'Gold /10').

2.  **Condition Assessment**: Analyze the card's condition based on centering, corners, edges, and surface. Provide a suggested raw grade on a scale of 1 to 10 (e.g., 8.5, 9, 10). Also, provide a list of specific observations about the card's condition.

Respond with ONLY a JSON object with the keys: "year", "set", "player", "cardNumber", "parallelDescription", "suggestedGrade" (as a number), and "conditionNotes" (as an array of strings). If a field cannot be identified, return null for its value. The grade and notes should be based on a critical assessment of the images.`;

  const frontImagePart = fileToGenerativePart(frontImage.base64, frontImage.mimeType);
  const backImagePart = fileToGenerativePart(backImage.base64, backImage.mimeType);

  const response = await ai.models.generateContent({
    model,
    contents: { parts: [{ text: prompt }, frontImagePart, backImagePart] },
  });

  try {
    const jsonString = response.text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    return JSON.parse(jsonString) as IdentifiedCardInfo;
  } catch (error) {
    console.error("Failed to parse JSON from identification response:", response.text);
    throw new Error("Could not identify the card from the provided images. The AI response was not valid JSON.");
  }
};

export const getPricingAndParallels = async (cardInfo: ManualCardInput): Promise<PricingData> => {
  const model = "gemini-2.5-flash";
  const prompt = `You are a sports card pricing expert. For the card: ${cardInfo.year} ${cardInfo.set} ${cardInfo.player} #${cardInfo.cardNumber}, provide a list of its common parallels and recent sales prices.
  The prices should reflect the current market for both RAW (ungraded) and top-graded conditions (like PSA 10 or BGS 9.5).
  For each price (raw and graded), provide the source of the data (e.g., eBay, 130point.com) including its name and a direct URL to the sales data if available. Provide separate sources for raw and graded prices. Also include the date range for the sales (e.g., 'Last 30 days').`;

  const sourceSchema = {
    type: Type.OBJECT,
    description: "Source of the pricing data.",
    properties: {
      name: { type: Type.STRING, description: "Name of the source, e.g., 'eBay Sold'" },
      url: { type: Type.STRING, description: "Direct URL to the source, or null if not available." }
    },
    required: ["name"]
  };

  const priceInfoSchema = {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "Description of the card or parallel, e.g., 'Base' or 'Silver Prizm'" },
      rawPrice: { type: Type.STRING, description: "Price range for a raw/ungraded card, e.g., '$10 - $15' or 'N/A'" },
      gradedPrice: { type: Type.STRING, description: "Price range for a top-graded card (PSA 10/BGS 9.5), e.g., '$50 - $75' or 'N/A'" },
      rawSource: sourceSchema,
      gradedSource: sourceSchema,
      dateRange: { type: Type.STRING, description: "Date range for the sales data, e.g., 'Last 30 days'" }
    },
     required: ["name", "rawPrice", "gradedPrice", "rawSource", "gradedSource", "dateRange"],
  };

  const pricingSchema = {
    type: Type.OBJECT,
    properties: {
      baseCard: priceInfoSchema,
      parallels: {
        type: Type.ARRAY,
        items: priceInfoSchema,
      },
    },
    required: ["baseCard", "parallels"],
  };
  
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: pricingSchema,
    },
  });

  try {
    const jsonString = response.text.trim();
    return JSON.parse(jsonString) as PricingData;
  } catch (error) {
    console.error("Failed to parse JSON from pricing response:", response.text);
    throw new Error("Could not retrieve pricing data. The AI response was not valid JSON.");
  }
};