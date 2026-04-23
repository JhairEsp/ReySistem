"use client"

import { usePathname } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const pageTitles: Record<string, string> = {
  "/dashboard": "Panel Principal",
  "/dashboard/workers": "Obreros",
  "/dashboard/payments": "Pagos",
  "/dashboard/income": "Ingresos",
  "/dashboard/expenses": "Egresos",
  "/dashboard/attendance": "Asistencias",
}

export function DashboardHeader() {
  const pathname = usePathname()
  const currentTitle = pageTitles[pathname] || "Panel Principal"

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-200 bg-white shadow-sm px-4 md:px-6">
      <SidebarTrigger className="-ml-1 hover:bg-slate-100" />
      <Separator orientation="vertical" className="mr-2 h-4 bg-slate-200" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="/dashboard" className="text-blue-600 hover:text-blue-700 font-semibold">
              ReiSystem
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-semibold text-slate-900">{currentTitle}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  )
}
