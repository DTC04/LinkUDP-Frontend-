"use client"

<<<<<<< HEAD
import { useState } from "react"
=======
import { useState, useEffect } from "react"
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
<<<<<<< HEAD
import { ChevronLeft, Calendar, Clock, MapPin, User } from "lucide-react"
import { useRouter } from "next/navigation"

export default function TutoringDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()

  // Simulación de datos de tutoría
  const [tutoring] = useState({
    id: params.id,
    title: "Programación en Python",
    area: "Informática",
    description:
      "Aprende los fundamentos de la programación utilizando Python desde cero. Esta tutoría está diseñada para estudiantes sin experiencia previa en programación. Cubriremos variables, estructuras de control, funciones, y estructuras de datos básicas. También realizaremos ejercicios prácticos para reforzar los conceptos aprendidos.",
    schedule: "Martes 10:00-12:00",
    duration: "2 horas",
    location: "Laboratorio de Informática, Edificio A",
    tutor: {
      name: "Ana Gómez",
      avatar: "/placeholder.svg?height=40&width=40",
      university: "Universidad Diego Portales",
      degree: "Ingeniería Informática",
      year: "5to año",
    },
  })
=======
import { ChevronLeft, Calendar, Clock, MapPin, User, AlertCircle, Mail } from "lucide-react"
import { useRouter, useParams } from "next/navigation"

interface UserProfile {
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
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [tutoring, setTutoring] = useState<Tutoring | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      const fetchTutoringDetails = async () => {
        setLoading(true)
        setError(null)
        try {
          const response = await fetch(`http://localhost:3000/tutorias/${params.id}`)
          if (!response.ok) {
            if (response.status === 404) {
              throw new Error("Tutoría no encontrada.")
            }
            throw new Error("Error al obtener los detalles de la tutoría.")
          }
          const data = await response.json()
          setTutoring(data)
        } catch (err: any) {
          setError(err.message)
        } finally {
          setLoading(false)
        }
      }
      fetchTutoringDetails()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="container flex min-h-screen items-center justify-center py-10">
        <p>Cargando detalles de la tutoría...</p>
      </div>
    )
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
    )
  }

  if (!tutoring) {
    return (
      <div className="container flex min-h-screen items-center justify-center py-10">
        <p>No se encontraron detalles para esta tutoría.</p>
      </div>
    )
  }
  
  const schedule = tutoring.schedule || `${new Date(tutoring.date).toLocaleDateString()} ${new Date(tutoring.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  const duration = tutoring.duration || `${((new Date(tutoring.end_time).getTime() - new Date(tutoring.start_time).getTime()) / (1000 * 60 * 60)).toFixed(1)} hrs`;

  const formatAcademicYear = (year?: string | null): string => {
    if (!year) return "Año no especificado";
    const yearNum = parseInt(year, 10);
   
    if (!isNaN(yearNum) && yearNum.toString() === year.trim()) { 
      return `${yearNum}° año`;
    }
    return year; 
  };
>>>>>>> 91eaf8eece301544045eee58500715486608cde4

  return (
    <div className="container py-10">
      <div className="mb-6 flex items-center">
<<<<<<< HEAD
        <Link href="/" className="mr-4">
=======
        <Link href="/tutoring" className="mr-4">
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-sky-700">Detalles de la Tutoría</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{tutoring.title}</CardTitle>
                  <CardDescription className="mt-1">
                    <Badge variant="outline" className="bg-sky-50 text-sky-700">
<<<<<<< HEAD
                      {tutoring.area}
=======
                      {tutoring.course?.name || "N/A"}
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
                    </Badge>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-2 font-medium text-sky-700">Descripción</h3>
                <p className="text-muted-foreground">{tutoring.description}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-sky-600" />
                  <div>
                    <p className="font-medium">Horario</p>
<<<<<<< HEAD
                    <p className="text-sm text-muted-foreground">{tutoring.schedule}</p>
=======
                    <p className="text-sm text-muted-foreground">{schedule}</p>
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-sky-600" />
                  <div>
                    <p className="font-medium">Duración</p>
<<<<<<< HEAD
                    <p className="text-sm text-muted-foreground">{tutoring.duration}</p>
=======
                    <p className="text-sm text-muted-foreground">{duration}</p>
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-sky-600" />
                  <div>
                    <p className="font-medium">Ubicación</p>
<<<<<<< HEAD
                    <p className="text-sm text-muted-foreground">{tutoring.location}</p>
=======
                    <p className="text-sm text-muted-foreground">{tutoring.location || "No especificada"}</p>
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
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
<<<<<<< HEAD
                  <AvatarImage src={tutoring.tutor.avatar || "/placeholder.svg"} alt={tutoring.tutor.name} />
                  <AvatarFallback>AG</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{tutoring.tutor.name}</p>
                  <p className="text-sm text-muted-foreground">{tutoring.tutor.degree}</p>
=======
                  <AvatarImage src={tutoring.tutor?.user?.photo_url || "/placeholder.svg"} alt={tutoring.tutor?.user?.full_name || "Tutor"} />
                  <AvatarFallback>
                    {tutoring.tutor?.user?.full_name?.split(" ").map(n => n[0]).join("").toUpperCase() || "T"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{tutoring.tutor?.user?.full_name || "No asignado"}</p>
                  <p className="text-sm text-muted-foreground">{tutoring.tutor?.degree || "Grado no especificado"}</p>
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-sky-600" />
<<<<<<< HEAD
                  <p className="text-sm text-muted-foreground">{tutoring.tutor.university}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-sky-600" />
                  <p className="text-sm text-muted-foreground">{tutoring.tutor.year}</p>
=======
                  <p className="text-sm text-muted-foreground">{tutoring.tutor?.university || "Universidad no especificada"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-sky-600" />
                  <p className="text-sm text-muted-foreground">{formatAcademicYear(tutoring.tutor?.academic_year)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-sky-600" />
                  <div>
                    <p className="font-medium">Email Tutorías</p>
                    <p className="text-sm text-muted-foreground">{tutoring.tutor?.tutoring_contact_email || tutoring.tutor?.user?.email || "Email no disponible"}</p>
                  </div>
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
                </div>
              </div>
            </CardContent>
            <CardFooter>
<<<<<<< HEAD
              <Button variant="outline" className="w-full" onClick={() => router.push("/profile")}>
=======
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => {
                  if (tutoring?.tutor?.id) {
                    router.push(`/profile/tutor/${tutoring.tutor.id}`)
                  }
                }} 
                disabled={!tutoring?.tutor?.id}
              >
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
                Ver Perfil Completo
              </Button>
            </CardFooter>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Calificaciones</CardTitle>
              <CardDescription>Esta función estará disponible próximamente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                <p>Las calificaciones y reseñas estarán disponibles en futuras actualizaciones.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
