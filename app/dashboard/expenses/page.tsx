"use client"

import { TransactionsPage } from "@/components/transactions-page"
import { TrendingDown } from "lucide-react"

export default function ExpensesPage() {
  return (
    <TransactionsPage
      type="expense"
      title="Egresos"
      description="Gestiona los gastos y egresos del negocio"
      icon={TrendingDown}
    />
  )
}
