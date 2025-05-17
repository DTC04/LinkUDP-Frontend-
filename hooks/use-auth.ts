
"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react"; 
import { jwtDecode } from "jwt-decode";


export interface User { 
  id: number;
  full_name: string;
  email: string;
  role: "STUDENT" | "TUTOR" | "BOTH"; 

}

export interface UserProfile { 
  user: User;
}

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
  university: string;
  career?: string;
  study_year: number;
  interestCourseIds?: number[];
  bio: string;
}

export function useAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: Credentials) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!res.ok) throw new Error("Error al iniciar sesión");

      const { access_token } = await res.json();
      localStorage.setItem("token", access_token);

      const profileRes = await fetch("http://localhost:3000/profile/me", {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const profile: UserProfile = await profileRes.json(); // Use UserProfile type
      
      // Log detallado del perfil obtenido
      console.log("Perfil obtenido en login (useAuth):", JSON.stringify(profile, null, 2));

      if (profile && profile.user && profile.user.role === "STUDENT") {
        console.log("Redirigiendo a /dashboard/student para rol STUDENT");
        router.push("/dashboard/student");
      } else if (
        profile && profile.user &&
        (profile.user.role === "TUTOR" || profile.user.role === "BOTH")
      ) {
        console.log(`Redirigiendo a /dashboard/tutor para rol ${profile.user.role}`);
        router.push("/dashboard/tutor");
      } else {
        // Fallback o manejo de error si el rol no está o es inesperado
        console.warn(
          `Rol de usuario no determinado o inesperado en login. Perfil recibido: ${JSON.stringify(profile, null, 2)}. Redirigiendo a /dashboard/tutor como fallback.`
        );
        router.push("/dashboard/tutor"); // Fallback a dashboard de tutor
      }
    } catch (err) {
      setError("Credenciales inválidas o error de servidor");
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Error al registrar usuario");

      const responseData = await res.json();
      const { access_token } = responseData;
      localStorage.setItem("token", access_token);

      let decodedTokenRole: string | undefined;
      try {
        const decoded: { role?: string; [key: string]: any } =
          jwtDecode(access_token);
        decodedTokenRole = decoded.role;
      } catch (e) {
        console.error("Error decodificando token:", e);
      }

      const profileRes = await fetch("http://localhost:3000/profile/me", {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const profile: UserProfile = await profileRes.json();

      console.log("Rol enviado al registrar:", data.role);
      console.log("Rol en token JWT decodificado:", decodedTokenRole);
      console.log("Rol obtenido de /profile/me:", profile.user?.role);

      if (
        profile.user &&
        (profile.user.role === "STUDENT" || profile.user.role === "BOTH")
      ) {
        router.push("/onboarding/student");
      } else if (profile.user && profile.user.role === "TUTOR") {
        router.push("/onboarding/tutor");
      } else {
        console.warn(
          `Rol de perfil no manejado explícitamente para onboarding: ${profile.user?.role}. Redirigiendo a /onboarding/student por defecto.`
        );
        router.push("/onboarding/student");
      }
    } catch (err) {
      console.error("Error en la función de registro:", err);
      setError("Error al crear cuenta. Revisa la consola para más detalles.");
    } finally {
      setLoading(false);
    }
  };

  const updateStudentProfile = async (data: UpdateStudentProfileData) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token no encontrado");

      const res = await fetch("http://localhost:3000/profile/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error al actualizar perfil:", errorData);
        setError("No se pudo guardar el perfil.");
        return null;
      }

      const responseData = await res.json();
      console.log("Perfil actualizado:", responseData);
      router.push("/dashboard/student"); 
      return responseData;
    } catch (err) {
      console.error("Error al actualizar perfil:", err);
      setError("Ocurrió un error al actualizar el perfil.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUserProfile = useCallback(async (): Promise<UserProfile | null> => {
    
    const token = localStorage.getItem("token");
    if (!token) {
      
      return null;
    }

    try {
      const profileRes = await fetch("http://localhost:3000/profile/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!profileRes.ok) {
        localStorage.removeItem("token"); 
        return null;
      }
      const profile = await profileRes.json();
      return profile as UserProfile; 
    } catch (err) {
      console.error("Error fetching current user profile:", err);
      return null;
    } finally {
      
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    router.push("/login");
   
  }, [router]);

  return { login, register, updateStudentProfile, getCurrentUserProfile, logout, loading, error };
}
