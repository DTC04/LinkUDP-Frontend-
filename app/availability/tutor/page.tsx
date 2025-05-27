"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { ChevronLeft } from "lucide-react"

const days = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO']

export default function ManageAvailabilityPage() {
  const { getCurrentUserProfile } = useAuth()
  const router = useRouter()
  const [tutorId, setTutorId] = useState<number | null>(null)
  const [blocks, setBlocks] = useState<any[]>([])
  const [newBlock, setNewBlock] = useState({ day: '', start: '', end: '' })
  const [editingBlockId, setEditingBlockId] = useState<number | null>(null)
  const [editValues, setEditValues] = useState<{ day?: string; start?: string; end?: string }>({})

  const fetchBlocks = async (id: number) => {
    const res = await fetch(`http://localhost:3000/disponibilidad/${id}`)
    const data = await res.json()
    setBlocks(data)
  }

  const init = useCallback(async () => {
    const profile = await getCurrentUserProfile()
    const id = profile?.tutorProfile?.id
    if (id) {
      setTutorId(id)
      fetchBlocks(id)
    } else {
      router.push('/login')
    }
  }, [getCurrentUserProfile, router])

  useEffect(() => {
    init()
  }, [init])

  const handleCreate = async () => {
    if (!tutorId) return
    const res = await fetch('http://localhost:3000/disponibilidad', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tutorId,
        day_of_week: newBlock.day,
        start_time: new Date(`1970-01-01T${newBlock.start}:00`).toISOString(),
        end_time: new Date(`1970-01-01T${newBlock.end}:00`).toISOString()
      })
    })
    if (res.ok) {
      toast({ title: 'Bloque creado correctamente' })
      fetchBlocks(tutorId)
      setNewBlock({ day: '', start: '', end: '' })
    } else {
      toast({ title: 'Error al crear bloque', variant: 'destructive' })
    }
  }

  const handleUpdate = async (id: number) => {
    const block = blocks.find(b => b.id === id)
    if (!block) return

    const res = await fetch(`http://localhost:3000/disponibilidad/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        day_of_week: editValues.day || block.day_of_week,
        start_time: new Date(`1970-01-01T${editValues.start || block.start_time.slice(11, 16)}:00`).toISOString(),
        end_time: new Date(`1970-01-01T${editValues.end || block.end_time.slice(11, 16)}:00`).toISOString()
      }),
    })

    if (res.ok) {
      toast({ title: 'Bloque actualizado' })
      setEditingBlockId(null)
      setEditValues({})
      if (tutorId) fetchBlocks(tutorId)
    } else {
      toast({ title: 'Error al actualizar', variant: 'destructive' })
    }
  }


  const handleDelete = async (id: number) => {
    const res = await fetch(`http://localhost:3000/disponibilidad/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast({ title: 'Bloque eliminado' })
      if (tutorId) fetchBlocks(tutorId)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <span className="text-xl font-bold text-sky-600 cursor-default select-none">LINKUDP</span>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link href="/dashboard/tutor" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Mi Dashboard
            </Link>
            <Link href="/profile/tutor" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Mi Perfil
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="container px-4 py-10 md:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <Link href="/dashboard/tutor">
                <Button variant="ghost" size="icon">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-sky-700">Mi Disponibilidad</h1>
                <p className="text-muted-foreground">Agrega o ajusta tus horarios disponibles para ofrecer tutorías.</p>
              </div>
            </div>
          </div>

          <div className="my-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={newBlock.day} onValueChange={(v) => setNewBlock({ ...newBlock, day: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Día de la semana" />
              </SelectTrigger>
              <SelectContent>
                {days.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input type="time" value={newBlock.start} onChange={(e) => setNewBlock({ ...newBlock, start: e.target.value })} />
            <Input type="time" value={newBlock.end} onChange={(e) => setNewBlock({ ...newBlock, end: e.target.value })} />
            <Button onClick={handleCreate} disabled={!newBlock.day || !newBlock.start || !newBlock.end}>Agregar</Button>
          </div>

          <div className="grid gap-4">
            {blocks.map((block) => (
              <div key={block.id} className="flex items-center justify-between border p-3 rounded-lg">
                {editingBlockId === block.id ? (
                  <div className="flex gap-2 items-center w-full">
                    <Select value={editValues.day || block.day_of_week} onValueChange={(v) => setEditValues((prev) => ({ ...prev, day: v }))}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Día" />
                      </SelectTrigger>
                      <SelectContent>
                        {days.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="time"
                      value={editValues.start || ''}
                      onChange={(e) => setEditValues((prev) => ({ ...prev, start: e.target.value }))}
                      required
                    />
                    <Input
                      type="time"
                      value={editValues.end || ''}
                      onChange={(e) => setEditValues((prev) => ({ ...prev, end: e.target.value }))}
                      required
                    />
                    <Button size="sm" onClick={() => handleUpdate(block.id)}>Guardar</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingBlockId(null)}>Cancelar</Button>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="font-medium">{block.day_of_week}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(block.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                        {new Date(block.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => {
                        setEditingBlockId(block.id)
                        setEditValues({
                          day: block.day_of_week,
                          start: new Date(block.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
                          end: new Date(block.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
                        })
                      }}>Editar</Button>
                      <Button variant="destructive" onClick={() => handleDelete(block.id)}>Eliminar</Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 LINKUDP. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
