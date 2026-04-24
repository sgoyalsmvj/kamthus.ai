import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const apiKey = process.env.API_KEY;

const NUTRITION_PROMPT = (input: string) => `
You are a precise nutrition calculator for Indian and international foods.

RULES:
- The user will describe their meal in a single message. They may include 
  ingredients and quantities inline (e.g. "dal tadka made with 100g masoor dal, 
  1 tbsp ghee, onion, tomato" or "poha banaya 1 cup chiura, 1 tbsp tel, moongfali").
- If ingredients/recipe is mentioned, calculate nutrition ingredient by 
  ingredient and sum the totals. Always prefer this over guessing.
- If a BRANDED product is mentioned (Amul, Kellogg's, Britannia etc.), 
  use that product's actual label values.
- If only a food name is given with no recipe, estimate based on standard 
  preparation methods.
- If the user provides label values directly, use those exact numbers — 
  do not override with estimates.
- User may write in English, Hindi, or Marathi — handle all three.
- Scale all values to the quantity/serving size mentioned.

Return exactly this JSON with no explanation or markdown:
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
  "confidence": number
}

Input: ${input}
`;

function parseAndValidate(text: string) {
  const jsonStr = text.match(/\{.*\}/s)?.[0];
  if (!jsonStr) throw new Error("Invalid AI response");
  return JSON.parse(jsonStr);
}

function mapMealData(mealData: any, extraFields: Record<string, any> = {}) {
  const round = (val: any) => Math.round(Number(val || 0) * 10) / 10;
  return {
    name: String(mealData.name),
    calories: Math.round(Number(mealData.calories)),
    protein: round(mealData.protein),
    carbs: round(mealData.carbs),
    fat: round(mealData.fat),
    fiber: round(mealData.fiber),
    sugar: round(mealData.sugar),
    addedSugar: round(mealData.addedSugar),
    sugarAlcohol: round(mealData.sugarAlcohol),
    netCarbs: round(mealData.netCarbs),
    saturatedFat: round(mealData.saturatedFat),
    transFat: round(mealData.transFat),
    polyunsaturatedFat: round(mealData.polyunsaturatedFat),
    monounsaturatedFat: round(mealData.monounsaturatedFat),
    cholesterol: round(mealData.cholesterol),
    sodium: round(mealData.sodium),
    calcium: round(mealData.calcium),
    iron: round(mealData.iron),
    potassium: round(mealData.potassium),
    vitaminA: round(mealData.vitaminA),
    vitaminC: round(mealData.vitaminC),
    vitaminD: round(mealData.vitaminD),
    confidence: Number(mealData.confidence),
    ...extraFields,
  };
}

export async function POST(req: Request) {
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const { input, userId } = await req.json();

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const result = await model.generateContent(NUTRITION_PROMPT(input));
    const text = result.response.text();
    const mealData = parseAndValidate(text);

    const savedMeal = await prisma.meal.create({
      data: {
        ...mapMealData(mealData, {
          originalInput: String(input),
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }),
        user: { connect: { id: userId } }
      },
    });

    return NextResponse.json(savedMeal);
  } catch (error: any) {
    console.error("POST /api/meals error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mealId = searchParams.get("mealId");
    if (!mealId) return NextResponse.json({ error: "MealId required" }, { status: 400 });

    await prisma.meal.delete({ where: { id: mealId } });

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

    const existingMeal = await prisma.meal.findUnique({ where: { id: mealId } });
    if (!existingMeal) return NextResponse.json({ error: "Meal not found" }, { status: 404 });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const result = await model.generateContent(NUTRITION_PROMPT(input));
    const text = result.response.text();
    const mealData = parseAndValidate(text);

    const updatedMeal = await prisma.meal.update({
      where: { id: mealId },
      data: {
        ...mapMealData(mealData, {
          originalInput: String(input),
        }),
      },
    });

    return NextResponse.json(updatedMeal);
  } catch (error: any) {
    console.error("PATCH /api/meals error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}