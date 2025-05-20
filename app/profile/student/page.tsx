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
import { Badge } from "@/components/ui/badge"

export default function StudentProfilePage() {
  const [profile, setProfile] = useState({
    name: "Juan Pérez",
    email: "juan.perez@udp.cl",
    bio: "Estudiante de Ingeniería Civil en la Universidad Diego Portales. Interesado en matemáticas, física y programación.",
    university: "Universidad Diego Portales",
    degree: "Ingeniería Civil",
    year: "2do año",
  })

  const [interests, setInterests] = useState([
    { id: 1, name: "Matemáticas" },
    { id: 2, name: "Física" },
    { id: 3, name: "Programación" },
  ])

  const [newInterest, setNewInterest] = useState("")

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
  }

  const handleNewInterestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewInterest(e.target.value)
  }

  const addInterest = () => {
    if (newInterest) {
      setInterests([...interests, { id: interests.length + 1, name: newInterest }])
      setNewInterest("")
    }
  }

  const removeInterest = (id: number) => {
    setInterests(interests.filter((interest) => interest.id !== id))
  }

  const saveProfile = () => {
    console.log("Perfil guardado:", { profile, interests })
    // Aquí iría la lógica para guardar en la base de datos
  }

  return (
    <div className="container py-10">
      <div className="mb-6 flex items-center">
=======
"use client";

import React, { useState, useEffect, ChangeEvent, KeyboardEvent } from "react";
import Link from "next/link"; // Mantener si lo usas para algún enlace de navegación
import { useRouter } from "next/navigation";
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
import { ChevronLeft, Save, Plus, Trash2, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// --- Interfaces (SIN CAMBIOS) ---
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
interface ProfileState {
  name: string;
  email: string;
  photo_url?: string;
  bio: string;
  university: string;
  degree: string;
  year: string;
}
interface InterestState {
  id: number;
  name: string;
}

// --- Componente Principal (LÓGICA SIN CAMBIOS) ---
export default function StudentProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileState | null>(null);
  const [interests, setInterests] = useState<InterestState[]>([]);
  const [newInterest, setNewInterest] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("general"); // Pestaña activa por defecto

  useEffect(() => {
    const fetchProfileData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No autenticado. Redirigiendo al login...");
        router.push("/login");
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("http://localhost:3000/profile/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            localStorage.removeItem("token");
            setError("Sesión expirada o inválida. Redirigiendo al login...");
            router.push("/login");
          } else {
            const errorData = await res.json();
            throw new Error(
              errorData.message || `Error al cargar el perfil: ${res.status}`
            );
          }
          return;
        }
        const data: ApiUserResponse = await res.json();
        if (data && data.user) {
          const studentData = data.studentProfile;
          let yearDisplay = "Año no especificado";
          if (studentData?.study_year) {
            yearDisplay = `${studentData.study_year}° año`;
          }
          setProfile({
            name: data.user.full_name || "",
            email: data.user.email || "",
            photo_url: data.user.photo_url || undefined,
            bio: studentData?.bio || "",
            university: studentData?.university || "",
            degree: studentData?.career || "",
            year: yearDisplay,
          });
          const mappedInterests =
            studentData?.interests?.map((interest) => ({
              id: interest.courseId,
              name: interest.courseName,
            })) || [];
          setInterests(mappedInterests);
        } else {
          throw new Error("Formato de datos del perfil inesperado.");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Ocurrió un error desconocido.";
        setError(errorMessage);
        console.error("Fetch profile error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [router]);

  const handleProfileChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!profile) return;
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleNewInterestChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewInterest(e.target.value);
  };

  const addInterest = () => {
    if (
      newInterest.trim() &&
      !interests.some(
        (i) => i.name.toLowerCase() === newInterest.trim().toLowerCase()
      )
    ) {
      alert(
        "Funcionalidad de agregar nuevo interés: considera cómo obtendrás el ID del curso para '" +
          newInterest.trim() +
          "'. Por ahora, esta acción es solo visual y no se guardará correctamente sin un ID de curso válido."
      );
      // Para un ejemplo visual rápido:
      // setInterests([...interests, { id: Date.now(), name: newInterest.trim() }]);
      // setNewInterest("");
    }
  };

  const removeInterest = (idToRemove: number) => {
    setInterests(interests.filter((interest) => interest.id !== idToRemove));
  };

  const saveProfile = async () => {
    if (!profile) return;
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No autenticado. No se pueden guardar los cambios.");
      router.push("/login");
      return;
    }
    setSaving(true);
    setError(null);
    let studyYearNumber: number | undefined = undefined;
    if (profile.year && typeof profile.year === "string") {
      const match = profile.year.match(/^(\d+)/);
      if (match) {
        studyYearNumber = parseInt(match[1], 10);
      }
    }
    const payload = {
      full_name: profile.name,
      photo_url: profile.photo_url,
      bio: profile.bio,
      university: profile.university,
      career: profile.degree,
      study_year: studyYearNumber,
      interestCourseIds: interests.map((interest) => interest.id),
    };
    console.log("Guardando perfil de estudiante con payload:", payload);
    try {
      const res = await fetch("http://localhost:3000/profile/me", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message ||
            `Error al guardar el perfil: ${res.status} ${res.statusText}`
        );
      }
      const updatedProfileData: ApiUserResponse = await res.json();
      if (updatedProfileData && updatedProfileData.user) {
        const studentData = updatedProfileData.studentProfile;
        let yearDisplay = "Año no especificado";
        if (studentData?.study_year) {
          yearDisplay = `${studentData.study_year}° año`;
        }
        setProfile({
          name: updatedProfileData.user.full_name || "",
          email: updatedProfileData.user.email || "",
          photo_url: updatedProfileData.user.photo_url || undefined,
          bio: studentData?.bio || "",
          university: studentData?.university || "",
          degree: studentData?.career || "",
          year: yearDisplay,
        });
        const mappedInterests =
          studentData?.interests?.map((interest) => ({
            id: interest.courseId,
            name: interest.courseName,
          })) || [];
        setInterests(mappedInterests);
        alert("Perfil guardado exitosamente!");
      } else {
        throw new Error("Respuesta inesperada del servidor tras guardar.");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido al guardar.";
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
      console.error("Save profile error:", err);
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    const names = name.split(" ");
    const initials = names.map((n) => n[0]).join("");
    return initials.toUpperCase().slice(0, 2);
  };

  // --- Renderizado (AJUSTES DE DISEÑO AQUÍ) ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Cargando perfil...</p>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <p className="text-red-500 text-xl mb-4">Error al cargar el perfil</p>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Reintentar</Button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <p className="text-xl mb-4">
          No se pudieron cargar los datos del perfil.
        </p>
        <p className="text-muted-foreground mb-4">
          Intenta recargar la página o volver a iniciar sesión.
        </p>
        <Button onClick={() => router.push("/")}>Volver al inicio</Button>
      </div>
    );
  }

  return (
    // Contenedor principal y título, similar al del tutor
    <div className="container py-10">
      {" "}
      {/* Estilo de contenedor del tutor */}
      {error && profile && saving && (
        <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">
          Error al guardar: {error}
        </p>
      )}
      <div className="mb-6 flex items-center">
        {/* Asumiendo que tienes una ruta de dashboard de estudiante */}
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
        <Link href="/dashboard/student" className="mr-4">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
<<<<<<< HEAD
        <h1 className="text-2xl font-bold text-sky-700">Mi Perfil de Estudiante</h1>
      </div>

      <div className="flex flex-col gap-6 md:flex-row">
=======
        <h1 className="text-2xl font-bold text-sky-700">
          Mi Perfil de Estudiante
        </h1>{" "}
        {/* Título similar */}
      </div>
      {/* Diseño de dos columnas */}
      <div className="flex flex-col gap-6 md:flex-row">
        {/* Columna Izquierda: Avatar e Info Resumida */}
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
        <div className="md:w-1/3">
          <Card>
            <CardHeader>
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
<<<<<<< HEAD
                  <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Avatar" />
                  <AvatarFallback className="text-2xl">JP</AvatarFallback>
=======
                  {" "}
                  {/* Tamaño de avatar similar */}
                  <AvatarImage
                    src={profile.photo_url || "/placeholder.svg"}
                    alt={profile.name}
                  />
                  <AvatarFallback className="text-2xl">
                    {getInitials(profile.name)}
                  </AvatarFallback>
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
                </Avatar>
                <div className="text-center">
                  <CardTitle>{profile.name}</CardTitle>
                  <CardDescription>{profile.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
<<<<<<< HEAD
                <div>
                  <h3 className="font-medium text-sky-700">Universidad</h3>
                  <p className="text-sm text-muted-foreground">{profile.university}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sky-700">Carrera</h3>
                  <p className="text-sm text-muted-foreground">{profile.degree}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sky-700">Año</h3>
                  <p className="text-sm text-muted-foreground">{profile.year}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button variant="outline" className="w-full" onClick={saveProfile}>
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </Button>
              <Link href="/profile/convert-to-tutor" className="w-full">
                <Button className="w-full bg-sky-600 hover:bg-sky-700">Convertirme en tutor</Button>
=======
                {" "}
                {/* Espaciado similar */}
                <div>
                  <h3 className="font-medium text-sky-700">Universidad</h3>{" "}
                  {/* Estilo de subtítulo */}
                  <p className="text-sm text-muted-foreground">
                    {profile.university || "No especificada"}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-sky-700">Carrera</h3>
                  <p className="text-sm text-muted-foreground">
                    {profile.degree || "No especificada"}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-sky-700">Año</h3>
                  <p className="text-sm text-muted-foreground">
                    {profile.year || "No especificado"}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={saveProfile}
                disabled={saving}
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Guardando..." : "Guardar Cambios"}
              </Button>
              {/* Puedes agregar aquí un botón "Convertirme en tutor" si es pertinente */}
              <Link href="/profile/convert-to-tutor" className="w-full">
                <Button className="w-full bg-sky-600 hover:bg-sky-700">
                  Convertirme en tutor
                </Button>
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
              </Link>
            </CardFooter>
          </Card>
        </div>

<<<<<<< HEAD
        <div className="md:w-2/3">
          <Tabs defaultValue="info">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">Información</TabsTrigger>
              <TabsTrigger value="interests">Intereses</TabsTrigger>
            </TabsList>
            <TabsContent value="info" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Información Personal</CardTitle>
                  <CardDescription>Actualiza tu información personal y académica</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nombre completo</Label>
                    <Input id="name" name="name" value={profile.name} onChange={handleProfileChange} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profile.email}
                      onChange={handleProfileChange}
=======
        {/* Columna Derecha: Tabs para editar */}
        <div className="md:w-2/3">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            defaultValue="general"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="general">Información General</TabsTrigger>
              <TabsTrigger value="academic">
                Cursos de Interés
              </TabsTrigger>{" "}
              {/* Cambiado para estudiante */}
            </TabsList>

            {/* Tab: Información General */}
            <TabsContent value="general" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Edita tu Información General</CardTitle>
                  <CardDescription>
                    Actualiza tu nombre y biografía. El email no es editable
                    aquí.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    {" "}
                    {/* Usar grid para consistencia */}
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input
                      id="name"
                      name="name"
                      value={profile.name}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      value={profile.email}
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
                      disabled
                    />
                  </div>
                  <div className="grid gap-2">
<<<<<<< HEAD
                    <Label htmlFor="bio">Biografía</Label>
                    <Textarea id="bio" name="bio" value={profile.bio} onChange={handleProfileChange} rows={4} />
                  </div>
                  <div className="grid gap-2">
=======
                    <Label htmlFor="photo_url">
                      URL Foto de Perfil (opcional)
                    </Label>
                    <Input
                      id="photo_url"
                      name="photo_url"
                      value={profile.photo_url || ""}
                      onChange={handleProfileChange}
                      placeholder="https://ejemplo.com/foto.jpg"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="bio">Biografía</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      placeholder="Cuéntanos un poco sobre ti, tus metas académicas, etc."
                      value={profile.bio}
                      onChange={handleProfileChange}
                      rows={4}
                    />
                  </div>
                </CardContent>
                {/* No hay CardFooter aquí para el botón de guardar, se maneja globalmente o por pestaña */}
              </Card>
            </TabsContent>

            {/* Tab: Detalles Académicos e Intereses */}
            <TabsContent value="academic" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Detalles Académicos y Cursos de Interés</CardTitle> {/* Changed "Intereses" to "Cursos de Interés" */}
                  <CardDescription>
                    Actualiza tu información académica y cursos de interés. {/* Changed "áreas" to "cursos" */}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {" "}
                  {/* Aumentado el espaciado */}
                  <div className="grid gap-2">
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
                    <Label htmlFor="university">Universidad</Label>
                    <Input
                      id="university"
                      name="university"
                      value={profile.university}
                      onChange={handleProfileChange}
                    />
                  </div>
<<<<<<< HEAD
                  <div className="grid gap-2">
                    <Label htmlFor="degree">Carrera</Label>
                    <Input id="degree" name="degree" value={profile.degree} onChange={handleProfileChange} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="year">Año</Label>
                    <Input id="year" name="year" value={profile.year} onChange={handleProfileChange} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="interests" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Áreas de interés</CardTitle>
                  <CardDescription>Agrega las materias en las que estás buscando ayuda</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {interests.map((interest) => (
                      <Badge key={interest.id} className="flex items-center gap-1 bg-sky-100 text-sky-800">
                        {interest.name}
                        <button
                          onClick={() => removeInterest(interest.id)}
                          className="ml-1 rounded-full p-0.5 hover:bg-sky-200"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span className="sr-only">Eliminar</span>
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Agregar nueva área de interés"
                      value={newInterest}
                      onChange={handleNewInterestChange}
                      onKeyDown={(e) => e.key === "Enter" && addInterest()}
                    />
                    <Button type="button" onClick={addInterest} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
=======
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="degree">Carrera</Label>
                      <Input
                        id="degree"
                        name="degree"
                        value={profile.degree}
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="year">Año de Estudio</Label>
                      <Input
                        id="year"
                        name="year"
                        placeholder="Ej: 3° año"
                        value={profile.year}
                        onChange={handleProfileChange}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2 block font-medium">
                      Cursos de Interés
                    </Label>{" "}
                    {/* Estilo de Label, Changed "Áreas" to "Cursos" */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {interests.map((interest) => (
                        <Badge
                          key={interest.id}
                          variant="secondary"
                          className="flex items-center gap-1 text-sm py-1 px-2 bg-sky-100 text-sky-800" /* Estilo de Badge similar al tutor */
                        >
                          {interest.name}
                          <button
                            onClick={() => removeInterest(interest.id)}
                            className="ml-1 rounded-full p-0.5 hover:bg-sky-200" /* Estilo de hover */
                            aria-label={`Eliminar ${interest.name}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2 items-center border-t pt-4">
                      {" "}
                      {/* Divisor y espaciado */}
                      <div className="grid gap-2 flex-grow">
                        {" "}
                        {/* Para que el input tome el espacio */}
                        <Label htmlFor="newInterest" className="sr-only">
                          Añadir interés
                        </Label>{" "}
                        {/* sr-only si el placeholder es suficiente */}
                        <Input
                          id="newInterest"
                          placeholder="Añadir nuevo curso de interés" /* Changed placeholder */
                          value={newInterest}
                          onChange={handleNewInterestChange}
                          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) =>
                            e.key === "Enter" && addInterest()
                          }
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={addInterest}
                        variant="outline"
                        // size="icon" // Puedes usar esto o texto
                      >
                        <Plus className="h-4 w-4 mr-2" /> Añadir{" "}
                        {/* Añadido texto para claridad */}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Nota: Al añadir un interés, asegúrate de que sea un curso
                      válido. El guardado final usará los IDs de los cursos.
                    </p>
                  </div>
                </CardContent>
                {/* Botón de Guardar Global (o por pestaña si se prefiere) */}
                {/* <CardFooter className="flex justify-end pt-6"> 
                  <Button onClick={saveProfile} disabled={saving} className="bg-sky-600 hover:bg-sky-700">
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? "Guardando..." : "Guardar Cambios Académicos"}
                  </Button>
                </CardFooter> */}
>>>>>>> 91eaf8eece301544045eee58500715486608cde4
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
