"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, Plus, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"

interface Course {
  id: number
  name: string
  subject_area: string
}

export default function TutorOnboardingPage() {
  const router = useRouter()
  const { updateTutorProfile, loading, error } = useAuth()
  const [formData, setFormData] = useState({
    university: "",
    degree: "",
    year: "",
    bio: "",
  })

  const [availableCourses, setAvailableCourses] = useState<Course[]>([])
  const [courses, setCourses] = useState<{ id: number; name: string; level: string; grade: string }[]>([])
  const [newCourse, setNewCourse] = useState({ name: "", level: "", grade: "" })
  const [coursesLoading, setCoursesLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      setCoursesLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/courses`, {
          credentials: "include",
        })
        if (response.ok) {
          const data = await response.json()
          setAvailableCourses(data)
        } else {
          const errorData = await response.text();
          console.error("Error fetching courses:", response.status, errorData)
        }
      } catch (error) {
        console.error("Error fetching courses:", error)
      } finally {
        setCoursesLoading(false);
      }
    }

    fetchCourses()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNewCourseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewCourse((prev) => ({ ...prev, [name]: value }))
  }

  const handleNewCourseSelectChange = (name: string, value: string) => {
    if (name === "name") {
      const selectedCourse = availableCourses.find((c) => c.name === value)
      if (selectedCourse) {
        setNewCourse((prev) => ({ ...prev, name: selectedCourse.name, id: selectedCourse.id }))
      }
    } else {
      setNewCourse((prev) => ({ ...prev, [name]: value }))
    }
  }

  const addCourse = () => {
    if (newCourse.name && newCourse.level && newCourse.grade) {
      // Validar que la nota sea un número entre 1.0 y 7.0
      const grade = Number.parseFloat(newCourse.grade)
      if (isNaN(grade) || grade < 1.0 || grade > 7.0) {
        alert("La nota debe ser un número entre 1.0 y 7.0")
        return
      }

      const courseToAdd = availableCourses.find(c => c.name === newCourse.name);
      if (courseToAdd) {
        setCourses([...courses, { id: courseToAdd.id, name: courseToAdd.name, level: newCourse.level, grade: newCourse.grade }])
        setNewCourse({ name: "", level: "", grade: "" })
      } else {
        alert("El curso seleccionado no es válido.")
      }

    } else {
      alert("Por favor completa todos los campos del curso")
    }
  }

  const removeCourse = (id: number) => {
    setCourses(courses.filter((course) => course.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const coursesWithNumericIds = courses.map(course => ({
      ...course,
      courseId: course.id 
    }));

    const result = await updateTutorProfile({ ...formData, courses: coursesWithNumericIds });

    if (result) {
      console.log("Perfil de tutor creado:", result)
      router.push("/dashboard/tutor")
    } else {
      console.error("Error al crear el perfil del tutor")
    }
  }

  return (
    <div className="container py-10">
      <div className="mb-6 flex items-center">
        <Link href="/" className="mr-4">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-sky-700">Completa tu perfil de tutor</h1>
      </div>

      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Información académica y profesional</CardTitle>
          <CardDescription>Esta información será visible para los estudiantes que busquen tutores</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="university">Universidad</Label>
                <Input
                  id="university"
                  name="university"
                  placeholder="Universidad Diego Portales"
                  value={formData.university}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="degree">Carrera</Label>
                <Input
                  id="degree"
                  name="degree"
                  placeholder="Ej: Ingeniería Civil"
                  value={formData.degree}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="year">Año de estudio</Label>
                <Select onValueChange={(value) => handleSelectChange("year", value)}>
                  <SelectTrigger id="year">
                    <SelectValue placeholder="Selecciona tu año de estudio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Primer año</SelectItem>
                    <SelectItem value="2">Segundo año</SelectItem>
                    <SelectItem value="3">Tercer año</SelectItem>
                    <SelectItem value="4">Cuarto año</SelectItem>
                    <SelectItem value="5">Quinto año</SelectItem>
                    <SelectItem value="6+">Sexto año o superior</SelectItem>
                    <SelectItem value="egresado">Egresado</SelectItem>
                    <SelectItem value="titulado">Titulado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-base">Cursos que puedes enseñar</Label>
                <p className="text-sm text-muted-foreground">Agrega los cursos en los que puedes ofrecer tutorías</p>
              </div>

              {courses.length > 0 && (
                <div className="grid gap-2">
                  {courses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-2">
                        <span>{course.name}</span>
                        <Badge variant="outline" className="bg-sky-50 text-sky-700">
                          {course.level}
                        </Badge>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Nota: {course.grade}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeCourse(course.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid gap-4 rounded-lg border p-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="courseName">Nombre del curso</Label>
                    <Select onValueChange={(value) => handleNewCourseSelectChange("name", value)}>
                      <SelectTrigger id="courseName">
                        <SelectValue placeholder={coursesLoading ? "Cargando cursos..." : "Selecciona un curso"} />
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
                  <div className="grid gap-2">
                    <Label htmlFor="courseLevel">Nivel</Label>
                    <Select onValueChange={(value) => setNewCourse((prev) => ({ ...prev, level: value }))}>
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
                  <div className="grid gap-2">
                    <Label htmlFor="courseGrade">Nota de aprobación</Label>
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
                    />
                    <p className="text-xs text-muted-foreground">Nota entre 1.0 y 7.0</p>
                  </div>
                </div>
                <Button type="button" variant="outline" onClick={addCourse} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Curso
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                <strong>Nota:</strong> En el futuro, solo podrás agregar cursos con nota de aprobación mayor a 5.0
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.push("/")}>
              Omitir por ahora
            </Button>
            <Button type="submit" className="bg-sky-600 hover:bg-sky-700" disabled={loading}>
              {loading ? "Guardando..." : "Guardar y continuar"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
