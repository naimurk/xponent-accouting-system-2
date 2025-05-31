/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { PlusCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function JournalEntriesPage() {
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

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Journal Entries</h1>
        <Button asChild>
          <Link href="/journal-entries/new">
            <PlusCircleIcon className="mr-2 h-4 w-4" />
            New Journal Entry
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {journalEntries.length > 0 ? (
          journalEntries.map((entry: any) => (
            <Card key={entry.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle>
                    <Link
                      href={`/journal-entries/${entry.id}`}
                      className="hover:underline"
                    >
                      Journal Entry -{" "}
                      {new Date(entry.date).toLocaleDateString()}
                    </Link>
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    Created: {new Date(entry.createdAt).toLocaleDateString()}
                  </div>
                </div>
                {entry.memo && (
                  <div className="text-muted-foreground mt-1">{entry.memo}</div>
                )}
              </CardHeader>
              <CardContent>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-4 py-2 text-left">Account</th>
                        <th className="px-4 py-2 text-left">Type</th>
                        <th className="px-4 py-2 text-right">Debit</th>
                        <th className="px-4 py-2 text-right">Credit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entry.lines.map((line: any) => (
                        <tr key={line.id} className="border-b">
                          <td className="px-4 py-2">{line.account.name}</td>
                          <td className="px-4 py-2">{line.account.type}</td>
                          <td className="px-4 py-2 text-right">
                            {line.debit > 0 ? `$${line.debit.toFixed(2)}` : ""}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {line.credit > 0
                              ? `$${line.credit.toFixed(2)}`
                              : ""}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-muted/50 font-medium">
                        <td className="px-4 py-2" colSpan={2}>
                          Total
                        </td>
                        <td className="px-4 py-2 text-right">
                          $
                          {entry.lines
                            .reduce(
                              (sum: any, line: any) => sum + line.debit,
                              0
                            )
                            .toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-right">
                          $
                          {entry.lines
                            .reduce(
                              (sum: any, line: any) => sum + line.credit,
                              0
                            )
                            .toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No journal entries found.</p>
            <Button asChild className="mt-4">
              <Link href="/journal-entries/new">
                Create your first journal entry
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
