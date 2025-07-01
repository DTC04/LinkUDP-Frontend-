"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { ChevronLeft, Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { TimeSelect } from "@/components/ui/time-select";
import { format, parse as parseDateFns } from "date-fns";
import { es } from "date-fns/locale";
import { formatDateUTC } from "@/lib/utils";
// import { StarRating } from "@/components/ui/star-rating";

const daysMap = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

const formatTimeLocal = (iso: string) => {
  const d = new Date(iso)
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

const formatDateLocal = (iso: string) => {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function ManageAvailabilityPage() {
  const { getCurrentUserProfile } = useAuth();
  const router = useRouter();
  const [tutorId, setTutorId] = useState<number | null>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [newBlock, setNewBlock] = useState({ date: '', start: '', end: '' });
  const [editingBlockId, setEditingBlockId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{ date?: string; start?: string; end?: string }>({});
  const [isFinished, setIsFinished] = useState(false);

  const fetchBlocks = async (id: number) => {
    const res = await fetch(`http://localhost:3000/disponibilidad/${id}`, { credentials: 'include' });
    const data = await res.json();
    setBlocks(data);
  };

  const init = useCallback(async () => {
    const profile = await getCurrentUserProfile();
    const id = profile?.tutorProfile?.id;
    if (id) {
      setTutorId(id);
      fetchBlocks(id);
    } else {
      router.push('/login');
    }
  }, [getCurrentUserProfile, router]);

  useEffect(() => {
    init();
  }, [init]);

  const handleCreate = async () => {
    if (!tutorId) return;
    const start = new Date(`${newBlock.date}T${newBlock.start}:00`);
    const end = new Date(`${newBlock.date}T${newBlock.end}:00`);
    const day_of_week = daysMap[start.getUTCDay()];

    const res = await fetch('http://localhost:3000/disponibilidad', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tutorId,
        day_of_week,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
      })
    });
    if (res.ok) {
      toast({ title: 'Bloque creado correctamente' });
      fetchBlocks(tutorId);
      setNewBlock({ date: '', start: '', end: '' });
    } else {
      toast({ title: 'Error al crear bloque', variant: 'destructive' });
    }
  };

  const handleUpdate = async (id: number) => {
    const block = blocks.find(b => b.id === id);
    if (!block) return;

    const date = editValues.date || formatDateLocal(block.start_time);
    const start = new Date(`${date}T${editValues.start || formatTimeLocal(block.start_time)}:00`);
    const end = new Date(`${date}T${editValues.end || formatTimeLocal(block.end_time)}:00`);
    const day_of_week = daysMap[start.getUTCDay()];

    const res = await fetch(`http://localhost:3000/disponibilidad/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        day_of_week,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
      }),
    });

    if (res.ok) {
      toast({ title: 'Bloque actualizado' });
      setEditingBlockId(null);
      setEditValues({});
      if (tutorId) fetchBlocks(tutorId);
    } else {
      toast({ title: 'Error al actualizar', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`http://localhost:3000/disponibilidad/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (res.ok) {
      toast({ title: 'Bloque eliminado' });
      if (tutorId) fetchBlocks(tutorId);
    }
  };
  return (
    <div className="flex min-h-screen flex-col">
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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${!newBlock.date && 'text-muted-foreground'}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newBlock.date ? format(parseDateFns(newBlock.date, 'yyyy-MM-dd', new Date()), 'PPP', { locale: es }) : <span>Selecciona una fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={newBlock.date ? parseDateFns(newBlock.date, 'yyyy-MM-dd', new Date()) : undefined}
                  onSelect={(date) => date && setNewBlock((prev) => ({ ...prev, date: format(date, 'yyyy-MM-dd') }))}
                  initialFocus
                  locale={es}
                  disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                />
              </PopoverContent>
            </Popover>
            <TimeSelect id="start" value={newBlock.start} onChange={(v) => setNewBlock({ ...newBlock, start: v })} />
            <TimeSelect id="end" value={newBlock.end} onChange={(v) => setNewBlock({ ...newBlock, end: v })} />
            <Button onClick={handleCreate} disabled={!newBlock.date || !newBlock.start || !newBlock.end}>Agregar</Button>
          </div>

          <div className="grid gap-4">
            {blocks.map((block) => (
              <div key={block.id} className="flex items-center justify-between border p-3 rounded-lg">
                {editingBlockId === block.id ? (
                  <div className="flex gap-2 items-center w-full">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-52 justify-start text-left font-normal ${!(editValues.date || block.start_time) && 'text-muted-foreground'}`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {(editValues.date || block.start_time) ? format(parseDateFns(editValues.date || formatDateLocal(block.start_time), 'yyyy-MM-dd', new Date()), 'PPP', { locale: es }) : <span>Selecciona una fecha</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={parseDateFns(editValues.date || formatDateLocal(block.start_time), 'yyyy-MM-dd', new Date())}
                          onSelect={(date) => date && setEditValues((prev) => ({ ...prev, date: format(date, 'yyyy-MM-dd') }))}
                          initialFocus
                          locale={es}
                          disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                        />
                      </PopoverContent>
                    </Popover>
                    <TimeSelect id="edit-start" value={editValues.start || formatTimeLocal(block.start_time)} onChange={(v) => setEditValues((prev) => ({ ...prev, start: v }))} />
                    <TimeSelect id="edit-end" value={editValues.end || formatTimeLocal(block.end_time)} onChange={(v) => setEditValues((prev) => ({ ...prev, end: v }))} />
                    <div className="ml-auto flex gap-2">
                      <Button size="sm" onClick={() => handleUpdate(block.id)}>Guardar</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingBlockId(null)}>Cancelar</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="font-medium">{formatDateUTC(block.start_time)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(block.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                        {new Date(block.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => {
                        setEditingBlockId(block.id)
                        setEditValues({
                          date: formatDateLocal(block.start_time),
                          start: formatTimeLocal(block.start_time),
                          end: formatTimeLocal(block.end_time),
                        })
                      }}>Editar</Button>
                      <Button variant="destructive" onClick={() => handleDelete(block.id)}>Eliminar</Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* StarRating component removed due to missing module */}
          {isFinished ? (
            <div className="flex items-center gap-2">
              <span>¡Has finalizado!</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>Solo disponible al finalizar</span>
            </div>
          )}
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
