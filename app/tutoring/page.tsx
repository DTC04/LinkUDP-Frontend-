<<<<<<< HEAD
=======
"use client"
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Filter, Plus } from "lucide-react"
<<<<<<< HEAD

export default function TutoringListPage() {
=======
import { useEffect, useState, useCallback } from "react" 
import { jwtDecode } from "jwt-decode"
import { useAuth } from "@/hooks/use-auth" 
import type { UserProfile as AuthUserProfile } from "@/hooks/use-auth" 


interface UserProfile { 
  full_name: string;
  email?: string;
  photo_url?: string;
}

interface TutorProfile { 
  id: number;
  user: UserProfile; 
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
  const [loggedInUserProfile, setLoggedInUserProfile] = useState<AuthUserProfile | null>(null) 
  const [tutoringsData, setTutoringsData] = useState<Tutoring[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [dashboardUrl, setDashboardUrl] = useState<string>("/login") 
  const [profileUrl, setProfileUrl] = useState<string>("/login") 
  const { getCurrentUserProfile, logout } = useAuth() 

  const fetchProfileAndSetLoginStatus = useCallback(async () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          jwtDecode(token); 
          setIsLoggedIn(true);
          const profile = await getCurrentUserProfile();
          setLoggedInUserProfile(profile); 
          if (!profile) { 
            setIsLoggedIn(false);
            localStorage.removeItem("token");
          }
        } catch (e) {
          console.error("Token decoding failed or profile fetch failed:", e);
          setIsLoggedIn(false);
          localStorage.removeItem("token"); 
          setLoggedInUserProfile(null); 
        }
      } else {
        setIsLoggedIn(false);
        setLoggedInUserProfile(null); 
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
        setProfileUrl("/profile/tutor");
      } else if (loggedInUserProfile.user.role === "STUDENT") {
        setDashboardUrl("/dashboard/student");
        setProfileUrl("/profile/student");
      } else {
        console.warn(`Rol de usuario (${loggedInUserProfile.user.role}) no manejado para enlaces, usando /dashboard/student y /profile/student por defecto.`);
        setDashboardUrl("/dashboard/student"); 
        setProfileUrl("/profile/student"); 
      }
    } else if (!isLoggedIn) {
      setDashboardUrl("/login"); 
      setProfileUrl("/login");
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

>>>>>>> 91eaf8eece301544045eee58500715486608cde4
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
<<<<<<< HEAD
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-sky-600">LINKUDP</span>
          </Link>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Iniciar Sesión
            </Link>
            <Link href="/register" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Registrarse
            </Link>
=======
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
                  href={dashboardUrl} 
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Mi Dashboard
                </Link>
                <Link
                  href={profileUrl} 
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
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
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
<<<<<<< HEAD
              <Input className="max-w-[200px]" placeholder="Buscar tutoría..." />
=======
              <Input
                className="max-w-[200px]"
                placeholder="Buscar tutoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filtrar tutorías</span>
              </Button>
<<<<<<< HEAD
              <Link href="/tutoring/create">
                <Button className="bg-sky-600 hover:bg-sky-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Tutoría
                </Button>
              </Link>
=======
              {loggedInUserProfile && loggedInUserProfile.user && loggedInUserProfile.user.role !== "STUDENT" && (
                <Link href="/tutoring/create">
                  <Button className="bg-sky-600 hover:bg-sky-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Tutoría
                  </Button>
                </Link>
              )}
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
<<<<<<< HEAD
            {tutorings.map((tutoring) => (
              <Link href={`/tutoring/${tutoring.id}`} key={tutoring.id}>
                <Card className="h-full overflow-hidden transition-all hover:border-sky-300 hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-medium">{tutoring.title}</CardTitle>
                      <Badge variant="outline" className="bg-sky-50 text-sky-700">
                        {tutoring.area}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs text-muted-foreground">Tutor: {tutoring.tutor}</CardDescription>
=======
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
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{tutoring.description}</p>
                  </CardContent>
<<<<<<< HEAD
                  <CardFooter className="border-t bg-muted/50 px-4 py-2">
                    <div className="flex w-full justify-between text-xs text-muted-foreground">
                      <span>Horario: {tutoring.schedule}</span>
                      <span>Duración: {tutoring.duration}</span>
=======
                    <CardFooter className="border-t bg-muted/50 px-4 py-2">
                    <div className="flex w-full justify-between text-xs text-muted-foreground">
                      <span>Horario: {tutoring.schedule || new Date(tutoring.date).toLocaleDateString() + " " + new Date(tutoring.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>Duración: {tutoring.duration || `${((new Date(tutoring.end_time).getTime() - new Date(tutoring.start_time).getTime()) / (1000 * 60 * 60)).toFixed(1)} hrs`}</span>
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
                    </div>
                  </CardFooter>
                </Card>
              </Link>
<<<<<<< HEAD
            ))}
=======
            ))
            ) : (
              <p className="col-span-full text-center text-muted-foreground">
                No se encontraron tutorías.
              </p>
            )}
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
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
<<<<<<< HEAD

const tutorings = [
  {
    id: "1",
    title: "Cálculo Diferencial",
    area: "Matemáticas",
    tutor: "Carlos Mendoza",
    description: "Tutoría para estudiantes de primer año que necesitan reforzar conceptos de cálculo diferencial.",
    schedule: "Lunes y Miércoles 15:00-17:00",
    duration: "2 horas",
  },
  {
    id: "2",
    title: "Programación en Python",
    area: "Informática",
    tutor: "Ana Gómez",
    description: "Aprende los fundamentos de la programación utilizando Python desde cero.",
    schedule: "Martes 10:00-12:00",
    duration: "2 horas",
  },
  {
    id: "3",
    title: "Física Mecánica",
    area: "Física",
    tutor: "Roberto Sánchez",
    description: "Refuerza tus conocimientos en física mecánica y prepárate para tus exámenes.",
    schedule: "Jueves 14:00-16:00",
    duration: "2 horas",
  },
  {
    id: "4",
    title: "Estadística Aplicada",
    area: "Matemáticas",
    tutor: "Laura Martínez",
    description: "Tutoría especializada en estadística aplicada para estudiantes de ciencias sociales.",
    schedule: "Viernes 16:00-18:00",
    duration: "2 horas",
  },
  {
    id: "5",
    title: "Química Orgánica",
    area: "Química",
    tutor: "Miguel Ángel Torres",
    description: "Refuerza tus conocimientos en química orgánica con ejercicios prácticos.",
    schedule: "Lunes 09:00-11:00",
    duration: "2 horas",
  },
  {
    id: "6",
    title: "Economía Básica",
    area: "Economía",
    tutor: "Patricia Flores",
    description: "Conceptos fundamentales de microeconomía y macroeconomía para estudiantes de primer año.",
    schedule: "Miércoles 17:00-19:00",
    duration: "2 horas",
  },
]
=======
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
