"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, Plus, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function TutorAvailabilityPage() {
  const [availability, setAvailability] = useState([
    { id: 1, day: "Lunes", startTime: "10:00", endTime: "12:00", status: "available" },
    { id: 2, day: "Martes", startTime: "15:00", endTime: "17:00", status: "booked" },
    { id: 3, day: "Jueves", startTime: "14:00", endTime: "16:00", status: "available" },
  ])

  const [newSlot, setNewSlot] = useState({
    day: "",
    startTime: "",
    endTime: "",
  })

  const handleNewSlotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewSlot((prev) => ({ ...prev, [name]: value }))
  }

  const handleDayChange = (value: string) => {
    setNewSlot((prev) => ({ ...prev, day: value }))
  }

  const addSlot = () => {
    if (newSlot.day && newSlot.startTime && newSlot.endTime) {
      setAvailability([...availability, { id: Date.now(), ...newSlot, status: "available" }])
      setNewSlot({ day: "", startTime: "", endTime: "" })
    }
  }

  const removeSlot = (id: number) => {
    setAvailability(availability.filter((slot) => slot.id !== id))
  }

  const saveAvailability = () => {
    console.log("Disponibilidad guardada:", availability)
    // Aquí iría la lógica para guardar en la base de datos
  }

  return (
    <div className="container py-10">
      <div className="mb-6 flex items-center">
        <Link href="/dashboard/tutor" className="mr-4">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-sky-700">Gestionar disponibilidad</h1>
      </div>

      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Horarios disponibles</CardTitle>
          <CardDescription>Establece los horarios en los que puedes ofrecer tutorías</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            {availability.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">{slot.day}</p>
                  <p className="text-sm text-muted-foreground">
                    {slot.startTime} - {slot.endTime}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={slot.status === "available" ? "outline" : "secondary"} className="mr-2">
                    {slot.status === "available" ? "Disponible" : "Reservado"}
                  </Badge>
                  {slot.status === "available" && (
                    <Button variant="ghost" size="icon" onClick={() => removeSlot(slot.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-4 rounded-lg border p-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="day">Día</Label>
                <Select onValueChange={handleDayChange}>
                  <SelectTrigger id="day">
                    <SelectValue placeholder="Seleccionar día" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lunes">Lunes</SelectItem>
                    <SelectItem value="Martes">Martes</SelectItem>
                    <SelectItem value="Miércoles">Miércoles</SelectItem>
                    <SelectItem value="Jueves">Jueves</SelectItem>
                    <SelectItem value="Viernes">Viernes</SelectItem>
                    <SelectItem value="Sábado">Sábado</SelectItem>
                    <SelectItem value="Domingo">Domingo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="startTime">Hora inicio</Label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="time"
                  value={newSlot.startTime}
                  onChange={handleNewSlotChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime">Hora fin</Label>
                <Input id="endTime" name="endTime" type="time" value={newSlot.endTime} onChange={handleNewSlotChange} />
              </div>
            </div>
            <Button type="button" onClick={addSlot} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Horario
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={saveAvailability} className="w-full bg-sky-600 hover:bg-sky-700">
            Guardar Cambios
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
