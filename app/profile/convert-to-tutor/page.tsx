"use client";

import React, { useState } from "react"; // Removido useEffect si no se usa para cargar cursos
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
import { Input } from "@/components/ui/input"; // No se usa si solo hay bio
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
// Removidas importaciones de Select, Plus, Trash2, Badge si no se usa la UI de cursos
import { ChevronLeft, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ConvertToTutorPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    bio: "",
    // Otros campos opcionales de UpdateTutorSpecificProfileDto si los necesitas
  });

  // --- SECCIÓN DE CURSOS COMENTADA/REMOVIDA YA QUE NO SE ENVIARÁN ---
  // const [courses, setCourses] = useState<{ id: number; name: string; level: string; grade: string }[]>([]);
  // const [newCourse, setNewCourse] = useState({ name: "", level: "", grade: "" });
  // const [simulatedAvailableCourses, setSimulatedAvailableCourses] = useState<AvailableCourse[]>([]);
  // --------------------------------------------------------------------

  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // --- useEffect para cargar cursos COMENTADO ---
  // useEffect(() => {
  //   // ...lógica de carga de cursos...
  // }, []);
  // ---------------------------------------------

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- Funciones de manejo de cursos COMENTADAS ---
  // const handleNewCourseNameChange = ...
  // const handleNewCourseLevelChange = ...
  // const handleNewCourseGradeChange = ...
  // const addCourse = ...
  // const removeCourse = ...
  // -----------------------------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitError(null);
    setFormError(null);

    if (formData.bio.trim().length < 10) {
      // Reducido el mínimo para pruebas si quieres
      setFormError(
        "La biografía profesional debe tener al menos 10 caracteres."
      );
      setIsLoading(false);
      return;
    }
    // Ya no se valida la existencia de cursos

    const token = localStorage.getItem("token");
    if (!token) {
      setSubmitError(
        "No estás autenticado. Por favor, inicia sesión de nuevo."
      );
      setIsLoading(false);
      router.push("/login"); // Ajusta tu ruta de login
      return;
    }

    // El payload ahora siempre enviará un array de cursos vacío
    const payload = {
      ...formData, // Solo contendrá 'bio' y otros campos directos si los añades
      courses: [], // <--- ¡IMPORTANTE! Array de cursos vacío
    };

    console.log(
      "Enviando payload (SIN CURSOS) a /profile/me/tutor:",
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

      const responseData = await response.json();

      if (!response.ok) {
        console.error("Error del backend:", responseData);
        const message =
          responseData?.message ||
          responseData?.error ||
          `Error del servidor: ${response.status}`;
        throw new Error(
          typeof message === "string" ? message : JSON.stringify(message)
        );
      }

      console.log(
        "Perfil de tutor actualizado/creado exitosamente (sin cursos):",
        responseData
      );
      router.push("/dashboard/tutor");
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Ocurrió un error inesperado al procesar tu solicitud.";
      console.error(
        "Error en handleSubmit (ConvertToTutorPage):",
        errorMessage,
        err
      );
      setSubmitError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-10 px-4 md:px-0">
      <div className="mb-8 flex items-center">
        <Link href="/dashboard/student" passHref>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Volver"
            className="mr-4"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-sky-700">
          Convertirme en Tutor
        </h1>
      </div>

      {submitError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error al Enviar</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}
      {formError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error en el Formulario</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <Alert className="mb-6 bg-sky-50 border-sky-200 text-sky-800">
        <AlertCircle className="h-4 w-4 text-sky-700" />
        <AlertTitle className="font-semibold">
          Información Importante
        </AlertTitle>
        <AlertDescription>
          Al convertirte en tutor, podrás crear tutorías, establecer tu
          disponibilidad y ayudar a otros estudiantes. Mantendrás tu perfil de
          estudiante y podrás cambiar entre ambos roles desde tu perfil. (Nota:
          La funcionalidad de agregar cursos específicos se habilitará en una
          futura actualización).
        </AlertDescription>
      </Alert>

      <Card className="mx-auto">
        <CardHeader>
          <CardTitle className="text-xl">
            Completa tu Información de Tutor
          </CardTitle>
          <CardDescription>
            Esta información será visible para los estudiantes que busquen
            tutorías.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8">
            <div className="space-y-2">
              <Label htmlFor="bio" className="font-semibold">
                Biografía Profesional
              </Label>
              <Textarea
                id="bio"
                name="bio"
                placeholder="Describe tu experiencia académica, habilidades, metodologías de enseñanza y cualquier otra información relevante para tus futuros alumnos (mín. 10 caracteres para prueba)."
                value={formData.bio}
                onChange={handleChange}
                rows={5}
                required
                minLength={10} // Reducido para pruebas
              />
              <p className="text-xs text-muted-foreground">
                Mínimo 10 caracteres para esta prueba.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-lg font-semibold">
                  Cursos que Puedes Enseñar (Funcionalidad Futura)
                </Label>
                <p className="text-sm text-muted-foreground">
                  Actualmente, esta sección es solo de ejemplo. La capacidad de
                  agregar cursos específicos se implementará más adelante.
                </p>
              </div>

              <div className="grid gap-4 rounded-lg border p-4 opacity-50">
                <p className="text-center text-muted-foreground">
                  La adición de cursos se habilitará pronto.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-8">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.back()}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-sky-600 hover:bg-sky-700 w-full sm:w-auto"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Convertirme en Tutor y Guardar
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
