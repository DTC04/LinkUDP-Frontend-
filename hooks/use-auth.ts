"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback, useEffect, createContext, useContext } from "react";

// --- Interfaces Base ---
export interface User {
  id: number;
  full_name: string;
  email: string;
  role: "STUDENT" | "TUTOR" | "BOTH";
  photo_url?: string | null;
  email_verified?: boolean;
}

// --- Perfil completo que devuelve /profile/me ---
export interface UserProfile {
  user: User;
  studentProfile?: {
    university?: string;
    career?: string;
    study_year?: number;
    bio?: string | null;
    interests?: Array<{ courseId: number; courseName: string }>;
  };
  tutorProfile?: {
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
    courses?: Array<{
      courseId: number;
      courseName: string;
      level: string;
      grade: number | null;
    }>;
    availability?: Array<{
      day_of_week: string;
      start_time: string;
      end_time: string;
    }>;
  };
}

// --- Datos de entrada ---
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

interface UpdateStudentProfileData {
  university?: string;
  career?: string;
  study_year?: number;
  bio?: string;
  interestCourseIds?: number[];
  full_name?: string;
  photo_url?: string;
}

export interface TutorOnboardingFormData {
  bio: string;
  university: string;
  degree: string;
  year: string;
  cv_url?: string;
  experience_details?: string;
  tutoring_contact_email?: string;
  tutoring_phone?: string;
  courses: Array<{
    courseId: number;
    name: string;
    level: string;
    grade: string;
  }>;
}

interface UpdateTutorSpecificProfilePayload {
  bio?: string;
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
    day_of_week: string;
    start_time: string;
    end_time: string;
  }>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const AuthContext = createContext<any>(null);

export function useAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(true); // Iniciar en true para la carga inicial
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const checkAuth = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/profile/me`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const getCurrentUserProfile = useCallback(async (): Promise<UserProfile | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/profile/me`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (res.status === 401 || res.status === 403) {
        return null; // No autenticado, pero no es un error como tal
      }      
      setUser(data.user);
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials: Credentials) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(credentials),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al iniciar sesión.");
      }

      if (data.user.role === "STUDENT") {
        window.location.assign("/dashboard/student");
      } else {
        window.location.assign("/dashboard/tutor");
      }

      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const register = async (registerData: RegisterData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(registerData),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.message || "Error al registrar usuario.");
      }

      // Redirigir después del registro exitoso
      if (registerData.role === "STUDENT") {
        router.push("/onboarding/student");
      } else {
        router.push("/onboarding/tutor");
      }

      return responseData;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateStudentProfile = async (data: UpdateStudentProfileData) => {
    setLoading(true);
    setError(null);
    try {
      const payload: UpdateStudentProfileData = {};
      if (data.full_name) payload.full_name = data.full_name;
      if (data.photo_url) payload.photo_url = data.photo_url;
      if (data.bio) payload.bio = data.bio;
      if (data.university) payload.university = data.university;
      if (data.career) payload.career = data.career;
      if (data.study_year) payload.study_year = data.study_year;
      if (data.interestCourseIds) payload.interestCourseIds = data.interestCourseIds;

      const res = await fetch(`${API_BASE_URL}/profile/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.message);
      router.push("/dashboard/student");
      return responseData;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateTutorProfile = async (data: TutorOnboardingFormData) => {
    setLoading(true);
    setError(null);
    try {
      const profileRes = await fetch(`${API_BASE_URL}/profile/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ bio: data.bio }),
      });
      if (!profileRes.ok) throw new Error("No se pudo guardar información básica.");

      const tutorPayload: UpdateTutorSpecificProfilePayload = {
        university: data.university,
        degree: data.degree,
        academic_year: data.year,
        cv_url: data.cv_url,
        experience_details: data.experience_details,
        tutoring_contact_email: data.tutoring_contact_email,
        tutoring_phone: data.tutoring_phone,
      };
      Object.keys(tutorPayload).forEach((key) => {
        if (tutorPayload[key as keyof typeof tutorPayload] === undefined) {
          delete tutorPayload[key as keyof typeof tutorPayload];
        }
      });

      const tutorRes = await fetch(`${API_BASE_URL}/profile/me/tutor`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(tutorPayload),
      });
      if (!tutorRes.ok) throw new Error("No se pudo guardar el perfil del tutor.");

      router.push("/dashboard/tutor");
      return await tutorRes.json();
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  const logout = useCallback(() => {
    fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).finally(() => {
      setUser(null);
      router.push("/login");
    });
  }, [router]);

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    checkAuth,
    refetchUser: checkAuth,
    updateStudentProfile,
    updateTutorProfile,
    getCurrentUserProfile,
  };
}
