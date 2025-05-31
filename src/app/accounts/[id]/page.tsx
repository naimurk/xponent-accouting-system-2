/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from "next/navigation";
import Link from "next/link";
import { PencilIcon, ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import prisma from "@/lib/prisma";

interface AccountPageProps {
  params: {
    id: string;
  };
}

export default async function AccountPage({ params }: AccountPageProps) {
  const account = await prisma.account.findUnique({
    where: { id: params.id },
    include: {
      entries: {
        include: {
          journalEntry: true,
        },
      },
    },
  });

  if (!account) {
    notFound();
  }

  return (
    <div className="container max-w-4xl py-10">
      <Button variant="outline" asChild className="mb-6">
        <Link href="/accounts">
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Accounts
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{account.name}</CardTitle>
              <CardDescription>Account Type: {account.type}</CardDescription>
            </div>
            <Button asChild>
              <Link href={`/accounts/${account.id}/edit`}>
                <PencilIcon className="mr-2 h-4 w-4" />
                Edit Account
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Account Details</h3>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p>{new Date(account.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p>{new Date(account.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium">Journal Entries</h3>
              {account.entries.length > 0 ? (
                <div className="mt-2 border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-2 text-left">Date</th>
                        <th className="px-4 py-2 text-left">Memo</th>
                        <th className="px-4 py-2 text-right">Debit</th>
                        <th className="px-4 py-2 text-right">Credit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {account.entries.map((entry: any) => (
                        <tr key={entry.id} className="border-b">
                          <td className="px-4 py-2">
                            <Link
                              href={`/journal-entries/${entry.journalEntryId}`}
                              className="text-primary hover:underline"
                            >
                              {new Date(
                                entry.journalEntry.date
                              ).toLocaleDateString()}
                            </Link>
                          </td>
                          <td className="px-4 py-2">
                            {entry.journalEntry.memo || "-"}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {entry.debit > 0
                              ? `$${entry.debit.toFixed(2)}`
                              : ""}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {entry.credit > 0
                              ? `$${entry.credit.toFixed(2)}`
                              : ""}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground mt-2">
                  No journal entries found for this account.
                </p>
              )}
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
                {account.entries
                  .reduce((sum: any, entry: any) => sum + entry.debit, 0)
                  .toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">
                Total Credits:
              </span>{" "}
              <span className="font-medium">
                $
                {account.entries
                  .reduce((sum: any, entry: any) => sum + entry.credit, 0)
                  .toFixed(2)}
              </span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
