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
        start_date: worker.start_date || "",
        end_date: worker.end_date || "",
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
      if (selectedWorker) {
        await supabase
          .from("workers")
          .update(formData)
          .eq("id", selectedWorker.id)
      } else {
        await supabase.from("workers").insert(formData)
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Obreros</h1>
          <p className="text-muted-foreground">
            Gestiona la información de tus obreros
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Obrero
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
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
              <Field>
                <FieldLabel htmlFor="start_date">Hora de Inicio *</FieldLabel>
                <Input
                  id="start_date"
                  type="time"
                  value={formData.start_date || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="end_date">Hora de Fin *</FieldLabel>
                <Input
                  id="end_date"
                  type="time"
                  value={formData.end_date || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                />
              </Field>
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

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Lista de Obreros</CardTitle>
              <CardDescription>
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
                className="pl-9"
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>DNI</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Especialidad</TableHead>
                    <TableHead className="text-right">Pago Acordado</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorkers.map((worker) => (
                    <TableRow key={worker.id}>
                      <TableCell className="font-medium">
                        {worker.full_name}
                      </TableCell>
                      <TableCell>{worker.dni}</TableCell>
                      <TableCell>{worker.phone || "-"}</TableCell>
                      <TableCell>{worker.specialty || "-"}</TableCell>
                      <TableCell className="text-right">
                        S/ {Number(worker.agreed_payment).toFixed(2)}
                      </TableCell>
                      <TableCell className="capitalize">
                        {worker.work_time.replace("_", " ")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(worker)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(worker)}
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
          )}
        </CardContent>
      </Card>

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
