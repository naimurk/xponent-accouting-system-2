/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { PlusCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  const accounts = await prisma.account.findMany({
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });

  // Group accounts by type
  const groupedAccounts = accounts.reduce((acc: any, account: any) => {
    if (!acc[account.type]) {
      acc[account.type] = [];
    }
    acc[account.type].push(account);
    return acc;
  }, {} as Record<string, typeof accounts>);

  // Order of account types
  const typeOrder = ["Asset", "Liability", "Equity", "Revenue", "Expense"];

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Chart of Accounts</h1>
        <Button asChild>
          <Link href="/accounts/new">
            <PlusCircleIcon className="mr-2 h-4 w-4" />
            New Account
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {typeOrder.map(
          (type) =>
            groupedAccounts[type] && (
              <Card key={type}>
                <CardHeader>
                  <CardTitle>{type} Accounts</CardTitle>
                  <CardDescription>
                    {type === "Asset" && "Resources owned by the business"}
                    {type === "Liability" && "Debts owed by the business"}
                    {type === "Equity" && "Owner's interest in the business"}
                    {type === "Revenue" &&
                      "Income earned from business activities"}
                    {type === "Expense" &&
                      "Costs incurred in business operations"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupedAccounts[type].map((account: any) => (
                      <Link
                        key={account.id}
                        href={`/accounts/${account.id}`}
                        className="block p-4 border rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="font-medium">{account.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Created:{" "}
                          {new Date(account.createdAt).toLocaleDateString()}
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
        )}
      </div>
    </div>
  );
}
