import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { AccountForm } from "@/components/account-form/account-form"

interface EditAccountPageProps {
  params: {
    id: string
  }
}

export default async function EditAccountPage({ params }: EditAccountPageProps) {
  const account = await prisma.account.findUnique({
    where: { id: params.id },
  })

  if (!account) {
    notFound()
  }

  return (
    <div className="container max-w-2xl py-10">
      <h1 className="text-3xl font-bold mb-6">Edit Account</h1>
      <AccountForm initialData={account} />
    </div>
  )
}
