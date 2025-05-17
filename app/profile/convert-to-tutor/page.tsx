"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { ChevronLeft, Plus, Trash2, Loader2 } from "lucide-react"; // Importa Loader2 o similar
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Definición de TutorCourseDto para el frontend (ajusta según tu backend DTO)
interface TutorCourseSubmitDto {
  courseId: number; // Asume que tienes una forma de obtener el ID del curso por nombre
  level: string;
  grade: number;
}

export default function ConvertToTutorPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    bio: "",
    // cv_url: "",
    // experience_details: "",
    // tutoring_contact_email: "",
    // tutoring_phone: "",
  });

  const [courses, setCourses] = useState<
    { id: number; name: string; level: string; grade: string }[]
  >([]);
  const [newCourse, setNewCourse] = useState({
    name: "",
    level: "",
    grade: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Simulación de lista de cursos disponibles (deberías cargarla desde tu API) ---
  const availableCourses = [
    { id: 1, name: "Cálculo I" },
    { id: 2, name: "Programación I" },
    { id: 3, name: "Álgebra Lineal" },
    { id: 10, name: "Estructuras de Datos" },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewCourseNameChange = (value: string) => {
    // Cambiado para Select
    setNewCourse((prev) => ({ ...prev, name: value }));
  };

  const handleNewCourseLevelChange = (value: string) => {
    setNewCourse((prev) => ({ ...prev, level: value }));
  };

  const handleNewCourseGradeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewCourse((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addCourse = () => {
    if (newCourse.name && newCourse.level && newCourse.grade) {
      const gradeNum = Number.parseFloat(newCourse.grade);
      if (isNaN(gradeNum) || gradeNum < 1.0 || gradeNum > 7.0) {
        setError("La nota debe ser un número entre 1.0 y 7.0.");
        return;
      }
      // Busca el curso seleccionado para obtener su ID
      const selectedCourse = availableCourses.find(
        (c) => c.name === newCourse.name
      );
      if (!selectedCourse) {
        setError("Curso seleccionado no válido.");
        return;
      }

      setCourses([
        ...courses,
        {
          id: selectedCourse.id,
          name: newCourse.name,
          level: newCourse.level,
          grade: newCourse.grade,
        },
      ]);
      setNewCourse({ name: "", level: "", grade: "" });
      setError(null);
    } else {
      setError(
        "Por favor completa todos los campos del curso (Nombre, Nivel, Nota)."
      );
    }
  };

  const removeCourse = (idToRemove: number) => {
    setCourses(courses.filter((course) => course.id !== idToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("No estás autenticado. Por favor, inicia sesión de nuevo.");
      setIsLoading(false);
      router.push("/login"); // O tu ruta de login
      return;
    }

    // Prepara los datos para el backend
    const coursesToSubmit: TutorCourseSubmitDto[] = courses.map((c) => ({
      courseId: c.id, // Usar el ID real del curso
      level: c.level,
      grade: Number.parseFloat(c.grade),
    }));

    const payload = {
      ...formData, //
      courses: coursesToSubmit,
      // availability: [],
    };

    console.log(
      "Enviando payload a /profile/me/tutor:",
      JSON.stringify(payload, null, 2)
    );

    try {
      const response = await fetch("http://localhost:3000/profile/me/tutor", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: "Error desconocido al convertir a tutor.",
        }));
        console.error("Error del backend:", errorData);
        throw new Error(
          errorData.message || `Error del servidor: ${response.status}`
        );
      }

      // Éxito
      console.log("Perfil de tutor actualizado/creado exitosamente.");

      router.push("/dashboard/tutor");
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Ocurrió un error al intentar convertirte en tutor.";
      console.error(
        "Error en handleSubmit (ConvertToTutorPage):",
        errorMessage,
        err
      );
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-10">
      <div className="mb-6 flex items-center">
        <Link href="/dashboard/student" className="mr-4">
          {" "}
          {/*  */}
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-sky-700">
          Convertirme en tutor
        </h1>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Información importante</AlertTitle>
        <AlertDescription>
          Al convertirte en tutor, podrás crear tutorías, establecer tu
          disponibilidad y ayudar a otros estudiantes. Mantendrás tu perfil de
          estudiante y podrás cambiar entre ambos roles.
        </AlertDescription>
      </Alert>

      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Información de tutor</CardTitle>
          <CardDescription>
            Completa la información necesaria para tu perfil de tutor
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="bio">Biografía profesional</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Describe tu experiencia, habilidades y estilo de enseñanza"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  required
                />
              </div>

              {/* Ejemplo:
              <div className="grid gap-2">
                <Label htmlFor="cv_url">URL de tu CV (LinkedIn, etc.)</Label>
                <Input id="cv_url" name="cv_url" value={formData.cv_url} onChange={handleChange} placeholder="https://linkedin.com/in/tu-perfil"/>
              </div>
              */}
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-base">Cursos que puedes enseñar</Label>
                <p className="text-sm text-muted-foreground">
                  Agrega los cursos en los que puedes ofrecer tutorías
                </p>
              </div>

              {courses.length > 0 && (
                <div className="grid gap-2">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-2">
                        <span>{course.name}</span>
                        <Badge
                          variant="outline"
                          className="bg-sky-50 text-sky-700"
                        >
                          {course.level}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700"
                        >
                          Nota: {course.grade}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCourse(course.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid gap-4 rounded-lg border p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="grid gap-2 md:col-span-1">
                    <Label htmlFor="courseNameSelect">Nombre del curso</Label>
                    <Select
                      onValueChange={handleNewCourseNameChange}
                      value={newCourse.name}
                    >
                      <SelectTrigger id="courseNameSelect">
                        <SelectValue placeholder="Selecciona un curso" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCourses.map((course) => (
                          <SelectItem key={course.id} value={course.name}>
                            {course.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2 md:col-span-1">
                    <Label htmlFor="courseLevel">Nivel</Label>
                    <Select
                      onValueChange={handleNewCourseLevelChange}
                      value={newCourse.level}
                    >
                      <SelectTrigger id="courseLevel">
                        <SelectValue placeholder="Selecciona el nivel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Básico">Básico</SelectItem>
                        <SelectItem value="Intermedio">Intermedio</SelectItem>
                        <SelectItem value="Avanzado">Avanzado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2 md:col-span-1">
                    <Label htmlFor="courseGrade">Nota de aprobación</Label>
                    <Input
                      id="courseGrade"
                      name="grade"
                      value={newCourse.grade}
                      onChange={handleNewCourseGradeChange}
                      placeholder="Ej: 6.5"
                      type="number"
                      min="1.0"
                      max="7.0"
                      step="0.1"
                    />
                    <p className="text-xs text-muted-foreground">
                      Nota entre 1.0 y 7.0
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addCourse}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Curso
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                <strong>Nota:</strong> Para este ejemplo, los IDs de los cursos
                se obtienen de una lista predefinida. En una aplicación real,
                cargarías estos cursos desde tu backend.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-sky-600 hover:bg-sky-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Convertirme en tutor
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
