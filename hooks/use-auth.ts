// src/hooks/use-auth.ts (o la ruta donde lo tengas)

"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

// --- Interfaces Base ---
export interface User {
  id: number;
  full_name: string;
  email: string;
  role: "STUDENT" | "TUTOR" | "BOTH";
  photo_url?: string | null;
  email_verified?: boolean;
}

// Corresponde a lo que devuelve el backend en GET /profile/me
// (Backend/src/profile/dto/view-user-profile.dto.ts)
export interface UserProfile {
  user: User;
  studentProfile?: {
    // id?: number; // Si el backend lo incluye y lo necesitas
    university?: string;
    career?: string;
    study_year?: number;
    bio?: string | null;
    interests?: Array<{ courseId: number; courseName: string }>;
  };
  tutorProfile?: {
    id: number; // ID del TutorProfile
    bio?: string | null;
    average_rating?: number;
    cv_url?: string | null;
    experience_details?: string | null;
    tutoring_contact_email?: string | null;
    tutoring_phone?: string | null;
    // --- NUEVOS CAMPOS ACADÉMICOS DEL TUTOR ---
    university?: string | null;
    degree?: string | null;
    academic_year?: string | null; // Corresponde al 'year' del formulario de onboarding
    // -----------------------------------------
    courses?: Array<{
      // id?: number; // ID de la relación TutorCourse si el backend lo envía
      courseId: number;
      courseName: string;
      level: string;
      grade: number | null;
    }>;
    availability?: Array<{
      // id?: number; // ID del AvailabilityBlock si el backend lo envía
      day_of_week: string; // Debería coincidir con el enum DayOfWeek del backend
      start_time: string; // Formato HH:MM
      end_time: string; // Formato HH:MM
    }>;
  };
}

// --- Interfaces para Autenticación ---
interface Credentials {
  email: string;
  password: string;
}

interface RegisterData {
  full_name: string;
  email: string;
  password: string;
  role: "STUDENT" | "TUTOR" | "BOTH";
}

// --- Interfaces para Actualización de Perfil de Estudiante ---
// (Corresponde a Backend/src/profile/dto/update-user-profile.dto.ts en parte)
interface UpdateStudentProfileData {
  university?: string; // Estos son para StudentProfile
  career?: string;
  study_year?: number;
  bio?: string; // Este bio va a UserProfile, y el backend lo propaga a StudentProfile.bio
  interestCourseIds?: number[];
  full_name?: string; // Para actualizar el nombre del usuario
  photo_url?: string; // Para actualizar la foto del usuario
}

// --- Interfaces para Actualización/Onboarding de Perfil de Tutor ---

// Datos recolectados en el formulario de onboarding del tutor (`app/onboarding/tutor/page.tsx`)
export interface TutorOnboardingFormData {
  bio: string; // Bio general que irá a UserProfile -> TutorProfile.bio
  university: string; // Específico del Tutor
  degree: string; // Específico del Tutor
  year: string; // Específico del Tutor (se mapeará a academic_year)

  // Estos son campos de UpdateTutorSpecificProfileDto
  cv_url?: string;
  experience_details?: string; // Para texto libre adicional si es necesario
  tutoring_contact_email?: string;
  tutoring_phone?: string;

  // Para los cursos, es CRUCIAL que courseId sea un número válido.
  courses: Array<{
    courseId: number; // ¡Este ID debe ser válido y existir en la tabla Course!
    name: string; // Útil para mostrar en el frontend, pero el backend usa courseId
    level: string;
    grade: string; // Se convertirá a número
  }>;

  // Opcional: disponibilidad si se recolecta en el onboarding
  // availability?: Array<{ day_of_week: string; start_time: string; end_time: string }>;
}

// Payload para PATCH /profile/me (actualiza datos generales del User y propaga bio)
// (Corresponde a Backend/src/profile/dto/update-user-profile.dto.ts)
interface UpdateUserGeneralProfilePayload {
  full_name?: string;
  photo_url?: string;
  bio?: string; // Bio general
  // Campos de estudiante, no se envían desde el onboarding de tutor a este endpoint.
  // university?: string;
  // career?: string;
  // study_year?: number;
  // interestCourseIds?: number[];
}

// Payload para PATCH /profile/me/tutor (actualiza datos específicos del TutorProfile)
// (Corresponde a Backend/src/profile/dto/update-tutor-specific-profile.dto.ts)
interface UpdateTutorSpecificProfilePayload {
  bio?: string; // Bio específico del tutor (puede sobreescribir el general si se maneja así en backend)
  cv_url?: string;
  experience_details?: string;
  tutoring_contact_email?: string;
  tutoring_phone?: string;
  university?: string;
  degree?: string;
  academic_year?: string;
  courses?: Array<{
    courseId: number;
    level: string;
    grade: number;
  }>;
  availability?: Array<{
    day_of_week: string; // Debe ser del enum DayOfWeek
    start_time: string; // Formato HH:MM
    end_time: string; // Formato HH:MM
  }>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export function useAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null); // Para almacenar el usuario logueado

  // Efecto para cargar el usuario desde el token al montar el hook (opcional)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Podrías decodificar el token para obtener datos básicos del usuario
      // o llamar a getCurrentUserProfile para obtener el perfil completo.
      // Por ahora, solo indicamos que hay un token.
      // Ejemplo con decodificación (si es necesario y seguro):
      // try {
      //   const decodedToken: any = jwtDecode(token); // Usa una interfaz más específica para el token decodificado
      //   setUser({ id: decodedToken.sub, email: decodedToken.email, role: decodedToken.role, full_name: decodedToken.full_name });
      // } catch (e) {
      //   console.error("Error decodificando token:", e);
      //   localStorage.removeItem("token");
      // }
    }
  }, []);

  const login = async (credentials: Credentials) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();

      if (res.status === 429 || res.status === 403) {
        throw new Error(data.message || "Demasiados intentos. Intenta más tarde.");
      }

      if (!res.ok) {
        throw new Error(data.message || "Error al iniciar sesión.");
      }
      localStorage.setItem("token", data.access_token);
      // Opcional: decodificar token para setear User o llamar a getCurrentUserProfile
      const decodedToken: any = jwtDecode(data.access_token);
      setUser({ id: decodedToken.sub, email: decodedToken.email, role: decodedToken.role, full_name: decodedToken.full_name });
      
      if (decodedToken.role === "STUDENT") {
        console.log("Redirigiendo a /dashboard/student...");
        router.push("/dashboard/student");
      } else if (decodedToken.role === "TUTOR" || decodedToken.role === "BOTH") {
        console.log("Redirigiendo a /dashboard/tutor...");
        router.push("/dashboard/tutor");
      }
      // Redirigir según el rol (el backend podría devolver el rol en la respuesta del login)
      // Por ahora, asumimos que el token contiene el rol o se obtiene después.
      // La redirección se puede manejar en la página de login después de una llamada exitosa.
      return data; // Devuelve la respuesta completa del login (incluyendo token)
    } catch (err: any) {
      console.error("Error en login:", err);
      setError(err.message || "Ocurrió un error al iniciar sesión.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const register = async (registerData: RegisterData) => {
    // RegisterData debe estar definida arriba
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });

      const responseData = await res.json();

      if (res.status === 409) {
        // 409 Conflict → Correo ya registrado (esto debe enviarlo el backend correctamente)
        throw new Error("El correo electrónico ya está registrado.");
      }

      if (!res.ok) {
        throw new Error(
          responseData.message || "Error al registrar usuario. Inténtalo de nuevo."
        );
      }


      // Asumimos que el backend devuelve access_token y posiblemente info del usuario al registrarse
      const access_token = responseData.access_token;
      if (!access_token) {
        console.warn(
          "No se recibió access_token después del registro exitoso. Se requiere inicio de sesión manual."
        );
        // Podrías manejar esto como un error si el login automático es esperado
        // throw new Error("Registro exitoso, pero no se pudo iniciar sesión automáticamente.");
      } else {
        localStorage.setItem("token", access_token);
        console.log("Token guardado después del registro.");
      }

      console.log("Registro exitoso. Rol seleccionado:", registerData.role);
      console.log("Respuesta del backend al registrar:", responseData);

      // --- LÓGICA DE REDIRECCIÓN ---
      if (registerData.role === "STUDENT") {
        console.log("Redirigiendo a /onboarding/student...");
        router.push("/onboarding/student");
      } else if (registerData.role === "TUTOR") {
        console.log("Redirigiendo a /onboarding/tutor...");
        router.push("/onboarding/tutor");
      } else if (registerData.role === "BOTH") {
        // Decide a dónde redirigir si el rol es BOTH.
        // Por ejemplo, podrías tener un flujo de onboarding combinado o elegir uno por defecto.
        console.log(
          "Rol BOTH detectado. Redirigiendo a /onboarding/tutor (ajustar si es necesario)."
        );
        router.push("/onboarding/tutor"); // O '/onboarding/student' o una página de selección de onboarding
      } else {
        console.warn(
          `Rol de usuario no manejado para onboarding: ${registerData.role}. Redirigiendo a dashboard como fallback.`
        );
        router.push("/dashboard"); // O a una página principal si el rol no coincide
      }
      // --- FIN DE LÓGICA DE REDIRECCIÓN ---

      return responseData; // Devuelve la respuesta completa del backend
    } catch (err: any) {
      console.error("Error en la función de registro (useAuth):", err);
      setError(
        err.message ||
          "Ocurrió un error durante el registro. Por favor, inténtalo más tarde."
      );
      return null; // Devuelve null en caso de error
    } finally {
      setLoading(false);
    }
  };

  // Actualiza perfil general del usuario y datos específicos de estudiante
  const updateStudentProfile = async (data: UpdateStudentProfileData) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token)
        throw new Error("Token no encontrado. Inicia sesión de nuevo.");

      // El DTO del backend UpdateUserProfileDto espera estos campos.
      // Asegúrate que UpdateStudentProfileData coincida con los campos permitidos.
      const payload: UpdateUserGeneralProfilePayload & {
        university?: string;
        career?: string;
        study_year?: number;
        interestCourseIds?: number[];
      } = {
        full_name: data.full_name, // Si se permite actualizar nombre
        photo_url: data.photo_url, // Si se permite actualizar foto
        bio: data.bio,
        university: data.university,
        career: data.career,
        study_year: data.study_year,
        interestCourseIds: data.interestCourseIds,
      };
      // Filtrar claves con valor undefined para no enviarlas
      Object.keys(payload).forEach((keyStr) => {
        const key = keyStr as keyof typeof payload;
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });

      const res = await fetch(`${API_BASE_URL}/profile/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();
      if (!res.ok) {
        console.error(
          "Error al actualizar perfil de estudiante:",
          responseData
        );
        throw new Error(
          responseData.message || "No se pudo guardar el perfil del estudiante."
        );
      }

      console.log("Perfil de estudiante actualizado:", responseData);
      router.push("/dashboard/student"); // O a la página de perfil del estudiante
      return responseData;
    } catch (err: any) {
      console.error("Error en updateStudentProfile:", err);
      setError(
        err.message ||
          "Ocurrió un error al actualizar el perfil del estudiante."
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateTutorProfile = async (data: TutorOnboardingFormData) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token)
        throw new Error("Token no encontrado. Inicia sesión de nuevo.");

      // 1. Actualizar el UserProfile general (bio)
      const userProfileUpdatePayload: UpdateUserGeneralProfilePayload = {
        bio: data.bio,
      };
      // Filtrar undefined
      Object.keys(userProfileUpdatePayload).forEach((keyStr) => {
        const key = keyStr as keyof UpdateUserGeneralProfilePayload;
        if (userProfileUpdatePayload[key] === undefined) {
          delete userProfileUpdatePayload[key];
        }
      });

      const profileRes = await fetch(`${API_BASE_URL}/profile/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userProfileUpdatePayload),
      });

      const profileResData = await profileRes.json();
      if (!profileRes.ok) {
        console.error(
          "Error al actualizar perfil básico del tutor:",
          profileResData
        );
        throw new Error(
          profileResData.message ||
            "No se pudo guardar la información básica del perfil del tutor."
        );
      }
      console.log("Perfil básico del tutor actualizado:", profileResData);

      // 2. Actualizar el TutorProfile específico
      const tutorSpecificPayload: UpdateTutorSpecificProfilePayload = {
        university: data.university,
        degree: data.degree,
        academic_year: data.year,
        cv_url: data.cv_url,
        experience_details: data.experience_details,
        tutoring_contact_email: data.tutoring_contact_email,
        tutoring_phone: data.tutoring_phone,
        // --- SECCIÓN DE CURSOS OMITIDA ---
        // courses: data.courses && data.courses.length > 0 ? data.courses.map(course => {
        //   const grade = parseFloat(course.grade);
        //   if (isNaN(grade) || course.courseId === undefined || course.courseId === null) {
        //     console.error("Datos de curso inválidos:", course);
        //     throw new Error(`Datos inválidos para el curso '${course.name}'. Se requiere ID de curso y nota válida.`);
        //   }
        //   return {
        //     courseId: course.courseId,
        //     level: course.level,
        //     grade: grade,
        //   };
        // }) : undefined, // Si data.courses está vacío o no existe, courses será undefined
        // availability: data.availability, // Si se recolecta
      };

      // Si data.courses existe y tiene elementos, Y TIENES IDs válidos (lo cual no es el caso ahora)
      // podrías añadirlo condicionalmente:
      // if (data.courses && data.courses.length > 0 && todosLosCursosTienenIDValido) {
      //    tutorSpecificPayload.courses = data.courses.map(...)
      // }
      // Por ahora, simplemente no lo incluimos.

      // Filtrar claves con valor undefined para no enviarlas
      Object.keys(tutorSpecificPayload).forEach((keyStr) => {
        const key = keyStr as keyof UpdateTutorSpecificProfilePayload;
        if (tutorSpecificPayload[key] === undefined) {
          delete tutorSpecificPayload[key];
        }
      });

      const tutorProfileRes = await fetch(`${API_BASE_URL}/profile/me/tutor`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(tutorSpecificPayload),
      });

      const tutorProfileResData = await tutorProfileRes.json();
      if (!tutorProfileRes.ok) {
        console.error(
          "Error al actualizar perfil específico del tutor:",
          tutorProfileResData
        );
        throw new Error(
          tutorProfileResData.message ||
            "No se pudo guardar la información específica del perfil del tutor."
        );
      }

      console.log(
        "Perfil específico del tutor actualizado (sin cursos por ahora):",
        tutorProfileResData
      );
      router.push("/dashboard/tutor");
      return tutorProfileResData;
    } catch (err: any) {
      console.error("Error en updateTutorProfile:", err);
      const message =
        err.message || "Ocurrió un error al actualizar el perfil del tutor.";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUserProfile =
    useCallback(async (): Promise<UserProfile | null> => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        // router.push("/login"); // Opcional: redirigir si no hay token y la página es protegida
        return null;
      }

      try {
        const profileRes = await fetch(`${API_BASE_URL}/profile/me`, {
          method: "GET", // Especificar método GET
          headers: { Authorization: `Bearer ${token}` },
        });

        const responseData = await profileRes.json();
        if (!profileRes.ok) {
          if (profileRes.status === 401) {
            // No autorizado o token inválido
            localStorage.removeItem("token");
            setUser(null);
            // router.push("/login"); // Opcional
          }
          throw new Error(
            responseData.message || "Error al obtener el perfil del usuario."
          );
        }
        // Almacenar el perfil de usuario en el estado del hook si es necesario globalmente
        // setUser(responseData.user);
        return responseData as UserProfile;
      } catch (err: any) {
        console.error("Error fetching current user profile:", err);
        setError(err.message || "Ocurrió un error al obtener el perfil.");
        return null;
      } finally {
        setLoading(false);
      }
    }, [router]); // router es dependencia si se usa para redirección

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null); // Limpiar el estado del usuario
    router.push("/login");
  }, [router]);

  return {
    user, // El usuario logueado (básico o nulo)
    loading,
    error,
    login,
    register,
    updateStudentProfile,
    updateTutorProfile,
    getCurrentUserProfile,
    logout,
  };
}
