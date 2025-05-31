import { JournalEntryForm } from "@/components/journal-entry-form/journal-entry-form";

export default function NewJournalEntryPage() {
  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-6">Create Journal Entry</h1>
      <JournalEntryForm />
    </div>
  );
}
