"use client"; // Necesario para hooks como useState, useEffect, useRouter

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // AvatarImage añadido
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Users,
  History,
  Activity,
} from "lucide-react"; // Iconos
import React, { useEffect, useState } from "react"; // React importado
import { useRouter } from "next/navigation";
// Definir el tipo DayOfWeek localmente para el frontend
type DayOfWeek =
  | "LUNES"
  | "MARTES"
  | "MIERCOLES"
  | "JUEVES"
  | "VIERNES"
  | "SABADO"
  | "DOMINGO";

// --- Interfaces (Consistentes con la respuesta de /profile/me y DTOs del backend) ---
interface UserBaseData {
  id: number;
  full_name: string;
  email: string;
  role: string;
  photo_url?: string | null;
  email_verified: boolean;
}

interface TutorCourseData {
  // Viene de TutorProfileViewDto -> TutorCourseViewDto
  courseId: number;
  courseName: string;
  level: string;
  grade?: number | null;
}

interface AvailabilityBlockData {
  id: number;
  // Viene de TutorProfileViewDto -> AvailabilityBlockViewDto
  day_of_week: DayOfWeek; // Usar el tipo DayOfWeek importado
  start_time: string; // Formato HH:MM (como lo formatea el backend)
  end_time: string; // Formato HH:MM
}

interface TutorProfileData {
  // Viene de ViewUserProfileDto -> tutorProfile
  bio?: string; // El bio principal del tutor está aquí
  average_rating?: number;
  cv_url?: string | null;
  experience_details?: string | null;
  tutoring_contact_email?: string | null;
  tutoring_phone?: string | null;
  courses: TutorCourseData[];
  availability: AvailabilityBlockData[];
}

interface ApiUserResponse {
  // Respuesta de GET /profile/me
  user: UserBaseData;
  studentProfile?: any;
  tutorProfile?: TutorProfileData;
}

// Estado local para la información del perfil a mostrar en el dashboard del tutor
interface DashboardTutorState {
  name: string;
  photo_url?: string | null;
  courses: TutorCourseData[];
  availability: AvailabilityBlockData[];
  average_rating?: number | null;
}

export default function TutorDashboardPage() {
  const router = useRouter();
  const [dashboardTutor, setDashboardTutor] =
    useState<DashboardTutorState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- Carga de Datos del Perfil del Tutor ---
  useEffect(() => {
    console.log(
      "TutorDashboardPage: useEffect para cargar datos del perfil iniciado."
    );
    const fetchProfileForDashboard = async () => {
      const token = localStorage.getItem("token"); // Asegúrate que "token" es la clave donde guardas el JWT
      console.log("TutorDashboardPage: Token obtenido:", token);

      if (!token) {
        setError("No autenticado. Redirigiendo al login...");
        console.warn("TutorDashboardPage: No hay token, redirigiendo a login.");
        router.push("/login"); // Ajusta tu ruta de login si es diferente
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log("TutorDashboardPage: Haciendo fetch a /profile/me");
        const res = await fetch("http://localhost:3000/profile/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log(
          "TutorDashboardPage: Respuesta del fetch recibida, status:",
          res.status
        );

        if (!res.ok) {
          const errorBodyText = await res.text();
          console.error(
            "TutorDashboardPage: Error en fetch, status:",
            res.status,
            "Body:",
            errorBodyText
          );
          if (res.status === 401 || res.status === 403) {
            localStorage.removeItem("token"); // Token inválido, limpiar
            setError("Sesión expirada o inválida. Redirigiendo al login...");
            router.push("/login");
          } else {
            let parsedError;
            try {
              parsedError = JSON.parse(errorBodyText);
            } catch (e) {
              parsedError = { message: errorBodyText };
            }
            throw new Error(
              parsedError.message ||
                `Error al cargar datos del dashboard: ${res.status}`
            );
          }
          return;
        }

        const data: ApiUserResponse = await res.json();
        console.log(
          "TutorDashboardPage: Datos recibidos de la API:",
          JSON.stringify(data, null, 2)
        );

        if (
          data &&
          data.user &&
          (data.user.role === "TUTOR" || data.user.role === "BOTH")
        ) {
          if (data.tutorProfile) {
            // Verificar que tutorProfile exista
            console.log(
              "TutorDashboardPage: Mapeando datos para el dashboard del tutor."
            );
            setDashboardTutor({
              name: data.user.full_name || "Tutor",
              photo_url: data.user.photo_url,
              courses: data.tutorProfile.courses || [],
              availability: data.tutorProfile.availability || [],
              average_rating: data.tutorProfile.average_rating,
            });
          } else {
            // Usuario es TUTOR o BOTH pero no tiene tutorProfile (perfil incompleto o nuevo)
            console.warn(
              "TutorDashboardPage: Usuario es TUTOR/BOTH pero tutorProfile no fue encontrado en la respuesta. Puede ser un perfil incompleto."
            );
            setDashboardTutor({
              // Inicializar con datos básicos del usuario
              name: data.user.full_name || "Tutor",
              photo_url: data.user.photo_url,
              courses: [],
              availability: [],
              average_rating: null,
            });
            // Podrías establecer un mensaje de error o una guía para completar el perfil
            setError(
              "Tu perfil de tutor está incompleto. Por favor, completa tu perfil para acceder a todas las funcionalidades."
            );
          }
        } else if (data && data.user && data.user.role === "STUDENT") {
          console.warn(
            "TutorDashboardPage: Usuario es ESTUDIANTE. Redirigiendo o mostrando error."
          );
          setError(
            "Este dashboard es para tutores. Estás registrado como estudiante."
          );
          // Considera redirigir: router.push('/dashboard/student');
        } else {
          console.error(
            "TutorDashboardPage: Formato de datos inesperado, rol no es Tutor/Both, o tutorProfile falta.",
            data
          );
          throw new Error(
            "Perfil de tutor no encontrado, rol de usuario incorrecto o perfil incompleto."
          );
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Ocurrió un error desconocido.";
        setError(errorMessage);
        console.error(
          "TutorDashboardPage: Catch Error en fetchProfileForDashboard:",
          err
        );
      } finally {
        setLoading(false);
        console.log(
          "TutorDashboardPage: Carga de datos del perfil finalizada (loading=false)."
        );
      }
    };

    fetchProfileForDashboard();
  }, [router]);

  // --- Datos de Ejemplo (Mantenidos por ahora para secciones no conectadas) ---
  const upcomingSessions = [];

  const myTutorings = [];

  const getInitials = (name?: string) => {
    if (!name) return "?";
    const names = name.split(" ");
    const initials = names.map((n) => n[0]).join("");
    return initials.toUpperCase().slice(0, 2);
  };

  const formatDayOfWeek = (day: DayOfWeek) => {
    if (!day) return "Día no especificado";
    // Capitalizar y traducir si es necesario (asumiendo que DayOfWeek son strings en mayúsculas)
    const formatted = day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
    // Ejemplo de traducción simple (puedes expandir esto o usar una librería i18n)
    const translations: Record<string, string> = {
      Lunes: "Lunes",
      Martes: "Martes",
      Miercoles: "Miércoles",
      Jueves: "Jueves",
      Viernes: "Viernes",
      Sabado: "Sábado",
      Domingo: "Domingo",
    };
    return translations[formatted] || formatted;
  };

  // --- Renderizado ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  // Si hay un error Y NO se pudieron cargar los datos del perfil inicial, muestra el error a pantalla completa
  if (error && !dashboardTutor) {
    console.error(
      "TutorDashboardPage: Renderizando error porque 'dashboardTutor' es null y hay error:",
      error
    );
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <p className="text-red-500 text-xl mb-4">
          Error al Cargar el Dashboard
        </p>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Reintentar
        </Button>
      </div>
    );
  }

  // Si no está cargando, y no hubo un error que impidió la carga inicial, pero el perfil sigue siendo null
  // (Esto podría ocurrir si el usuario no es tutor o su perfil de tutor está realmente vacío)
  if (!dashboardTutor) {
    console.warn(
      "TutorDashboardPage: Renderizando mensaje 'No se pudo cargar' porque 'dashboardTutor' es null y no hay error de carga general."
    );
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <p className="text-xl mb-4">
          No se pudo cargar la información del dashboard del tutor.
        </p>
        <p className="text-muted-foreground mb-4">
          Asegúrate de haber completado tu perfil de tutor.
        </p>
        <Link href="/profile/tutor">
          <Button>Ir a Mi Perfil de Tutor</Button>
        </Link>
      </div>
    );
  }

  // Si llegamos aquí, dashboardTutor tiene datos.
  console.log(
    "TutorDashboardPage: Renderizando dashboard con datos:",
    JSON.stringify(dashboardTutor, null, 2)
  );

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link href="/" className="flex items-center">
            {dashboardTutor.photo_url && (
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage
                  src={dashboardTutor.photo_url}
                  alt={dashboardTutor.name}
                />
                <AvatarFallback>
                  {getInitials(dashboardTutor.name)}
                </AvatarFallback>
              </Avatar>
            )}
            <span className="text-xl font-bold text-sky-600">LINKUDP</span>
          </Link>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link
              href="/tutoring"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Explorar
            </Link>
            <Link
              href="/dashboard/tutor"
              className="text-sm font-medium text-foreground"
            >
              Mi Dashboard
            </Link>
            <Link
              href="/profile/tutor"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Mi Perfil
            </Link>
            {/* Considera un botón de Logout */}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="container px-4 py-10 md:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-sky-700">
                Dashboard de Tutor
              </h1>
              <p className="text-muted-foreground">
                Bienvenido, {dashboardTutor.name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/tutoring/create">
                {" "}
                {/* Ajusta esta ruta si es diferente */}
                <Button className="bg-sky-600 hover:bg-sky-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Tutoría
                </Button>
              </Link>
            </div>
          </div>

          {/* Mostrar errores de guardado u otros errores no bloqueantes aquí */}
          {error && dashboardTutor && (
            <p className="text-red-500 bg-red-100 p-3 rounded-md my-4">
              Error: {error}
            </p>
          )}

          <Tabs defaultValue="upcoming" className="mt-8">
            <TabsList className="grid w-full grid-cols-3 md:w-auto">
              <TabsTrigger value="upcoming">Próximas Sesiones</TabsTrigger>
              <TabsTrigger value="mytutorings">Mis Tutorías</TabsTrigger>
              <TabsTrigger value="availability">Disponibilidad</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="mt-4">
              {upcomingSessions.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"></div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 text-xl font-medium">
                      No tienes sesiones programadas
                    </h3>
                    <p className="mb-4 text-muted-foreground">
                      Cuando los estudiantes agenden sesiones contigo,
                      aparecerán aquí.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="mytutorings" className="mt-4">
              {myTutorings.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"></div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <Activity className="mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 text-xl font-medium">
                      Aún no has creado tutorías
                    </h3>
                    <p className="mb-4 text-muted-foreground">
                      Crea tu primera tutoría para empezar a ayudar a otros
                      estudiantes.
                    </p>
                  </CardContent>
                </Card>
              )}
              <div className="mt-4 flex justify-center">
                <Link href="/tutoring/create">
                  {" "}
                  {/* Ajusta esta ruta */}
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
                  <CardDescription>
                    Estos son los bloques horarios que has establecido en tu
                    perfil.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboardTutor.availability.length > 0 ? (
                    <div className="grid gap-4">
                      {dashboardTutor.availability.map((slot, index) => (
                        <div
                          key={slot.id || index}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div>
                            <p className="font-medium">
                              {formatDayOfWeek(slot.day_of_week)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {slot.start_time} - {slot.end_time}
                            </p>
                          </div>
                          {/* La API no devuelve 'status' para AvailabilityBlock, asumimos que todos los listados son 'disponibles' */}
                          <Badge
                            variant="outline"
                            className="border-green-500 text-green-700"
                          >
                            Disponible
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No has configurado tu disponibilidad. Puedes hacerlo en tu
                      perfil.
                    </p>
                  )}
                </CardContent>
                <CardFooter>
                  <Link href="/profile/tutor">
                    {" "}
                    {/* Enlace a la página de edición de perfil */}
                    <Button className="bg-sky-600 hover:bg-sky-700">
                      Gestionar disponibilidad
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas</CardTitle>
                <CardDescription>
                  Resumen de tu actividad como tutor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-sm text-muted-foreground">
                      Tutorías creadas
                    </p>
                    {/* Conectar a myTutorings.length cuando se cargue desde API */}
                    <p className="text-2xl font-bold text-sky-700">
                      {myTutorings.length}
                    </p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-sm text-muted-foreground">
                      Sesiones completadas
                    </p>
                    {/* Conectar a datos reales */}
                    <p className="text-2xl font-bold text-sky-700">0</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-sm text-muted-foreground">
                      Estudiantes ayudados
                    </p>
                    {/* Conectar a datos reales */}
                    <p className="text-2xl font-bold text-sky-700">0</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-sm text-muted-foreground">
                      Calificación promedio
                    </p>
                    <p className="text-2xl font-bold text-sky-700">
                      {dashboardTutor.average_rating?.toFixed(1) || "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cursos que enseñas</CardTitle>
                <CardDescription>
                  Materias en las que ofreces tutorías
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardTutor.courses.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {dashboardTutor.courses.map((course) => (
                      <Badge
                        key={course.courseId}
                        className="bg-sky-100 text-sky-800 hover:bg-sky-200"
                      >
                        {course.courseName} ({course.level})
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Aún no has especificado los cursos que enseñas. Puedes
                    hacerlo en tu perfil.
                  </p>
                )}
              </CardContent>
              <CardFooter>
                <Link href="/profile/tutor">
                  {" "}
                  {/* Enlace a la página de edición de perfil */}
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

// Las variables de datos de ejemplo (upcomingSessions, myTutorings) se pueden mantener fuera del componente
// si no se van a modificar o cargar desde el backend en esta iteración.
// La variable 'availability' original del archivo que me pasaste se reemplaza por dashboardTutor.availability
// que se carga desde el backend.
