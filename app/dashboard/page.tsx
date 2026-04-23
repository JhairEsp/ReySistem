"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Wallet, TrendingUp, TrendingDown, Calendar, DollarSign } from "lucide-react"

export default function DashboardPage() {
  const supabase = createClient()

  const [data, setData] = useState({
    workersCount: 0,
    totalIncome: 0,
    totalExpenses: 0,
    totalPayments: 0,
    balance: 0,
    attendanceCount: 0,
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      // 👷 trabajadores
      const { count: workersCount } = await supabase
        .from("workers")
        .select("*", { count: "exact", head: true })

      // 💰 ingresos / egresos
      const { data: transactions } = await supabase
        .from("transactions")
        .select("type, amount")

      let totalIncome = 0
      let totalExpenses = 0

      transactions?.forEach((t) => {
        if (t.type === "income") totalIncome += Number(t.amount)
        if (t.type === "expense") totalExpenses += Number(t.amount)
      })

      // 💵 pagos
      const { data: payments } = await supabase
        .from("payments")
        .select("amount")

      const totalPayments =
        payments?.reduce((acc, p) => acc + Number(p.amount), 0) || 0

      // 📅 asistencias hoy
      const today = new Date().toISOString().split("T")[0]

      const { count: attendanceCount } = await supabase
        .from("attendance")
        .select("*", { count: "exact", head: true })
        .eq("attendance_date", today)
        .eq("status", "present")

      // 🧠 balance
      const balance = totalIncome - totalExpenses - totalPayments

      setData({
        workersCount: workersCount || 0,
        totalIncome,
        totalExpenses,
        totalPayments,
        balance,
        attendanceCount: attendanceCount || 0,
      })

      setLoading(false)
    }

    fetchData()
  }, [])

  const cards = [
    {
      title: "Total Obreros",
      value: data.workersCount,
      description: "Obreros registrados",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Ingresos",
      value: `S/ ${data.totalIncome.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`,
      description: "Ingresos totales",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Egresos",
      value: `S/ ${data.totalExpenses.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`,
      description: "Egresos totales",
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Pagos Realizados",
      value: `S/ ${data.totalPayments.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`,
      description: "Total en pagos a obreros",
      icon: Wallet,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Balance",
      value: `S/ ${data.balance.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`,
      description: "Ingresos - Egresos - Pagos",
      icon: DollarSign,
      color: data.balance >= 0 ? "text-green-600" : "text-red-600",
      bgColor: data.balance >= 0 ? "bg-green-100" : "bg-red-100",
    },
    {
      title: "Asistencias Hoy",
      value: data.attendanceCount,
      description: "Obreros presentes hoy",
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6 lg:p-8">
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            ReiSystem
          </h1>
          <p className="text-lg text-slate-600">
            Resumen general del sistema de gestión de personal
          </p>
        </div>

        {loading ? (
          <div className="text-center py-10 text-slate-500">
            Cargando datos...
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <Card key={card.title} className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-700">
                    {card.title}
                  </CardTitle>
                  <div className={`rounded-xl p-3 ${card.bgColor}`}>
                    <card.icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-3xl font-bold text-slate-900">
                    {card.value}
                  </div>
                  <CardDescription className="text-slate-600">
                    {card.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
