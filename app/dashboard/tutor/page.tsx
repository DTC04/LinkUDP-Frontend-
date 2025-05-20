<<<<<<< HEAD
=======
"use client"

import { useState, useEffect } from "react"
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, Plus, Users } from "lucide-react"
<<<<<<< HEAD

export default function TutorDashboardPage() {
=======
import { useAuth, type UserProfile } from "../../../hooks/use-auth" 
import { toast } from "@/components/ui/use-toast" 
import { useRouter } from "next/navigation" 

interface Session {
  id: string | number
  title: string
  area: string 
  student?: string 
  date: string
  time: string
  location: string
  description?: string 
  students?: number 
  status?: string 
  course?: { name: string } 
  tutor?: { user?: { full_name?: string } } 
  studentProfile?: { user?: { full_name?: string } } 
  start_time?: string | Date
  end_time?: string | Date
}


export default function TutorDashboardPage() {
  const router = useRouter()
  const { getCurrentUserProfile, loading: authLoading } = useAuth()
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null)
  const [apiToken, setApiToken] = useState<string | null>(null)

  const [upcomingSessionsData, setUpcomingSessionsData] = useState<Session[]>([])
  const [myTutoringsData, setMyTutoringsData] = useState<Session[]>([])
  const [availabilityData, setAvailabilityData] = useState<any[]>([]) 
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    const fetchProfileAndToken = async () => {
      const profile = await getCurrentUserProfile()
      setCurrentUserProfile(profile)
      const storedToken = localStorage.getItem("token")
      setApiToken(storedToken)

      if (!profile || !storedToken) {
        toast({
          title: "Autenticación requerida",
          description: "Por favor, inicia sesión para ver tu dashboard.",
          variant: "destructive",
        })
        router.push("/login")
      }
    }
    fetchProfileAndToken()
  }, [getCurrentUserProfile, router])

  useEffect(() => {
    if (currentUserProfile?.tutorProfile?.id && apiToken) {
      const tutorId = currentUserProfile.tutorProfile.id
      setLoadingData(true)

      const fetchMyTutorings = async () => {
        try {
          const res = await fetch(`http://localhost:3000/tutorias?tutorId=${tutorId}`, {
            headers: { Authorization: `Bearer ${apiToken}` },
          })
          if (!res.ok) throw new Error("Error al cargar mis tutorías")
          const data = await res.json()
          setMyTutoringsData(data.map((item: any) => ({
            id: item.id,
            title: item.title,
            area: item.course?.name || 'N/A',
            description: item.description,
            students: item.bookings?.length || 0, 
            date: new Date(item.date).toLocaleDateString(),
            time: `${new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(item.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            location: item.location || "Online",
            status: item.status,
          })))
        } catch (error) {
          console.error("Failed to fetch my tutorings:", error)
          toast({ title: "Error", description: (error as Error).message, variant: "destructive" })
        }
      }

      const fetchUpcomingSessions = async () => {
        try {
          const res = await fetch(`http://localhost:3000/tutorias?tutorId=${tutorId}&status=CONFIRMED&status=PENDING&upcoming=true`, {
            headers: { Authorization: `Bearer ${apiToken}` },
          })
          if (!res.ok) throw new Error("Error al cargar próximas sesiones")
          const data = await res.json()
          const upcoming = data.map((item: any) => ({
              id: item.id,
              title: item.title,
              area: item.course?.name || 'N/A',
              student: item.bookings?.[0]?.studentProfile?.user?.full_name || "Estudiante por confirmar", 
              date: new Date(item.date).toLocaleDateString(),
              time: `${new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(item.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
              location: item.location || "Online",
          }));
          setUpcomingSessionsData(upcoming)
        } catch (error) {
          console.error("Failed to fetch upcoming sessions:", error)
        }
      }
      
      const fetchAvailability = async () => {
        if (currentUserProfile?.tutorProfile?.availability) {
           setAvailabilityData(currentUserProfile.tutorProfile.availability.map((av: any) => ({
            id: av.day_of_week + av.start_time, 
            day: av.day_of_week,
            startTime: av.start_time,
            endTime: av.end_time,
            status: "available", 
          })));
        }
      };


      Promise.all([fetchMyTutorings(), fetchUpcomingSessions(), fetchAvailability()]).finally(() => setLoadingData(false))
    } else if (!authLoading && (!currentUserProfile || !apiToken)) {
      setLoadingData(false);
    }
  }, [currentUserProfile, apiToken, authLoading])


  if (authLoading || loadingData || !currentUserProfile) {
    return <div className="container flex h-screen items-center justify-center">Cargando dashboard...</div>
  }
  
  const tutorName = currentUserProfile?.user?.full_name || "Tutor";


>>>>>>> 91eaf8eece301544045eee58500715486608cde4
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
<<<<<<< HEAD
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-sky-600">LINKUDP</span>
          </Link>
=======
            <span className="text-xl font-bold text-sky-600 cursor-default select-none">LINKUDP</span>
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link href="/tutoring" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Explorar
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
<<<<<<< HEAD
              <p className="text-muted-foreground">Bienvenido, Ana Gómez</p>
=======
              <p className="text-muted-foreground">Bienvenido, {tutorName}</p>
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
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
            <TabsList className="grid w-full grid-cols-3 md:w-auto">
              <TabsTrigger value="upcoming">Próximas Sesiones</TabsTrigger>
              <TabsTrigger value="mytutorings">Mis Tutorías</TabsTrigger>
              <TabsTrigger value="availability">Disponibilidad</TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming" className="mt-4">
<<<<<<< HEAD
              {upcomingSessions.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {upcomingSessions.map((session) => (
=======
              {upcomingSessionsData.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {upcomingSessionsData.map((session) => (
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
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
<<<<<<< HEAD
                            <AvatarFallback>{session.student.charAt(0)}</AvatarFallback>
                          </Avatar>
                          Estudiante: {session.student}
=======
                            <AvatarFallback>{session.student?.charAt(0) || 'E'}</AvatarFallback>
                          </Avatar>
                          Estudiante: {session.student || 'No asignado'}
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
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
                        <Button variant="outline" className="w-full">
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
<<<<<<< HEAD
                      Crea tutorías y establece tu disponibilidad para que los estudiantes puedan agendar sesiones
                      contigo
                    </p>
                    <Link href="/tutoring/create">
                      <Button className="bg-sky-600 hover:bg-sky-700">Crear Tutoría</Button>
                    </Link>
=======
                      Las sesiones confirmadas o pendientes con estudiantes aparecerán aquí.
                    </p>
                     <Link href="/tutoring/create">
                       <Button className="bg-sky-600 hover:bg-sky-700">Crear Tutoría</Button>
                     </Link>
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            <TabsContent value="mytutorings" className="mt-4">
<<<<<<< HEAD
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {myTutorings.map((tutoring) => (
                  <Card key={tutoring.id} className="h-full overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-medium">{tutoring.title}</CardTitle>
                        <Badge variant="outline" className="bg-sky-50 text-sky-700">
                          {tutoring.area}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-1 text-xs">
                        <Users className="h-3 w-3" /> {tutoring.students} estudiantes interesados
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">{tutoring.description}</p>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button variant="outline" className="w-full">
                        Editar
                      </Button>
                      <Button variant="outline" className="w-full">
                        Ver detalles
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
=======
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
                         <Badge variant={tutoring.status === "AVAILABLE" ? "secondary" : tutoring.status === "CONFIRMED" ? "default" : "outline"} className="mt-1">
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
                        <Button variant="outline" className="w-full">
                          Editar
                        </Button>
                        <Button variant="outline" className="w-full">
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
                    <h3 className="mb-2 text-xl font-medium">No has creado tutorías</h3>
                    <p className="mb-4 text-muted-foreground">
                      Crea tutorías para que los estudiantes puedan encontrarlas y agendar sesiones contigo.
                    </p>
                  </CardContent>
                </Card>
              )}
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
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
<<<<<<< HEAD
                    {availability.map((slot) => (
=======
                    {availabilityData.length > 0 ? availabilityData.map((slot) => (
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
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
<<<<<<< HEAD
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href="/profile/tutor/availability">
                    <Button className="bg-sky-600 hover:bg-sky-700">Gestionar disponibilidad</Button>
                  </Link>
                </CardFooter>
=======
                    )) : <p className="text-muted-foreground">No has configurado tu disponibilidad.</p>}
                  </div>
                </CardContent>
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
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
<<<<<<< HEAD
                    <p className="text-2xl font-bold text-sky-700">3</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-sm text-muted-foreground">Sesiones completadas</p>
                    <p className="text-2xl font-bold text-sky-700">0</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-sm text-muted-foreground">Estudiantes ayudados</p>
                    <p className="text-2xl font-bold text-sky-700">0</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-sm text-muted-foreground">Calificación promedio</p>
                    <p className="text-2xl font-bold text-sky-700">-</p>
=======
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
                    <p className="text-2xl font-bold text-sky-700">{currentUserProfile?.tutorProfile?.average_rating || '-'}</p>
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
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
<<<<<<< HEAD
                  <Badge className="bg-sky-100 text-sky-800 hover:bg-sky-200">Programación en Python</Badge>
                  <Badge className="bg-sky-100 text-sky-800 hover:bg-sky-200">Desarrollo Web</Badge>
                  <Badge className="bg-sky-100 text-sky-800 hover:bg-sky-200">Bases de Datos</Badge>
=======
                  {currentUserProfile?.tutorProfile?.courses && currentUserProfile.tutorProfile.courses.length > 0 ? (
                    currentUserProfile.tutorProfile.courses.map(course => (
                      <Badge key={course.courseId} className="bg-sky-100 text-sky-800 hover:bg-sky-200">
                        {course.courseName}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No has añadido cursos a tu perfil.</p>
                  )}
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
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
  )
}
<<<<<<< HEAD

const upcomingSessions = [
  {
    id: "1",
    title: "Programación en Python",
    area: "Informática",
    student: "Juan Pérez",
    date: "15 de Mayo, 2025",
    time: "10:00 - 12:00",
    location: "Laboratorio de Informática",
  },
]

const myTutorings = [
  {
    id: "1",
    title: "Programación en Python",
    area: "Informática",
    description: "Aprende los fundamentos de la programación utilizando Python desde cero.",
    students: 2,
  },
  {
    id: "2",
    title: "Desarrollo Web",
    area: "Informática",
    description: "Introducción al desarrollo web con HTML, CSS y JavaScript.",
    students: 1,
  },
  {
    id: "3",
    title: "Bases de Datos",
    area: "Informática",
    description: "Fundamentos de bases de datos relacionales y SQL.",
    students: 0,
  },
]

const availability = [
  {
    id: "1",
    day: "Lunes",
    startTime: "10:00",
    endTime: "12:00",
    status: "available",
  },
  {
    id: "2",
    day: "Martes",
    startTime: "15:00",
    endTime: "17:00",
    status: "booked",
  },
  {
    id: "3",
    day: "Jueves",
    startTime: "14:00",
    endTime: "16:00",
    status: "available",
  },
]
=======
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
