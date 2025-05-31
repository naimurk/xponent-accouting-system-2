import { z } from "zod"

// Account validation schema
export const accountSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  type: z.enum(["Asset", "Liability", "Equity", "Expense", "Revenue"], {
    errorMap: () => ({ message: "Invalid account type" }),
  }),
})

export type AccountFormData = z.infer<typeof accountSchema>

// Journal Entry Line validation schema
export const journalEntryLineSchema = z
  .object({
    accountId: z.string().min(1, "Account is required"),
    debit: z.number().min(0, "Debit must be a positive number"),
    credit: z.number().min(0, "Credit must be a positive number"),
  })
  .refine((data) => (data.debit === 0) !== (data.credit === 0), {
    message: "Either debit or credit must be specified, but not both",
    path: ["debit"],
  })

// Journal Entry validation schema
export const journalEntrySchema = z
  .object({
    date: z.date(),
    memo: z.string().optional(),
    lines: z.array(journalEntryLineSchema).min(2, "At least two lines are required"),
  })
  .refine(
    (data) => {
      const totalDebit = data.lines.reduce((sum, line) => sum + line.debit, 0)
      const totalCredit = data.lines.reduce((sum, line) => sum + line.credit, 0)
      return Math.abs(totalDebit - totalCredit) < 0.001 // Allow for floating point imprecision
    },
    {
      message: "Total debit must equal total credit",
      path: ["lines"],
    },
  )

export type JournalEntryFormData = z.infer<typeof journalEntrySchema>
