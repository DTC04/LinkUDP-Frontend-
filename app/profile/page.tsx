<<<<<<< HEAD
"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronLeft, Save, Plus, Trash2 } from "lucide-react"
=======
"use client";

import type React from "react";

import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, Save, Plus, Trash2 } from "lucide-react";
>>>>>>> 91eaf8eece301544045eee58500715486608cde4

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: "Ana Gómez",
    email: "ana.gomez@udp.cl",
    bio: "Estudiante de último año de Ingeniería Informática con experiencia en programación y desarrollo web.",
    university: "Universidad Diego Portales",
    degree: "Ingeniería Informática",
    year: "5to año",
<<<<<<< HEAD
  })
=======
  });
>>>>>>> 91eaf8eece301544045eee58500715486608cde4

  const [courses, setCourses] = useState([
    { id: 1, name: "Programación en Python", level: "Intermedio" },
    { id: 2, name: "Desarrollo Web", level: "Avanzado" },
    { id: 3, name: "Bases de Datos", level: "Básico" },
<<<<<<< HEAD
  ])

  const [newCourse, setNewCourse] = useState({ name: "", level: "" })
=======
  ]);

  const [newCourse, setNewCourse] = useState({ name: "", level: "" });
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
  const [schedules, setSchedules] = useState([
    { id: 1, day: "Lunes", startTime: "10:00", endTime: "12:00" },
    { id: 2, day: "Martes", startTime: "15:00", endTime: "17:00" },
    { id: 3, day: "Jueves", startTime: "14:00", endTime: "16:00" },
<<<<<<< HEAD
  ])

  const [newSchedule, setNewSchedule] = useState({ day: "", startTime: "", endTime: "" })

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
  }

  const handleNewCourseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewCourse((prev) => ({ ...prev, [name]: value }))
  }

  const handleNewScheduleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewSchedule((prev) => ({ ...prev, [name]: value }))
  }

  const addCourse = () => {
    if (newCourse.name && newCourse.level) {
      setCourses([...courses, { id: courses.length + 1, ...newCourse }])
      setNewCourse({ name: "", level: "" })
    }
  }

  const removeCourse = (id: number) => {
    setCourses(courses.filter((course) => course.id !== id))
  }

  const addSchedule = () => {
    if (newSchedule.day && newSchedule.startTime && newSchedule.endTime) {
      setSchedules([...schedules, { id: schedules.length + 1, ...newSchedule }])
      setNewSchedule({ day: "", startTime: "", endTime: "" })
    }
  }

  const removeSchedule = (id: number) => {
    setSchedules(schedules.filter((schedule) => schedule.id !== id))
  }

  const saveProfile = () => {
    console.log("Perfil guardado:", { profile, courses, schedules })
    // Aquí iría la lógica para guardar en la base de datos
  }
=======
  ]);

  const [newSchedule, setNewSchedule] = useState({
    day: "",
    startTime: "",
    endTime: "",
  });

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewCourseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCourse((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewScheduleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewSchedule((prev) => ({ ...prev, [name]: value }));
  };

  const addCourse = () => {
    if (newCourse.name && newCourse.level) {
      setCourses([...courses, { id: courses.length + 1, ...newCourse }]);
      setNewCourse({ name: "", level: "" });
    }
  };

  const removeCourse = (id: number) => {
    setCourses(courses.filter((course) => course.id !== id));
  };

  const addSchedule = () => {
    if (newSchedule.day && newSchedule.startTime && newSchedule.endTime) {
      setSchedules([
        ...schedules,
        { id: schedules.length + 1, ...newSchedule },
      ]);
      setNewSchedule({ day: "", startTime: "", endTime: "" });
    }
  };

  const removeSchedule = (id: number) => {
    setSchedules(schedules.filter((schedule) => schedule.id !== id));
  };

  const saveProfile = () => {
    console.log("Perfil guardado:", { profile, courses, schedules });
    // Aquí iría la lógica para guardar en la base de datos
  };
>>>>>>> 91eaf8eece301544045eee58500715486608cde4

  return (
    <div className="container py-10">
      <div className="mb-6 flex items-center">
        <Link href="/" className="mr-4">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-sky-700">Mi Perfil de Tutor</h1>
      </div>

      <div className="flex flex-col gap-6 md:flex-row">
        <div className="md:w-1/3">
          <Card>
            <CardHeader>
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
<<<<<<< HEAD
                  <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Avatar" />
=======
                  <AvatarImage
                    src="/placeholder.svg?height=96&width=96"
                    alt="Avatar"
                  />
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
                  <AvatarFallback className="text-2xl">AG</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <CardTitle>{profile.name}</CardTitle>
                  <CardDescription>{profile.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sky-700">Universidad</h3>
<<<<<<< HEAD
                  <p className="text-sm text-muted-foreground">{profile.university}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sky-700">Carrera</h3>
                  <p className="text-sm text-muted-foreground">{profile.degree}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sky-700">Año</h3>
                  <p className="text-sm text-muted-foreground">{profile.year}</p>
=======
                  <p className="text-sm text-muted-foreground">
                    {profile.university}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-sky-700">Carrera</h3>
                  <p className="text-sm text-muted-foreground">
                    {profile.degree}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-sky-700">Año</h3>
                  <p className="text-sm text-muted-foreground">
                    {profile.year}
                  </p>
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
                </div>
              </div>
            </CardContent>
            <CardFooter>
<<<<<<< HEAD
              <Button variant="outline" className="w-full" onClick={saveProfile}>
=======
              <Button
                variant="outline"
                className="w-full"
                onClick={saveProfile}
              >
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="md:w-2/3">
          <Tabs defaultValue="info">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Información</TabsTrigger>
              <TabsTrigger value="courses">Cursos</TabsTrigger>
              <TabsTrigger value="schedule">Horarios</TabsTrigger>
            </TabsList>
            <TabsContent value="info" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Información Personal</CardTitle>
<<<<<<< HEAD
                  <CardDescription>Actualiza tu información personal y académica</CardDescription>
=======
                  <CardDescription>
                    Actualiza tu información personal y académica
                  </CardDescription>
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nombre completo</Label>
<<<<<<< HEAD
                    <Input id="name" name="name" value={profile.name} onChange={handleProfileChange} />
=======
                    <Input
                      id="name"
                      name="name"
                      value={profile.name}
                      onChange={handleProfileChange}
                    />
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profile.email}
                      onChange={handleProfileChange}
                      disabled
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="bio">Biografía</Label>
<<<<<<< HEAD
                    <Textarea id="bio" name="bio" value={profile.bio} onChange={handleProfileChange} rows={4} />
=======
                    <Textarea
                      id="bio"
                      name="bio"
                      value={profile.bio}
                      onChange={handleProfileChange}
                      rows={4}
                    />
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="university">Universidad</Label>
                    <Input
                      id="university"
                      name="university"
                      value={profile.university}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="degree">Carrera</Label>
<<<<<<< HEAD
                    <Input id="degree" name="degree" value={profile.degree} onChange={handleProfileChange} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="year">Año</Label>
                    <Input id="year" name="year" value={profile.year} onChange={handleProfileChange} />
=======
                    <Input
                      id="degree"
                      name="degree"
                      value={profile.degree}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="year">Año</Label>
                    <Input
                      id="year"
                      name="year"
                      value={profile.year}
                      onChange={handleProfileChange}
                    />
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="courses" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Cursos que puedo enseñar</CardTitle>
<<<<<<< HEAD
                  <CardDescription>Agrega los cursos en los que puedes ofrecer tutorías</CardDescription>
=======
                  <CardDescription>
                    Agrega los cursos en los que puedes ofrecer tutorías
                  </CardDescription>
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    {courses.map((course) => (
<<<<<<< HEAD
                      <div key={course.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="font-medium">{course.name}</p>
                          <p className="text-sm text-muted-foreground">Nivel: {course.level}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeCourse(course.id)}>
=======
                      <div
                        key={course.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <p className="font-medium">{course.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Nivel: {course.level}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCourse(course.id)}
                        >
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="grid gap-4 pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="courseName">Nombre del curso</Label>
                        <Input
                          id="courseName"
                          name="name"
                          value={newCourse.name}
                          onChange={handleNewCourseChange}
                          placeholder="Ej: Cálculo I"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="courseLevel">Nivel</Label>
                        <Input
                          id="courseLevel"
                          name="level"
                          value={newCourse.level}
                          onChange={handleNewCourseChange}
                          placeholder="Ej: Básico, Intermedio, Avanzado"
                        />
                      </div>
                    </div>
<<<<<<< HEAD
                    <Button onClick={addCourse} className="w-full bg-sky-600 hover:bg-sky-700">
=======
                    <Button
                      onClick={addCourse}
                      className="w-full bg-sky-600 hover:bg-sky-700"
                    >
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar Curso
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="schedule" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Horarios Disponibles</CardTitle>
<<<<<<< HEAD
                  <CardDescription>Configura tus horarios disponibles para tutorías</CardDescription>
=======
                  <CardDescription>
                    Configura tus horarios disponibles para tutorías
                  </CardDescription>
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    {schedules.map((schedule) => (
<<<<<<< HEAD
                      <div key={schedule.id} className="flex items-center justify-between rounded-lg border p-3">
=======
                      <div
                        key={schedule.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
                        <div>
                          <p className="font-medium">{schedule.day}</p>
                          <p className="text-sm text-muted-foreground">
                            {schedule.startTime} - {schedule.endTime}
                          </p>
                        </div>
<<<<<<< HEAD
                        <Button variant="ghost" size="icon" onClick={() => removeSchedule(schedule.id)}>
=======
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSchedule(schedule.id)}
                        >
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="grid gap-4 pt-4 border-t">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="day">Día</Label>
                        <select
                          id="day"
                          name="day"
                          value={newSchedule.day}
                          onChange={handleNewScheduleChange as any}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Seleccionar día</option>
                          <option value="Lunes">Lunes</option>
                          <option value="Martes">Martes</option>
                          <option value="Miércoles">Miércoles</option>
                          <option value="Jueves">Jueves</option>
                          <option value="Viernes">Viernes</option>
                          <option value="Sábado">Sábado</option>
                          <option value="Domingo">Domingo</option>
                        </select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="startTime">Hora inicio</Label>
                        <Input
                          id="startTime"
                          name="startTime"
                          type="time"
                          value={newSchedule.startTime}
                          onChange={handleNewScheduleChange}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="endTime">Hora fin</Label>
                        <Input
                          id="endTime"
                          name="endTime"
                          type="time"
                          value={newSchedule.endTime}
                          onChange={handleNewScheduleChange}
                        />
                      </div>
                    </div>
<<<<<<< HEAD
                    <Button onClick={addSchedule} className="w-full bg-sky-600 hover:bg-sky-700">
=======
                    <Button
                      onClick={addSchedule}
                      className="w-full bg-sky-600 hover:bg-sky-700"
                    >
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar Horario
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
<<<<<<< HEAD
  )
=======
  );
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
}
