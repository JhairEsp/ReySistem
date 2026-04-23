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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6 lg:p-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Control de Asistencias
          </h1>
          <p className="text-lg text-slate-600 mt-2">
            Registra y monitorea la asistencia diaria de tu personal
          </p>
        </div>

      <div className="grid gap-6 md:gap-8">
        <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border-0">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Selecciona una fecha</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="outline" size="icon" onClick={() => changeDate(-1)} className="hover:bg-blue-100">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-4 py-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-auto border-0 bg-transparent font-semibold text-slate-900 p-0"
                  />
                </div>
                <Button variant="outline" size="icon" onClick={() => changeDate(1)} className="hover:bg-blue-100">
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
                  className="hover:bg-blue-100 hover:text-blue-600 font-semibold"
                >
                  Hoy
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:gap-6">
              <div className="flex items-center gap-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-600">
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-700">{presentCount}</p>
                  <p className="text-sm font-medium text-green-600">Presentes</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600">
                  <UserX className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-700">{absentCount}</p>
                  <p className="text-sm font-medium text-red-600">Ausentes</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      <Card className="border-0 shadow-md">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
          <CardTitle className="text-2xl capitalize text-slate-900">{formatDate(selectedDate)}</CardTitle>
          <CardDescription className="text-base mt-2">
            Registra la asistencia de cada miembro del personal para este día
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
            <div className="space-y-4">
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-100 hover:bg-slate-100">
                      <TableHead className="font-semibold">Obrero</TableHead>
                      <TableHead className="text-center font-semibold">Estado</TableHead>
                      <TableHead className="text-center font-semibold">Marcar</TableHead>
                      <TableHead className="font-semibold">Observaciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workers.map((worker) => {
                      const att = getAttendanceForWorker(worker.id)
                      const isLoading = saving === worker.id

                      return (
                        <TableRow key={worker.id} className="hover:bg-slate-50 border-b">
                          <TableCell className="font-semibold text-slate-900">
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
                                    : "bg-red-100 text-red-800 hover:bg-red-100"
                                }
                              >
                                {att.status === "present" ? "Presente" : "Ausente"}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-slate-600">Sin marcar</Badge>
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
                                    : "hover:bg-green-100"
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
                                className={
                                  att?.status !== "absent"
                                    ? "hover:bg-red-100"
                                    : ""
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
                                className="text-blue-600 hover:bg-blue-100"
                              >
                                {att.notes ? att.notes.substring(0, 30) + (att.notes.length > 30 ? "..." : "") : "Agregar nota"}
                              </Button>
                            ) : (
                              <span className="text-slate-400 text-sm">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="md:hidden space-y-3">
                {workers.map((worker) => {
                  const att = getAttendanceForWorker(worker.id)
                  const isLoading = saving === worker.id

                  return (
                    <div key={worker.id} className="bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-slate-900 text-lg">{worker.full_name}</h3>
                          {att ? (
                            <Badge
                              className={
                                att.status === "present"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }
                            >
                              {att.status === "present" ? "Presente" : "Ausente"}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-slate-600">Sin marcar</Badge>
                          )}
                        </div>
                        <div className="flex gap-2 pt-2 border-t">
                          <Button
                            className="flex-1"
                            variant={
                              att?.status === "present" ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              handleMarkAttendance(worker.id, "present")
                            }
                            disabled={isLoading}
                          >
                            {isLoading && att?.status !== "present" ? (
                              <Spinner className="h-4 w-4" />
                            ) : (
                              <Check className="h-4 w-4 mr-1" />
                            )}
                            Presente
                          </Button>
                          <Button
                            className="flex-1"
                            variant={
                              att?.status === "absent" ? "destructive" : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              handleMarkAttendance(worker.id, "absent")
                            }
                            disabled={isLoading}
                          >
                            {isLoading && att?.status !== "absent" ? (
                              <Spinner className="h-4 w-4" />
                            ) : (
                              <X className="h-4 w-4 mr-1" />
                            )}
                            Ausente
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openNotesDialog(worker)}
                            className="hover:bg-blue-100"
                          >
                            Nota
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
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
