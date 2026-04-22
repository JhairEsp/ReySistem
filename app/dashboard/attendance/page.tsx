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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { Empty } from "@/components/ui/empty"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { Calendar, Check, X, ChevronLeft, ChevronRight, UserCheck, UserX } from "lucide-react"

type Worker = {
  id: string
  full_name: string
}

type Attendance = {
  id: string
  worker_id: string
  attendance_date: string
  status: "present" | "absent"
  notes: string | null
}

export default function AttendancePage() {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  )
  const [notesDialog, setNotesDialog] = useState<{
    open: boolean
    workerId: string
    workerName: string
    notes: string
  }>({ open: false, workerId: "", workerName: "", notes: "" })

  const supabase = createClient()

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [workersRes, attendanceRes] = await Promise.all([
      supabase.from("workers").select("id, full_name").order("full_name"),
      supabase
        .from("attendance")
        .select("*")
        .eq("attendance_date", selectedDate),
    ])
    setWorkers(workersRes.data || [])
    setAttendance(attendanceRes.data || [])
    setLoading(false)
  }, [supabase, selectedDate])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const getAttendanceForWorker = (workerId: string) => {
    return attendance.find((a) => a.worker_id === workerId)
  }

  const handleMarkAttendance = async (
    workerId: string,
    status: "present" | "absent"
  ) => {
    setSaving(workerId)
    try {
      const existing = getAttendanceForWorker(workerId)

      if (existing) {
        if (existing.status === status) {
          // Remove attendance if clicking the same status
          await supabase.from("attendance").delete().eq("id", existing.id)
        } else {
          // Update status
          await supabase
            .from("attendance")
            .update({ status })
            .eq("id", existing.id)
        }
      } else {
        // Create new attendance
        await supabase.from("attendance").insert({
          worker_id: workerId,
          attendance_date: selectedDate,
          status,
        })
      }
      fetchData()
    } finally {
      setSaving(null)
    }
  }

  const handleSaveNotes = async () => {
    const existing = getAttendanceForWorker(notesDialog.workerId)
    if (existing) {
      await supabase
        .from("attendance")
        .update({ notes: notesDialog.notes || null })
        .eq("id", existing.id)
    }
    setNotesDialog({ ...notesDialog, open: false })
    fetchData()
  }

  const openNotesDialog = (worker: Worker) => {
    const att = getAttendanceForWorker(worker.id)
    setNotesDialog({
      open: true,
      workerId: worker.id,
      workerName: worker.full_name,
      notes: att?.notes || "",
    })
  }

  const changeDate = (days: number) => {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() + days)
    setSelectedDate(date.toISOString().split("T")[0])
  }

  const presentCount = attendance.filter((a) => a.status === "present").length
  const absentCount = attendance.filter((a) => a.status === "absent").length

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00")
    return date.toLocaleDateString("es-PE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Asistencias</h1>
        <p className="text-muted-foreground">
          Controla la asistencia diaria de los obreros
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => changeDate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => changeDate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
          >
            Hoy
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
              <UserCheck className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium">{presentCount}</p>
              <p className="text-xs text-muted-foreground">Presentes</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
              <UserX className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium">{absentCount}</p>
              <p className="text-xs text-muted-foreground">Ausentes</p>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="capitalize">{formatDate(selectedDate)}</CardTitle>
          <CardDescription>
            Marca la asistencia de cada obrero para este día
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner className="h-8 w-8" />
            </div>
          ) : workers.length === 0 ? (
            <Empty
              icon={Calendar}
              title="No hay obreros registrados"
              description="Primero debes agregar obreros para controlar su asistencia"
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Obrero</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                    <TableHead className="text-center">Marcar</TableHead>
                    <TableHead>Observaciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workers.map((worker) => {
                    const att = getAttendanceForWorker(worker.id)
                    const isLoading = saving === worker.id

                    return (
                      <TableRow key={worker.id}>
                        <TableCell className="font-medium">
                          {worker.full_name}
                        </TableCell>
                        <TableCell className="text-center">
                          {att ? (
                            <Badge
                              variant={
                                att.status === "present" ? "default" : "destructive"
                              }
                              className={
                                att.status === "present"
                                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                                  : ""
                              }
                            >
                              {att.status === "present" ? "Presente" : "Ausente"}
                            </Badge>
                          ) : (
                            <Badge variant="outline">Sin marcar</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-2">
                            <Button
                              size="icon"
                              variant={
                                att?.status === "present" ? "default" : "outline"
                              }
                              className={
                                att?.status === "present"
                                  ? "bg-green-600 hover:bg-green-700"
                                  : ""
                              }
                              onClick={() =>
                                handleMarkAttendance(worker.id, "present")
                              }
                              disabled={isLoading}
                            >
                              {isLoading && att?.status !== "present" ? (
                                <Spinner className="h-4 w-4" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="icon"
                              variant={
                                att?.status === "absent" ? "destructive" : "outline"
                              }
                              onClick={() =>
                                handleMarkAttendance(worker.id, "absent")
                              }
                              disabled={isLoading}
                            >
                              {isLoading && att?.status !== "absent" ? (
                                <Spinner className="h-4 w-4" />
                              ) : (
                                <X className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          {att ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openNotesDialog(worker)}
                            >
                              {att.notes ? att.notes.substring(0, 30) + (att.notes.length > 30 ? "..." : "") : "Agregar nota"}
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={notesDialog.open}
        onOpenChange={(open) => setNotesDialog({ ...notesDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Observaciones</DialogTitle>
            <DialogDescription>
              Notas para {notesDialog.workerName} - {formatDate(selectedDate)}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="notes">Observaciones</FieldLabel>
              <Textarea
                id="notes"
                value={notesDialog.notes}
                onChange={(e) =>
                  setNotesDialog({ ...notesDialog, notes: e.target.value })
                }
                placeholder="Escribe una nota..."
                rows={4}
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNotesDialog({ ...notesDialog, open: false })}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveNotes}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
