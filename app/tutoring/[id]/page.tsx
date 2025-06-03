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
import { useAuth, type UserProfile as AuthUserProfile } from "../../../hooks/use-auth"; // Import useAuth

interface UserProfile { // This is for the tutor's user profile within Tutoring data
  id: number;
  full_name: string;
  email?: string;
  photo_url?: string;
}

interface TutorProfile { // This is for the tutor's profile within Tutoring data
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
  const { getCurrentUserProfile, loading: authLoading } = useAuth(); // useAuth hook
  const [currentUser, setCurrentUser] = useState<AuthUserProfile | null>(null); // State for logged-in user

  const [tutoring, setTutoring] = useState<Tutoring | null>(null);
  const [loading, setLoading] = useState(true); // Combined loading state
  const [error, setError] = useState<string | null>(null);
  const [bookingStatus, setBookingStatus] = useState< "idle" | "loading" | "success" | "error" >("idle");
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);
  const [hasBooked, setHasBooked] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState<number | null>(null);
  // isAuthenticated will be derived from currentUser

  const fetchTutoringDetails = async () => {
    setLoading(true);
    setError(null);
    setHasBooked(false);
    setCurrentBookingId(null);

    // Fetch current user profile (moved from inside useEffect to be accessible)
    // This might run more often than strictly necessary if called from handlers,
    // but ensures currentUser state is up-to-date before other logic.
    // Consider optimizing if this becomes a performance issue.
    const userProfile = await getCurrentUserProfile();
    setCurrentUser(userProfile);
    const authenticated = !!userProfile;

    if (!params.id) {
      setError("ID de tutoría no especificado.");
      setLoading(false);
      return;
    }

    try {
      // Fetch tutoring details
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

      // Check booking status if user is authenticated
      if (authenticated && tutoringData.id) {
        try {
          const userBookingsResponse = await fetch(
            `http://localhost:3000/bookings/me?sessionId=${tutoringData.id}&status=PENDING&status=CONFIRMED`,
            { credentials: "include" }
          );

          if (userBookingsResponse.ok) {
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
          } else if (userBookingsResponse.status === 404 && userProfile?.user?.role === 'TUTOR') { // Use userProfile directly
            // This is expected if a tutor (without a student profile) views the page.
            // console.log("Tutor viewing session, no student bookings to fetch via /bookings/me for this user.");
          } else if (userBookingsResponse.status !== 401) { 
            console.error("Error fetching user bookings:", userBookingsResponse.status, userBookingsResponse.statusText);
          }
        } catch (bookingError) {
          console.error("Error al procesar el estado de la reserva:", bookingError);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTutoringDetails();
  }, [params.id]); // Removed getCurrentUserProfile from deps as it's called inside fetchTutoringDetails


  const handleBookTutoring = async () => {
    if (!tutoring) return;

    setBookingStatus("loading");
    setBookingMessage(null);

    if (!currentUser) { // currentUser is now set by fetchTutoringDetails
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
          },
          credentials: "include", 
        }
      );

      if (response.ok) {
        setBookingStatus("success");
        setBookingMessage(
          "Tutoría agendada con éxito. Esperando confirmación del tutor."
        );
        await fetchTutoringDetails(); // Re-fetch para actualizar el estado del botón y hasBooked
      } else {
        const errorData = await response.json();
        setBookingStatus("error");
        setBookingMessage(errorData.message || "Error al agendar la tutoría.");
        if (
          errorData.message.includes("Ya tienes una reserva para esta sesión")
        ) {
          setHasBooked(true); 
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

    if (!currentUser) { 
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
          },
          credentials: "include", 
        }
      );

      if (response.status === 204) {
        setBookingStatus("success");
        setBookingMessage("Reserva cancelada exitosamente.");
        await fetchTutoringDetails(); // Re-fetch para actualizar el estado
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

  // Consistently derive date and time for display from start_time
  const startTimeObj = new Date(tutoring.start_time);
  const scheduleDisplayDate = startTimeObj.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  const scheduleDisplayTime = startTimeObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  
  const schedule = tutoring.schedule || `${scheduleDisplayDate} ${scheduleDisplayTime}`;
  
  const duration =
    tutoring.duration ||
    `${(
      (new Date(tutoring.end_time).getTime() -
        new Date(tutoring.start_time).getTime()) /
      (1000 * 60 * 60)
    ).toFixed(1)} hrs`;

  const formatAcademicYear = (year?: string | null): string => {
    if (year === null || year === undefined || year.trim() === "") {
      return "Año no especificado";
    }
    const yearStr = String(year).trim();
    const yearNum = parseInt(yearStr, 10);

    if (!isNaN(yearNum) && yearNum.toString() === yearStr) {
      return `${yearNum}° año`;
    }
    return yearStr;
  };

  const isAvailableForNewBookings = tutoring.status === "AVAILABLE";
  const isPastSession = new Date(tutoring.end_time) < new Date();
  const canCancel =
    hasBooked &&
    !isPastSession &&
    (tutoring.status === "PENDING" || tutoring.status === "CONFIRMED");

  const profileLink = currentUser?.user?.role === "TUTOR" ? "/profile/tutor" : currentUser?.user?.role === "STUDENT" ? "/profile/student" : "/profile";
  const dashboardLink = currentUser?.user?.role === "TUTOR" ? "/dashboard/tutor" : "/dashboard/student";


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
            {currentUser && (
               <Link
                href={dashboardLink}
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Mi Dashboard
              </Link>
            )}
            {currentUser && (
              <Link
                href={profileLink}
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Mi Perfil
              </Link>
            )}
            {!currentUser && !authLoading && (
               <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Iniciar Sesión
              </Link>
            )}
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
                      !currentUser // Deshabilitar si no está autenticado
                    }
                  >
                    {bookingStatus === "loading"
                      ? "Agendando..."
                      : isPastSession
                      ? "Sesión Finalizada"
                      : !currentUser
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
