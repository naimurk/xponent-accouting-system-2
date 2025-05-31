/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import prisma from "@/lib/prisma";

interface JournalEntryPageProps {
  params: {
    id: string;
  };
}

export default async function JournalEntryPage({
  params,
}: JournalEntryPageProps) {
  const journalEntry = await prisma.journalEntry.findUnique({
    where: { id: params.id },
    include: {
      lines: {
        include: {
          account: true,
        },
      },
    },
  });

  if (!journalEntry) {
    notFound();
  }

  return (
    <div className="container max-w-4xl py-10">
      <Button variant="outline" asChild className="mb-6">
        <Link href="/journal-entries">
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Journal Entries
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Journal Entry - {new Date(journalEntry.date).toLocaleDateString()}
          </CardTitle>
          {journalEntry.memo && (
            <p className="text-muted-foreground">{journalEntry.memo}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Entry Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p>{new Date(journalEntry.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p>{new Date(journalEntry.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Journal Entry Lines</h3>
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
                    {journalEntry.lines.map((line: any) => (
                      <tr key={line.id} className="border-b">
                        <td className="px-4 py-2">
                          <Link
                            href={`/accounts/${line.accountId}`}
                            className="text-primary hover:underline"
                          >
                            {line.account.name}
                          </Link>
                        </td>
                        <td className="px-4 py-2">{line.account.type}</td>
                        <td className="px-4 py-2 text-right">
                          {line.debit > 0 ? `$${line.debit.toFixed(2)}` : ""}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {line.credit > 0 ? `$${line.credit.toFixed(2)}` : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t">
          <div className="w-full flex justify-between">
            <div>
              <span className="text-sm text-muted-foreground">
                Total Debits:
              </span>{" "}
              <span className="font-medium">
                $
                {journalEntry.lines
                  .reduce((sum: any, line: any) => sum + line.debit, 0)
                  .toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">
                Total Credits:
              </span>{" "}
              <span className="font-medium">
                $
                {journalEntry.lines
                  .reduce((sum: any, line: any) => sum + line.credit, 0)
                  .toFixed(2)}
              </span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
