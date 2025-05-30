"use client";

import type React from "react";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth, type UserProfile } from "../../../hooks/use-auth";
import { toast } from "@/components/ui/use-toast";

interface Course {
  id: number;
  name: string;
  subject_area: string;
}

export default function CreateTutoringPage() {
  const router = useRouter();
  const {
    getCurrentUserProfile,
    loading: authLoading,
    error: authError,
  } = useAuth();
  const [currentUserProfile, setCurrentUserProfile] =
    useState<UserProfile | null>(null);
  // const [apiToken, setApiToken] = useState<string | null>(null); // Eliminado
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    courseId: "", 
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      // Fetch profile
      const profile = await getCurrentUserProfile();
      setCurrentUserProfile(profile);
      // const storedToken = localStorage.getItem("token"); // Eliminado
      // setApiToken(storedToken); // Eliminado

      if (!profile || !profile.user) { // Verificamos profile y profile.user
        toast({
          title: "Autenticación requerida",
          description: "Por favor, inicia sesión para crear una tutoría.",
          variant: "destructive",
        });
        router.push("/login");
        return; // Stop further execution if not authenticated
      }

      // Fetch courses
      try {
        setLoadingCourses(true);
        // Aseguramos que se envíen las credenciales para obtener los cursos
        const coursesResponse = await fetch("http://localhost:3000/courses", {
          credentials: "include", // Agregado para enviar cookies de sesión
        });
        if (!coursesResponse.ok) {
          const errorBody = await coursesResponse.text();
          console.error("Error response body from /courses:", errorBody);
          throw new Error(`Error al cargar la lista de cursos. Status: ${coursesResponse.status}`);
        }
        const coursesData: Course[] = await coursesResponse.json();
        setCoursesList(coursesData);
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast({
          title: "Error al cargar cursos",
          description: (error as Error).message,
          variant: "destructive",
        });
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchInitialData();
  }, [getCurrentUserProfile, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUserProfile || !currentUserProfile.user) { // Eliminada la comprobación de apiToken
      toast({
        title: "Error de autenticación",
        description:
          "No se pudo obtener la información del usuario. Por favor, reintenta iniciar sesión.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    if (
      !currentUserProfile.tutorProfile ||
      !currentUserProfile.tutorProfile.id
    ) {
      toast({
        title: "Error de perfil de tutor",
        description:
          "No se pudo encontrar el perfil de tutor. Asegúrate de que tu perfil de tutor esté completo.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.date) {
      toast({
        title: "Campo requerido",
        description: "Por favor, selecciona una fecha para la tutoría.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.courseId) { // Changed from formData.area
      toast({
        title: "Campo requerido",
        description: "Por favor, selecciona un curso para la tutoría.", // Changed "área" to "curso"
        variant: "destructive",
      });
      return;
    }

    const courseIdNum = parseInt(formData.courseId, 10);
    if (isNaN(courseIdNum)) {
      toast({
        title: "Error en el curso", // Changed "área" to "curso"
        description: "El curso seleccionado no es válido.", // Changed "área" to "curso"
        variant: "destructive",
      });
      return;
    }

    const startTimeISO = new Date(
      `${formData.date}T${formData.startTime}:00`
    ).toISOString();
    const endTimeISO = new Date(
      `${formData.date}T${formData.endTime}:00`
    ).toISOString();

    const tutoriaData = {
      tutorId: currentUserProfile.tutorProfile.id,
      courseId: courseIdNum, // Use parsed courseId
      title: formData.title,
      description: formData.description,
      date: new Date(formData.date).toISOString(),
      start_time: startTimeISO,
      end_time: endTimeISO,
      location: formData.location,
    };

    try {
      console.log("Datos de tutoría a enviar:", tutoriaData);
      const response = await fetch("http://localhost:3000/tutorias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${apiToken}`, // Eliminado, confiamos en cookies via credentials: "include"
        },
        credentials: "include", // Aseguramos que las cookies se envíen
        body: JSON.stringify(tutoriaData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear la tutoría");
      }

      toast({
        title: "Tutoría Creada",
        description: "La tutoría ha sido creada exitosamente.",
      });
      router.push("/tutoring");
    } catch (error) {
      console.error("Error creating tutoring session:", error);
      toast({
        title: "Error",
        description:
          (error as Error).message ||
          "No se pudo crear la tutoría. Intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  if (authLoading || !currentUserProfile) {
    return (
      <div className="container py-10 text-center">
        Cargando perfil del usuario...
      </div>
    );
  }

  if (authError) {
    return (
      <div className="container py-10 text-center text-red-500">
        Error al cargar: {authError}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col"> {/* Envoltura principal */}
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
              href="/dashboard/tutor" // Asumiendo que esta página es para tutores
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Mi Dashboard
            </Link>
            <Link
              href="/profile/tutor" // Asumiendo que esta página es para tutores
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Mi Perfil
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 container py-10"> {/* Contenido principal */}
        <div className="mb-6 flex items-center">
          <Link href="/dashboard/tutor" className="mr-4">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-sky-700">Crear Nueva Tutoría</h1>
        </div>

        <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Detalles de la Tutoría</CardTitle>
          <CardDescription>
            Completa la información para crear una nueva tutoría
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título de la tutoría</Label>
              <Input
                id="title"
                name="title"
                placeholder="Ej: Tutoría de Cálculo Diferencial"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="courseId">Curso</Label> {/* Changed "Área" to "Curso" and htmlFor */}
              <Select
                value={formData.courseId}
                onValueChange={(value) => handleSelectChange("courseId", value)}
                required
                disabled={loadingCourses || coursesList.length === 0}
              >
                <SelectTrigger id="courseId"> {/* Changed id */}
                  <SelectValue placeholder={loadingCourses ? "Cargando cursos..." : "Selecciona un curso"} /> {/* Changed placeholder */}
                </SelectTrigger>
                <SelectContent>
                  {loadingCourses ? (
                    <SelectItem value="loading" disabled>Cargando...</SelectItem>
                  ) : coursesList.length === 0 ? (
                    <SelectItem value="no-courses" disabled>No hay cursos disponibles</SelectItem>
                  ) : (
                    coursesList.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe brevemente la tutoría, temas a tratar, nivel, etc."
                value={formData.description}
                onChange={handleChange}
                rows={4}
                required
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="date">Fecha</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="startTime">Hora de inicio</Label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime">Hora de fin</Label>
                <Input
                  id="endTime"
                  name="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                name="location"
                placeholder="Ej: Biblioteca Central, Sala de Estudio 3, Online"
                value={formData.location}
                onChange={handleChange}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.push("/dashboard/tutor")}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-sky-600 hover:bg-sky-700"
              disabled={authLoading || !currentUserProfile } // Eliminada la comprobación de apiToken
            >
              Crear Tutoría
            </Button>
          </CardFooter>
        </form>
      </Card>
      </main> {/* Cierre de <main> */}
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
