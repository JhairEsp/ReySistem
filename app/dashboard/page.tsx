import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Wallet, TrendingUp, TrendingDown, Calendar, DollarSign } from "lucide-react"

export default function DashboardPage() {
  // Datos de ejemplo mientras se configura la base de datos
  const mockData = {
    workersCount: 0,
    totalIncome: 0,
    totalExpenses: 0,
    totalPayments: 0,
    balance: 0,
    attendanceCount: 0,
  }

  const cards = [
    {
      title: "Total Obreros",
      value: mockData.workersCount,
      description: "Obreros registrados",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Ingresos",
      value: `S/ ${mockData.totalIncome.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`,
      description: "Ingresos totales",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Egresos",
      value: `S/ ${mockData.totalExpenses.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`,
      description: "Egresos totales",
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Pagos Realizados",
      value: `S/ ${mockData.totalPayments.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`,
      description: "Total en pagos a obreros",
      icon: Wallet,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Balance",
      value: `S/ ${mockData.balance.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`,
      description: "Ingresos - Egresos - Pagos",
      icon: DollarSign,
      color: mockData.balance >= 0 ? "text-green-600" : "text-red-600",
      bgColor: mockData.balance >= 0 ? "bg-green-100" : "bg-red-100",
    },
    {
      title: "Asistencias Hoy",
      value: mockData.attendanceCount,
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

        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Card key={card.title} className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-slate-700">{card.title}</CardTitle>
                <div className={`rounded-xl p-3 ${card.bgColor}`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-3xl font-bold text-slate-900">{card.value}</div>
                <CardDescription className="text-slate-600">{card.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
