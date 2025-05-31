/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { ArrowRightIcon, BarChart3Icon, BookOpenIcon } from "lucide-react";

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

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Get counts
  const accountCount = await prisma.account.count();
  const journalEntryCount = await prisma.journalEntry.count();

  // Get recent journal entries
  const recentEntries = await prisma.journalEntry.findMany({
    take: 5,
    orderBy: { date: "desc" },
    include: {
      lines: {
        include: {
          account: true,
        },
      },
    },
  });

  return (
    <div className="container py-10">
      <h1 className="text-4xl font-bold mb-2">Accounting System</h1>
      <p className="text-muted-foreground mb-8">
        Manage your chart of accounts and journal entries
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Chart of Accounts
            </CardTitle>
            <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accountCount} Accounts</div>
            <p className="text-xs text-muted-foreground">
              Manage your asset, liability, equity, revenue, and expense
              accounts
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/accounts">
                View Accounts
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Journal Entries
            </CardTitle>
            <BarChart3Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {journalEntryCount} Entries
            </div>
            <p className="text-xs text-muted-foreground">
              Record financial transactions with balanced debits and credits
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/journal-entries">
                View Journal Entries
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks to manage your accounting system
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button asChild>
              <Link href="/accounts/new">Create New Account</Link>
            </Button>
            <Button asChild>
              <Link href="/journal-entries/new">Add Journal Entry</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Journal Entries</CardTitle>
          <CardDescription>
            The latest financial transactions recorded in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentEntries.length > 0 ? (
            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Memo</th>
                    <th className="px-4 py-2 text-right">Total Amount</th>
                    <th className="px-4 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEntries.map((entry: any) => {
                    const totalAmount = entry.lines.reduce(
                      (sum: any, line: any) => sum + line.debit,
                      0
                    );

                    return (
                      <tr key={entry.id} className="border-b">
                        <td className="px-4 py-2">
                          {new Date(entry.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2">{entry.memo || "-"}</td>
                        <td className="px-4 py-2 text-right">
                          ${totalAmount.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/journal-entries/${entry.id}`}>
                              View
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No journal entries found.</p>
              <Button asChild className="mt-4">
                <Link href="/journal-entries/new">
                  Create your first journal entry
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
        {recentEntries.length > 0 && (
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/journal-entries">
                View All Journal Entries
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
