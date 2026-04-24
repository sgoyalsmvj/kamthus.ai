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
      Analyze this meal description and provide comprehensive nutritional information in JSON format.
      Return exactly this structure:
      {
        "name": "Meal name",
        "calories": number,
        "protein": number,
        "carbs": number,
        "fat": number,
        "fiber": number,
        "sugar": number,
        "addedSugar": number,
        "sugarAlcohol": number,
        "netCarbs": number,
        "saturatedFat": number,
        "transFat": number,
        "polyunsaturatedFat": number,
        "monounsaturatedFat": number,
        "cholesterol": number,
        "sodium": number,
        "calcium": number,
        "iron": number,
        "potassium": number,
        "vitaminA": number,
        "vitaminC": number,
        "vitaminD": number,
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
        name: String(mealData.name),
        calories: Math.round(Number(mealData.calories)),
        protein: Number(mealData.protein),
        carbs: Number(mealData.carbs),
        fat: Number(mealData.fat),
        fiber: Number(mealData.fiber || 0),
        sugar: Number(mealData.sugar || 0),
        addedSugar: Number(mealData.addedSugar || 0),
        sugarAlcohol: Number(mealData.sugarAlcohol || 0),
        netCarbs: Number(mealData.netCarbs || 0),
        saturatedFat: Number(mealData.saturatedFat || 0),
        transFat: Number(mealData.transFat || 0),
        polyunsaturatedFat: Number(mealData.polyunsaturatedFat || 0),
        monounsaturatedFat: Number(mealData.monounsaturatedFat || 0),
        cholesterol: Number(mealData.cholesterol || 0),
        sodium: Number(mealData.sodium || 0),
        calcium: Number(mealData.calcium || 0),
        iron: Number(mealData.iron || 0),
        potassium: Number(mealData.potassium || 0),
        vitaminA: Number(mealData.vitaminA || 0),
        vitaminC: Number(mealData.vitaminC || 0),
        vitaminD: Number(mealData.vitaminD || 0),
        confidence: Number(mealData.confidence),
        originalInput: String(input),
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

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mealId = searchParams.get("mealId");
    if (!mealId) return NextResponse.json({ error: "MealId required" }, { status: 400 });

    await prisma.meal.delete({
      where: { id: mealId }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const { mealId, input } = await req.json();
    if (!mealId || !input) return NextResponse.json({ error: "MealId and Input required" }, { status: 400 });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const prompt = `
      Analyze this UPDATED meal description and provide comprehensive nutritional information in JSON format.
      Return exactly this structure:
      {
        "name": "Meal name",
        "calories": number,
        "protein": number,
        "carbs": number,
        "fat": number,
        "fiber": number,
        "sugar": number,
        "addedSugar": number,
        "sugarAlcohol": number,
        "netCarbs": number,
        "saturatedFat": number,
        "transFat": number,
        "polyunsaturatedFat": number,
        "monounsaturatedFat": number,
        "cholesterol": number,
        "sodium": number,
        "calcium": number,
        "iron": number,
        "potassium": number,
        "vitaminA": number,
        "vitaminC": number,
        "vitaminD": number,
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

    // Verify meal exists first
    const existingMeal = await prisma.meal.findUnique({ where: { id: mealId } });
    if (!existingMeal) return NextResponse.json({ error: "Meal not found" }, { status: 404 });

    const updatedMeal = await prisma.meal.update({
      where: { id: mealId },
      data: {
        name: String(mealData.name),
        calories: Math.round(Number(mealData.calories)),
        protein: Number(mealData.protein),
        carbs: Number(mealData.carbs),
        fat: Number(mealData.fat),
        fiber: Number(mealData.fiber || 0),
        sugar: Number(mealData.sugar || 0),
        addedSugar: Number(mealData.addedSugar || 0),
        sugarAlcohol: Number(mealData.sugarAlcohol || 0),
        netCarbs: Number(mealData.netCarbs || 0),
        saturatedFat: Number(mealData.saturatedFat || 0),
        transFat: Number(mealData.transFat || 0),
        polyunsaturatedFat: Number(mealData.polyunsaturatedFat || 0),
        monounsaturatedFat: Number(mealData.monounsaturatedFat || 0),
        cholesterol: Number(mealData.cholesterol || 0),
        sodium: Number(mealData.sodium || 0),
        calcium: Number(mealData.calcium || 0),
        iron: Number(mealData.iron || 0),
        potassium: Number(mealData.potassium || 0),
        vitaminA: Number(mealData.vitaminA || 0),
        vitaminC: Number(mealData.vitaminC || 0),
        vitaminD: Number(mealData.vitaminD || 0),
        confidence: Number(mealData.confidence),
        originalInput: String(input)
      }
    });

    return NextResponse.json(updatedMeal);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
