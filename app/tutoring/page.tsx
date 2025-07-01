"use client"
import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Bookmark, Star } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import RequireEmailVerified from "@/components/RequireEmailVerified"
import type { UserProfile as AuthUserProfile } from "@/hooks/use-auth"
import { formatDateUTC } from "@/lib/utils"

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
  averageRating?: number;
  alreadyRated?: boolean;
}

function renderStars(average: number) {
  const filled = Math.floor(average)
  const half = average - filled >= 0.5
  const total = 5
  return (
    <span className="flex items-center gap-0.5 ml-2">
      {[...Array(filled)].map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      ))}
      {half && <Star className="w-4 h-4 fill-yellow-200 text-yellow-200" />}
      {[...Array(total - filled - (half ? 1 : 0))].map((_, i) => (
        <Star key={filled + 1 + i} className="w-4 h-4 text-gray-300" />
      ))}
      <span className="text-xs ml-1 text-gray-500">{average.toFixed(1)}</span>
    </span>
  )
}

export default function TutoringListPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loggedInUserProfile, setLoggedInUserProfile] = useState<AuthUserProfile | null>(null) 
  const [tutoringsData, setTutoringsData] = useState<Tutoring[]>([])
  const [recommendedTutorings, setRecommendedTutorings] = useState<Tutoring[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [dashboardUrl, setDashboardUrl] = useState<string>("/login") 
  const [profileUrl, setProfileUrl] = useState<string>("/login") 
  const { getCurrentUserProfile } = useAuth()
  const [savedTutorings, setSavedTutorings] = useState<string[]>([]);
  // Estado para rating
  const [showModal, setShowModal] = useState(false)
  const [modalTutoring, setModalTutoring] = useState<Tutoring | null>(null)
  const [rating, setRating] = useState<number>(0)
  const [comment, setComment] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)

  const handleSave = async (tutoringId: string) => {
    if (!isLoggedIn) return;

    const isSaved = savedTutorings.includes(tutoringId);
    const method = isSaved ? "DELETE" : "POST";
    const url = `http://localhost:3000/tutorias/${tutoringId}/save`;

    try {
      const response = await fetch(url, {
        method,
        credentials: "include",
      });

      if (response.ok) {
        if (isSaved) {
          setSavedTutorings(savedTutorings.filter((id) => id !== tutoringId));
        } else {
          setSavedTutorings([...savedTutorings, tutoringId]);
        }
      }
    } catch (error) {
      console.error("Error saving tutoring:", error);
    }
  };

  const fetchProfileAndSetLoginStatus = useCallback(async () => {
    if (typeof window !== "undefined") {
      const profile = await getCurrentUserProfile();
      if (profile && profile.user) {
        setIsLoggedIn(true);
        setLoggedInUserProfile(profile);
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
        const response = await fetch("http://localhost:3000/tutorias", { credentials: "include" })
        if (!response.ok) {
          throw new Error("Error al obtener las tutorías")
        }
        const data = await response.json()
        setTutoringsData(data)
      } catch (error) {
        console.error("Error fetching tutorings:", error)
      }
    }

    const fetchSavedTutorings = async () => {
      if (isLoggedIn) {
        try {
          const response = await fetch("http://localhost:3000/tutorias/me/saved", {
            credentials: "include",
          });
          if (response.ok) {
            const data = await response.json();
            setSavedTutorings(data.map((t: any) => t.sessionId));
          }
        } catch (error) {
          console.error("Error fetching saved tutorings:", error);
        }
      }
    };

    fetchTutorings()
    fetchSavedTutorings()
  }, [isLoggedIn])

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const url = `http://localhost:3000/tutorias/recomendadas`;
        const response = await fetch(url, { credentials: "include" });
        if (!response.ok) throw new Error("Error al obtener recomendaciones");
        const data = await response.json();
        setRecommendedTutorings(data);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      }
    };
    if (loggedInUserProfile !== null) {
      fetchRecommendations();
    }
  }, [loggedInUserProfile]);

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

  // --- Modal para calificar ---
  const openRatingModal = (tutoring: Tutoring) => {
    setModalTutoring(tutoring)
    setShowModal(true)
    setRating(0)
    setComment("")
  }
  const closeModal = () => {
    setShowModal(false)
    setModalTutoring(null)
    setRating(0)
    setComment("")
  }
  const handleRatingSubmit = async () => {
    if (!modalTutoring) return;
    setSubmitting(true);
    try {
      // Llama a tu API real
      const response = await fetch(`http://localhost:3000/tutorias/${modalTutoring.id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ value: rating, comment }),
      });
      if (!response.ok) {
        throw new Error("No se pudo registrar la calificación");
      }
      const data = await response.json();
      setTutoringsData(prev =>
        prev.map(t =>
          t.id === modalTutoring.id
            ? { ...t, alreadyRated: true, averageRating: data.averageRating ?? t.averageRating }
            : t
        )
      );
      closeModal();
      alert("¡Calificación registrada!");
    } catch (err) {
      alert("Error al calificar");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <RequireEmailVerified>
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

          {/* Cards */}
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
                      <CardDescription className="text-xs text-muted-foreground flex items-center gap-2">
                        Tutor: {tutoring.tutor?.user?.full_name || "No asignado"}
                        {typeof tutoring.averageRating === "number" && tutoring.averageRating > 0 && renderStars(tutoring.averageRating)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">{tutoring.description}</p>
                    </CardContent>
                    <CardFooter className="border-t bg-muted/50 px-4 py-2 flex justify-between items-center">
                      <div className="flex w-full justify-between text-xs text-muted-foreground">
                        <span>Horario: {tutoring.schedule || formatDateUTC(tutoring.start_time) + " " + new Date(tutoring.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>Duración: {tutoring.duration || `${((new Date(tutoring.end_time).getTime() - new Date(tutoring.start_time).getTime()) / (1000 * 60 * 60)).toFixed(1)} hrs`}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {loggedInUserProfile && (loggedInUserProfile.user.role === "STUDENT" || loggedInUserProfile.user.role === "BOTH") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={
                              tutoring.status !== "FINALIZADA" ||
                              tutoring.alreadyRated
                            }
                            title={
                              tutoring.alreadyRated
                                ? "Ya calificaste esta tutoría"
                                : tutoring.status !== "FINALIZADA"
                                ? "Solo puedes calificar cuando la tutoría haya finalizado"
                                : "Calificar tutoría"
                            }
                            onClick={e => {
                              e.preventDefault();
                              openRatingModal(tutoring)
                            }}
                          >
                            <Star
                              className={`h-5 w-5 ${
                                tutoring.status === "FINALIZADA" && !tutoring.alreadyRated
                                  ? "text-yellow-500"
                                  : "text-gray-300"
                              }`}
                            />
                          </Button>
                        )}
                        {loggedInUserProfile && (loggedInUserProfile.user.role === "STUDENT" || loggedInUserProfile.user.role === "BOTH") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.preventDefault();
                              handleSave(tutoring.id);
                            }}
                          >
                            <Bookmark className={`h-5 w-5 ${savedTutorings.includes(tutoring.id) ? "text-sky-600 fill-sky-600" : "text-muted-foreground"}`} />
                          </Button>
                        )}
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

        {/* MODAL RATING */}
        {showModal && modalTutoring && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Calificar Tutoría</h2>
              <div className="mb-4 flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    className={`text-2xl ${rating >= n ? "text-yellow-400" : "text-gray-300"}`}
                    onClick={() => setRating(n)}
                    type="button"
                  >★</button>
                ))}
              </div>
              <textarea
                className="w-full border rounded p-2 mb-4"
                rows={3}
                placeholder="Deja un comentario (opcional)"
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={closeModal} disabled={submitting}>Cancelar</Button>
                <Button
                  onClick={handleRatingSubmit}
                  disabled={submitting || rating === 0}
                  className="bg-sky-600 hover:bg-sky-700 text-white"
                >
                  {submitting ? "Enviando..." : "Enviar Calificación"}
                </Button>
              </div>
            </div>
          </div>
        )}

      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 LINKUDP. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </RequireEmailVerified>
  )
}
