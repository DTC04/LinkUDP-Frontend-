"use client"; // Necesario para hooks como useState, useEffect, useRouter

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
	import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // AvatarImage añadido
	import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
	import { Calendar, Clock, MapPin, Search, History } from "lucide-react";
	import { useEffect, useState } from "react";
	import { useRouter } from "next/navigation";

	// --- Interfaces (Consistentes con la respuesta de /profile/me) ---
	interface UserBaseData {
	  id: number;
	  full_name: string;
	  email: string;
	  role: string;
	  photo_url?: string | null;
	  email_verified: boolean;
	}

	interface CourseInterestData {
	  // Del StudentProfile
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
	  // Respuesta de GET /profile/me
	  user: UserBaseData;
	  studentProfile?: StudentProfileData;
	  tutorProfile?: any; // Ajustar si es necesario para un rol BOTH
	}

	// Estado local para la información del perfil a mostrar en el dashboard
	interface DashboardProfileState {
	  name: string;
	  photo_url?: string | null;
	  interests: CourseInterestData[]; // Usaremos la interfaz del backend directamente
	}

	export default function StudentDashboardPage() {
	  const router = useRouter();
	  const [dashboardProfile, setDashboardProfile] =
	    useState<DashboardProfileState | null>(null);
	  const [loading, setLoading] = useState<boolean>(true);
	  const [error, setError] = useState<string | null>(null);

	  // --- Carga de Datos del Perfil del Estudiante ---
	  useEffect(() => {
	    console.log(
	      "StudentDashboardPage: useEffect para cargar datos del perfil iniciado."
	    );
	    const fetchProfileForDashboard = async () => {
	      const token = localStorage.getItem("token"); // Asegúrate que "token" es la clave donde guardas el JWT
	      console.log("StudentDashboardPage: Token obtenido:", token);

	      if (!token) {
		setError("No autenticado. Redirigiendo al login...");
		console.warn(
		  "StudentDashboardPage: No hay token, redirigiendo a login."
		);
		router.push("/login"); // Ajusta tu ruta de login si es diferente
		return;
	      }

	      try {
		setLoading(true);
		setError(null);
		console.log("StudentDashboardPage: Haciendo fetch a /profile/me");
		const res = await fetch("http://localhost:3000/profile/me", {
		  headers: {
		    Authorization: `Bearer ${token}`,
		  },
		});

		console.log(
		  "StudentDashboardPage: Respuesta del fetch recibida, status:",
		  res.status
		);

		if (!res.ok) {
		  const errorBodyText = await res.text();
		  console.error(
		    "StudentDashboardPage: Error en fetch, status:",
		    res.status,
		    "Body:",
		    errorBodyText
		  );
		  if (res.status === 401 || res.status === 403) {
		    localStorage.removeItem("token"); // Token inválido, limpiar
		    setError("Sesión expirada o inválida. Redirigiendo al login...");
		    router.push("/login");
		  } else {
		    let parsedError;
		    try {
		      parsedError = JSON.parse(errorBodyText);
		    } catch (e) {
		      parsedError = { message: errorBodyText };
		    }
		    throw new Error(
		      parsedError.message ||
		        `Error al cargar datos del dashboard: ${res.status}`
		    );
		  }
		  return;
		}

		const data: ApiUserResponse = await res.json();
		console.log(
		  "StudentDashboardPage: Datos recibidos de la API:",
		  JSON.stringify(data, null, 2)
		);

		if (data && data.user) {
		  // Asegurarse que el usuario es un estudiante o tiene perfil de estudiante
		  if (data.user.role === "STUDENT" || data.user.role === "BOTH") {
		    console.log(
		      "StudentDashboardPage: Mapeando datos para el dashboard."
		    );
		    setDashboardProfile({
		      name: data.user.full_name || "Usuario",
		      photo_url: data.user.photo_url,
		      interests: data.studentProfile?.interests || [],
		    });
		  } else {
		    console.warn(
		      "StudentDashboardPage: Usuario no tiene rol de estudiante. Rol actual:",
		      data.user.role
		    );
		    setError("Este dashboard es para estudiantes.");
		    // Podrías redirigir a otro dashboard o página si no es estudiante
		    // router.push('/dashboard/tutor');
		  }
		} else {
		  console.error(
		    "StudentDashboardPage: Formato de datos inesperado de la API.",
		    data
		  );
		  throw new Error("Formato de datos del perfil inesperado.");
		}
	      } catch (err) {
		const errorMessage =
		  err instanceof Error ? err.message : "Ocurrió un error desconocido.";
		setError(errorMessage);
		console.error(
		  "StudentDashboardPage: Catch Error en fetchProfileForDashboard:",
		  err
		);
	      } finally {
		setLoading(false);
		console.log(
		  "StudentDashboardPage: Carga de datos del perfil finalizada (loading=false)."
		);
	      }
	    };

	    fetchProfileForDashboard();
	  }, [router]); // router como dependencia

	  // Datos de ejemplo para las tutorías (a reemplazar con llamadas a API cuando estén listos los endpoints)
	  const upcomingTutorings = [
	    {
	      id: "1",
	      title: "Cálculo Diferencial",
	      area: "Matemáticas",
	      tutor: "Carlos Mendoza",
	      date: "15 de Mayo, 2025",
	      time: "15:00 - 17:00",
	      location: "Biblioteca Central",
	    },
	  ];

	  const recommendedTutorings = [
	    {
	      id: "2",
	      title: "Programación en Python",
	      area: "Informática",
	      tutor: "Ana Gómez",
	      description:
		"Aprende los fundamentos de la programación utilizando Python desde cero.",
	      schedule: "Martes 10:00-12:00",
	      duration: "2 horas",
	    },
	    {
	      id: "3",
	      title: "Física Mecánica",
	      area: "Física",
	      tutor: "Roberto Sánchez",
	      description:
		"Refuerza tus conocimientos en física mecánica y prepárate para tus exámenes.",
	      schedule: "Jueves 14:00-16:00",
	      duration: "2 horas",
	    },
	  ];

	  // Función para obtener iniciales (si quieres usarla para el Avatar en el header o algún otro lugar)
	  const getInitials = (name?: string) => {
	    if (!name) return "?";
	    const names = name.split(" ");
	    const initials = names.map((n) => n[0]).join("");
	    return initials.toUpperCase().slice(0, 2);
	  };

	  if (loading) {
	    return (
	      <div className="flex justify-center items-center h-screen">
		<p>Cargando dashboard...</p>
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
		<p>No se pudo cargar la información del dashboard.</p>
	      </div>
	    );
	  }

	  return (
	    <div className="flex min-h-screen flex-col">
	      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
		<div className="container flex h-16 items-center">
		  {/* Podrías añadir el avatar del usuario aquí si lo deseas */}
		  {/* {dashboardProfile?.photo_url && (
		    <Avatar className="h-8 w-8 mr-2">
		      <AvatarImage src={dashboardProfile.photo_url} alt={dashboardProfile.name} />
		      <AvatarFallback>{getInitials(dashboardProfile.name)}</AvatarFallback>
		    </Avatar>
		  )} */}
		  <span className="text-xl font-bold text-sky-600 cursor-default select-none">LINKUDP</span>
		  <nav className="ml-auto flex gap-4 sm:gap-6">
		    <Link
		      href="/tutoring"
		      className="text-sm font-medium text-muted-foreground hover:text-foreground"
		    >
		      Buscar Tutorías
		    </Link>
		    <Link
		      href="/dashboard/student"
		      className="text-sm font-medium text-foreground border-b-2 border-sky-600 pb-1"
		    >
		      {" "}
		      {/* Ruta actual, marcada activa */}
		      Mi Dashboard
		    </Link>
		    <Link
		      href="/profile/student"
		      className="text-sm font-medium text-muted-foreground hover:text-foreground"
		    >
		      Mi Perfil
		    </Link>
		    {/* Aquí podrías añadir un botón de Logout si tienes la lógica en tu useAuth o similar */}
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
		      {/* Mostrar nombre del perfil cargado */}
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
		      {upcomingTutorings.length > 0 ? (
		        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		          {upcomingTutorings.map((tutoring) => (
		            <Card key={tutoring.id} className="h-full overflow-hidden">
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
		                <CardDescription className="flex items-center gap-1 text-xs">
		                  <Avatar className="h-5 w-5">
		                    <AvatarFallback>
		                      {tutoring.tutor.charAt(0)}
		                    </AvatarFallback>
		                  </Avatar>
		                  {tutoring.tutor}
		                </CardDescription>
		              </CardHeader>
		              <CardContent>
		                <div className="grid gap-2">
		                  <div className="flex items-center gap-2 text-sm">
		                    <Calendar className="h-4 w-4 text-sky-600" />
		                    <span>{tutoring.date}</span>
		                  </div>
		                  <div className="flex items-center gap-2 text-sm">
		                    <Clock className="h-4 w-4 text-sky-600" />
		                    <span>{tutoring.time}</span>
		                  </div>
		                  <div className="flex items-center gap-2 text-sm">
		                    <MapPin className="h-4 w-4 text-sky-600" />
		                    <span>{tutoring.location}</span>
		                  </div>
		                </div>
		              </CardContent>
		              <CardFooter>
		                <Link
		                  href={`/tutoring/${tutoring.id}`}
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
		              tutor
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
		      {/* Mantener datos de ejemplo o conectar a API si existe */}
		      {recommendedTutorings.length > 0 ? (
		        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		          {recommendedTutorings.map((tutoring) => (
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
		              Explora las tutorías disponibles.
		            </p>
		          </CardContent>
		        </Card>
		      )}
		    </TabsContent>
		    <TabsContent value="history" className="mt-4">
		      <Card>
		        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
		          <History className="mb-4 h-12 w-12 text-muted-foreground" />
		          <h3 className="mb-2 text-xl font-medium">
		            No tienes historial de tutorías
		          </h3>
		          <p className="mb-4 text-muted-foreground">
		            Tu historial de tutorías aparecerá aquí una vez que hayas
		            completado alguna sesión
		          </p>
		        </CardContent>
		      </Card>
		    </TabsContent>
		  </Tabs>

		  <div className="mt-10 grid gap-6 md:grid-cols-2">
		    <Card>
		      <CardHeader>
		        <CardTitle>Tus áreas de interés</CardTitle>
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
		            Aún no has especificado tus áreas de interés.
		          </p>
		        )}
		      </CardContent>
		      <CardFooter>
		        <Link href="/profile/student">
		          <Button variant="outline" size="sm">
		            Editar intereses
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
		          {" "}
		          {/* Temporalmente enlaza a perfil de estudiante para editar rol */}
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