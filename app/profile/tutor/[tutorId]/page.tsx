"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronLeft, User, Mail, BookOpen, Briefcase, Calendar as CalendarIcon, University, GraduationCap, Info } from "lucide-react" // Added University, GraduationCap, Info
import { Badge } from "@/components/ui/badge"

interface UserProfile {
  full_name: string;
  email?: string;
  photo_url?: string;
}

interface TutorCourse {
  id: string; // Assuming course ID is a string, adjust if necessary
  name: string;
  // Add other relevant course properties if available
}

interface AvailabilityBlock {
  id: number; // Or string, depending on what the backend provides (Prisma ID is usually number)
  day_of_week: string; // e.g., MONDAY, TUESDAY
  start_time: string; // HH:MM
  end_time: string;   // HH:MM
}

// This interface represents the nested tutorProfile object within the main DTO
interface TutorSpecificProfileData {
  id: number; // Or string, matching backend
  bio?: string;
  university?: string;
  degree?: string;
  academic_year?: string;
  tutoring_contact_email?: string;
  courses?: TutorCourse[];
  availability?: AvailabilityBlock[];
  average_rating?: number;
  cv_url?: string;
  experience_details?: string;
  tutoring_phone?: string;
}

// This interface represents the entire data structure fetched (like ViewUserProfileDto)
interface FetchedUserProfileData {
  user: UserProfile;
  studentProfile?: any; // Define if needed, or keep as any/optional
  tutorProfile?: TutorSpecificProfileData;
  // Add other top-level fields from ViewUserProfileDto if any (e.g. main id, if applicable)
  // For this page, we are primarily interested in user and tutorProfile parts.
  // The existing TutorProfileData was trying to be too flat.
  // Let's assume the root object fetched might also have an id, bio, etc. if it's a direct tutor profile fetch
  // For now, let's match ViewUserProfileDto structure:
  id?: string; // This was on the old TutorProfileData, might be from params.tutorId if not on root object
  bio?: string; // This was on the old TutorProfileData
  university?: string; // This was on the old TutorProfileData
  degree?: string; // This was on the old TutorProfileData
  academic_year?: string; // This was on the old TutorProfileData
  tutoring_contact_email?: string; // This was on the old TutorProfileData
  courses?: TutorCourse[]; // This was on the old TutorProfileData
}


// Helper to map day names - Keys now match backend data (Spanish, uppercase)
const dayOfWeekMap: Record<string, string> = {
  LUNES: "Lunes",
  MARTES: "Martes",
  MIERCOLES: "Miércoles", // Assuming MIERCOLES from backend for consistency
  JUEVES: "Jueves",
  VIERNES: "Viernes",
  SABADO: "Sábado",
  DOMINGO: "Domingo",
};

// Order of days for display - Keys now match backend data
const dayOrder: string[] = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO"];
// Note: If backend uses 'MIÉRCOLES' with an accent, update MIERCOLES above accordingly.
// Based on logs, it seems to be 'LUNES', 'JUEVES', 'VIERNES' without accents for those.
// We'll assume MIERCOLES for now, adjust if needed based on actual data for Wednesday.
function formatHour(timeOrIso: string) {
  // Si es solo una hora como "08:30", construye una fecha completa en UTC
  if (/^\d{2}:\d{2}$/.test(timeOrIso)) {
    // Concatenar una fecha base
    timeOrIso = `1970-01-01T${timeOrIso}:00Z`
  }

  const date = new Date(timeOrIso)

  if (isNaN(date.getTime())) {
    return "Hora inválida"
  }

  return date.toLocaleTimeString("es-CL", {
    timeZone: "America/Santiago",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}




export default function TutorPublicProfilePage() {
  const router = useRouter()
  const params = useParams<{ tutorId: string }>()
  // tutorProfile state now holds an object matching FetchedUserProfileData (like ViewUserProfileDto)
  const [tutorProfile, setTutorProfile] = useState<FetchedUserProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.tutorId) {
      const fetchTutorProfile = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(`http://localhost:3000/profile/tutor/${params.tutorId}`, {
            credentials: "include",
          });
  
          if (!response.ok) {
            if (response.status === 404) {
              throw new Error("Perfil de tutor no encontrado.");
            }
            throw new Error("Error al obtener el perfil del tutor.");
          }
  
          const data = await response.json();
          setTutorProfile(data);
        } catch (err: any) {
          setError(err.message || "Error desconocido al obtener el perfil.");
        } finally {
          setLoading(false);
        }
      };
  
      fetchTutorProfile();
    }
  }, [params.tutorId]);
  

  const formatAcademicYear = (year?: string | null): string => {
    if (!year) return "Año no especificado";
    const yearNum = parseInt(year, 10);
    if (!isNaN(yearNum) && yearNum.toString() === year.trim()) {
      return `${yearNum}° año`;
    }
    return year;
  };

  if (loading) {
    return (
      <div className="container flex min-h-screen items-center justify-center py-10">
        <p>Cargando perfil del tutor...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container flex min-h-screen flex-col items-center justify-center py-10">
        <Info className="mb-4 h-16 w-16 text-red-500" />
        <h2 className="mb-2 text-2xl font-semibold text-red-600">Error</h2>
        <p className="text-center text-muted-foreground">{error}</p>
        <Button onClick={() => router.back()} className="mt-6">
          Volver
        </Button>
      </div>
    )
  }

  if (!tutorProfile) {
    return (
      <div className="container flex min-h-screen items-center justify-center py-10">
        <p>No se encontró el perfil del tutor.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl py-10">
      <div className="mb-6 flex items-center">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-4">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold text-sky-700">Perfil del Tutor</h1>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="bg-sky-50 p-6">
          <div className="flex flex-col items-center gap-4 text-center md:flex-row md:text-left">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
              <AvatarImage src={tutorProfile.user?.photo_url || "/placeholder-user.jpg"} alt={tutorProfile.user?.full_name || "Tutor"} />
              <AvatarFallback className="text-3xl">
                {tutorProfile.user?.full_name?.split(" ").map(n => n[0]).join("").toUpperCase() || "T"}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-3xl font-semibold text-sky-800">{tutorProfile.user?.full_name || "Nombre no disponible"}</CardTitle>
              <CardDescription className="mt-1 text-lg text-sky-600">
                {tutorProfile.tutorProfile?.degree || "Grado no especificado"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {tutorProfile.tutorProfile?.bio && (
            <div>
              <h3 className="mb-2 text-xl font-semibold text-sky-700">Sobre mí</h3>
              <p className="text-muted-foreground whitespace-pre-line">{tutorProfile.tutorProfile.bio}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-sky-700">Información Académica</h3>
              <div className="flex items-start gap-3">
                <University className="h-5 w-5 mt-1 text-sky-600 flex-shrink-0" />
                <div>
                  <p className="font-medium">Universidad</p>
                  <p className="text-sm text-muted-foreground">{tutorProfile.tutorProfile?.university || "No especificada"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <GraduationCap className="h-5 w-5 mt-1 text-sky-600 flex-shrink-0" />
                <div>
                  <p className="font-medium">Carrera / Grado</p>
                  <p className="text-sm text-muted-foreground">{tutorProfile.tutorProfile?.degree || "No especificada"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CalendarIcon className="h-5 w-5 mt-1 text-sky-600 flex-shrink-0" />
                <div>
                  <p className="font-medium">Año Académico</p>
                  <p className="text-sm text-muted-foreground">{formatAcademicYear(tutorProfile.tutorProfile?.academic_year)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-sky-700">Contacto</h3>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 mt-1 text-sky-600 flex-shrink-0" />
                <div>
                  <p className="font-medium">Email para Tutorías</p>
                  <p className="text-sm text-muted-foreground">{tutorProfile.tutorProfile?.tutoring_contact_email || tutorProfile.user?.email || "No disponible"}</p>
                </div>
              </div>
              {/* Add other contact details if available */}
            </div>
          </div>

          {tutorProfile.tutorProfile?.courses && tutorProfile.tutorProfile.courses.length > 0 && (
            <div>
              <h3 className="mb-3 text-xl font-semibold text-sky-700">Cursos que Imparte</h3>
              <div className="flex flex-wrap gap-2">
                {tutorProfile.tutorProfile.courses.map((course) => (
                  <Badge key={course.id} variant="secondary" className="text-sm bg-sky-100 text-sky-800 hover:bg-sky-200">
                    {course.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Availability Section - Styled like Tutor Dashboard */}
          <div>
            <h3 className="mb-3 text-xl font-semibold text-sky-700">Disponibilidad Semanal</h3>
            {tutorProfile.tutorProfile?.availability && tutorProfile.tutorProfile.availability.length > 0 ? (
              <Card>
                <CardContent className="p-4 space-y-3">
                  {/* Sort availability by dayOrder then start_time for consistent display */}
                  {tutorProfile.tutorProfile.availability
                    .slice() // Create a shallow copy to sort without mutating state
                    .sort((a, b) => {
                      const dayIndexA = dayOrder.indexOf(a.day_of_week);
                      const dayIndexB = dayOrder.indexOf(b.day_of_week);
                      if (dayIndexA !== dayIndexB) {
                        return dayIndexA - dayIndexB;
                      }
                      return a.start_time.localeCompare(b.start_time);
                    })
                    .map((block: AvailabilityBlock) => (
                    <div key={block.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-slate-50 transition-colors">
                        <div>
                        <p className="font-medium text-sky-700">{dayOfWeekMap[block.day_of_week] || block.day_of_week}</p>
                        <p className="text-sm text-muted-foreground">
                            {formatHour(block.start_time)} - {formatHour(block.end_time)}
                        </p>
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">
                        Disponible
                        </Badge>
                    </div>
                    ))
                    }
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed border-slate-300 bg-slate-50">
                <CardContent className="p-6 text-center text-muted-foreground">
                  <p>El tutor no ha especificado su disponibilidad horaria.</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Placeholder for Reviews - to be implemented */}
          <div>
            <h3 className="mb-3 text-xl font-semibold text-sky-700">Calificaciones y Reseñas</h3>
            <Card className="border-dashed border-slate-300 bg-slate-50">
              <CardContent className="p-6 text-center text-muted-foreground">
                <p>Las calificaciones y reseñas de los estudiantes estarán disponibles próximamente.</p>
              </CardContent>
            </Card>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}