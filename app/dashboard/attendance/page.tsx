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
  work_start_date: string | null
  work_end_date: string | null
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

  const [notesDialog, setNotesDialog] = useState({
    open: false,
    workerId: "",
    workerName: "",
    notes: "",
  })

  const supabase = createClient()

  const fetchData = useCallback(async () => {
    setLoading(true)

    const [workersRes, attendanceRes] = await Promise.all([
      supabase
        .from("workers")
        .select("id, full_name, work_start_date, work_end_date")
        .or(`work_start_date.lte.${selectedDate},work_start_date.is.null`)
        .or(`work_end_date.gte.${selectedDate},work_end_date.is.null`)
        .order("full_name"),

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
          await supabase.from("attendance").delete().eq("id", existing.id)
        } else {
          await supabase
            .from("attendance")
            .update({ status })
            .eq("id", existing.id)
        }
      } else {
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

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="capitalize">
              {formatDate(selectedDate)}
            </CardTitle>
            <CardDescription>
              Registra la asistencia del día
            </CardDescription>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : workers.length === 0 ? (
              <Empty
                icon={Calendar}
                title="No hay trabajadores activos"
                description="No hay personal activo en esta fecha"
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Obrero</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                    <TableHead>Notas</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {workers.map((worker) => {
                    const att = getAttendanceForWorker(worker.id)

                    return (
                      <TableRow key={worker.id}>
                        <TableCell>{worker.full_name}</TableCell>

                        <TableCell>
                          {att ? (
                            <Badge>
                              {att.status === "present"
                                ? "Presente"
                                : "Ausente"}
                            </Badge>
                          ) : (
                            "Sin marcar"
                          )}
                        </TableCell>

                        <TableCell>
                          <Button
                            onClick={() =>
                              handleMarkAttendance(worker.id, "present")
                            }
                          >
                            ✔
                          </Button>

                          <Button
                            onClick={() =>
                              handleMarkAttendance(worker.id, "absent")
                            }
                          >
                            ✖
                          </Button>
                        </TableCell>

                        <TableCell>
                          <Button
                            onClick={() => openNotesDialog(worker)}
                          >
                            Nota
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
