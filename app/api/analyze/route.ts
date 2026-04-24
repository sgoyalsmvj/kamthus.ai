import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const { input, userId } = await req.json();
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const prompt = `
      Analyze this meal and provide nutritional information in JSON format.
      Return exactly this structure:
      {
        "name": "Meal name",
        "calories": number,
        "protein": number,
        "carbs": number,
        "fat": number,
        "confidence": number (0-1)
      }
      Input: ${input}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonStr = text.match(/\{.*\}/s)?.[0];
    if (!jsonStr) throw new Error("Invalid AI response");
    
    const mealData = JSON.parse(jsonStr);

    // Save to Neon Database via Prisma
    const savedMeal = await prisma.meal.create({
      data: {
        name: mealData.name,
        calories: mealData.calories,
        protein: mealData.protein,
        carbs: mealData.carbs,
        fat: mealData.fat,
        confidence: mealData.confidence,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        userId: userId
      },
    });
    
    return NextResponse.json(savedMeal);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
