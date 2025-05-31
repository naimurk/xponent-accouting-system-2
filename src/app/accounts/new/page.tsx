import { AccountForm } from "@/components/account-form/account-form";

export default function NewAccountPage() {
  return (
    <div className="container max-w-2xl py-10">
      <h1 className="text-3xl font-bold mb-6">Create New Account</h1>
      <AccountForm />
    </div>
  );
}
