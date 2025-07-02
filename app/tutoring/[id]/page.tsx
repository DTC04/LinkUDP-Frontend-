"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  MessageCircle,
} from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { useAuth, type UserProfile as AuthUserProfile } from "../../../hooks/use-auth"
import { formatDateUTC } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { forbiddenWords } from "../../../lib/forbidden-words"

interface UserProfile {
  id: number
  full_name: string
  email?: string
  photo_url?: string
}

interface TutorProfile {
  id: number
  user: UserProfile
  bio?: string
  university?: string
  degree?: string
  academic_year?: string
  tutoring_contact_email?: string
}

interface Course {
  id: number
  name: string
}

interface Tutoring {
  id: string
  title: string
  description: string
  date: string
  start_time: string
  end_time: string
  location?: string
  notes?: string
  status: string
  tutor: TutorProfile
  course: Course
  schedule?: string
  duration?: string
}

export default function TutoringDetailsPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { getCurrentUserProfile, loading: authLoading } = useAuth()
  const [currentUser, setCurrentUser] = useState<AuthUserProfile | null>(null)

  const [tutoring, setTutoring] = useState<Tutoring | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bookingStatus, setBookingStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [bookingMessage, setBookingMessage] = useState<string | null>(null)
  const [hasBooked, setHasBooked] = useState(false)
  const [currentBookingId, setCurrentBookingId] = useState<number | null>(null)
  const [isFinished, setIsFinished] = useState(false)

  const fetchTutoringDetails = async () => {
    setLoading(true)
    setError(null)
    setHasBooked(false)
    setCurrentBookingId(null)

    const userProfile = await getCurrentUserProfile()
    setCurrentUser(userProfile)
    const authenticated = !!userProfile

    if (!params.id) {
      setError("ID de tutoría no especificado.")
      setLoading(false)
      return
    }

    try {
      const tutoringResponse = await fetch(`http://localhost:3000/tutorias/${params.id}`)
      if (!tutoringResponse.ok) {
        if (tutoringResponse.status === 404) {
          throw new Error("Tutoría no encontrada.")
        }
        throw new Error("Error al obtener los detalles de la tutoría.")
      }
      const tutoringData = await tutoringResponse.json()
      setTutoring(tutoringData)

      if (authenticated && tutoringData.id) {
        try {
          const userBookingsResponse = await fetch(
            `http://localhost:3000/bookings/me?sessionId=${tutoringData.id}&status=PENDING&status=CONFIRMED`,
            { credentials: "include" },
          )

          if (userBookingsResponse.ok) {
            const userBookings = await userBookingsResponse.json()
            const foundBooking = userBookings.find(
              (booking: any) =>
                booking.sessionId === tutoringData.id &&
                (booking.status === "PENDING" || booking.status === "CONFIRMED"),
            )
            if (foundBooking) {
              setHasBooked(true)
              setCurrentBookingId(foundBooking.id)
            }
          } else if (userBookingsResponse.status === 404 && userProfile?.user?.role === "TUTOR") {
            // Este caso es esperado para tutores sin bookings.
          } else if (userBookingsResponse.status !== 401) {
            console.error("Error fetching user bookings:", userBookingsResponse.status, userBookingsResponse.statusText)
          }
        } catch (bookingError) {
          console.error("Error al procesar el estado de la reserva:", bookingError)
        }
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTutoringDetails()
  }, [params.id])

  useEffect(() => {
    if (!tutoring?.end_time) return
    const checkFinished = () => {
      const endTime = new Date(tutoring.end_time).getTime()
      const now = Date.now()
      setIsFinished(now >= endTime && tutoring.status === "CONFIRMED")
    }
    checkFinished()
    const interval = setInterval(checkFinished, 60000)
    return () => clearInterval(interval)
  }, [tutoring?.end_time, tutoring?.status])

  const handleBookTutoring = async () => {
    if (!tutoring) return

    setBookingStatus("loading")
    setBookingMessage(null)

    if (!currentUser) {
      setBookingStatus("error")
      setBookingMessage("No estás autenticado. Por favor, inicia sesión para reservar.")
      return
    }

    try {
      const response = await fetch(`http://localhost:3000/bookings/${tutoring.id}/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (response.ok) {
        setBookingStatus("success")
        setBookingMessage("Tutoría agendada con éxito. Esperando confirmación del tutor.")
        await fetchTutoringDetails()
      } else {
        const errorData = await response.json()
        setBookingStatus("error")
        setBookingMessage(errorData.message || "Error al agendar la tutoría.")
        if (errorData.message.includes("Ya tienes una reserva para esta sesión")) {
          setHasBooked(true)
        }
      }
    } catch (err: any) {
      setBookingStatus("error")
      setBookingMessage(err.message || "Error de red al intentar agendar la tutoría.")
    }
  }

  const handleCancelBooking = async () => {
    if (!currentBookingId) return

    setBookingStatus("loading")
    setBookingMessage(null)

    if (!currentUser) {
      setBookingStatus("error")
      setBookingMessage("No estás autenticado. Por favor, inicia sesión para cancelar.")
      return
    }

    try {
      const response = await fetch(`http://localhost:3000/bookings/${currentBookingId}/cancel`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (response.status === 204) {
        setBookingStatus("success")
        setBookingMessage("Reserva cancelada exitosamente.")
        await fetchTutoringDetails()
      } else {
        const errorData = await response.json()
        setBookingStatus("error")
        setBookingMessage(errorData.message || "Error al cancelar la reserva.")
      }
    } catch (err: any) {
      setBookingStatus("error")
      setBookingMessage(err.message || "Error de red al intentar cancelar la reserva.")
    }
  }

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

  const startTimeObj = new Date(tutoring.start_time)
  const scheduleDisplayDate = formatDateUTC(tutoring.start_time)
  const scheduleDisplayTime = startTimeObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  const schedule = tutoring.schedule || `${scheduleDisplayDate} ${scheduleDisplayTime}`

  const duration =
    tutoring.duration ||
    `${((new Date(tutoring.end_time).getTime() - new Date(tutoring.start_time).getTime()) / (1000 * 60 * 60)).toFixed(
      1,
    )} hrs`

  const formatAcademicYear = (year?: string | null): string => {
    if (year === null || year === undefined || year.trim() === "") {
      return "Año no especificado"
    }
    const yearStr = String(year).trim()
    const yearNum = Number.parseInt(yearStr, 10)

    if (!isNaN(yearNum) && yearNum.toString() === yearStr) {
      return `${yearNum}° año`
    }
    return yearStr
  }

  const isAvailableForNewBookings = tutoring.status === "AVAILABLE"
  const isPastSession = new Date(tutoring.end_time) < new Date()
  const canCancel = hasBooked && !isPastSession && (tutoring.status === "PENDING" || tutoring.status === "CONFIRMED")

  const profileLink =
    currentUser?.user?.role === "TUTOR"
      ? "/profile/tutor"
      : currentUser?.user?.role === "STUDENT"
        ? "/profile/student"
        : "/profile"
  const dashboardLink = currentUser?.user?.role === "TUTOR" ? "/dashboard/tutor" : "/dashboard/student"

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 container py-10">
        <div className="mb-6 flex items-center">
          <Link href="/tutoring" className="mr-4">
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
                        {tutoring.course?.name || "N/A"}
                      </Badge>
                    </CardDescription>
                  </div>
                  {tutoring.status && (
                    <Badge
                      className={`
                      ${tutoring.status === "AVAILABLE" ? "bg-green-100 text-green-700" : ""}
                      ${tutoring.status === "PENDING" ? "bg-yellow-100 text-yellow-700" : ""}
                      ${tutoring.status === "CONFIRMED" ? "bg-blue-100 text-blue-700" : ""}
                      ${tutoring.status === "CANCELLED" ? "bg-red-100 text-red-700" : ""}
                      ${tutoring.status === "COMPLETED" ? "bg-gray-100 text-gray-700" : ""}
                      ${
                        isPastSession && (tutoring.status === "CONFIRMED" || tutoring.status === "PENDING")
                          ? "bg-gray-100 text-gray-700"
                          : ""
                      }
                      text-sm font-semibold ml-4
                    `}
                    >
                      {isPastSession && (tutoring.status === "CONFIRMED" || tutoring.status === "PENDING")
                        ? "FINALIZADA"
                        : tutoring.status}
                    </Badge>
                  )}
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
                      <p className="text-sm text-muted-foreground">{schedule}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-sky-600" />
                    <div>
                      <p className="font-medium">Duración</p>
                      <p className="text-sm text-muted-foreground">{duration}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-sky-600" />
                    <div>
                      <p className="font-medium">Ubicación</p>
                      <p className="text-sm text-muted-foreground">{tutoring.location || "No especificada"}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
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
                      !isAvailableForNewBookings || isPastSession || bookingStatus === "loading" || !currentUser
                    }
                  >
                    {bookingStatus === "loading"
                      ? "Agendando..."
                      : isPastSession
                        ? "Sesión Finalizada"
                        : !currentUser
                          ? "Inicia sesión para reservar"
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
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={!currentUser}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      {!currentUser ? "Inicia sesión para contactar" : "Contactar al Tutor"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Contactar a {tutoring.tutor?.user?.full_name || "Tutor"}</DialogTitle>
                      <DialogDescription>
                        Envía un mensaje al tutor para coordinar la tutoría o hacer preguntas sobre el contenido.
                      </DialogDescription>
                    </DialogHeader>
                    <ContactForm
                      tutorName={tutoring.tutor?.user?.full_name || "Tutor"}
                      tutoringTitle={tutoring.title}
                      tutorEmail={
                        tutoring.tutor?.tutoring_contact_email || tutoring.tutor?.user?.email || "No disponible"
                      }
                    />
                  </DialogContent>
                </Dialog>
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
                      src={tutoring.tutor?.user?.photo_url || "/placeholder.svg"}
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
                    <p className="font-medium">{tutoring.tutor?.user?.full_name || "No asignado"}</p>
                    <p className="text-sm text-muted-foreground">{tutoring.tutor?.degree || "Grado no especificado"}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-sky-600" />
                    <p className="text-sm text-muted-foreground">
                      {tutoring.tutor?.university || "Universidad no especificada"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-sky-600" />
                    <p className="text-sm text-muted-foreground">{formatAcademicYear(tutoring.tutor?.academic_year)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-sky-600" />
                    <div>
                      <p className="font-medium">Email Tutorías</p>
                      <p className="text-sm text-muted-foreground">
                        {tutoring.tutor?.tutoring_contact_email || tutoring.tutor?.user?.email || "Email no disponible"}
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
                      router.push(`/profile/tutor/${tutoring.tutor.user.id}`)
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

function ContactForm({
  tutorName,
  tutoringTitle,
  tutorEmail,
}: {
  tutorName: string
  tutoringTitle: string
  tutorEmail: string
}) {
  const [message, setMessage] = useState("")
  const [messageError, setMessageError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const params = useParams<{ id: string }>()

  const validateMessage = (value: string) => {
    const lowerCaseValue = value.toLowerCase()
    for (const word of forbiddenWords) {
      if (lowerCaseValue.includes(word)) {
        setMessageError(`El mensaje contiene palabras no permitidas: ${word}`)
        return
      }
    }
    setMessageError("")
  }

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target
    setMessage(value)
    validateMessage(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess(null)
    setError(null)

    if (!message.trim()) return

    setIsSubmitting(true)

    try {
      const response = await fetch(
        `http://localhost:3000/tutorias/${params.id}/contact`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ message }),
        }
      )

      if (response.ok) {
        setMessage("")
        setSuccess("¡Mensaje enviado exitosamente! El tutor recibirá tu mensaje y te contactará pronto.")
      } else {
        const err = await response.json()
        setError("Error al enviar el mensaje: " + (err.message || "Intenta de nuevo."))
      }
    } catch (err: any) {
      setError("Error de red al enviar el mensaje.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="message">Tu mensaje</Label>
        <Textarea
          id="message"
          placeholder={`Hola ${tutorName}, estoy interesado en la tutoría "${tutoringTitle}". Me gustaría saber más sobre...`}
          value={message}
          onChange={handleMessageChange}
          rows={4}
          required
        />
        {messageError && (
          <p className="text-sm text-red-500">{messageError}</p>
        )}
      </div>
      <div className="text-sm text-muted-foreground">
        <strong>Email del tutor:</strong> {tutorEmail}
      </div>
      {success && (
        <div className="text-green-600 text-sm">{success}</div>
      )}
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
      <DialogFooter>
        <Button
          type="submit"
          disabled={isSubmitting || !message.trim() || !!messageError}
          className="bg-sky-600 hover:bg-sky-700"
        >
          {isSubmitting ? "Enviando..." : "Enviar mensaje"}
        </Button>
      </DialogFooter>
    </form>
  )
}

function canRateTutoring(tutoring: any) {
  if (!tutoring?.end_time || !tutoring?.status) return false;
  const finished = new Date(tutoring.end_time).getTime() <= Date.now();
  return tutoring.status === "CONFIRMED" && finished;
}
