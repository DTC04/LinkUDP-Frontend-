"use client";

import React, { useState, useEffect, ChangeEvent, KeyboardEvent } from "react";
import Link from "next/link";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, Save, Plus, Trash2, Upload, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
// Enum para los días de la semana (debe coincidir con el backend)
export enum DayOfWeek {
  LUNES = "LUNES",
  MARTES = "MARTES",
  MIERCOLES = "MIERCOLES",
  JUEVES = "JUEVES",
  VIERNES = "VIERNES",
  SABADO = "SABADO",
  DOMINGO = "DOMINGO",
}

// --- Interfaces para Tipado (Asegúrate que coincidan con la respuesta de tu API) ---

interface UserBaseData {
  id: number;
  full_name: string;
  email: string;
  role: string;
  photo_url?: string | null;
  email_verified: boolean;
}

interface TutorCourseData {
  courseId: number;
  courseName: string;
  level: string;
  grade?: number | null;
}

interface AvailabilityBlockData {
  id?: number;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
}

interface TutorProfileData {
  id?: number;
  userId?: number;
  bio: string;
  average_rating?: number;
  cv_url?: string | null;
  experience_details?: string | null;
  tutoring_contact_email?: string | null;
  tutoring_phone?: string | null;
  courses: TutorCourseData[];
  availability: AvailabilityBlockData[];
}

interface ApiUserResponse {
  user: UserBaseData;
  studentProfile?: any; // Ajustar si es necesario
  tutorProfile?: TutorProfileData;
}

// Estado local del formulario
interface TutorProfileState {
  name: string;
  email: string;
  photo_url?: string;
  bio: string;
  cv_url?: string | null;
  experience_details?: string | null;
  tutoring_contact_email?: string | null;
  tutoring_phone?: string | null;
  university?: string; // Estos eran del estado original que pasaste, mantenlos si los usas
  degree?: string; // o considera si deben venir de studentProfile
  experience?: string; // Este campo estaba en tu último `page.tsx`
}

interface ExpertiseAreaData {
  // Tu último código usaba 'name' y no 'courseName'
  id: number; // Asumo que esto será courseId
  name: string; // courseName
  level?: string; // Para mantener consistencia con TutorCourseData
  grade?: number | null; // Para mantener consistencia
}

interface AvailabilityFormState {
  // Tu último código usaba day, startTime, endTime
  id: number;
  day: DayOfWeek; // Cambiado de string a DayOfWeek para consistencia con el enum y backend
  startTime: string;
  endTime: string;
}

export default function TutorProfilePage() {
  console.log(
    "TutorProfilePage: COMPONENTE INICIADO (nueva versión con logs)."
  );
  const router = useRouter();

  // El estado inicial que pasaste en tu último page.tsx es para un perfil estático.
  // Lo cambiaremos para que sea null inicialmente y se llene con el fetch.
  const [profile, setProfile] = useState<TutorProfileState | null>(null);
  const [expertiseAreas, setExpertiseAreas] = useState<ExpertiseAreaData[]>([]);
  const [availabilityBlocks, setAvailabilityBlocks] = useState<
    AvailabilityFormState[]
  >([]);

  // Estados para los inputs de nuevos items
  const [newExpertiseAreaInput, setNewExpertiseAreaInput] = useState(""); // Para el input de nombre de área de expertise
  // Para el ejemplo de addExpertiseArea, se necesitarían más campos si quieres añadir nivel, etc.

  const [newScheduleInput, setNewScheduleInput] = useState<
    Omit<AvailabilityFormState, "id">
  >({
    day: DayOfWeek.LUNES, // Valor por defecto
    startTime: "09:00",
    endTime: "10:00",
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [savingGeneral, setSavingGeneral] = useState<boolean>(false);
  const [savingSpecific, setSavingSpecific] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("info"); // Tu código usaba 'info', 'expertise'

  useEffect(() => {
    console.log("TutorProfilePage: useEffect para cargar datos iniciado.");
    const fetchProfileData = async () => {
      const token = localStorage.getItem("token");
      console.log("TutorProfilePage: Token obtenido:", token);

      if (!token) {
        setError("No autenticado. Redirigiendo al login...");
        console.warn("TutorProfilePage: No hay token, redirigiendo a login.");
        router.push("/login");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log("TutorProfilePage: Haciendo fetch a /profile/me");
        const res = await fetch("http://localhost:3000/profile/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log(
          "TutorProfilePage: Respuesta del fetch recibida, status:",
          res.status
        );

        if (!res.ok) {
          const errorBodyText = await res.text(); // Leer como texto para depurar
          console.error(
            "TutorProfilePage: Error en fetch, status:",
            res.status,
            "Body:",
            errorBodyText
          );
          if (res.status === 401 || res.status === 403) {
            localStorage.removeItem("token");
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
              parsedError.message || `Error al cargar el perfil: ${res.status}`
            );
          }
          return;
        }

        const data: ApiUserResponse = await res.json();
        console.log(
          "TutorProfilePage: Datos recibidos de la API:",
          JSON.stringify(data, null, 2)
        );

        if (
          data &&
          data.user &&
          (data.user.role === "TUTOR" || data.user.role === "BOTH")
        ) {
          if (data.tutorProfile) {
            console.log(
              "TutorProfilePage: Mapeando datos de tutorProfile existente."
            );
            setProfile({
              name: data.user.full_name || "",
              email: data.user.email || "",
              photo_url: data.user.photo_url || undefined,
              bio: data.tutorProfile.bio || "",
              cv_url: data.tutorProfile.cv_url,
              experience_details: data.tutorProfile.experience_details, // Tu estado TutorProfileState usa 'experience'
              experience: data.tutorProfile.experience_details || "", // Mapeando a tu campo 'experience'
              tutoring_contact_email: data.tutorProfile.tutoring_contact_email,
              tutoring_phone: data.tutorProfile.tutoring_phone,
              university: data.studentProfile?.university || "", // Asumiendo que quieres mostrar esto si rol es BOTH
              degree: data.studentProfile?.career || "", // Asumiendo que quieres mostrar esto si rol es BOTH
            });

            // Mapear courses de tutorProfile a expertiseAreas
            setExpertiseAreas(
              data.tutorProfile.courses.map((course) => ({
                id: course.courseId,
                name: course.courseName,
                level: course.level,
                grade: course.grade,
              })) || []
            );

            // Mapear availability de tutorProfile a availabilityBlocks
            setAvailabilityBlocks(
              data.tutorProfile.availability.map((ab, index) => ({
                id: Date.now() + index, // ID temporal para la UI
                day: ab.day_of_week,
                startTime: ab.start_time,
                endTime: ab.end_time,
              })) || []
            );
          } else {
            console.log(
              "TutorProfilePage: Usuario es TUTOR/BOTH pero no tiene tutorProfile. Inicializando perfil de tutor nuevo."
            );
            setProfile({
              name: data.user.full_name || "",
              email: data.user.email || "",
              photo_url: data.user.photo_url || undefined,
              bio: "",
              cv_url: null,
              experience_details: "",
              experience: "",
              tutoring_contact_email: data.user.email,
              tutoring_phone: null,
              university: data.studentProfile?.university || "",
              degree: data.studentProfile?.career || "",
            });
            setExpertiseAreas([]);
            setAvailabilityBlocks([]);
          }
        } else if (data && data.user && data.user.role === "STUDENT") {
          console.warn(
            "TutorProfilePage: Usuario es ESTUDIANTE, no debería estar en perfil de tutor."
          );
          setError("Acceso denegado. Esta es una página de perfil de Tutor.");
          // router.push('/dashboard/student'); // o similar
        } else {
          console.error(
            "TutorProfilePage: Formato de datos inesperado o usuario no es tutor.",
            data
          );
          throw new Error(
            "Perfil de tutor no encontrado o formato de datos inesperado."
          );
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Ocurrió un error desconocido.";
        setError(errorMessage);
        console.error(
          "TutorProfilePage: Catch Error en fetchProfileData:",
          err
        );
      } finally {
        setLoading(false);
        console.log(
          "TutorProfilePage: Carga de datos finalizada (loading=false)."
        );
      }
    };

    fetchProfileData();
  }, [router]);

  useEffect(() => {
    if (profile) {
      // Solo loguear si profile no es null
      console.log(
        "TutorProfilePage: Estado 'profile' HA CAMBIADO A:",
        JSON.stringify(profile, null, 2)
      );
    }
    if (expertiseAreas.length > 0) {
      console.log(
        "TutorProfilePage: Estado 'expertiseAreas' HA CAMBIADO A:",
        JSON.stringify(expertiseAreas, null, 2)
      );
    }
    if (availabilityBlocks.length > 0) {
      console.log(
        "TutorProfilePage: Estado 'availabilityBlocks' HA CAMBIADO A:",
        JSON.stringify(availabilityBlocks, null, 2)
      );
    }
  }, [profile, expertiseAreas, availabilityBlocks]);

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!profile) return;
    const { name, value } = e.target;
    setProfile((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleNewExpertiseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewExpertiseAreaInput(e.target.value);
  };

  const addExpertiseArea = () => {
    if (newExpertiseAreaInput.trim()) {
      // Necesitas una forma de obtener el courseId real para el 'newExpertiseAreaInput'
      const tempCourseId = parseInt(
        prompt(
          "Ingresa el ID del curso para '" +
            newExpertiseAreaInput +
            "' (esto es temporal para desarrollo):"
        ) || "0"
      );
      if (isNaN(tempCourseId) || tempCourseId <= 0) {
        alert("ID de curso inválido.");
        return;
      }
      const newArea: ExpertiseAreaData = {
        id: tempCourseId, // Esto sería courseId
        name: newExpertiseAreaInput.trim(),
        level:
          prompt("Nivel del curso (ej. Universitario):") || "Universitario", // Placeholder
        // grade: podrías pedirlo también
      };
      setExpertiseAreas([...expertiseAreas, newArea]);
      setNewExpertiseAreaInput("");
    }
  };

  const removeExpertiseArea = (idToRemove: number) => {
    setExpertiseAreas(expertiseAreas.filter((area) => area.id !== idToRemove));
  };

  const handleNewScheduleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewScheduleInput(
      (prev) =>
        ({ ...prev, [name]: value as DayOfWeek | string } as Omit<
          AvailabilityFormState,
          "id"
        >)
    );
  };

  const handleAvailabilityBlockItemChange = (
    index: number,
    field: keyof Omit<AvailabilityFormState, "id">,
    value: string | DayOfWeek
  ) => {
    const updatedBlocks = [...availabilityBlocks];
    // @ts-ignore
    updatedBlocks[index][field] = value;
    setAvailabilityBlocks(updatedBlocks);
  };

  const addSchedule = () => {
    if (
      newScheduleInput.day &&
      newScheduleInput.startTime &&
      newScheduleInput.endTime
    ) {
      if (newScheduleInput.startTime >= newScheduleInput.endTime) {
        alert("La hora de inicio debe ser anterior a la hora de fin.");
        return;
      }
      setAvailabilityBlocks([
        ...availabilityBlocks,
        { id: Date.now(), ...newScheduleInput },
      ]);
      setNewScheduleInput({
        day: DayOfWeek.LUNES,
        startTime: "09:00",
        endTime: "10:00",
      });
    }
  };

  const removeSchedule = (id: number) => {
    setAvailabilityBlocks(
      availabilityBlocks.filter((schedule) => schedule.id !== id)
    );
  };

  const saveProfileData = async () => {
    // Renombrado de saveProfile para evitar confusión con el estado 'profile'
    if (!profile) return;
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No autenticado.");
      router.push("/login");
      return;
    }

    console.log("TutorProfilePage: Iniciando guardado de perfil...");

    // --- Guardar Información General (PATCH /profile/me) ---
    setSavingGeneral(true);
    const generalPayload = {
      full_name: profile.name,
      photo_url: profile.photo_url,
      bio: profile.bio, // Este es el bio principal del tutor
    };
    console.log(
      "TutorProfilePage: Payload para /profile/me:",
      JSON.stringify(generalPayload, null, 2)
    );

    try {
      const generalRes = await fetch("http://localhost:3000/profile/me", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(generalPayload),
      });
      if (!generalRes.ok) {
        const errData = await generalRes.json();
        throw new Error(
          errData.message || "Error al guardar información general."
        );
      }
      const updatedGeneralData: ApiUserResponse = await generalRes.json();
      console.log(
        "TutorProfilePage: Respuesta de /profile/me:",
        JSON.stringify(updatedGeneralData, null, 2)
      );
      // Actualizar el estado 'profile' con lo que devuelva el backend (especialmente si normaliza datos)
      if (updatedGeneralData.user) {
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                name: updatedGeneralData.user.full_name,
                photo_url: updatedGeneralData.user.photo_url || undefined,
                bio: updatedGeneralData.tutorProfile?.bio || prev.bio,
              }
            : null
        );
      }
      alert("Información general guardada.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setError(msg);
      console.error("TutorProfilePage: Error en saveGeneralProfile:", err);
      alert(`Error guardando info general: ${msg}`);
      setSavingGeneral(false);
      return; // Detener si falla la parte general
    } finally {
      setSavingGeneral(false);
    }

    // --- Guardar Información Específica del Tutor (PATCH /profile/me/tutor) ---
    setSavingSpecific(true);
    const specificPayload = {
      cv_url: profile.cv_url,
      experience_details: profile.experience || profile.experience_details, // Usar 'experience' si existe, sino 'experience_details'
      tutoring_contact_email: profile.tutoring_contact_email,
      tutoring_phone: profile.tutoring_phone,
      courses: expertiseAreas.map((area) => ({
        courseId: area.id, // Asumiendo que 'id' en ExpertiseAreaData es courseId
        level: area.level || "No especificado", // Asegurar que level tenga un valor
        grade: area.grade,
      })),
      availability: availabilityBlocks.map((block) => ({
        day_of_week: block.day, // Mapear de 'day' a 'day_of_week'
        start_time: block.startTime,
        end_time: block.endTime,
      })),
    };
    console.log(
      "TutorProfilePage: Payload para /profile/me/tutor:",
      JSON.stringify(specificPayload, null, 2)
    );

    try {
      const specificRes = await fetch(
        "http://localhost:3000/profile/me/tutor",
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(specificPayload),
        }
      );

      if (!specificRes.ok) {
        const errorData = await specificRes.json();
        throw new Error(
          errorData.message ||
            `Error al guardar detalles del tutor: ${specificRes.status}`
        );
      }

      const updatedSpecificData: ApiUserResponse = await specificRes.json();
      console.log(
        "TutorProfilePage: Respuesta de /profile/me/tutor:",
        JSON.stringify(updatedSpecificData, null, 2)
      );
      // Actualizar el estado local con los datos del tutorProfile
      if (updatedSpecificData.tutorProfile) {
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                cv_url: updatedSpecificData.tutorProfile?.cv_url,
                experience:
                  updatedSpecificData.tutorProfile?.experience_details ||
                  prev.experience,
                experience_details:
                  updatedSpecificData.tutorProfile?.experience_details,
                tutoring_contact_email:
                  updatedSpecificData.tutorProfile?.tutoring_contact_email,
                tutoring_phone:
                  updatedSpecificData.tutorProfile?.tutoring_phone,
              }
            : null
        );
        setExpertiseAreas(
          updatedSpecificData.tutorProfile.courses.map((c) => ({
            id: c.courseId,
            name: c.courseName,
            level: c.level,
            grade: c.grade,
          })) || []
        );
        setAvailabilityBlocks(
          updatedSpecificData.tutorProfile.availability.map((ab, i) => ({
            id: Date.now() + i,
            day: ab.day_of_week,
            startTime: ab.start_time,
            endTime: ab.end_time,
          })) || []
        );
      }
      alert("Detalles del tutor guardados exitosamente!");
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error desconocido al guardar detalles del tutor.";
      setError(errorMessage);
      alert(`Error guardando detalles del tutor: ${errorMessage}`);
      console.error(
        "TutorProfilePage: Error en saveTutorSpecificProfile:",
        err
      );
    } finally {
      setSavingSpecific(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "?";
    const names = name.split(" ");
    const initials = names.map((n) => n[0]).join("");
    return initials.toUpperCase().slice(0, 2);
  };

  console.log(
    "TutorProfilePage: ANTES DEL RETURN - loading:",
    loading,
    "error:",
    error,
    "profile:",
    profile !== null
  );

  if (loading) {
    console.log("TutorProfilePage: Renderizando estado de CARGA");
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Cargando perfil de tutor...</p>
      </div>
    );
  }

  if (error && !profile) {
    console.error(
      "TutorProfilePage: Renderizando error porque 'profile' es null y hay error:",
      error
    );
    function fetchProfileData() {
      throw new Error("Function not implemented.");
    }

    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <p className="text-red-500 text-xl mb-4">Error al cargar el perfil</p>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button
          onClick={() => {
            setError(null);
            fetchProfileData();
          }}
        >
          Reintentar
        </Button>{" "}
        {/* fetchProfileData no está en scope */}
      </div>
    );
  }

  if (!profile) {
    console.warn(
      "TutorProfilePage: Renderizando mensaje 'No se pudo cargar' porque 'profile' es null."
    );
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <p className="text-xl mb-4">
          No se pudo cargar la información del perfil del tutor.
        </p>
        <p className="text-muted-foreground mb-4">
          Esto puede ocurrir si no eres un tutor o si hubo un problema con los
          datos.
        </p>
        <Button onClick={() => router.push("/")}>Volver al inicio</Button>
      </div>
    );
  }

  console.log(
    "TutorProfilePage: Renderizando perfil con datos:",
    JSON.stringify(profile, null, 2)
  );
  const daysOfWeek = Object.values(DayOfWeek);

  return (
    <div className="container py-10">
      {" "}
      {/* Cambiado de mx-auto p-4 md:p-8 max-w-4xl */}
      {/* Mostrar errores no bloqueantes (ej. de guardado) si profile existe */}
      {error && profile && (savingGeneral || savingSpecific) && (
        <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">
          Error al guardar: {error}
        </p>
      )}
      <div className="mb-6 flex items-center">
        <Link href="/dashboard/tutor" className="mr-4">
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
                  <AvatarImage
                    src={
                      profile.photo_url || "/placeholder.svg?height=96&width=96"
                    }
                    alt={profile.name}
                  />
                  <AvatarFallback className="text-2xl">
                    {getInitials(profile.name)}
                  </AvatarFallback>
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
                  <p className="text-sm text-muted-foreground">
                    {profile.university || "No especificada"}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-sky-700">
                    Título/Especialidad
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {profile.degree || "No especificado"}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-sky-700">Experiencia</h3>
                  <p className="text-sm text-muted-foreground">
                    {profile.experience || "No especificada"}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-sky-700">Email Tutorías</h3>
                  <p className="text-sm text-muted-foreground">
                    {profile.tutoring_contact_email || profile.email}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-sky-700">
                    Teléfono Tutorías
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {profile.tutoring_phone || "No especificado"}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              {" "}
              {/* Cambiado a flex-col y gap-2 */}
              <Button
                variant="outline"
                className="w-full"
                onClick={saveProfileData}
                disabled={savingGeneral || savingSpecific}
              >
                <Save className="mr-2 h-4 w-4" />
                {savingGeneral || savingSpecific
                  ? "Guardando..."
                  : "Guardar Cambios"}
              </Button>
              {/* <Link href="/profile/tutor/availability" className="w-full"> // Esto es manejado por una tab ahora
                <Button className="w-full bg-sky-600 hover:bg-sky-700">Configurar Disponibilidad</Button>
              </Link> */}
            </CardFooter>
          </Card>
        </div>

        <div className="md:w-2/3">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            defaultValue="info"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Información</TabsTrigger>
              <TabsTrigger value="expertise">Expertise</TabsTrigger>
              <TabsTrigger value="availability">Horarios</TabsTrigger>{" "}
              {/* Cambiado de schedule a availability */}
            </TabsList>

            <TabsContent value="info" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Información Personal y Profesional</CardTitle>
                  <CardDescription>
                    Actualiza tu información personal y profesional
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nombre completo</Label>
                    <Input
                      id="name"
                      name="name"
                      value={profile.name}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profile.email}
                      disabled
                    />
                  </div>
                  <div className="grid gap-2">
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
                      value={profile.bio}
                      onChange={handleProfileChange}
                      rows={4}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="university">Universidad (Base)</Label>
                    <Input
                      id="university"
                      name="university"
                      value={profile.university || ""}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="degree">Título/Especialidad (Base)</Label>
                    <Input
                      id="degree"
                      name="degree"
                      value={profile.degree || ""}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="experience">Experiencia (General)</Label>
                    <Input
                      id="experience"
                      name="experience"
                      value={profile.experience || ""}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cv_url">URL CV (opcional)</Label>
                    <Input
                      id="cv_url"
                      name="cv_url"
                      value={profile.cv_url || ""}
                      onChange={handleProfileChange}
                      placeholder="https://linkedin.com/in/tu-perfil"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="experience_details">
                      Detalles de Experiencia (Tutor)
                    </Label>
                    <Textarea
                      id="experience_details"
                      name="experience_details"
                      value={profile.experience_details || ""}
                      onChange={handleProfileChange}
                      rows={3}
                      placeholder="Detalla tu experiencia específica como tutor..."
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tutoring_contact_email">
                      Email Contacto Tutorías
                    </Label>
                    <Input
                      id="tutoring_contact_email"
                      name="tutoring_contact_email"
                      type="email"
                      value={profile.tutoring_contact_email || ""}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tutoring_phone">
                      Teléfono Tutorías (opcional)
                    </Label>
                    <Input
                      id="tutoring_phone"
                      name="tutoring_phone"
                      type="tel"
                      value={profile.tutoring_phone || ""}
                      onChange={handleProfileChange}
                      placeholder="+56912345678"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="expertise" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Áreas de Expertise</CardTitle>
                  <CardDescription>
                    Agrega las materias o áreas en las que ofreces tutorías
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {expertiseAreas.map((area) => (
                      <Badge
                        key={area.id}
                        className="flex items-center gap-1 bg-sky-100 text-sky-800"
                      >
                        {area.name} {area.level && `(${area.level})`}{" "}
                        {area.grade && `- Nota: ${area.grade}`}
                        <button
                          onClick={() => removeExpertiseArea(area.id)}
                          className="ml-1 rounded-full p-0.5 hover:bg-sky-200"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span className="sr-only">Eliminar</span>
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2 items-end border-t pt-4">
                    <div className="grid gap-2 flex-grow">
                      <Label htmlFor="newExpertiseAreaInput">
                        Nombre del Área/Curso
                      </Label>
                      <Input
                        id="newExpertiseAreaInput"
                        placeholder="Ej: Cálculo Avanzado"
                        value={newExpertiseAreaInput}
                        onChange={handleNewExpertiseChange}
                        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                          if (e.key === "Enter") addExpertiseArea();
                        }}
                      />
                    </div>
                    {/* Podrías añadir inputs para nivel y nota aquí si es necesario antes de añadir */}
                    <Button
                      type="button"
                      onClick={addExpertiseArea}
                      variant="outline"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Recuerda que el backend necesita el ID del curso. Este campo
                    es para buscar/añadir el nombre.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="availability" className="mt-4">
              {" "}
              {/* Cambiado de schedule a availability */}
              <Card>
                <CardHeader>
                  <CardTitle>Horarios Disponibles</CardTitle>
                  <CardDescription>
                    Configura tus horarios disponibles para tutorías
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    {availabilityBlocks.map((schedule, index) => (
                      <div
                        key={schedule.id}
                        className="flex items-center justify-between rounded-lg border p-3 gap-2"
                      >
                        <Select
                          value={schedule.day}
                          onValueChange={(value) =>
                            handleAvailabilityBlockItemChange(
                              index,
                              "day",
                              value as DayOfWeek
                            )
                          }
                        >
                          <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Día" />
                          </SelectTrigger>
                          <SelectContent>
                            {daysOfWeek.map((d) => (
                              <SelectItem key={d} value={d}>
                                {d.charAt(0).toUpperCase() +
                                  d.slice(1).toLowerCase()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="time"
                          value={schedule.startTime}
                          onChange={(e) =>
                            handleAvailabilityBlockItemChange(
                              index,
                              "startTime",
                              e.target.value
                            )
                          }
                          className="w-[120px]"
                        />
                        <span className="text-muted-foreground">-</span>
                        <Input
                          type="time"
                          value={schedule.endTime}
                          onChange={(e) =>
                            handleAvailabilityBlockItemChange(
                              index,
                              "endTime",
                              e.target.value
                            )
                          }
                          className="w-[120px]"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSchedule(schedule.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="grid sm:grid-cols-4 gap-3 items-end pt-4 border-t">
                    <div className="grid gap-1">
                      <Label htmlFor="newScheduleDay">Día</Label>
                      <Select
                        name="day"
                        value={newScheduleInput.day}
                        onValueChange={(value) =>
                          setNewScheduleInput((prev) => ({
                            ...prev,
                            day: value as DayOfWeek,
                          }))
                        }
                      >
                        <SelectTrigger id="newScheduleDay">
                          <SelectValue placeholder="Seleccionar día" />
                        </SelectTrigger>
                        <SelectContent>
                          {daysOfWeek.map((d) => (
                            <SelectItem key={d} value={d}>
                              {d.charAt(0).toUpperCase() +
                                d.slice(1).toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-1">
                      <Label htmlFor="newScheduleStartTime">Hora inicio</Label>
                      <Input
                        id="newScheduleStartTime"
                        name="startTime"
                        type="time"
                        value={newScheduleInput.startTime}
                        onChange={handleNewScheduleChange}
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label htmlFor="newScheduleEndTime">Hora fin</Label>
                      <Input
                        id="newScheduleEndTime"
                        name="endTime"
                        type="time"
                        value={newScheduleInput.endTime}
                        onChange={handleNewScheduleChange}
                      />
                    </div>
                    <Button
                      onClick={addSchedule}
                      className="w-full bg-sky-600 hover:bg-sky-700 self-end"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
