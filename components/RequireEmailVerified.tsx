"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export default function RequireEmailVerified({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && !user.email_verified) {
      router.push("/verify-email-pending");
    }
  }, [user, loading, router]);

  // 👇 Esto permite que el componente se re-renderice y deje de bloquearse
  if (loading || !user) {
    return <div>Cargando...</div>;
  }

  if (!user.email_verified) {
    return null; // 👈 bloquea la renderización si el email no está verificado
  }

  return <>{children}</>;
}
