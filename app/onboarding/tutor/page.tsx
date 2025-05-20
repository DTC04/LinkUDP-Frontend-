// app/onboarding/tutor/page.tsx

"use client";

import type React from "react";
import { useState, ChangeEvent } from "react";
// import { useRouter } from "next/navigation"; // No es necesario si useAuth lo maneja
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
import { ChevronLeft, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth, TutorOnboardingFormData } from "@/hooks/use-auth"; // Ajusta la ruta

// Estructura para el estado de un nuevo curso (sin courseIdString por ahora)
interface NewCourseState {
  name: string;
  level: string;
  grade: string;
}

// Estructura para los cursos que se almacenan en el estado (sin courseId)
interface CourseEntry {
  internalId: number; // ID único para la key en el map del frontend
  name: string;
  level: string;
  grade: string;
}

export default function TutorOnboardingPage() {
  // const router = useRouter(); // No se usa directamente aquí
  const { updateTutorProfile, loading, error } = useAuth();

  const [formData, setFormData] = useState({
    university: "",
    degree: "",
    year: "",
    bio: "",
    // cv_url: "", // Opcional
    // experience_details: "", // Opcional
  });

  // El estado 'courses' ahora no necesita 'courseId' ya que no se enviará
  const [courses, setCourses] = useState<CourseEntry[]>([]);
  const [newCourse, setNewCourse] = useState<NewCourseState>({
    name: "",
    level: "",
    grade: "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (fieldName: string, value: string) => {
    if (fieldName === "year") {
      setFormData((prev) => ({ ...prev, year: value }));
    }
  };

  const handleNewCourseChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCourse((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewCourseSelectChange = (value: string) => {
    setNewCourse((prev) => ({ ...prev, level: value }));
  };

  const addCourse = () => {
    if (!newCourse.name || !newCourse.level || !newCourse.grade) {
      alert(
        "Por favor, completa todos los campos del curso (nombre, nivel, nota)."
      );
      return;
    }

    const gradeValue = parseFloat(newCourse.grade);
    if (isNaN(gradeValue) || gradeValue < 1.0 || gradeValue > 7.0) {
      alert("La nota debe ser un número entre 1.0 y 7.0.");
      return;
    }

    setCourses([
      ...courses,
      {
        internalId: Date.now(),
        name: newCourse.name,
        level: newCourse.level,
        grade: newCourse.grade,
      },
    ]);
    setNewCourse({ name: "", level: "", grade: "" });
  };

  const removeCourse = (internalIdToRemove: number) => {
    setCourses(
      courses.filter((course) => course.internalId !== internalIdToRemove)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.university ||
      !formData.degree ||
      !formData.year ||
      !formData.bio
    ) {
      alert("Por favor, completa toda tu información académica y biografía.");
      return;
    }
    // Ya no es mandatorio tener cursos si no se van a enviar IDs válidos
    // if (courses.length === 0) {
    //     alert("Por favor, agrega al menos un curso que puedes enseñar.");
    //     return;
    // }

    const tutorDataToSubmit: TutorOnboardingFormData = {
      bio: formData.bio,
      university: formData.university,
      degree: formData.degree,
      year: formData.year,
      // cv_url: formData.cv_url,
      // experience_details: formData.experience_details,

      // --- SECCIÓN DE CURSOS ---
      // Como no hay IDs, no podemos enviar esta estructura al backend según el DTO actual.
      // Pasamos un array vacío o no definimos la propiedad `courses` para que
      // `updateTutorProfile` en use-auth.ts no la incluya en el payload a /profile/me/tutor.
      // Si TutorOnboardingFormData tiene courses como opcional:
      courses: [], // O `courses: undefined,`
      // O si TutorOnboardingFormData tiene `courses` como `Array<{ name: string; level: string; grade: string; courseId?: number }>`
      // y en use-auth.ts se filtra si no hay courseId:
      // courses: courses.map(c => ({ // Esta estructura no se enviará si courseId es mandatorio en el payload final
      //   name: c.name,
      //   level: c.level,
      //   grade: c.grade,
      //   // courseId: undefined // No hay courseId
      // })),
    };

    // La lógica en `use-auth.ts` (`updateTutorProfile`) ahora omitirá `courses`
    // si no se le pasa o si el array que se le pasa no es procesable para el backend DTO.
    // Lo más simple es asegurar que `tutorDataToSubmit` no tenga la propiedad `courses`
    // o que su valor sea `undefined` si no hay IDs.

    // Si `TutorOnboardingFormData` tiene `courses` como opcional:
    // delete tutorDataToSubmit.courses; // O no lo incluyas al construir el objeto

    console.log(
      "Enviando datos de onboarding del tutor (cursos no se enviarán al backend por ahora):",
      tutorDataToSubmit
    );
    await updateTutorProfile(tutorDataToSubmit);
  };

  return (
    <div className="container mx-auto min-h-screen max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center">
        <Link href="/" className="mr-4 text-sky-600 hover:text-sky-800">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-sky-700">
          Completa tu Perfil de Tutor
        </h1>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-slate-800">
            Información Académica y Profesional
          </CardTitle>
          <CardDescription className="text-slate-600">
            Esta información será visible para los estudiantes que busquen
            tutores.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8 p-6">
            {/* Sección de Información Personal y Académica (igual que antes) */}
            <div className="space-y-6 rounded-lg border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-sky-700">
                Tu Trayectoria
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label
                    htmlFor="university"
                    className="font-medium text-slate-700"
                  >
                    Universidad
                  </Label>
                  <Input
                    id="university"
                    name="university"
                    placeholder="Ej: Universidad de Chile"
                    value={formData.university}
                    onChange={handleChange}
                    required
                    className="border-slate-300 focus:border-sky-500 focus:ring-sky-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label
                    htmlFor="degree"
                    className="font-medium text-slate-700"
                  >
                    Carrera / Título
                  </Label>
                  <Input
                    id="degree"
                    name="degree"
                    placeholder="Ej: Ingeniería Civil en Computación"
                    value={formData.degree}
                    onChange={handleChange}
                    required
                    className="border-slate-300 focus:border-sky-500 focus:ring-sky-500"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="year" className="font-medium text-slate-700">
                  Año de Estudio / Situación Actual
                </Label>
                <Select
                  onValueChange={(value) => handleSelectChange("year", value)}
                  value={formData.year}
                  required
                >
                  <SelectTrigger
                    id="year"
                    className="border-slate-300 focus:border-sky-500 focus:ring-sky-500"
                  >
                    <SelectValue placeholder="Selecciona tu año o situación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Primer año</SelectItem>
                    <SelectItem value="2">Segundo año</SelectItem>
                    <SelectItem value="3">Tercer año</SelectItem>
                    <SelectItem value="4">Cuarto año</SelectItem>
                    <SelectItem value="5">Quinto año</SelectItem>
                    <SelectItem value="6+">Sexto año o superior</SelectItem>
                    <SelectItem value="egresado">Egresado/a</SelectItem>
                    <SelectItem value="titulado">Titulado/a</SelectItem>
                    <SelectItem value="postgrado">
                      Estudiante de Postgrado
                    </SelectItem>
                    <SelectItem value="profesional">
                      Profesional / Experto
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bio" className="font-medium text-slate-700">
                  Biografía Profesional
                </Label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Describe tu experiencia, metodología de enseñanza, logros académicos y cualquier otra cosa que te haga un gran tutor (mín. 50 caracteres)."
                  value={formData.bio}
                  onChange={handleChange}
                  rows={5}
                  required
                  minLength={50}
                  className="border-slate-300 focus:border-sky-500 focus:ring-sky-500"
                />
                <p className="text-xs text-slate-500">
                  Caracteres: {formData.bio.length}
                </p>
              </div>
            </div>

            {/* Sección de Cursos (UI mantenida, pero sin envío de courseId al backend) */}
            <div className="space-y-6 rounded-lg border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-sky-700">
                  Cursos que Podrías Enseñar (Opcional por ahora)
                </h3>
                {courses.length > 0 && (
                  <Badge variant="secondary" className="text-sm">
                    {courses.length} curso(s) en lista
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-600">
                Puedes listar los cursos en los que te sientes capaz de ofrecer
                tutorías.
                <span className="block font-semibold text-orange-600">
                  Nota: Actualmente, esta información es solo para tu referencia
                  y no se guardará en el perfil hasta que la funcionalidad de
                  cursos esté completamente implementada en el sistema.
                </span>
              </p>

              {courses.length > 0 && (
                <div className="space-y-3">
                  {courses.map((course) => (
                    <div
                      key={course.internalId}
                      className="flex flex-col gap-2 rounded-md border border-slate-300 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex-grow">
                        <p className="font-semibold text-slate-800">
                          {course.name}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                          <Badge
                            variant="outline"
                            className="border-sky-300 bg-sky-50 text-sky-700"
                          >
                            Nivel: {course.level}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="border-green-300 bg-green-50 text-green-700"
                          >
                            Nota obtenida: {course.grade}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCourse(course.internalId)}
                        className="text-red-500 hover:bg-red-100 hover:text-red-700 sm:ml-4"
                        aria-label="Eliminar curso"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-4 rounded-md border border-dashed border-slate-400 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-700">
                  Agregar nuevo curso a tu lista (temporal):
                </p>
                {/* El input para courseIdString se quita ya que no hay IDs */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-3">
                  {" "}
                  {/* Ajustado para 3 columnas */}
                  <div className="grid gap-1.5 md:col-span-1">
                    {" "}
                    {/* Nombre del curso */}
                    <Label
                      htmlFor="courseName"
                      className="text-xs font-medium text-slate-600"
                    >
                      Nombre del Curso*
                    </Label>
                    <Input
                      id="courseName"
                      name="name"
                      value={newCourse.name}
                      onChange={handleNewCourseChange}
                      placeholder="Ej: Cálculo I"
                      className="border-slate-300 text-sm focus:border-sky-500 focus:ring-sky-500"
                    />
                  </div>
                  <div className="grid gap-1.5 md:col-span-1">
                    {" "}
                    {/* Nivel del curso */}
                    <Label
                      htmlFor="courseLevel"
                      className="text-xs font-medium text-slate-600"
                    >
                      Nivel del Curso*
                    </Label>
                    <Select
                      onValueChange={handleNewCourseSelectChange}
                      value={newCourse.level}
                    >
                      <SelectTrigger
                        id="courseLevel"
                        className="border-slate-300 text-sm focus:border-sky-500 focus:ring-sky-500"
                      >
                        <SelectValue placeholder="Selecciona nivel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Básico">Básico</SelectItem>
                        <SelectItem value="Intermedio">Intermedio</SelectItem>
                        <SelectItem value="Avanzado">Avanzado</SelectItem>
                        <SelectItem value="Universidad">Universidad</SelectItem>
                        <SelectItem value="Otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5 md:col-span-1">
                    {" "}
                    {/* Nota en el curso */}
                    <Label
                      htmlFor="courseGrade"
                      className="text-xs font-medium text-slate-600"
                    >
                      Tu Nota en el Curso*
                    </Label>
                    <Input
                      id="courseGrade"
                      name="grade"
                      value={newCourse.grade}
                      onChange={handleNewCourseChange}
                      placeholder="Ej: 6.5"
                      type="number"
                      min="1.0"
                      max="7.0"
                      step="0.1"
                      className="border-slate-300 text-sm focus:border-sky-500 focus:ring-sky-500"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addCourse}
                  className="w-full border-sky-500 text-sky-600 hover:bg-sky-50 hover:text-sky-700"
                  disabled={
                    !newCourse.name || !newCourse.level || !newCourse.grade
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Curso a la Lista (Temporal)
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-center gap-4 border-t border-slate-200 p-6">
            {error && (
              <p className="w-full rounded-md border border-red-300 bg-red-50 p-3 text-center text-sm text-red-700">
                {error}
              </p>
            )}
            <Button
              type="submit"
              className="w-full bg-sky-600 py-3 text-base font-semibold text-white hover:bg-sky-700 focus-visible:outline-sky-600 sm:w-auto sm:px-10"
              disabled={loading}
            >
              {loading ? "Guardando Perfil..." : "Guardar y Continuar"}
            </Button>
            <p className="text-xs text-slate-500">
              Al continuar, aceptas nuestros Términos de Servicio y Política de
              Privacidad.
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
