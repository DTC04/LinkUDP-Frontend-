"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Filter, Plus } from "lucide-react"
import { useEffect, useState, useCallback } from "react" // Added useCallback
import { jwtDecode } from "jwt-decode"
import { useAuth } from "@/hooks/use-auth" // Import useAuth
import type { UserProfile as AuthUserProfile } from "@/hooks/use-auth" // Alias UserProfile

// Local interfaces for Tutoring data structure
interface UserProfile { // Local UserProfile for tutor details within a session
  full_name: string;
  email?: string;
  photo_url?: string;
}

interface TutorProfile { // Local TutorProfile for tutor object within a Tutoring session
  id: number;
  user: UserProfile; // Uses the local UserProfile above
  bio?: string;
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

export default function TutoringListPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loggedInUserProfile, setLoggedInUserProfile] = useState<AuthUserProfile | null>(null) // Updated state variable name and type
  const [tutoringsData, setTutoringsData] = useState<Tutoring[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [dashboardUrl, setDashboardUrl] = useState<string>("/login") // State for dynamic dashboard URL
  const { getCurrentUserProfile, logout } = useAuth() // Destructure getCurrentUserProfile and logout

  const fetchProfileAndSetLoginStatus = useCallback(async () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          jwtDecode(token); // Check if token is valid
          setIsLoggedIn(true);
          const profile = await getCurrentUserProfile();
          setLoggedInUserProfile(profile); // Updated state setter
          if (!profile) { // If profile fetch fails (e.g. invalid token really)
            setIsLoggedIn(false);
            localStorage.removeItem("token"); // Clean up bad token
          }
        } catch (e) {
          console.error("Token decoding failed or profile fetch failed:", e);
          setIsLoggedIn(false);
          localStorage.removeItem("token"); // Clean up bad token
          setLoggedInUserProfile(null); // Updated state setter
        }
      } else {
        setIsLoggedIn(false);
        setLoggedInUserProfile(null); // Updated state setter
      }
    }
  }, [getCurrentUserProfile]);

  useEffect(() => {
    fetchProfileAndSetLoginStatus();
  }, [fetchProfileAndSetLoginStatus]);

  useEffect(() => {
    if (isLoggedIn && loggedInUserProfile && loggedInUserProfile.user) {
      if (loggedInUserProfile.user.role === "TUTOR" || loggedInUserProfile.user.role === "BOTH") {
        setDashboardUrl("/dashboard/tutor");
      } else if (loggedInUserProfile.user.role === "STUDENT") {
        setDashboardUrl("/dashboard/student");
      } else {
        console.warn(`Rol de usuario (${loggedInUserProfile.user.role}) no manejado para el enlace del dashboard, usando /dashboard/student por defecto.`);
        setDashboardUrl("/dashboard/student"); // Fallback, o podría ser /
      }
    } else if (!isLoggedIn) {
      setDashboardUrl("/login"); // Si no está logueado, el dashboard link no debería aparecer o llevar a login
    }
  }, [isLoggedIn, loggedInUserProfile]);

  useEffect(() => {
    const fetchTutorings = async () => {
      try {
        const response = await fetch("http://localhost:3000/tutorias")
        if (!response.ok) {
          throw new Error("Error al obtener las tutorías")
        }
        const data = await response.json()
        setTutoringsData(data)
      } catch (error) {
        console.error("Error fetching tutorings:", error)
      }
    }

    fetchTutorings()
  }, [])

  const filteredTutorings = tutoringsData.filter(
    (tutoring) => {
      const searchTermLower = searchTerm.toLowerCase()
      return (
        tutoring.title.toLowerCase().includes(searchTermLower) ||
        (tutoring.course && tutoring.course.name.toLowerCase().includes(searchTermLower)) ||
        (tutoring.tutor && tutoring.tutor.user && tutoring.tutor.user.full_name.toLowerCase().includes(searchTermLower))
      )
    }
  )

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <span className="text-xl font-bold text-sky-600 cursor-default select-none">LINKUDP</span>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            {isLoggedIn ? (
              <>
                <Link
                  href="/tutoring"
                  className="text-sm font-medium text-foreground border-b-2 border-sky-600 pb-1"
                >
                  Buscar Tutorías
                </Link>
                <Link
                  href={dashboardUrl} // Use dynamic dashboard URL
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Mi Dashboard
                </Link>
                <Link
                  href="/profile/student"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Mi Perfil
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  Iniciar Sesión
                </Link>
                <Link href="/register" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  Registrarse
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="container px-4 py-10 md:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-sky-700">Tutorías Disponibles</h1>
              <p className="text-muted-foreground">Encuentra la tutoría que necesitas para tus materias.</p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                className="max-w-[200px]"
                placeholder="Buscar tutoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filtrar tutorías</span>
              </Button>
              {loggedInUserProfile && loggedInUserProfile.user && loggedInUserProfile.user.role !== "STUDENT" && (
                <Link href="/tutoring/create">
                  <Button className="bg-sky-600 hover:bg-sky-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Tutoría
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTutorings.length > 0 ? (
              filteredTutorings.map((tutoring) => (
                <Link href={`/tutoring/${tutoring.id}`} key={tutoring.id}>
                  <Card className="h-full overflow-hidden transition-all hover:border-sky-300 hover:shadow-md">
                    <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-medium">{tutoring.title}</CardTitle>
                      <Badge variant="outline" className="bg-sky-50 text-sky-700">
                        {tutoring.course?.name || "N/A"}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs text-muted-foreground">
                      Tutor: {tutoring.tutor?.user?.full_name || "No asignado"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{tutoring.description}</p>
                  </CardContent>
                    <CardFooter className="border-t bg-muted/50 px-4 py-2">
                    <div className="flex w-full justify-between text-xs text-muted-foreground">
                      <span>Horario: {tutoring.schedule || new Date(tutoring.date).toLocaleDateString() + " " + new Date(tutoring.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>Duración: {tutoring.duration || `${((new Date(tutoring.end_time).getTime() - new Date(tutoring.start_time).getTime()) / (1000 * 60 * 60)).toFixed(1)} hrs`}</span>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))
            ) : (
              <p className="col-span-full text-center text-muted-foreground">
                No se encontraron tutorías.
              </p>
            )}
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
