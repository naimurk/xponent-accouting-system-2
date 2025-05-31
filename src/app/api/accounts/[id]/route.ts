import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { accountSchema } from "@/lib/validator";

// GET a specific account
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const account = await prisma.account.findUnique({
      where: { id: params.id },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    return NextResponse.json(account);
  } catch (error) {
    console.error("Error fetching account:", error);
    return NextResponse.json(
      { error: "Failed to fetch account" },
      { status: 500 }
    );
  }
}

// PUT update an account
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Check if account exists
    const existingAccount = await prisma.account.findUnique({
      where: { id: params.id },
    });

    if (!existingAccount) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Check if another account with the same name exists
    const duplicateAccount = await prisma.account.findFirst({
      where: {
        name,
        id: { not: params.id },
      },
    });

    if (duplicateAccount) {
      return NextResponse.json(
        { error: "Another account with this name already exists" },
        { status: 409 }
      );
    }

    // Update account
    const updatedAccount = await prisma.account.update({
      where: { id: params.id },
      data: { name, type },
    });

    return NextResponse.json(updatedAccount);
  } catch (error) {
    console.error("Error updating account:", error);
    return NextResponse.json(
      { error: "Failed to update account" },
      { status: 500 }
    );
  }
}

// DELETE an account
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if account exists
    const existingAccount = await prisma.account.findUnique({
      where: { id: params.id },
      include: { entries: true },
    });

    if (!existingAccount) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Check if account is used in journal entries
    if (existingAccount.entries.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete account that is used in journal entries" },
        { status: 400 }
      );
    }

    // Delete account
    await prisma.account.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
