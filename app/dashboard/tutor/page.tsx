"use client"

import { useState, useEffect, useRef } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, Plus, Users, Edit, Trash2 } from "lucide-react"; // Added Edit and Trash2
import { useAuth, type UserProfile } from "../../../hooks/use-auth";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"; // Added AlertDialog components

interface Session {
  id: string | number;
  title: string;
  area: string;
  student?: string;
  date: string;
  time: string;
  location: string;
  description?: string;
  students?: number;
  status?: string;
  course?: { name: string };
  tutor?: { user?: { full_name?: string } };
  studentProfile?: { user?: { full_name?: string } };
  start_time?: string | Date;
  end_time?: string | Date;
  bookingId?: number; // ID del booking asociado
}

export default function TutorDashboardPage() {
  const router = useRouter();
  const { getCurrentUserProfile, loading: authLoading } = useAuth();
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);

  const [upcomingSessionsData, setUpcomingSessionsData] = useState<Session[]>([]);
  const [myTutoringsData, setMyTutoringsData] = useState<Session[]>([]);
  const [availabilityData, setAvailabilityData] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [solicitudesData, setSolicitudesData] = useState<Session[]>([]);
  const [accionEnCurso, setAccionEnCurso] = useState<string | null>(null);
  const [deletingTutoringId, setDeletingTutoringId] = useState<string | number | null>(null);


  const fetchSolicitudesRef = useRef<() => Promise<void>>();
  const fetchUpcomingSessionsRef = useRef<() => Promise<void>>();
  const fetchMyTutoringsRef = useRef<() => Promise<void>>();

  useEffect(() => {
    const fetchProfile = async () => {
      const profile = await getCurrentUserProfile();
      setCurrentUserProfile(profile);

      if (!profile) {
        toast({
          title: "Autenticación requerida",
          description: "Por favor, inicia sesión para ver tu dashboard.",
          variant: "destructive",
        });
        router.push("/login");
      }
    };
    fetchProfile();
  }, [getCurrentUserProfile, router]);

  useEffect(() => {
    if (currentUserProfile?.tutorProfile?.id) {
      const tutorId = currentUserProfile.tutorProfile.id;
      setLoadingData(true);

      const fetchMyTutorings = async () => {
        try {
          // Fetch all relevant statuses for "Mis Tutorías"
          const statusesToFetch = ["AVAILABLE", "PENDING", "CONFIRMED", "CANCELLED"].map((s) => `status=${s}`).join("&");
          const res = await fetch(`http://localhost:3000/tutorias?tutorId=${tutorId}&${statusesToFetch}`, {
            credentials: "include",
          });
          if (!res.ok) throw new Error("Error al cargar mis tutorías");
          const data = await res.json();
          setMyTutoringsData(
            data.map((item: any) => ({
              id: item.id,
              title: item.title,
              area: item.course?.name || "N/A",
              description: item.description,
              students: item.bookings?.length || 0,
              date: new Date(item.date).toLocaleDateString(),
              time: `${new Date(item.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${new Date(item.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
              location: item.location || "Online",
              status: item.status,
            })),
          );
        } catch (error) {
          console.error("Failed to fetch my tutorings:", error);
          toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
        }
      };
      fetchMyTutoringsRef.current = fetchMyTutorings; // Assign here so it's available for re-fetching

      const fetchSolicitudes = async () => {
        try {
          const res = await fetch(`http://localhost:3000/tutorias?tutorId=${tutorId}&status=PENDING`, {
            credentials: "include",
          });
          if (!res.ok) throw new Error("Error al cargar solicitudes");
          const data = await res.json();
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const solicitudes = data
            .filter((item: any) => {
              const sessionDate = new Date(item.date);
              sessionDate.setHours(0, 0, 0, 0);
              return sessionDate >= today;
            })
            .map((item: any) => ({
              id: item.id,
              title: item.title,
              area: item.course?.name || "N/A",
              student: item.bookings?.[0]?.studentProfile?.user?.full_name || "Estudiante por confirmar",
              date: new Date(item.date).toLocaleDateString(),
              time: `${new Date(item.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${new Date(item.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
              location: item.location || "Online",
              bookingId: item.bookings?.[0]?.id, // Guardamos el ID del booking
            }));
          setSolicitudesData(solicitudes);
        } catch (error) {
          console.error("Failed to fetch solicitudes:", error);
        }
      };
      const fetchUpcomingSessions = async () => {
        try {
          const res = await fetch(
            `http://localhost:3000/tutorias?tutorId=${tutorId}&status=CONFIRMED&status=PENDING&upcoming=true`,
            {
              credentials: "include",
            },
          );
          if (!res.ok) throw new Error("Error al cargar próximas sesiones");
          const data = await res.json();
          const upcoming = data.map((item: any) => ({
            id: item.id,
            title: item.title,
            area: item.course?.name || "N/A",
            student: item.bookings?.[0]?.studentProfile?.user?.full_name || "Estudiante por confirmar",
            date: new Date(item.date).toLocaleDateString(),
            time: `${new Date(item.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${new Date(item.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
            location: item.location || "Online",
          }));
          setUpcomingSessionsData(upcoming);
        } catch (error) {
          console.error("Failed to fetch upcoming sessions:", error);
        }
      };

      const fetchAvailability = async () => {
        if (currentUserProfile?.tutorProfile?.availability) {
          setAvailabilityData(
            currentUserProfile.tutorProfile.availability.map((av: any) => ({
              id: av.id,
              day: av.day_of_week,
              startTime: av.start_time,
              endTime: av.end_time,
              status: "available",
            })),
          );
        }
      };

      fetchSolicitudesRef.current = fetchSolicitudes;
      fetchUpcomingSessionsRef.current = fetchUpcomingSessions;
      // fetchMyTutoringsRef.current is already assigned above

      Promise.all([fetchMyTutorings(), fetchUpcomingSessions(), fetchAvailability(), fetchSolicitudes()]).finally(() =>
        setLoadingData(false),
      );
    } else if (!authLoading && !currentUserProfile) {
      setLoadingData(false);
    }
  }, [currentUserProfile, authLoading]);

  if (authLoading || loadingData || !currentUserProfile) {
    return <div className="container flex h-screen items-center justify-center">Cargando dashboard...</div>;
  }

  const tutorName = currentUserProfile?.user?.full_name || "Tutor";

  // Función para aceptar solicitud (confirma el booking)
  const handleAceptarSolicitud = async (solicitudId: string | number) => {
    setAccionEnCurso(`aceptar-${solicitudId}`);
    try {
      // Llamar al endpoint de confirmación de la tutoría por sessionId
      const response = await fetch(`http://localhost:3000/bookings/session/${solicitudId}/confirm`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorMsg = "No se pudo confirmar la solicitud";
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } catch {
          errorMsg = `Error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMsg);
      }

      // Actualizar las listas después del cambio
      await Promise.all([
        typeof fetchSolicitudesRef.current === "function" ? fetchSolicitudesRef.current() : null,
        typeof fetchUpcomingSessionsRef.current === "function" ? fetchUpcomingSessionsRef.current() : null,
        typeof fetchMyTutoringsRef.current === "function" ? fetchMyTutoringsRef.current() : null,
      ]);

      toast({
        title: "Tutoría confirmada",
        description: "La solicitud ha sido aceptada exitosamente.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error al aceptar solicitud:", error);
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setAccionEnCurso(null);
    }
  };

  // Función para rechazar solicitud (cancela el booking)
  const handleRechazarSolicitud = async (solicitudId: string | number) => {
    setAccionEnCurso(`rechazar-${solicitudId}`);
    try {
      // Llamar al endpoint de cancelación de la tutoría por sessionId
      const response = await fetch(`http://localhost:3000/bookings/session/${solicitudId}/cancel`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status !== 204 && !response.ok) {
        let errorMsg = "No se pudo cancelar la solicitud";
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } catch {
          errorMsg = `Error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMsg);
      }

      // Actualizar las listas después del cambio
      await Promise.all([
        typeof fetchSolicitudesRef.current === "function" ? fetchSolicitudesRef.current() : null,
        typeof fetchUpcomingSessionsRef.current === "function" ? fetchUpcomingSessionsRef.current() : null,
        typeof fetchMyTutoringsRef.current === "function" ? fetchMyTutoringsRef.current() : null,
      ]);

      toast({
        title: "Solicitud rechazada",
        description: "La solicitud ha sido rechazada exitosamente.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error al rechazar solicitud:", error);
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setAccionEnCurso(null);
    }
  };

  const handleDeleteTutoring = async (tutoringId: string | number) => {
    setDeletingTutoringId(tutoringId); // Indicate which tutoring is being deleted for UI feedback
    try {
      const response = await fetch(`http://localhost:3000/tutorias/${tutoringId}`, {
        method: "DELETE",
        credentials: "include", // Important for sending auth cookies
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Error ${response.status}` }));
        throw new Error(errorData.message || "No se pudo eliminar la tutoría.");
      }

      toast({
        title: "Tutoría Eliminada",
        description: "La tutoría ha sido eliminada exitosamente.",
      });
      // Re-fetch "Mis Tutorías" to update the list
      if (fetchMyTutoringsRef.current) {
        await fetchMyTutoringsRef.current();
      }
    } catch (error) {
      console.error("Error al eliminar la tutoría:", error);
      toast({
        title: "Error al Eliminar",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setDeletingTutoringId(null);
    }
  };


  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <span className="text-xl font-bold text-sky-600 cursor-default select-none">LINKUDP</span>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link href="/tutoring" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Explorar
            </Link>
            <Link href="/calendar" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Calendario
            </Link>
            <Link href="/dashboard/tutor" className="text-sm font-medium text-foreground">
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
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-sky-700">Dashboard de Tutor</h1>
              <p className="text-muted-foreground">Bienvenido, {tutorName}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/tutoring/create">
                <Button className="bg-sky-600 hover:bg-sky-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Tutoría
                </Button>
              </Link>
            </div>
          </div>

          <Tabs defaultValue="upcoming" className="mt-8">
            <TabsList className="grid w-full grid-cols-4 md:w-auto">
              <TabsTrigger value="upcoming">Próximas Sesiones</TabsTrigger>
              <TabsTrigger value="solicitudes">Solicitudes</TabsTrigger>
              <TabsTrigger value="mytutorings">Mis Tutorías</TabsTrigger>
              <TabsTrigger value="availability">Disponibilidad</TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming" className="mt-4">
              {upcomingSessionsData.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {upcomingSessionsData.map((session) => (
                    <Card key={session.id} className="h-full overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-medium">{session.title}</CardTitle>
                          <Badge variant="outline" className="bg-sky-50 text-sky-700">
                            {session.area}
                          </Badge>
                        </div>
                        <CardDescription className="flex items-center gap-1 text-xs">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback>{session.student?.charAt(0) || "E"}</AvatarFallback>
                          </Avatar>
                          Estudiante: {session.student || "No asignado"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-sky-600" />
                            <span>{session.date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-sky-600" />
                            <span>{session.time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-sky-600" />
                            <span>{session.location}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full" onClick={() => router.push(`/tutoring/${session.id}`)}>
                          Ver detalles
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 text-xl font-medium">No tienes sesiones programadas</h3>
                    <p className="mb-4 text-muted-foreground">
                      Las sesiones confirmadas o pendientes con estudiantes aparecerán aquí.
                    </p>
                    <Link href="/tutoring/create">
                      <Button className="bg-sky-600 hover:bg-sky-700">Crear Tutoría</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            <TabsContent value="solicitudes" className="mt-4">
              {solicitudesData.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {solicitudesData.map((solicitud) => (
                    <Card key={solicitud.id} className="h-full overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-medium">{solicitud.title}</CardTitle>
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                            {solicitud.area}
                          </Badge>
                        </div>
                        <CardDescription className="flex items-center gap-1 text-xs">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback>{solicitud.student?.charAt(0) || "E"}</AvatarFallback>
                          </Avatar>
                          Solicitado por: {solicitud.student}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-yellow-600" />
                            <span>{solicitud.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-yellow-600" />
                            <span>{solicitud.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-yellow-600" />
                            <span>{solicitud.location}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <div className="flex w-full gap-2">
                          <Button
                            variant="default"
                            className="w-1/2 bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleAceptarSolicitud(solicitud.id)}
                            disabled={accionEnCurso !== null}
                          >
                            {accionEnCurso === `aceptar-${solicitud.id}` ? "Aceptando..." : "Aceptar"}
                          </Button>
                          <Button
                            variant="outline"
                            className="w-1/2 border-red-500 text-red-600 hover:bg-red-50"
                            onClick={() => handleRechazarSolicitud(solicitud.id)}
                            disabled={accionEnCurso !== null}
                          >
                            {accionEnCurso === `rechazar-${solicitud.id}` ? "Rechazando..." : "Rechazar"}
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <Users className="mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 text-xl font-medium">No tienes solicitudes pendientes</h3>
                    <p className="mb-4 text-muted-foreground">
                      Cuando un estudiante solicite una tutoría, aparecerá aquí.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="mytutorings" className="mt-4">
              {myTutoringsData.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {myTutoringsData.map((tutoring) => (
                    <Card key={tutoring.id} className="h-full overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-medium">{tutoring.title}</CardTitle>
                          <Badge variant="outline" className="bg-sky-50 text-sky-700">
                            {tutoring.area}
                          </Badge>
                        </div>
                        <CardDescription className="flex items-center gap-1 text-xs">
                          <Users className="h-3 w-3" /> {tutoring.students} estudiantes interesados/inscritos
                        </CardDescription>
                        <Badge
                          variant={
                            tutoring.status === "AVAILABLE"
                              ? "secondary"
                              : tutoring.status === "CONFIRMED"
                                ? "default"
                                : "outline"
                          }
                          className="mt-1"
                        >
                          {tutoring.status}
                        </Badge>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2">{tutoring.description}</p>
                        <div className="mt-2 grid gap-1 text-xs">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-sky-600" />
                            <span>{tutoring.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-sky-600" />
                            <span>{tutoring.time}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex gap-2">
                        <Button variant="outline" className="flex-1" onClick={() => router.push(`/tutoring/${tutoring.id}/edit`)}>
                          <Edit className="mr-2 h-4 w-4" /> Editar
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" className="flex-1 border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700" disabled={deletingTutoringId === tutoring.id}>
                              {deletingTutoringId === tutoring.id ? (<><Clock className="mr-2 h-4 w-4 animate-spin" /> Eliminando...</>) : (<><Trash2 className="mr-2 h-4 w-4" /> Eliminar</>)}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Esto eliminará permanentemente la tutoría.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteTutoring(tutoring.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Sí, eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 text-xl font-medium">No has creado tutorías</h3>
                    <p className="mb-4 text-muted-foreground">
                      Crea tutorías para que los estudiantes puedan encontrarlas y agendar sesiones contigo.
                    </p>
                  </CardContent>
                </Card>
              )}
              <div className="mt-4 flex justify-center">
                <Link href="/tutoring/create">
                  <Button className="bg-sky-600 hover:bg-sky-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Nueva Tutoría
                  </Button>
                </Link>
              </div>
            </TabsContent>
            <TabsContent value="availability" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tu disponibilidad</CardTitle>
                  <CardDescription>Establece los horarios en los que puedes ofrecer tutorías</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {availabilityData.length > 0 ? (
                      availabilityData.map((slot) => (
                        <div key={slot.id} className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <p className="font-medium">{slot.day}</p>
                            <p className="text-sm text-muted-foreground">
                              {slot.startTime} - {slot.endTime}
                            </p>
                          </div>
                          <Badge variant={slot.status === "available" ? "outline" : "secondary"}>
                            {slot.status === "available" ? "Disponible" : "Reservado"}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No has configurado tu disponibilidad.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas</CardTitle>
                <CardDescription>Resumen de tu actividad como tutor</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-sm text-muted-foreground">Tutorías creadas</p>
                    <p className="text-2xl font-bold text-sky-700">{myTutoringsData.length}</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-sm text-muted-foreground">Sesiones Próximas</p>
                    <p className="text-2xl font-bold text-sky-700">{upcomingSessionsData.length}</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-sm text-muted-foreground">Estudiantes ayudados</p>
                    <p className="text-2xl font-bold text-sky-700">0</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-sm text-muted-foreground">Calificación promedio</p>
                    <p className="text-2xl font-bold text-sky-700">
                      {currentUserProfile?.tutorProfile?.average_rating || "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cursos que enseñas</CardTitle>
                <CardDescription>Materias en las que ofreces tutorías</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {currentUserProfile?.tutorProfile?.courses && currentUserProfile.tutorProfile.courses.length > 0 ? (
                    currentUserProfile.tutorProfile.courses.map((course) => (
                      <Badge key={course.courseId} className="bg-sky-100 text-sky-800 hover:bg-sky-200">
                        {course.courseName}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No has añadido cursos a tu perfil.</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/profile/tutor">
                  <Button variant="outline" size="sm">
                    Editar cursos
                  </Button>
                </Link>
              </CardFooter>
            </Card>
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
  );
}
