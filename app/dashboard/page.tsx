import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Wallet, TrendingUp, TrendingDown, Calendar, DollarSign } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch summary data
  const [
    { count: workersCount },
    { data: transactionsData },
    { data: paymentsData },
    { data: attendanceData },
  ] = await Promise.all([
    supabase.from("workers").select("*", { count: "exact", head: true }),
    supabase.from("transactions").select("type, amount"),
    supabase.from("payments").select("amount"),
    supabase.from("attendance").select("status").eq("status", "present"),
  ])

  const totalIncome = transactionsData
    ?.filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0) || 0

  const totalExpenses = transactionsData
    ?.filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0) || 0

  const totalPayments = paymentsData?.reduce((sum, p) => sum + Number(p.amount), 0) || 0

  const balance = totalIncome - totalExpenses - totalPayments

  const cards = [
    {
      title: "Total Obreros",
      value: workersCount || 0,
      description: "Obreros registrados",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Ingresos",
      value: `S/ ${totalIncome.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`,
      description: "Ingresos totales",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Egresos",
      value: `S/ ${totalExpenses.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`,
      description: "Egresos totales",
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Pagos Realizados",
      value: `S/ ${totalPayments.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`,
      description: "Total en pagos a obreros",
      icon: Wallet,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Balance",
      value: `S/ ${balance.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`,
      description: "Ingresos - Egresos - Pagos",
      icon: DollarSign,
      color: balance >= 0 ? "text-green-600" : "text-red-600",
      bgColor: balance >= 0 ? "bg-green-100" : "bg-red-100",
    },
    {
      title: "Asistencias Hoy",
      value: attendanceData?.length || 0,
      description: "Obreros presentes hoy",
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel Principal</h1>
        <p className="text-muted-foreground">
          Resumen general del sistema de control de obreros
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`rounded-lg p-2 ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <CardDescription>{card.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
