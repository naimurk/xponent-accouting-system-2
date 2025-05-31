/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { CalendarIcon, Trash2Icon, PlusCircleIcon } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { extractZodErrorMessages } from "@/utils/extract-errro-message";

interface Account {
  id: string;
  name: string;
  type: string;
}

export function JournalEntryForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [totalDebit, setTotalDebit] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);

  const form = useForm({
    // resolver: zodResolver(journalEntrySchema),
    defaultValues: {
      date: new Date(),
      memo: "",
      lines: [
        { accountId: "", debit: 0, credit: 0 },
        { accountId: "", debit: 0, credit: 0 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  });

  // Fetch accounts
  useEffect(() => {
    async function fetchAccounts() {
      try {
        const response = await fetch("/api/accounts");
        if (!response.ok) {
          throw new Error("Failed to fetch accounts");
        }
        const data = await response.json();
        setAccounts(data);
      } catch (error) {
        toast.error("Failed to load accounts");
        console.error(error);
      }
    }

    fetchAccounts();
  }, []);

  // Calculate totals when form values change
  useEffect(() => {
    const values = form.getValues();
    const newTotalDebit = values.lines.reduce(
      (sum, line) =>
        sum +
        (typeof line.debit === "number" ? line.debit : Number(line.debit) || 0),
      0
    );
    const newTotalCredit = values.lines.reduce(
      (sum, line) =>
        sum +
        (typeof line.credit === "number"
          ? line.credit
          : Number(line.credit) || 0),
      0
    );

    setTotalDebit(newTotalDebit);
    setTotalCredit(newTotalCredit);
  }, [form.watch("lines")]);

  async function onSubmit(data: any) {
    setIsLoading(true);
    try {
      // Convert string values to numbers for debit and credit
      const formattedData = {
        ...data,
        lines: data.lines.map((line: any) => ({
          ...line,
          debit: Number(line.debit) || 0,
          credit: Number(line.credit) || 0,
        })),
      };

      const response = await fetch("/api/journal-entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const formattedErrorMessages = extractZodErrorMessages(
          errorData?.error
        );

        // Show each error message using toast
        if (formattedErrorMessages.length > 0) {
          formattedErrorMessages.forEach((msg) => toast.error(msg));
        } else {
          toast.error("Something went wrong");
        }

        throw new Error("Validation errors");
      }

      toast.success("Journal entry created");
      router.refresh();
      router.push("/journal-entries");
    } catch (error) {
      console.log(error);
      if (error instanceof Error && error.message === "Validation errors") {
        // Already handled above with multiple toasts
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setIsLoading(false);
    }
  }

  function addLine() {
    append({ accountId: "", debit: 0, credit: 0 });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className="w-full pl-3 text-left font-normal"
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="memo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Memo</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter description or reference"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-4 font-medium">
                <div className="col-span-5">Account</div>
                <div className="col-span-3 text-right">Debit</div>
                <div className="col-span-3 text-right">Credit</div>
                <div className="col-span-1"></div>
              </div>

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-12 gap-4 items-center"
                >
                  <div className="col-span-5">
                    <FormField
                      control={form.control}
                      name={`lines.${index}.accountId`}
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select account" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {accounts.map((account) => (
                                <SelectItem key={account.id} value={account.id}>
                                  {account.name} ({account.type})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-3">
                    <FormField
                      control={form.control}
                      name={`lines.${index}.debit`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              className="text-right"
                              {...field}
                              onChange={(e) => {
                                const numericValue =
                                  e.target.value === ""
                                    ? 0
                                    : Number(e.target.value);
                                field.onChange(numericValue);
                                if (numericValue > 0) {
                                  // Clear credit when debit has a value
                                  form.setValue(`lines.${index}.credit`, 0);
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-3">
                    <FormField
                      control={form.control}
                      name={`lines.${index}.credit`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              className="text-right"
                              {...field}
                              onChange={(e) => {
                                const numericValue =
                                  e.target.value === ""
                                    ? 0
                                    : Number(e.target.value);
                                field.onChange(numericValue);
                                if (numericValue > 0) {
                                  // Clear debit when credit has a value
                                  form.setValue(`lines.${index}.debit`, 0);
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-1 flex justify-center">
                    {fields.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={addLine}
              >
                <PlusCircleIcon className="mr-2 h-4 w-4" />
                Add Line
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between border-t p-4">
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <span className="font-medium">Total Debit:</span> $
                {totalDebit.toFixed(2)}
              </div>
              <div>
                <span className="font-medium">Total Credit:</span> $
                {totalCredit.toFixed(2)}
              </div>
            </div>
            <div
              className={`text-sm ${
                Math.abs(totalDebit - totalCredit) < 0.001
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {Math.abs(totalDebit - totalCredit) < 0.001
                ? "Balanced"
                : `Unbalanced: ${Math.abs(totalDebit - totalCredit).toFixed(
                    2
                  )}`}
            </div>
          </CardFooter>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/journal-entries")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Create Journal Entry"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
