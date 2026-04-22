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
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { Empty } from "@/components/ui/empty"
import { Plus, Pencil, Trash2, Search, TrendingUp, TrendingDown, type LucideIcon } from "lucide-react"

type Transaction = {
  id: string
  type: "income" | "expense"
  amount: number
  description: string
  category: string | null
  transaction_date: string
  created_at: string
}

type TransactionsPageProps = {
  type: "income" | "expense"
  title: string
  description: string
  icon: LucideIcon
}

export function TransactionsPage({ type, title, description, icon: Icon }: TransactionsPageProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [formData, setFormData] = useState({
    amount: 0,
    description: "",
    category: "",
    transaction_date: new Date().toISOString().split("T")[0],
  })
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("type", type)
      .order("transaction_date", { ascending: false })
    setTransactions(data || [])
    setLoading(false)
  }, [supabase, type])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const filteredTransactions = transactions.filter(
    (t) =>
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.category && t.category.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const totalAmount = filteredTransactions.reduce(
    (sum, t) => sum + Number(t.amount),
    0
  )

  const handleOpenDialog = (transaction?: Transaction) => {
    if (transaction) {
      setSelectedTransaction(transaction)
      setFormData({
        amount: transaction.amount,
        description: transaction.description,
        category: transaction.category || "",
        transaction_date: transaction.transaction_date,
      })
    } else {
      setSelectedTransaction(null)
      setFormData({
        amount: 0,
        description: "",
        category: "",
        transaction_date: new Date().toISOString().split("T")[0],
      })
    }
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const dataToSave = {
        type,
        amount: formData.amount,
        description: formData.description,
        category: formData.category || null,
        transaction_date: formData.transaction_date,
      }

      if (selectedTransaction) {
        await supabase
          .from("transactions")
          .update(dataToSave)
          .eq("id", selectedTransaction.id)
      } else {
        await supabase.from("transactions").insert(dataToSave)
      }
      setDialogOpen(false)
      fetchTransactions()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedTransaction) return
    await supabase.from("transactions").delete().eq("id", selectedTransaction.id)
    setDeleteDialogOpen(false)
    setSelectedTransaction(null)
    fetchTransactions()
  }

  const openDeleteDialog = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setDeleteDialogOpen(true)
  }

  const typeLabel = type === "income" ? "ingreso" : "egreso"
  const typeLabelPlural = type === "income" ? "ingresos" : "egresos"

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Registrar {type === "income" ? "Ingreso" : "Egreso"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedTransaction ? `Editar ${typeLabel}` : `Nuevo ${typeLabel}`}
              </DialogTitle>
              <DialogDescription>
                {selectedTransaction
                  ? `Modifica los datos del ${typeLabel}`
                  : `Ingresa los datos del nuevo ${typeLabel}`}
              </DialogDescription>
            </DialogHeader>
            <FieldGroup className="py-4">
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
                  <FieldLabel htmlFor="transaction_date">Fecha *</FieldLabel>
                  <Input
                    id="transaction_date"
                    type="date"
                    value={formData.transaction_date}
                    onChange={(e) =>
                      setFormData({ ...formData, transaction_date: e.target.value })
                    }
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="category">Categoría</FieldLabel>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder={type === "income" ? "Ej: Venta, Servicio" : "Ej: Materiales, Transporte"}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="description">Descripción *</FieldLabel>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder={`Describe el ${typeLabel}...`}
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
                disabled={saving || !formData.description || formData.amount <= 0}
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
              <CardTitle>Historial de {title}</CardTitle>
              <CardDescription>
                {filteredTransactions.length} {filteredTransactions.length === 1 ? typeLabel : typeLabelPlural} -{" "}
                Total: S/ {totalAmount.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
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
          ) : filteredTransactions.length === 0 ? (
            <Empty
              icon={type === "income" ? TrendingUp : TrendingDown}
              title={`No hay ${typeLabelPlural}`}
              description={
                searchTerm
                  ? `No se encontraron ${typeLabelPlural} con ese criterio`
                  : `Comienza registrando tu primer ${typeLabel}`
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {new Date(transaction.transaction_date).toLocaleDateString("es-PE")}
                      </TableCell>
                      <TableCell className="max-w-xs truncate font-medium">
                        {transaction.description}
                      </TableCell>
                      <TableCell>{transaction.category || "-"}</TableCell>
                      <TableCell className={`text-right font-medium ${
                        type === "income" ? "text-green-600" : "text-red-600"
                      }`}>
                        S/ {Number(transaction.amount).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(transaction)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(transaction)}
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
            <AlertDialogTitle>¿Eliminar {typeLabel}?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el {typeLabel}{" "}
              de S/ {selectedTransaction?.amount.toFixed(2)}.
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
