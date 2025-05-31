/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { journalEntrySchema } from "@/lib/validator";

// GET all journal entries
export async function GET() {
  try {
    const journalEntries = await prisma.journalEntry.findMany({
      include: {
        lines: {
          include: {
            account: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(journalEntries);
  } catch (error) {
    console.error("Error fetching journal entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch journal entries" },
      { status: 500 }
    );
  }
}

// POST create a new journal entry
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Parse date string to Date object if needed
    if (typeof body.date === "string") {
      body.date = new Date(body.date);
    }

    // Validate request body
    const validationResult = journalEntrySchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { date, memo, lines } = validationResult.data;

    // Verify all accounts exist
    const accountIds = lines.map((line) => line.accountId);
    const accounts = await prisma.account.findMany({
      where: { id: { in: accountIds } },
    });

    if (accounts.length !== new Set(accountIds).size) {
      return NextResponse.json(
        { error: "One or more accounts do not exist" },
        { status: 400 }
      );
    }

    // Create journal entry with lines in a transaction
    const journalEntry = await prisma.$transaction(async (tx:any) => {
      const entry = await tx.journalEntry.create({
        data: {
          date,
          memo,
          lines: {
            create: lines.map((line) => ({
              accountId: line.accountId,
              debit: line.debit,
              credit: line.credit,
            })),
          },
        },
        include: {
          lines: {
            include: {
              account: true,
            },
          },
        },
      });
      return entry;
    });

    return NextResponse.json(journalEntry, { status: 201 });
  } catch (error) {
    console.error("Error creating journal entry:", error);
    return NextResponse.json(
      { error: "Failed to create journal entry" },
      { status: 500 }
    );
  }
}
