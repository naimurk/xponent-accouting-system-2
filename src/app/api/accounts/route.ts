import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { accountSchema } from "@/lib/validator";

// GET all accounts
export async function GET() {
  try {
    const accounts = await prisma.account.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(accounts);
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch accounts" },
      { status: 500 }
    );
  }
}

// POST create a new account
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = accountSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { name, type } = validationResult.data;

    // Check if account with same name already exists
    const existingAccount = await prisma.account.findFirst({
      where: { name },
    });

    if (existingAccount) {
      return NextResponse.json(
        { error: "Account with this name already exists" },
        { status: 409 }
      );
    }

    // Create new account
    const account = await prisma.account.create({
      data: { name, type },
    });

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error("Error creating account:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
