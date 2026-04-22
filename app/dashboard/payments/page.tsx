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
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { Empty } from "@/components/ui/empty"
import { Plus, Pencil, Trash2, Search, Wallet } from "lucide-react"

type Worker = {
  id: string
  full_name: string
}

type Payment = {
  id: string
  worker_id: string
  amount: number
  payment_date: string
  period: string
  series_number: string | null
  voucher_number: string | null
  notes: string | null
  created_at: string
  workers: Worker
}

const emptyPayment = {
  worker_id: "",
  amount: 0,
  payment_date: new Date().toISOString().split("T")[0],
  period: "",
  series_number: "",
  voucher_number: "",
  notes: "",
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [formData, setFormData] = useState(emptyPayment)
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [paymentsRes, workersRes] = await Promise.all([
      supabase
        .from("payments")
        .select("*, workers(id, full_name)")
        .order("payment_date", { ascending: false }),
      supabase.from("workers").select("id, full_name").order("full_name"),
    ])
    setPayments((paymentsRes.data as Payment[]) || [])
    setWorkers(workersRes.data || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredPayments = payments.filter(
    (payment) =>
      payment.workers.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.period.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalAmount = filteredPayments.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  )

  const handleOpenDialog = (payment?: Payment) => {
    if (payment) {
      setSelectedPayment(payment)
      setFormData({
        worker_id: payment.worker_id,
        amount: payment.amount,
        payment_date: payment.payment_date,
        period: payment.period,
        series_number: payment.series_number || "",
        voucher_number: payment.voucher_number || "",
        notes: payment.notes || "",
      })
    } else {
      setSelectedPayment(null)
      setFormData(emptyPayment)
    }
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const dataToSave = {
        ...formData,
        series_number: formData.series_number || null,
        voucher_number: formData.voucher_number || null,
        notes: formData.notes || null,
      }

      if (selectedPayment) {
        await supabase
          .from("payments")
          .update(dataToSave)
          .eq("id", selectedPayment.id)
      } else {
        await supabase.from("payments").insert(dataToSave)
      }
      setDialogOpen(false)
      fetchData()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedPayment) return
    await supabase.from("payments").delete().eq("id", selectedPayment.id)
    setDeleteDialogOpen(false)
    setSelectedPayment(null)
    fetchData()
  }

  const openDeleteDialog = (payment: Payment) => {
    setSelectedPayment(payment)
    setDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pagos</h1>
          <p className="text-muted-foreground">
            Gestiona los pagos realizados a los obreros
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Registrar Pago
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedPayment ? "Editar Pago" : "Nuevo Pago"}
              </DialogTitle>
              <DialogDescription>
                {selectedPayment
                  ? "Modifica los datos del pago"
                  : "Ingresa los datos del nuevo pago"}
              </DialogDescription>
            </DialogHeader>
            <FieldGroup className="py-4">
              <Field>
                <FieldLabel htmlFor="worker">Obrero *</FieldLabel>
                <Select
                  value={formData.worker_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, worker_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un obrero" />
                  </SelectTrigger>
                  <SelectContent>
                    {workers.map((worker) => (
                      <SelectItem key={worker.id} value={worker.id}>
                        {worker.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="amount">Monto *</FieldLabel>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0.00"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="payment_date">Fecha *</FieldLabel>
                  <Input
                    id="payment_date"
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) =>
                      setFormData({ ...formData, payment_date: e.target.value })
                    }
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="period">Período *</FieldLabel>
                <Input
                  id="period"
                  value={formData.period}
                  onChange={(e) =>
                    setFormData({ ...formData, period: e.target.value })
                  }
                  placeholder="Ej: Semana 1 - Enero 2024"
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="series_number">N° Serie</FieldLabel>
                  <Input
                    id="series_number"
                    value={formData.series_number}
                    onChange={(e) =>
                      setFormData({ ...formData, series_number: e.target.value })
                    }
                    placeholder="001"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="voucher_number">N° Comprobante</FieldLabel>
                  <Input
                    id="voucher_number"
                    value={formData.voucher_number}
                    onChange={(e) =>
                      setFormData({ ...formData, voucher_number: e.target.value })
                    }
                    placeholder="000001"
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="notes">Observaciones</FieldLabel>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Notas adicionales..."
                  rows={3}
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
              <Button
                onClick={handleSave}
                disabled={saving || !formData.worker_id || !formData.period}
              >
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
              <CardTitle>Historial de Pagos</CardTitle>
              <CardDescription>
                {filteredPayments.length} pago{filteredPayments.length !== 1 ? "s" : ""} -{" "}
                Total: S/ {totalAmount.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por obrero o período..."
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
          ) : filteredPayments.length === 0 ? (
            <Empty
              icon={Wallet}
              title="No hay pagos"
              description={
                searchTerm
                  ? "No se encontraron pagos con ese criterio"
                  : "Comienza registrando tu primer pago"
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Obrero</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Serie/Comprobante</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {new Date(payment.payment_date).toLocaleDateString("es-PE")}
                      </TableCell>
                      <TableCell className="font-medium">
                        {payment.workers.full_name}
                      </TableCell>
                      <TableCell>{payment.period}</TableCell>
                      <TableCell>
                        {payment.series_number && payment.voucher_number
                          ? `${payment.series_number}-${payment.voucher_number}`
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        S/ {Number(payment.amount).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(payment)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(payment)}
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
            <AlertDialogTitle>¿Eliminar pago?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el
              pago de S/ {selectedPayment?.amount.toFixed(2)} a{" "}
              <strong>{selectedPayment?.workers.full_name}</strong>.
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
