"use client"

import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  Building2,
  Users,
  Wallet,
  TrendingUp,
  TrendingDown,
  Calendar,
  LayoutDashboard,
  ChevronUp,
  User,
} from "lucide-react"
import Link from "next/link"

const menuItems = [
  {
    title: "Panel Principal",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Obreros",
    url: "/dashboard/workers",
    icon: Users,
  },
  {
    title: "Pagos",
    url: "/dashboard/payments",
    icon: Wallet,
  },
  {
    title: "Ingresos",
    url: "/dashboard/income",
    icon: TrendingUp,
  },
  {
    title: "Egresos",
    url: "/dashboard/expenses",
    icon: TrendingDown,
  },
  {
    title: "Asistencias",
    url: "/dashboard/attendance",
    icon: Calendar,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-md">
            <span className="text-xl font-bold text-blue-600">R</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white">ReiSystem</span>
            <span className="text-xs text-blue-100">Gestión de Personal</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="w-full">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">Admin</span>
                <span className="text-xs text-muted-foreground">Administrador</span>
              </div>
              <ChevronUp className="ml-auto h-4 w-4" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
