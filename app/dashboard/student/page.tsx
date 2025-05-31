"use client"; 

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
	import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
	import { Calendar, Clock, MapPin, Search, History } from "lucide-react";
	import { useEffect, useState } from "react";
	import { useRouter } from "next/navigation";

	interface UserBaseData {
	  id: number;
	  full_name: string;
	  email: string;
	  role: string;
	  photo_url?: string | null;
	  email_verified: boolean;
	}

	interface CourseInterestData {
	  courseId: number;
	  courseName: string;
	}

	interface StudentProfileData {
	  id?: number;
	  userId?: number;
	  university?: string | null;
	  career?: string | null;
	  study_year?: number | null;
	  bio?: string | null;
	  interests?: CourseInterestData[];
	}

	interface ApiUserResponse {
	  user: UserBaseData;
	  studentProfile?: StudentProfileData;
	  tutorProfile?: any; 
	}

	interface DashboardProfileState {
	  name: string;
	  photo_url?: string | null;
	  interests: CourseInterestData[]; 
	}

	export default function StudentDashboardPage() {
	  const router = useRouter();
	  const [dashboardProfile, setDashboardProfile] =
	    useState<DashboardProfileState | null>(null);

	  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
	  const [historyBookings, setHistoryBookings] = useState<any[]>([]);
	  const [recommendedTutoringsData, setRecommendedTutoringsData] = useState<any[]>([]);
	  
	  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
	  const [loadingBookings, setLoadingBookings] = useState<boolean>(false);
	  const [loadingRecommendations, setLoadingRecommendations] = useState<boolean>(false);
	  const [error, setError] = useState<string | null>(null);


	  useEffect(() => {
	    const fetchProfileAndBookings = async () => {
	      setLoadingProfile(true);
	      setError(null);

	      try {
	        const profileRes = await fetch("http://localhost:3000/profile/me", {
				credentials: "include",
	        });

	        if (!profileRes.ok) {
				if (profileRes.status === 401 || profileRes.status === 403) {
				  router.push("/login");
				}
				throw new Error(`Error al cargar perfil: ${profileRes.status}`);
			}
	        const profileData: ApiUserResponse = await profileRes.json();

	        if (profileData?.user && (profileData.user.role === "STUDENT" || profileData.user.role === "BOTH")) {
	          setDashboardProfile({
	            name: profileData.user.full_name || "Usuario",
	            photo_url: profileData.user.photo_url,
	            interests: profileData.studentProfile?.interests || [],
	          });
	          
	          if (profileData.studentProfile?.id) { 
	            setLoadingBookings(true);
	            const studentProfileId = profileData.studentProfile.id;

	            try {
	              const upcomingRes = await fetch(`http://localhost:3000/bookings/me?status=CONFIRMED&status=PENDING&upcoming=true`, { 
	                credentials: "include",
	              });
	              if (!upcomingRes.ok) throw new Error('Error al cargar próximas tutorías');
	              const upcomingData = await upcomingRes.json();
	              setUpcomingBookings(upcomingData.map((booking: any) => ({
	                id: booking.id,
	                title: booking.session?.title || 'N/A',
	                area: booking.session?.course?.name || 'N/A',
	                tutor: booking.session?.tutor?.user?.full_name || 'N/A',
	                date: new Date(booking.session?.start_time).toLocaleDateString(),
	                time: `${new Date(booking.session?.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(booking.session?.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
	                location: booking.session?.location || 'Online',
	                sessionId: booking.sessionId,
	              })));
	            } catch (bookingError) {
	              console.error("Error fetching upcoming bookings:", bookingError);
	            }

	            try {
	              // Fetch past confirmed and cancelled bookings for history
	              const historyRes = await fetch(`http://localhost:3000/bookings/me?status=CONFIRMED&status=CANCELLED&past=true`, { 
	                credentials: "include",
	              });
	              if (!historyRes.ok) throw new Error('Error al cargar historial de tutorías');
	              const historyData = await historyRes.json();
	              setHistoryBookings(historyData.map((booking: any) => ({
	                id: booking.id,
	                title: booking.session?.title || 'N/A',
	                area: booking.session?.course?.name || 'N/A',
	                tutor: booking.session?.tutor?.user?.full_name || 'N/A',
	                date: new Date(booking.session?.start_time).toLocaleDateString(),
	                status: booking.status,
	                sessionId: booking.sessionId,
	              })));
	            } catch (bookingError) {
	              console.error("Error fetching history bookings:", bookingError);
	            }
	            setLoadingBookings(false);
	          }

	          setLoadingRecommendations(true);
	          try {
	            const recomRes = await fetch(`http://localhost:3000/tutorias?status=AVAILABLE&limit=6`, { 
					credentials: "include",
	            });
	            if (!recomRes.ok) throw new Error('Error al cargar tutorías recomendadas');
	            let recommendedData = await recomRes.json();
	            setRecommendedTutoringsData(recommendedData.slice(0,6).map((tutoria: any) => ({
	              id: tutoria.id,
	              title: tutoria.title,
	              area: tutoria.course?.name || 'N/A',
	              tutor: tutoria.tutor?.user?.full_name || 'N/A',
	              description: tutoria.description,
	              schedule: `${new Date(tutoria.start_time).toLocaleDateString()} ${new Date(tutoria.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
	              duration: `${((new Date(tutoria.end_time).getTime() - new Date(tutoria.start_time).getTime()) / (1000 * 60 * 60)).toFixed(1)} horas`,
	            })));
	          } catch (recomError) {
	            console.error("Error fetching recommended tutorings:", recomError);
	          } finally {
	            setLoadingRecommendations(false);
	          }

	        } else {
	          setError("Este dashboard es para estudiantes.");
	        }
	      } catch (err) {
	        setError(err instanceof Error ? err.message : "Ocurrió un error desconocido.");
	        console.error("Error en fetchProfileAndBookings:", err);
	      } finally {
	        setLoadingProfile(false);
	      }
	    };

	    fetchProfileAndBookings();
	  }, [router]);


	  const getInitials = (name?: string) => {
	    if (!name) return "?";
	    const names = name.split(" ");
	    const initials = names.map((n) => n[0]).join("");
	    return initials.toUpperCase().slice(0, 2);
	  };

	  if (loadingProfile) { 
	    return (
	      <div className="flex justify-center items-center h-screen">
		<p>Cargando perfil...</p>
	      </div>
	    );
	  }

	  if (error) {
	    return (
	      <div className="flex flex-col justify-center items-center h-screen">
		<p className="text-red-500 text-xl mb-4">Error</p>
		<p>{error}</p>
		<Button onClick={() => window.location.reload()} className="mt-4">
		  Reintentar
		</Button>
	      </div>
	    );
	  }

	  if (!dashboardProfile) {
	    return (
	      <div className="flex justify-center items-center h-screen">
		<p>No se pudo cargar la información del dashboard. Por favor, reintenta.</p>
	      </div>
	    );
	  }

	  return (
	    <div className="flex min-h-screen flex-col">
	      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
		<div className="container flex h-16 items-center">
		  <span className="text-xl font-bold text-sky-600 cursor-default select-none">LINKUDP</span>
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
		      className="text-sm font-medium text-foreground border-b-2 border-sky-600 pb-1"
		    >
		      Mi Dashboard
		    </Link>
		    <Link
		      href="/profile/student"
		      className="text-sm font-medium text-muted-foreground hover:text-foreground"
		    >
		      Mi Perfil
		    </Link>
		  </nav>
		</div>
	      </header>
	      <main className="flex-1">
		<div className="container px-4 py-10 md:px-6">
		  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
		    <div>
		      <h1 className="text-3xl font-bold tracking-tight text-sky-700">
		        Dashboard de Estudiante
		      </h1>
		      <p className="text-muted-foreground">
		        Bienvenido, {dashboardProfile.name}
		      </p>
		    </div>
		    <div className="flex items-center gap-2">
		      <Link href="/tutoring">
		        <Button className="bg-sky-600 hover:bg-sky-700">
		          <Search className="mr-2 h-4 w-4" />
		          Buscar Tutorías
		        </Button>
		      </Link>
		    </div>
		  </div>

		  <Tabs defaultValue="upcoming" className="mt-8">
		    <TabsList className="grid w-full grid-cols-3 md:w-auto">
		      <TabsTrigger value="upcoming">Próximas Tutorías</TabsTrigger>
		      <TabsTrigger value="recommended">Recomendados</TabsTrigger>
		      <TabsTrigger value="history">Historial</TabsTrigger>
		    </TabsList>
		    <TabsContent value="upcoming" className="mt-4">
		      {loadingBookings ? <p>Cargando próximas tutorías...</p> : upcomingBookings.length > 0 ? (
		        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		          {upcomingBookings.map((booking) => (
		            <Card key={booking.id} className="h-full overflow-hidden">
		              <CardHeader className="pb-2">
		                <div className="flex items-center justify-between">
		                  <CardTitle className="text-lg font-medium">
		                    {booking.title}
		                  </CardTitle>
		                  <Badge
		                    variant="outline"
		                    className="bg-sky-50 text-sky-700"
		                  >
		                    {booking.area}
		                  </Badge>
		                </div>
		                <CardDescription className="flex items-center gap-1 text-xs">
		                  <Avatar className="h-5 w-5">
		                    <AvatarFallback>
		                      {booking.tutor?.charAt(0) || 'T'}
		                    </AvatarFallback>
		                  </Avatar>
		                  {booking.tutor}
		                </CardDescription>
		              </CardHeader>
		              <CardContent>
		                <div className="grid gap-2">
		                  <div className="flex items-center gap-2 text-sm">
		                    <Calendar className="h-4 w-4 text-sky-600" />
		                    <span>{booking.date}</span>
		                  </div>
		                  <div className="flex items-center gap-2 text-sm">
		                    <Clock className="h-4 w-4 text-sky-600" />
		                    <span>{booking.time}</span>
		                  </div>
		                  <div className="flex items-center gap-2 text-sm">
		                    <MapPin className="h-4 w-4 text-sky-600" />
		                    <span>{booking.location}</span>
		                  </div>
		                </div>
		              </CardContent>
		              <CardFooter>
		                <Link
		                  href={`/tutoring/${booking.sessionId}`} 
		                  className="w-full"
		                >
		                  <Button variant="outline" className="w-full">
		                    Ver detalles
		                  </Button>
		                </Link>
		              </CardFooter>
		            </Card>
		          ))}
		        </div>
		      ) : (
		        <Card>
		          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
		            <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
		            <h3 className="mb-2 text-xl font-medium">
		              No tienes tutorías programadas
		            </h3>
		            <p className="mb-4 text-muted-foreground">
		              Busca tutorías disponibles y agenda una sesión con un
		              tutor.
		            </p>
		            <Link href="/tutoring">
		              <Button className="bg-sky-600 hover:bg-sky-700">
		                Buscar Tutorías
		              </Button>
		            </Link>
		          </CardContent>
		        </Card>
		      )}
		    </TabsContent>
		    <TabsContent value="recommended" className="mt-4">
		      {loadingRecommendations ? <p>Cargando recomendaciones...</p> : recommendedTutoringsData.length > 0 ? (
		        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		          {recommendedTutoringsData.map((tutoring) => (
		            <Link href={`/tutoring/${tutoring.id}`} key={tutoring.id}>
		              <Card className="h-full overflow-hidden transition-all hover:border-sky-300 hover:shadow-md">
		                <CardHeader className="pb-2">
		                  <div className="flex items-center justify-between">
		                    <CardTitle className="text-lg font-medium">
		                      {tutoring.title}
		                    </CardTitle>
		                    <Badge
		                      variant="outline"
		                      className="bg-sky-50 text-sky-700"
		                    >
		                      {tutoring.area}
		                    </Badge>
		                  </div>
		                  <CardDescription className="text-xs text-muted-foreground">
		                    Tutor: {tutoring.tutor}
		                  </CardDescription>
		                </CardHeader>
		                <CardContent>
		                  <p className="text-sm text-muted-foreground line-clamp-2">
		                    {tutoring.description}
		                  </p>
		                </CardContent>
		                <CardFooter className="border-t bg-muted/50 px-4 py-2">
		                  <div className="flex w-full justify-between text-xs text-muted-foreground">
		                    <span>Horario: {tutoring.schedule}</span>
		                    <span>Duración: {tutoring.duration}</span>
		                  </div>
		                </CardFooter>
		              </Card>
		            </Link>
		          ))}
		        </div>
		      ) : (
		        <Card>
		          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
		            <Search className="mb-4 h-12 w-12 text-muted-foreground" />
		            <h3 className="mb-2 text-xl font-medium">
		              No hay recomendaciones por ahora
		            </h3>
		            <p className="mb-4 text-muted-foreground">
		              Explora las tutorías disponibles o completa tus intereses en tu perfil para mejores recomendaciones.
		            </p>
		          </CardContent>
		        </Card>
		      )}
		    </TabsContent>
		    <TabsContent value="history" className="mt-4">
		      {loadingBookings ? <p>Cargando historial...</p> : historyBookings.length > 0 ? (
		        <div className="grid gap-4"> 
		          {historyBookings.map((booking) => (
		            <Card key={booking.id} className="overflow-hidden">
		              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
		                <CardTitle className="text-base font-medium">{booking.title}</CardTitle>
		                {/* Adjust badge logic: if status is CONFIRMED (and it's in history, so past=true), it's "Completada" */}
		                <Badge variant={booking.status === "CONFIRMED" ? "default" : "destructive"} 
		                       className={booking.status === "CONFIRMED" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
		                  {booking.status === "CONFIRMED" ? "Completada" : "Cancelada"}
		                </Badge>
		              </CardHeader>
		              <CardContent>
		                <div className="text-sm text-muted-foreground">
		                  <p>Curso: {booking.area}</p> {/* Changed "Área" to "Curso" */}
		                  <p>Tutor: {booking.tutor}</p>
		                  <p>Fecha: {booking.date}</p>
		                </div>
		              </CardContent>
		               <CardFooter>
		                <Link href={`/tutoring/${booking.sessionId}`} className="w-full">
		                  <Button variant="outline" size="sm" className="w-full">
		                    Ver detalles de la tutoría
		                  </Button>
		                </Link>
		              </CardFooter>
		            </Card>
		          ))}
		        </div>
		      ) : (
		        <Card>
		          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
		            <History className="mb-4 h-12 w-12 text-muted-foreground" />
		            <h3 className="mb-2 text-xl font-medium">
		              No tienes historial de tutorías
		            </h3>
		            <p className="mb-4 text-muted-foreground">
		              Tu historial de tutorías aparecerá aquí una vez que hayas
		              completado o cancelado alguna sesión.
		            </p>
		          </CardContent>
		        </Card>
		      )}
		    </TabsContent>
		  </Tabs>

		  <div className="mt-10 grid gap-6 md:grid-cols-2">
		    <Card>
		      <CardHeader>
		        <CardTitle>Tus cursos de interés</CardTitle> {/* Changed "áreas" to "cursos" */}
		        <CardDescription>
		          Materias en las que estás buscando ayuda
		        </CardDescription>
		      </CardHeader>
		      <CardContent>
		        {dashboardProfile.interests.length > 0 ? (
		          <div className="flex flex-wrap gap-2">
		            {dashboardProfile.interests.map((interest) => (
		              <Badge
		                key={interest.courseId}
		                className="bg-sky-100 text-sky-800 hover:bg-sky-200"
		              >
		                {interest.courseName}
		              </Badge>
		            ))}
		          </div>
		        ) : (
		          <p className="text-sm text-muted-foreground">
		            Aún no has especificado tus cursos de interés. {/* Changed "áreas" to "cursos" */}
		          </p>
		        )}
		      </CardContent>
		      <CardFooter>
		        <Link href="/profile/student">
		          <Button variant="outline" size="sm">
		            Editar cursos de interés {/* Changed "intereses" to "cursos de interés" */}
		          </Button>
		        </Link>
		      </CardFooter>
		    </Card>

		    <Card>
		      <CardHeader>
		        <CardTitle>¿Quieres ser tutor?</CardTitle>
		        <CardDescription>
		          Comparte tus conocimientos y ayuda a otros estudiantes
		        </CardDescription>
		      </CardHeader>
		      <CardContent>
		        <p className="text-sm text-muted-foreground">
		          Como tutor, podrás crear tutorías, establecer tu
		          disponibilidad y ayudar a otros estudiantes en las materias
		          que dominas.
		        </p>
		      </CardContent>
		      <CardFooter>
		        {/* El link para convertirse en tutor debería llevar a una página o modal */}
		        {/* que quizás llame a un endpoint PATCH /profile/me/convert-to-tutor o similar */}
		        {/* o simplemente actualice el rol del usuario en /profile/me */}
		        <Link href="/profile/student">
		          <Button className="bg-sky-600 hover:bg-sky-700">
		            Convertirme en tutor
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
