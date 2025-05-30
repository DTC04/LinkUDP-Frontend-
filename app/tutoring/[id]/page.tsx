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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  AlertCircle,
  Mail,
  XCircle,
  CheckCircle,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";

interface UserProfile {
  id: number;
  full_name: string;
  email?: string;
  photo_url?: string;
}

interface TutorProfile {
  id: number;
  user: UserProfile;
  bio?: string;
  university?: string;
  degree?: string;
  academic_year?: string;
  tutoring_contact_email?: string;
}

interface Course {
  id: number;
  name: string;
}

interface Tutoring {
  id: string;
  title: string;
  description: string;
  date: string;
  start_time: string;
  end_time: string;
  location?: string;
  notes?: string;
  status: string;
  tutor: TutorProfile;
  course: Course;
  schedule?: string;
  duration?: string;
}

export default function TutoringDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [tutoring, setTutoring] = useState<Tutoring | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingStatus, setBookingStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);
  const [hasBooked, setHasBooked] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Nuevo estado para la autenticación

  const fetchTutoringDetails = async () => {
    setLoading(true);
    setError(null);
    setHasBooked(false);
    setCurrentBookingId(null);
    try {
      const tutoringResponse = await fetch(
        `http://localhost:3000/tutorias/${params.id}`
      );
      if (!tutoringResponse.ok) {
        if (tutoringResponse.status === 404) {
          throw new Error("Tutoría no encontrada.");
        }
        throw new Error("Error al obtener los detalles de la tutoría.");
      }
      const tutoringData = await tutoringResponse.json();
      setTutoring(tutoringData);

      // NO necesitamos obtener el token de localStorage aquí si usamos cookies
      // En su lugar, haremos una solicitud para verificar si el usuario está autenticado
      // y adjuntaremos las cookies automáticamente con credentials: 'include'.
      try {
        const userBookingsResponse = await fetch(
          `http://localhost:3000/bookings/me?sessionId=${tutoringData.id}&status=PENDING&status=CONFIRMED`, // tutoringData.id es necesario aquí
          {
            credentials: "include", // Esto asegura que las cookies se envíen
          }
        );

        if (userBookingsResponse.ok) {
          setIsAuthenticated(true); // El usuario está autenticado si la llamada a /bookings/me es exitosa
          const userBookings = await userBookingsResponse.json();
          const foundBooking = userBookings.find(
            (booking: any) =>
              booking.sessionId === tutoringData.id &&
              (booking.status === "PENDING" || booking.status === "CONFIRMED")
          );
          if (foundBooking) {
            setHasBooked(true);
            setCurrentBookingId(foundBooking.id);
          }
        } else if (userBookingsResponse.status === 401) {
          setIsAuthenticated(false); // No autenticado si devuelve 401
        }
      } catch (authError) {
        console.error(
          "Error al verificar el estado de autenticación:",
          authError
        );
        setIsAuthenticated(false); // Asume no autenticado en caso de error de red o similar
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchTutoringDetails();
    }
  }, [params.id]);

  const handleBookTutoring = async () => {
    if (!tutoring) return;

    setBookingStatus("loading");
    setBookingMessage(null);

    // No se verifica el token en localStorage aquí, dependemos de la cookie del navegador
    if (!isAuthenticated) {
      // Usamos el estado de autenticación
      setBookingStatus("error");
      setBookingMessage(
        "No estás autenticado. Por favor, inicia sesión para reservar."
      );
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/bookings/${tutoring.id}/book`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Ya no se necesita el encabezado Authorization, el navegador envía la cookie
          },
          credentials: "include", // Crucial para enviar la cookie de autenticación
        }
      );

      if (response.ok) {
        setBookingStatus("success");
        setBookingMessage(
          "Tutoría agendada con éxito. Esperando confirmación del tutor."
        );
        fetchTutoringDetails(); // Re-fetch para actualizar el estado del botón y hasBooked
      } else {
        const errorData = await response.json();
        setBookingStatus("error");
        setBookingMessage(errorData.message || "Error al agendar la tutoría.");
        if (
          errorData.message.includes("Ya tienes una reserva para esta sesión")
        ) {
          setHasBooked(true); // Asegurarse de que el estado refleje esto
        }
      }
    } catch (err: any) {
      setBookingStatus("error");
      setBookingMessage(
        err.message || "Error de red al intentar agendar la tutoría."
      );
    }
  };

  const handleCancelBooking = async () => {
    if (!currentBookingId) return;

    setBookingStatus("loading");
    setBookingMessage(null);

    // No se verifica el token en localStorage aquí
    if (!isAuthenticated) {
      // Usamos el estado de autenticación
      setBookingStatus("error");
      setBookingMessage(
        "No estás autenticado. Por favor, inicia sesión para cancelar."
      );
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/bookings/${currentBookingId}/cancel`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            // Ya no se necesita el encabezado Authorization
          },
          credentials: "include", // Crucial para enviar la cookie de autenticación
        }
      );

      if (response.status === 204) {
        setBookingStatus("success");
        setBookingMessage("Reserva cancelada exitosamente.");
        fetchTutoringDetails(); // Re-fetch para actualizar el estado
      } else {
        const errorData = await response.json();
        setBookingStatus("error");
        setBookingMessage(errorData.message || "Error al cancelar la reserva.");
      }
    } catch (err: any) {
      setBookingStatus("error");
      setBookingMessage(
        err.message || "Error de red al intentar cancelar la reserva."
      );
    }
  };

  if (loading) {
    return (
      <div className="container flex min-h-screen items-center justify-center py-10">
        <p>Cargando detalles de la tutoría...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container flex min-h-screen flex-col items-center justify-center py-10">
        <AlertCircle className="mb-4 h-16 w-16 text-red-500" />
        <h2 className="mb-2 text-2xl font-semibold text-red-600">Error</h2>
        <p className="text-center text-muted-foreground">{error}</p>
        <Button onClick={() => router.push("/tutoring")} className="mt-6">
          Volver a Tutorías
        </Button>
      </div>
    );
  }

  if (!tutoring) {
    return (
      <div className="container flex min-h-screen items-center justify-center py-10">
        <p>No se encontraron detalles para esta tutoría.</p>
      </div>
    );
  }

  const schedule =
    tutoring.schedule ||
    `${new Date(tutoring.date).toLocaleDateString()} ${new Date(
      tutoring.start_time
    ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  const duration =
    tutoring.duration ||
    `${(
      (new Date(tutoring.end_time).getTime() -
        new Date(tutoring.start_time).getTime()) /
      (1000 * 60 * 60)
    ).toFixed(1)} hrs`;

  const formatAcademicYear = (year?: string | null): string => {
    if (!year) return "Año no especificado";
    const yearNum = parseInt(year, 10);

    if (!isNaN(yearNum) && yearNum.toString() === year.trim()) {
      return `${yearNum}° año`;
    }
    return year;
  };

  const isAvailableForNewBookings = tutoring.status === "AVAILABLE";
  const isPastSession = new Date(tutoring.end_time) < new Date();
  const canCancel =
    hasBooked &&
    !isPastSession &&
    (tutoring.status === "PENDING" || tutoring.status === "CONFIRMED");

  return (
    <div className="flex min-h-screen flex-col">
      {" "}
      {/* Envoltura principal */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <span className="text-xl font-bold text-sky-600 cursor-default select-none">
            LINKUDP
          </span>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link
              href="/tutoring"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Explorar
            </Link>
            <Link
              href="/calendar"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Calendario
            </Link>
            <Link
              href="/dashboard/student"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Mi Dashboard
            </Link>
            <Link
              href="/profile"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Mi Perfil
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 container py-10">
        {" "}
        {/* Contenido principal */}
        <div className="mb-6 flex items-center">
          <Link href="/tutoring" className="mr-4">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-sky-700">
            Detalles de la Tutoría
          </h1>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{tutoring.title}</CardTitle>
                    <CardDescription className="mt-1">
                      <Badge
                        variant="outline"
                        className="bg-sky-50 text-sky-700"
                      >
                        {tutoring.course?.name || "N/A"}
                      </Badge>
                    </CardDescription>
                  </div>
                  {/* Display tutoring status badge */}
                  {tutoring.status && (
                    <Badge
                      className={`
                      ${
                        tutoring.status === "AVAILABLE"
                          ? "bg-green-100 text-green-700"
                          : ""
                      }
                      ${
                        tutoring.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : ""
                      }
                      ${
                        tutoring.status === "CONFIRMED"
                          ? "bg-blue-100 text-blue-700"
                          : ""
                      }
                      ${
                        tutoring.status === "CANCELLED"
                          ? "bg-red-100 text-red-700"
                          : ""
                      }
                      ${
                        tutoring.status === "COMPLETED"
                          ? "bg-gray-100 text-gray-700"
                          : ""
                      }
                      ${
                        isPastSession &&
                        (tutoring.status === "CONFIRMED" ||
                          tutoring.status === "PENDING")
                          ? "bg-gray-100 text-gray-700"
                          : ""
                      }
                      text-sm font-semibold ml-4
                    `}
                    >
                      {isPastSession &&
                      (tutoring.status === "CONFIRMED" ||
                        tutoring.status === "PENDING")
                        ? "FINALIZADA"
                        : tutoring.status}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="mb-2 font-medium text-sky-700">Descripción</h3>
                  <p className="text-muted-foreground">
                    {tutoring.description}
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-sky-600" />
                    <div>
                      <p className="font-medium">Horario</p>
                      <p className="text-sm text-muted-foreground">
                        {schedule}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-sky-600" />
                    <div>
                      <p className="font-medium">Duración</p>
                      <p className="text-sm text-muted-foreground">
                        {duration}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-sky-600" />
                    <div>
                      <p className="font-medium">Ubicación</p>
                      <p className="text-sm text-muted-foreground">
                        {tutoring.location || "No especificada"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                {/* Conditional Booking/Cancellation Button */}
                {hasBooked ? (
                  <Button
                    className="w-full bg-red-600 hover:bg-red-700"
                    onClick={handleCancelBooking}
                    disabled={!canCancel || bookingStatus === "loading"}
                  >
                    {bookingStatus === "loading"
                      ? "Cancelando..."
                      : isPastSession
                      ? "Sesión Finalizada"
                      : tutoring.status === "CANCELLED"
                      ? "Sesión Cancelada"
                      : "Cancelar Reserva"}
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-sky-600 hover:bg-sky-700"
                    onClick={handleBookTutoring}
                    disabled={
                      !isAvailableForNewBookings ||
                      isPastSession ||
                      bookingStatus === "loading" ||
                      !isAuthenticated // Deshabilitar si no está autenticado
                    }
                  >
                    {bookingStatus === "loading"
                      ? "Agendando..."
                      : isPastSession
                      ? "Sesión Finalizada"
                      : !isAuthenticated
                      ? "Inicia sesión para reservar" // Mensaje para no autenticados
                      : tutoring.status === "PENDING"
                      ? "Reserva Pendiente"
                      : tutoring.status === "CONFIRMED"
                      ? "Sesión Confirmada"
                      : tutoring.status === "CANCELLED"
                      ? "Sesión Cancelada"
                      : "Agendar Tutoría"}
                  </Button>
                )}

                {bookingStatus === "success" && (
                  <div className="flex items-center text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {bookingMessage}
                  </div>
                )}
                {bookingStatus === "error" && (
                  <div className="flex items-center text-red-600 text-sm">
                    <XCircle className="h-4 w-4 mr-2" />
                    {bookingMessage}
                  </div>
                )}
                {/* Botón "Contactar al Tutor" - Considera su habilitación/deshabilitación */}
                <Button className="w-full bg-sky-600 hover:bg-sky-700" disabled>
                  Contactar al Tutor
                  <span className="ml-2 text-xs">(Próximamente)</span>
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Información del Tutor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={
                        tutoring.tutor?.user?.photo_url || "/placeholder.svg"
                      }
                      alt={tutoring.tutor?.user?.full_name || "Tutor"}
                    />
                    <AvatarFallback>
                      {tutoring.tutor?.user?.full_name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase() || "T"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {tutoring.tutor?.user?.full_name || "No asignado"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {tutoring.tutor?.degree || "Grado no especificado"}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-sky-600" />
                    <p className="text-sm text-muted-foreground">
                      {tutoring.tutor?.university ||
                        "Universidad no especificada"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-sky-600" />
                    <p className="text-sm text-muted-foreground">
                      {formatAcademicYear(tutoring.tutor?.academic_year)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-sky-600" />
                    <div>
                      <p className="font-medium">Email Tutorías</p>
                      <p className="text-sm text-muted-foreground">
                        {tutoring.tutor?.tutoring_contact_email ||
                          tutoring.tutor?.user?.email ||
                          "Email no disponible"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    if (tutoring?.tutor?.user?.id) {
                      router.push(`/profile/tutor/${tutoring.tutor.user.id}`);
                    }
                  }}
                  disabled={!tutoring?.tutor?.user?.id}
                >
                  Ver Perfil Completo
                </Button>
              </CardFooter>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Calificaciones</CardTitle>
                <CardDescription>
                  Esta función estará disponible próximamente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                  <p>
                    Las calificaciones y reseñas estarán disponibles en futuras
                    actualizaciones.
                  </p>
                </div>
              </CardContent>
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
