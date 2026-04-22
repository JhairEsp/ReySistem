"use client"

import { TransactionsPage } from "@/components/transactions-page"
import { TrendingUp } from "lucide-react"

export default function IncomePage() {
  return (
    <TransactionsPage
      type="income"
      title="Ingresos"
      description="Gestiona los ingresos del negocio"
      icon={TrendingUp}
    />
  )
}
