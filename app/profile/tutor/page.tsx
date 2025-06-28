"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
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
import {
  ChevronLeft,
  Save,
  Plus,
  Trash2,
  Upload,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { formatDateUTC } from "@/lib/utils";
import RequireEmailVerified from "@/components/RequireEmailVerified";

export enum DayOfWeek {
  LUNES = "LUNES",
  MARTES = "MARTES",
  MIERCOLES = "MIERCOLES",
  JUEVES = "JUEVES",
  VIERNES = "VIERNES",
  SABADO = "SABADO",
  DOMINGO = "DOMINGO",
}

interface UserBaseData {
  id: number;
  full_name: string;
  email: string;
  role: "STUDENT" | "TUTOR" | "BOTH";
  photo_url?: string | null;
}
interface AvailabilityBlockFromApi {
  id?: number;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
}
interface TutorCourseFromApi {
  courseId: number;
  courseName: string;
  level: string;
  grade: number | null;
}
interface TutorProfileDataFromApi {
  id: number;
  bio?: string | null;
  average_rating?: number;
  cv_url?: string | null;
  experience_details?: string | null;
  tutoring_contact_email?: string | null;
  tutoring_phone?: string | null;
  university?: string | null;
  degree?: string | null;
  academic_year?: string | null;
  courses?: Array<TutorCourseFromApi>;
  availability?: Array<AvailabilityBlockFromApi>;
}
interface ApiUserResponse {
  user: UserBaseData;
  studentProfile?: { university?: string; career?: string };
  tutorProfile?: TutorProfileDataFromApi;
}

interface TutorProfileState {
  name: string;
  email: string;
  photo_url?: string | null;
  bio: string;
  cv_url: string | null;
  experience: string;
  tutoring_contact_email: string | null;
  tutoring_phone: string | null;
  university: string;
  degree: string;
  academic_year: string;
}
interface ExpertiseAreaData {
  id: number;
  name: string;
  level: string;
  grade: number | null;
}
interface AvailabilityBlockData {
  id: number;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
}

function formatDate(iso: string) {
  return formatDateUTC(iso)
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
function formatHour(iso: string) {
  const date = new Date(iso)
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export default function TutorProfileEditPageOriginalDesign() {
  const router = useRouter();
  const {
    getCurrentUserProfile,
    loading: authLoading,
    error: authError,
  } = useAuth();

  const [activeTab, setActiveTab] = useState("info");
  const [profile, setProfile] = useState<TutorProfileState>({
    name: "",
    email: "",
    photo_url: null,
    bio: "",
    cv_url: null,
    experience: "",
    tutoring_contact_email: null,
    tutoring_phone: null,
    university: "",
    degree: "",
    academic_year: "",
  });
  const [expertiseAreas, setExpertiseAreas] = useState<ExpertiseAreaData[]>([]);
  const [newExpertiseArea, setNewExpertiseArea] = useState({
    name: "",
    level: "",
    grade: "",
    courseId: "",
  });
  const [availabilityBlocks, setAvailabilityBlocks] = useState<
    AvailabilityBlockData[]
  >([]);
  const [newScheduleInput, setNewScheduleInput] = useState({
    day: DayOfWeek.LUNES,
    startTime: "09:00",
    endTime: "10:00",
  });

  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pageMessage, setPageMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsFetching(true);
      setPageMessage(null);
      const dataFromApi = await getCurrentUserProfile();
      console.log(
        "EditPage(Original)/fetchProfileData: API Response ->",
        JSON.stringify(dataFromApi, null, 2)
      );
      if (dataFromApi && dataFromApi.user) {
        const { user, tutorProfile } = dataFromApi;
        if (user.role === "TUTOR" || user.role === "BOTH") {
          setProfile({
            name: user.full_name || "",
            email: user.email || "",
            photo_url: user.photo_url || null,
            bio: tutorProfile?.bio || "",
            cv_url: tutorProfile?.cv_url || null,
            experience: tutorProfile?.experience_details || "",
            tutoring_contact_email:
              tutorProfile?.tutoring_contact_email || user.email || "",
            tutoring_phone: tutorProfile?.tutoring_phone || null,
            university: tutorProfile?.university || "",
            degree: tutorProfile?.degree || "",
            academic_year: tutorProfile?.academic_year || "", // Usar "" para que el placeholder se muestre
          });
          setExpertiseAreas(
            tutorProfile?.courses?.map((c) => ({
              id: c.courseId,
              name: c.courseName,
              level: c.level,
              grade: c.grade,
            })) || []
          );
          setAvailabilityBlocks(
            tutorProfile?.availability?.map((ab, i) => ({
              id: Date.now() + i,
              day: ab.day_of_week as DayOfWeek,
              startTime: ab.start_time,
              endTime: ab.end_time,
            })) || []
          );
        } else {
          setPageMessage({ type: "error", text: "Acceso denegado." });
        }
      } else {
        setPageMessage({
          type: "error",
          text: authError || "Error cargando perfil.",
        });
      }
      setIsFetching(false);
    };
    fetchProfileData();
  }, [getCurrentUserProfile, authError]);

  const handleProfileChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    if (pageMessage) setPageMessage(null);
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfile((prev) => ({ ...prev, photo_url: URL.createObjectURL(file) }));
      setPageMessage({
        type: "success",
        text: "Vista previa de imagen. Subida real no implementada.",
      });
    }
  };

  const handleNewExpertiseChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewExpertiseArea((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewExpertiseLevelChange = (value: string) => {
    setNewExpertiseArea((prev) => ({ ...prev, level: value }));
  };

  const addExpertiseArea = () => {
    if (!newExpertiseArea.name || !newExpertiseArea.level) {
      /* ... */ return;
    }
    const grade = newExpertiseArea.grade
      ? parseFloat(newExpertiseArea.grade)
      : null;
    if (
      newExpertiseArea.grade &&
      (isNaN(grade!) || grade! < 1.0 || grade! > 7.0)
    ) {
      /* ... */ return;
    }
    const tempCourseId = newExpertiseArea.courseId
      ? parseInt(newExpertiseArea.courseId)
      : Date.now();
    if (
      newExpertiseArea.courseId &&
      (isNaN(tempCourseId) || tempCourseId <= 0)
    ) {
      /* ... */ return;
    }
    setExpertiseAreas((prev) => [
      ...prev,
      {
        id: tempCourseId,
        name: newExpertiseArea.name,
        level: newExpertiseArea.level,
        grade,
      },
    ]);
    setNewExpertiseArea({ name: "", level: "", grade: "", courseId: "" });
  };
  const removeExpertiseArea = (id: number) =>
    setExpertiseAreas((prev) => prev.filter((area) => area.id !== id));

  const handleNewScheduleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewScheduleInput((prev) => ({
      ...prev,
      [name]: value as DayOfWeek | string,
    }));
  };
  const addSchedule = () => {
    if (
      !newScheduleInput.day ||
      !newScheduleInput.startTime ||
      !newScheduleInput.endTime
    ) {
      /* ... */ return;
    }
    if (newScheduleInput.startTime >= newScheduleInput.endTime) {
      /* ... */ return;
    }
    setAvailabilityBlocks((prev) => [
      ...prev,
      {
        id: Date.now(),
        day: newScheduleInput.day as DayOfWeek,
        startTime: newScheduleInput.startTime,
        endTime: newScheduleInput.endTime,
      },
    ]);
    setNewScheduleInput({
      day: DayOfWeek.LUNES,
      startTime: "09:00",
      endTime: "10:00",
    });
  };
  const removeSchedule = (id: number) =>
    setAvailabilityBlocks((prev) => prev.filter((block) => block.id !== id));

  const saveProfileData = async () => {
    setPageMessage(null);
    setIsSaving(true);

    let allSuccess = true;

    const generalPayload = {
      full_name: profile.name,
      photo_url: profile.photo_url,
      bio: profile.bio,
    };
    try {
      const generalRes = await fetch(`${API_BASE_URL}/profile/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(generalPayload),
      });
      const generalData = await generalRes.json();
      if (!generalRes.ok) {
        allSuccess = false;
        throw new Error(generalData.message || "Error info general.");
      }
    } catch (error: any) {
      allSuccess = false;
      setPageMessage({ type: "error", text: `Info general: ${error.message}` });
    }

    const specificPayload: any = {
      cv_url: profile.cv_url,
      experience_details: profile.experience,
      tutoring_contact_email: profile.tutoring_contact_email,
      tutoring_phone: profile.tutoring_phone,
      university: profile.university,
      degree: profile.degree,
      academic_year: profile.academic_year,
      courses: undefined, // Omitir hasta tener IDs
      availability: availabilityBlocks.map((b) => ({
        day_of_week: b.day,
        start_time: b.startTime,
        end_time: b.endTime,
      })),
    };
    for (const key in specificPayload) {
      if (specificPayload[key] === "" || specificPayload[key] === null)
        delete specificPayload[key];
    }
    console.log(
      "EditPage(Original)/saveProfileData: Specific Payload ->",
      JSON.stringify(specificPayload, null, 2)
    );

    if (allSuccess) {
      try {
        const specificRes = await fetch(`${API_BASE_URL}/profile/me/tutor`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(specificPayload),
        });
        const specificData = await specificRes.json();
        console.log(
          "EditPage(Original)/saveProfileData: Response from /profile/me/tutor ->",
          { status: specificRes.status, ok: specificRes.ok, body: specificData }
        );
        if (!specificRes.ok) {
          allSuccess = false;
          throw new Error(
            specificData.message ||
              `Error info específica. Estado: ${specificRes.status}`
          );
        }
      } catch (error: any) {
        allSuccess = false;
        setPageMessage({
          type: "error",
          text: `Info específica: ${error.message}`,
        });
      }
    }

    setIsSaving(false);
    if (allSuccess) {
      setPageMessage({ type: "success", text: "¡Perfil actualizado!" });
      setTimeout(() => {
        // VERIFICA ESTA RUTA EN TU PROYECTO NEXT.JS
        router.push("/profile/tutor");
      }, 1500);
    }
  };

  if (isFetching || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Clock className="h-8 w-8 animate-spin text-sky-600" />
        <p className="ml-3">Cargando...</p>
      </div>
    );
  }
  if (authError && !profile.email) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-4 text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
        <h2 className="text-lg font-semibold text-red-600">Error</h2>
        <p>{authError}</p>
      </div>
    );
  }

  return (
    <RequireEmailVerified>
      <div className="container py-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
          <Link href="/dashboard/tutor" className="mr-4">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-sky-700">
            Editar Perfil de Tutor
          </h1>
        </div>
        {/* Botón de Guardar General (opcional, si cada pestaña tiene el suyo) */}
        {/* <Button onClick={saveProfileData} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />{isSaving ? "Guardando..." : "Guardar Todo"}
        </Button> */}
      </div>

      {pageMessage && (
        <div
          className={`my-4 rounded-md p-3 text-sm ${
            pageMessage.type === "success"
              ? "bg-green-100 border border-green-400 text-green-700"
              : "bg-red-100 border border-red-400 text-red-700"
          }`}
        >
          {pageMessage.text}
        </div>
      )}

      <Tabs
        defaultValue="info"
        className="w-full"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="info">Información</TabsTrigger>
          <TabsTrigger value="expertise">Expertise</TabsTrigger>
          <TabsTrigger value="schedules">Horarios</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal y Académica</CardTitle>
              <CardDescription>
                Datos que te describen como tutor.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-2">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.photo_url || undefined} />
                  <AvatarFallback>
                    {profile.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    document.getElementById("avatarUploadField")?.click()
                  }
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Cambiar Foto
                </Button>
                <input
                  type="file"
                  id="avatarUploadField"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input
                    id="name"
                    name="name"
                    value={profile.name}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    value={profile.email}
                    disabled
                    readOnly
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="bio">Biografía</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={profile.bio}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="university">Universidad</Label>
                  <Input
                    id="university"
                    name="university"
                    value={profile.university}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="degree">Carrera/Título</Label>
                  <Input
                    id="degree"
                    name="degree"
                    value={profile.degree}
                    onChange={handleProfileChange}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="academic_year">Año/Situación Académica</Label>
                <Select
                  name="academic_year"
                  value={profile.academic_year || ""}
                  onValueChange={(value) =>
                    setProfile((prev) => ({
                      ...prev,
                      academic_year:
                        value === "UNSET_ACADEMIC_YEAR" ? "" : value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1er año</SelectItem>
                    <SelectItem value="2">2do año</SelectItem>
                    <SelectItem value="3">3er año</SelectItem>
                    <SelectItem value="4">4to año</SelectItem>
                    <SelectItem value="5">5to año</SelectItem>
                    <SelectItem value="6+">6to año o +</SelectItem>
                    <SelectItem value="egresado">Egresado/a</SelectItem>
                    <SelectItem value="titulado">Titulado/a</SelectItem>
                    <SelectItem value="postgrado">Postgrado</SelectItem>
                    <SelectItem value="profesional">Profesional</SelectItem>
                    <SelectItem value="UNSET_ACADEMIC_YEAR">
                      No especificar
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="cv_url">URL CV</Label>
                <Input
                  id="cv_url"
                  name="cv_url"
                  value={profile.cv_url || ""}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="experience">Experiencia Detallada</Label>
                <Textarea
                  id="experience"
                  name="experience"
                  value={profile.experience}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="tutoring_contact_email">Email Tutorías</Label>
                  <Input
                    id="tutoring_contact_email"
                    name="tutoring_contact_email"
                    type="email"
                    value={profile.tutoring_contact_email || ""}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="tutoring_phone">Teléfono Tutorías</Label>
                  <Input
                    id="tutoring_phone"
                    name="tutoring_phone"
                    type="tel"
                    value={profile.tutoring_phone || ""}
                    onChange={handleProfileChange}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={saveProfileData}
                disabled={isSaving}
                className="ml-auto bg-sky-600 hover:bg-sky-700"
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Guardando..." : "Guardar Información"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="expertise">
          <Card>
            <CardHeader>
              <CardTitle>Cursos que Enseñas</CardTitle> {/* Changed "Áreas de Expertise" */}
              <CardDescription>Cursos que enseñas.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {expertiseAreas.length > 0 &&
                expertiseAreas.map((area) => (
                  <div
                    key={area.id}
                    className="flex justify-between items-center border p-3 rounded-md"
                  >
                    <div>
                      <span>{area.name}</span> <Badge>{area.level}</Badge>{" "}
                      {area.grade && <span>Nota: {area.grade}</span>}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeExpertiseArea(area.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              <div className="border-dashed border p-4 space-y-3">
                <h4>Añadir Curso</h4> {/* Changed "Área" to "Curso" */}
                <Input
                  name="courseId"
                  value={newExpertiseArea.courseId}
                  onChange={handleNewExpertiseChange}
                  placeholder="ID Curso (Temporal)"
                  type="number"
                />
                <Input
                  name="name"
                  value={newExpertiseArea.name}
                  onChange={handleNewExpertiseChange}
                  placeholder="Nombre Curso"
                />
                <Select
                  name="level"
                  value={newExpertiseArea.level}
                  onValueChange={handleNewExpertiseLevelChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Básico">Básico</SelectItem>
                    <SelectItem value="Intermedio">Intermedio</SelectItem>
                    <SelectItem value="Avanzado">Avanzado</SelectItem>
                    <SelectItem value="Universidad">Universidad</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  name="grade"
                  value={newExpertiseArea.grade}
                  onChange={handleNewExpertiseChange}
                  placeholder="Tu Nota (1.0-7.0)"
                  type="number"
                  step="0.1"
                />
                <Button
                  onClick={addExpertiseArea}
                  variant="outline"
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Añadir Curso {/* Changed "Añadir" to "Añadir Curso" for clarity, though original was just "Añadir" */}
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={saveProfileData}
                disabled={isSaving}
                className="ml-auto bg-sky-600 hover:bg-sky-700"
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Guardando..." : "Guardar Cursos"} {/* Changed "Expertise" to "Cursos" */}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="schedules">
          <Card>
            <CardHeader>
              <CardTitle>Disponibilidad</CardTitle>
              <CardDescription>Tus horarios.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {availabilityBlocks.length > 0 &&
                availabilityBlocks
                  .slice()
                  .sort((a, b) =>
                    new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
                  )
                  .map((block) => (
                    <div
                      key={block.id}
                      className="flex justify-between items-center border p-3 rounded-md"
                    >
                      <span>
                        {formatDate(block.startTime)}: {formatHour(block.startTime)} - {formatHour(block.endTime)}
                      </span>
                    </div>
                  ))}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Link href="/availability/tutor">
                <Button className="bg-sky-600 hover:bg-sky-700 text-white">
                  Editar mi Disponibilidad
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </RequireEmailVerified>
  );
}
