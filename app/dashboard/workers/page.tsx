"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Empty } from "@/components/ui/empty"
import { Plus, Pencil, Trash2, Search, Users } from "lucide-react"

type Worker = {
  id: string
  full_name: string
  dni: string
  phone: string | null
  bank_account: string | null
  specialty: string | null
  agreed_payment: number
  work_time: string
  start_date: string | null
  end_date: string | null
  payment_days: string | null
  created_at: string
}

const emptyWorker: Omit<Worker, "id" | "created_at"> = {
  full_name: "",
  dni: "",
  phone: "",
  bank_account: "",
  specialty: "",
  agreed_payment: 0,
  work_time: "mensual",
  start_date: "",
  end_date: "",
  payment_days: "",
}

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null)
  const [formData, setFormData] = useState(emptyWorker)
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  const fetchWorkers = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from("workers")
      .select("*")
      .order("full_name")
    setWorkers(data || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchWorkers()
  }, [fetchWorkers])

  const filteredWorkers = workers.filter(
    (worker) =>
      worker.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.dni.includes(searchTerm)
  )

  const handleOpenDialog = (worker?: Worker) => {
    if (worker) {
      setSelectedWorker(worker)
      setFormData({
      full_name: worker.full_name,
      dni: worker.dni,
      phone: worker.phone || "",
      bank_account: worker.bank_account || "",
      specialty: worker.specialty || "",
      agreed_payment: worker.agreed_payment,
      work_time: worker.work_time,
      start_date: worker.work_start_date || "",
      end_date: worker.work_end_date || "",
      payment_days: worker.payment_days || "",
      })
    } else {
      setSelectedWorker(null)
      setFormData(emptyWorker)
    }
    setDialogOpen(true)
  }

  const handleSave = async () => {
  setSaving(true)
  try {
    const payload = {
      full_name: formData.full_name,
      dni: formData.dni,
      phone: formData.phone || null,
      bank_account: formData.bank_account || null,
      specialty: formData.specialty || null,
      agreed_payment: formData.agreed_payment,
      work_time: formData.work_time,
      work_start_date: formData.start_date || null,
      work_end_date: formData.end_date || null,
    }

    if (selectedWorker) {
      await supabase
        .from("workers")
        .update(payload)
        .eq("id", selectedWorker.id)
    } else {
      await supabase.from("workers").insert(payload)
    }

    setDialogOpen(false)
    fetchWorkers()
  } finally {
    setSaving(false)
  }
}

  const handleDelete = async () => {
    if (!selectedWorker) return
    await supabase.from("workers").delete().eq("id", selectedWorker.id)
    setDeleteDialogOpen(false)
    setSelectedWorker(null)
    fetchWorkers()
  }

  const openDeleteDialog = (worker: Worker) => {
    setSelectedWorker(worker)
    setDeleteDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6 lg:p-8">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Gestión de Personal
            </h1>
            <p className="text-lg text-slate-600 mt-2">
              Administra la información de tus obreros y sus períodos de trabajo
            </p>
          </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Personal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedWorker ? "Editar Obrero" : "Nuevo Obrero"}
              </DialogTitle>
              <DialogDescription>
                {selectedWorker
                  ? "Modifica los datos del obrero"
                  : "Ingresa los datos del nuevo obrero"}
              </DialogDescription>
            </DialogHeader>
            <FieldGroup className="py-4">
              <Field>
                <FieldLabel htmlFor="full_name">Nombre Completo *</FieldLabel>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  placeholder="Juan Pérez García"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="dni">DNI *</FieldLabel>
                <Input
                  id="dni"
                  value={formData.dni}
                  onChange={(e) =>
                    setFormData({ ...formData, dni: e.target.value })
                  }
                  placeholder="12345678"
                  maxLength={8}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="phone">Teléfono</FieldLabel>
                <Input
                  id="phone"
                  value={formData.phone || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="999999999"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="bank_account">Cuenta Bancaria</FieldLabel>
                <Input
                  id="bank_account"
                  value={formData.bank_account || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, bank_account: e.target.value })
                  }
                  placeholder="00000000000000000000"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="specialty">Especialidad</FieldLabel>
                <Input
                  id="specialty"
                  value={formData.specialty || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, specialty: e.target.value })
                  }
                  placeholder="Albañil, Electricista, etc."
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="agreed_payment">Pago Acordado *</FieldLabel>
                  <Input
                    id="agreed_payment"
                    type="number"
                    value={formData.agreed_payment}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        agreed_payment: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0.00"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="work_time">Tipo de Pago</FieldLabel>
                  <Select
                    value={formData.work_time}
                    onValueChange={(value) =>
                      setFormData({ ...formData, work_time: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mensual">Mensual</SelectItem>
                      <SelectItem value="semanal">Semanal</SelectItem>
                      <SelectItem value="diario">Diario</SelectItem>
                      <SelectItem value="por_obra">Por Obra</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="start_date">Fecha de Inicio *</FieldLabel>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="end_date">Fecha de Fin *</FieldLabel>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="payment_days">Días de Pago</FieldLabel>
                <Input
                  id="payment_days"
                  value={formData.payment_days || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, payment_days: e.target.value })
                  }
                  placeholder="Ej: Lunes, Miércoles, Viernes"
                />
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Spinner className="mr-2" />
                    Guardando...
                  </>
                ) : (
                  "Guardar"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-2xl">Lista de Personal</CardTitle>
              <CardDescription className="text-base mt-1">
                {workers.length} obrero{workers.length !== 1 ? "s" : ""} registrado
                {workers.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o DNI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 border-slate-300"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner className="h-8 w-8" />
            </div>
          ) : filteredWorkers.length === 0 ? (
            <Empty
              icon={Users}
              title="No hay obreros"
              description={
                searchTerm
                  ? "No se encontraron obreros con ese criterio de búsqueda"
                  : "Comienza agregando tu primer obrero"
              }
            />
          ) : (
            <div className="space-y-4">
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-100 hover:bg-slate-100">
                      <TableHead className="font-semibold">Nombre</TableHead>
                      <TableHead className="font-semibold">DNI</TableHead>
                      <TableHead className="font-semibold hidden lg:table-cell">Teléfono</TableHead>
                      <TableHead className="font-semibold hidden lg:table-cell">Especialidad</TableHead>
                      <TableHead className="font-semibold text-right">Pago</TableHead>
                      <TableHead className="font-semibold hidden sm:table-cell">Tipo</TableHead>
                      <TableHead className="font-semibold text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWorkers.map((worker) => (
                      <TableRow key={worker.id} className="hover:bg-slate-50 border-b">
                        <TableCell className="font-semibold text-slate-900">
                          {worker.full_name}
                        </TableCell>
                        <TableCell className="text-slate-600">{worker.dni}</TableCell>
                        <TableCell className="text-slate-600 hidden lg:table-cell">{worker.phone || "-"}</TableCell>
                        <TableCell className="text-slate-600 hidden lg:table-cell">{worker.specialty || "-"}</TableCell>
                        <TableCell className="text-right font-semibold text-blue-600">
                          S/ {Number(worker.agreed_payment).toFixed(2)}
                        </TableCell>
                        <TableCell className="capitalize text-slate-600 hidden sm:table-cell">
                          {worker.work_time.replace("_", " ")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(worker)}
                              className="hover:bg-blue-100 hover:text-blue-600"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(worker)}
                              className="hover:bg-red-100"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="md:hidden space-y-3">
                {filteredWorkers.map((worker) => (
                  <div key={worker.id} className="bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <h3 className="font-semibold text-slate-900 text-lg">{worker.full_name}</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-slate-500">DNI</p>
                            <p className="font-medium text-slate-700">{worker.dni}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Teléfono</p>
                            <p className="font-medium text-slate-700">{worker.phone || "-"}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Especialidad</p>
                            <p className="font-medium text-slate-700">{worker.specialty || "-"}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Tipo de Pago</p>
                            <p className="font-medium text-slate-700 capitalize">{worker.work_time.replace("_", " ")}</p>
                          </div>
                        </div>
                        <div className="pt-2 border-t">
                          <p className="text-blue-600 font-semibold text-lg">S/ {Number(worker.agreed_payment).toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(worker)}
                          className="hover:bg-blue-100 hover:text-blue-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(worker)}
                          className="hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar obrero?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente a{" "}
              <strong>{selectedWorker?.full_name}</strong> y todos sus registros
              asociados (pagos, asistencias).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
