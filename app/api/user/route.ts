import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Get user data by ID
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "UserId required" }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { meals: { orderBy: { createdAt: 'desc' } } }
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Find or create user by nickname
export async function POST(req: Request) {
  try {
    const { nickname } = await req.json();
    if (!nickname) return NextResponse.json({ error: "Nickname required" }, { status: 400 });

    let user = await prisma.user.findUnique({
      where: { nickname },
      include: { meals: true }
    });

    if (!user) {
      user = await prisma.user.create({
        data: { nickname },
        include: { meals: true }
      });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Update user profile (Onboarding)
export async function PATCH(req: Request) {
  try {
    const { userId, ...data } = await req.json();
    
    // BMR Calculation (Mifflin-St Jeor Equation)
    let bmr = (10 * data.weight) + (6.25 * data.height) - (5 * data.age);
    bmr = data.gender === 'male' ? bmr + 5 : bmr - 161;

    // Activity Multipliers (Standard TDEE)
    const activityMultipliers: any = {
      sedentary: 1.2,        // Sedentary (desk job, no exercise)
      light: 1.375,          // Lightly active (1–3 days/week exercise)
      moderate: 1.55,        // Moderately active (3–5 days/week)
      active: 1.725,         // Very active (6–7 days/week hard exercise)
      extreme: 1.9           // Extremely active (physical job + exercise)
    };

    let maintenanceCalories = Math.round(bmr * (activityMultipliers[data.activityLevel] || 1.2));
    let targetCalories = maintenanceCalories;
    
    // Goal Adjustments (Standard ±500 kcal for 0.5kg/week change)
    if (data.goal === 'lose') {
      targetCalories = maintenanceCalories - 500; 
    } else if (data.goal === 'gain') {
      targetCalories = maintenanceCalories + 500;
    }

    // Safety Minimums (Don't let calories drop too low)
    const minCalories = data.gender === 'male' ? 1500 : 1200;
    if (targetCalories < minCalories) targetCalories = minCalories;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        targetCalories: data.weight ? targetCalories : undefined,
        waterIntake: data.waterIntake !== undefined ? data.waterIntake : undefined
      }
    });

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
