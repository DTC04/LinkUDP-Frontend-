"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TimeSelect } from "@/components/ui/time-select"; // Import TimeSelect
import { ChevronLeft, AlertCircle, Calendar as CalendarIcon, Clock } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useAuth, type UserProfile } from "../../../../hooks/use-auth"; // Adjusted path
import { toast } from "@/components/ui/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parse as parseDateFns } from "date-fns"; // Import parse
import { es } from "date-fns/locale";

interface TutoringSessionData {
  id: string | number;
  title: string;
  description: string;
  date: string | Date; // Can be string initially, then Date
  start_time: string | Date;
  end_time: string | Date;
  location?: string;
  notes?: string;
  courseId: number;
  tutorId: number;
}

interface Course {
  id: number;
  name: string;
}

export default function EditTutoringPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { getCurrentUserProfile, loading: authLoading } = useAuth();
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);

  const [tutoring, setTutoring] = useState<TutoringSessionData | null>(null);
  const [formData, setFormData] = useState<Partial<TutoringSessionData>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPastSession, setIsPastSession] = useState(false); // New state
  const [courses, setCourses] = useState<Course[]>([]); // For potential course selector, though not editable per reqs

  useEffect(() => {
    const fetchProfileAndTutoring = async () => {
      setLoading(true);
      try {
        const profile = await getCurrentUserProfile();
        setCurrentUserProfile(profile);

        if (!profile) {
          toast({ title: "Autenticación Requerida", description: "Por favor, inicia sesión.", variant: "destructive" });
          router.push("/login");
          return;
        }

        if (!params.id) {
          setError("ID de tutoría no encontrado.");
          setLoading(false);
          return;
        }

        const tutoringRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tutorias/${params.id}`, { credentials: "include" });
        if (!tutoringRes.ok) {
          if (tutoringRes.status === 404) throw new Error("Tutoría no encontrada.");
          throw new Error("Error al cargar los datos de la tutoría.");
        }
        const tutoringData: TutoringSessionData = await tutoringRes.json();

        if (tutoringData.tutorId !== profile.tutorProfile?.id) {
          toast({ title: "No Autorizado", description: "No tienes permiso para editar esta tutoría.", variant: "destructive" });
          router.push("/dashboard/tutor");
          return;
        }
        
        const sessionStartTime = new Date(tutoringData.start_time);
        if (sessionStartTime <= new Date()) {
          setIsPastSession(true);
          toast({ title: "Tutoría Pasada", description: "Esta tutoría ya ha ocurrido y no puede ser modificada.", variant: "default", duration: 5000 }); // Changed variant to "default"
        }
        
        setTutoring(tutoringData);
        // Initialize form data with fetched tutoring data
        // Ensure dates are in 'yyyy-MM-dd' and times in 'HH:mm' for input[type=date/time]
        // Use tutoringData.start_time as the primary source for initial date and start time display
        const initialStartTime = new Date(tutoringData.start_time);
        const initialEndTime = new Date(tutoringData.end_time);

        setFormData({
          title: tutoringData.title,
          description: tutoringData.description,
          date: format(initialStartTime, "yyyy-MM-dd"), // Derive date part from start_time
          start_time: format(initialStartTime, "HH:mm"), // Derive time part from start_time
          end_time: format(initialEndTime, "HH:mm"),   // Derive time part from end_time
          location: tutoringData.location || "",
          notes: tutoringData.notes || "",
        });

      } catch (err: any) {
        setError(err.message);
        toast({ title: "Error", description: err.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndTutoring();
  }, [params.id, getCurrentUserProfile, router]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, date: format(date, "yyyy-MM-dd") }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("handleSubmit called. formData:", JSON.stringify(formData), "tutoring:", tutoring ? tutoring.id : "null");

    if (!tutoring || !formData.title || !formData.description || !formData.date || !formData.start_time || !formData.end_time) {
      toast({ title: "Error de Validación", description: "Por favor, completa todos los campos requeridos (Título, Descripción, Fecha, Hora Inicio, Hora Fin).", variant: "destructive" });
      console.log("Validation failed: missing required fields. Title:", formData.title, "Desc:", formData.description, "Date:", formData.date, "Start:", formData.start_time, "End:", formData.end_time);
      return;
    }
    
    console.log("Setting saving to true");
    setSaving(true);
    setError(null);

    const combinedStartTime = new Date(`${formData.date}T${formData.start_time}:00`);
    const combinedEndTime = new Date(`${formData.date}T${formData.end_time}:00`);
    console.log("Combined times: Start:", combinedStartTime.toISOString(), "End:", combinedEndTime.toISOString());

    if (combinedStartTime <= new Date()) {
        toast({ title: "Error de Validación", description: "La fecha y hora de inicio no pueden ser en el pasado.", variant: "destructive" });
        console.log("Validation failed: start time in past.");
        setSaving(false);
        return;
    }
    if (combinedStartTime >= combinedEndTime) {
        toast({ title: "Error de Validación", description: "La hora de inicio debe ser anterior a la hora de finalización.", variant: "destructive" });
        console.log("Validation failed: start time not before end time.");
        setSaving(false);
        return;
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      date: combinedStartTime.toISOString(), 
      start_time: combinedStartTime.toISOString(),
      end_time: combinedEndTime.toISOString(),
      location: formData.location,
      notes: formData.notes,
    };
    console.log("Payload for PATCH:", JSON.stringify(payload));

    try {
      console.log(`Attempting PATCH to ${process.env.NEXT_PUBLIC_BACKEND_URL}/tutorias/${tutoring.id}`);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tutorias/${tutoring.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include", 
      });
      console.log("PATCH response status:", response.status, "ok:", response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Error ${response.status}: ${response.statusText || "No se pudo actualizar la tutoría."}` }));
        console.error("PATCH error data:", errorData);
        throw new Error(errorData.message);
      }

      const responseData = await response.json(); 
      console.log("PATCH success response data:", responseData);
      toast({ title: "Tutoría Actualizada", description: "Los cambios han sido guardados exitosamente." });
      router.push(`/dashboard/tutor`);
    } catch (err: any) {
      console.error("Error in handleSubmit catch block:", err, err.stack);
      setError(err.message);
      toast({ title: "Error al Guardar", description: err.message, variant: "destructive" });
    } finally {
      console.log("Setting saving to false in finally block");
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="container flex min-h-screen items-center justify-center py-10">Cargando editor de tutoría...</div>;
  }

  if (error && !tutoring) { // Show general error if tutoring couldn't be loaded
    return (
      <div className="container flex min-h-screen flex-col items-center justify-center py-10">
        <AlertCircle className="mb-4 h-16 w-16 text-red-500" />
        <h2 className="mb-2 text-2xl font-semibold text-red-600">Error</h2>
        <p className="text-center text-muted-foreground">{error}</p>
        <Button onClick={() => router.back()} className="mt-6">Volver</Button>
      </div>
    );
  }
  
  if (!tutoring) {
     return <div className="container flex min-h-screen items-center justify-center py-10">Tutoría no encontrada o no tienes permiso para editarla.</div>;
  }


  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 container py-10">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-sky-700">Editar Tutoría</CardTitle>
              <CardDescription>Actualiza los detalles de tu tutoría.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                {isPastSession && (
                  <div className="p-4 mb-4 text-sm text-yellow-800 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300" role="alert">
                    <span className="font-medium">Atención:</span> Esta tutoría ya ha ocurrido y no puede ser modificada.
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input id="title" name="title" value={formData.title || ""} onChange={handleChange} required disabled={isPastSession} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea id="description" name="description" value={formData.description || ""} onChange={handleChange} required disabled={isPastSession} />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="date">Fecha</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={`w-full justify-start text-left font-normal ${!formData.date && "text-muted-foreground"}`}
                          disabled={isPastSession}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.date ? format(parseDateFns(formData.date as string, 'yyyy-MM-dd', new Date()), 'PPP', { locale: es }) : <span>Selecciona una fecha</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.date ? parseDateFns(formData.date as string, 'yyyy-MM-dd', new Date()) : undefined}
                          onSelect={handleDateChange}
                          initialFocus
                          locale={es}
                          disabled={isPastSession || ((date) => date < new Date(new Date().setHours(0,0,0,0)))} // Disable past dates in calendar
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Hora de Inicio</Label>
                    <TimeSelect
                      id="start_time"
                      value={formData.start_time as string || ""}
                      onChange={(newTime) => setFormData(prev => ({ ...prev, start_time: newTime }))}
                      disabled={isPastSession}
                      minuteStep={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_time">Hora de Fin</Label>
                    <TimeSelect
                      id="end_time"
                      value={formData.end_time as string || ""}
                      onChange={(newTime) => setFormData(prev => ({ ...prev, end_time: newTime }))}
                      disabled={isPastSession}
                      minuteStep={5}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación (opcional)</Label>
                  <Input id="location" name="location" value={formData.location || ""} onChange={handleChange} disabled={isPastSession} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notas Adicionales (opcional)</Label>
                  <Textarea id="notes" name="notes" value={formData.notes || ""} onChange={handleChange} disabled={isPastSession} />
                </div>
                {error && !isPastSession && <p className="text-sm text-red-600">{error}</p>}
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
                <Button type="submit" className="bg-sky-600 hover:bg-sky-700" disabled={saving || isPastSession}>
                  {saving ? (<><Clock className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>) : "Guardar Cambios"}
                </Button>
              </CardFooter>
            </form>
          </Card>
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
  );
}
