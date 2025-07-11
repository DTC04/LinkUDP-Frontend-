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
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

interface Course {
  id: number
  name: string
  subject_area: string
}

export default function StudentOnboardingPage() {
  const router = useRouter()
  const { updateStudentProfile, loading, error } = useAuth()
  const [formData, setFormData] = useState({
    university: "",
    career: "",
    study_year: 0,
    bio: "",
  })
  const [selectedCourses, setSelectedCourses] = useState<number[]>([])
  const [availableCourses, setAvailableCourses] = useState<Course[]>([])
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
    setFormData((prev) => ({ ...prev, [name]: name === 'study_year' ? parseInt(value, 10) : value }));
  }

  const handleCourseChange = (courseId: number) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await updateStudentProfile({ ...formData, interestCourseIds: selectedCourses });

    if (result) {
      console.log("Perfil de estudiante creado:", result)
      router.push("/dashboard/student")
    } else {
      console.error("Error al crear el perfil del estudiante")
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
        <h1 className="text-2xl font-bold text-sky-700">Completa tu perfil de estudiante</h1>
      </div>

      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Información académica</CardTitle>
          <CardDescription>Esta información nos ayudará a encontrar tutores adecuados para ti</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
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
                name="career"
                placeholder="Ej: Ingeniería Civil"
                value={formData.career}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="year">Año de estudio</Label>
              <Select
                onValueChange={(value) => handleSelectChange("study_year", value)}
              >
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
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Cursos de interés</Label>
              <div className="grid grid-cols-2 gap-2 rounded-md border p-4 max-h-60 overflow-y-auto">
                {coursesLoading ? (
                  <p>Cargando cursos...</p>
                ) : (
                  availableCourses.map((course) => (
                    <div key={course.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`course-${course.id}`}
                        checked={selectedCourses.includes(course.id)}
                        onCheckedChange={() => handleCourseChange(course.id)}
                      />
                      <label
                        htmlFor={`course-${course.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {course.name}
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bio">Acerca de ti (opcional)</Label>
              <Textarea
                id="bio"
                name="bio"
                placeholder="Cuéntanos un poco sobre ti, tus objetivos académicos, etc."
                value={formData.bio}
                onChange={handleChange}
                rows={4}
              />
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
