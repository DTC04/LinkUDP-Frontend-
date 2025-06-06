"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function VerifyEmailPendingPage() {
  const { user, refetchUser } = useAuth();
  const router = useRouter();

  const handleVerifyClick = async () => {
    await refetchUser();
  };

  useEffect(() => {
    if (user?.email_verified) {
      // Redirige al dashboard según el rol del usuario
      if (user.role === "STUDENT") {
        router.push("/dashboard/student");
      } else if (user.role === "TUTOR") {
        router.push("/dashboard/tutor");
      }
    }
  }, [user, router]);

  return (
    <div>
      <h1>Verificación de correo electrónico pendiente</h1>
      <p>
        Debes verificar tu correo electrónico antes de continuar. Por favor revisa tu bandeja de entrada y haz clic en el enlace de verificación.
      </p>
      <button
        onClick={handleVerifyClick}
        style={{ marginTop: "20px", padding: "10px 20px" }}
      >
        Ya verifiqué mi correo
      </button>
    </div>
  );
}
