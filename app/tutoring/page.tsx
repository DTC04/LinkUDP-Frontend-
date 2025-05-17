"use client";
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
import { Badge } from "@/components/ui/badge";
import { Filter, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export default function TutoringListPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          jwtDecode(token);
          setIsLoggedIn(true);
        } catch {
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <span className="text-xl font-bold text-sky-600 cursor-default select-none">
            LINKUDP
          </span>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            {isLoggedIn ? (
              <>
                <Link
                  href="/tutoring"
                  className="text-sm font-medium text-foreground border-b-2 border-sky-600 pb-1"
                >
                  Buscar Tutorías
                </Link>
                <Link
                  href="/dashboard/student"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Mi Dashboard
                </Link>
                <Link
                  href="/profile/student"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Mi Perfil
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Registrarse
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="container px-4 py-10 md:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-sky-700">
                Tutorías Disponibles
              </h1>
              <p className="text-muted-foreground">
                Encuentra la tutoría que necesitas para tus materias.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                className="max-w-[200px]"
                placeholder="Buscar tutoría..."
              />
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filtrar tutorías</span>
              </Button>
              <Link href="/tutoring/create">
                <Button className="bg-sky-600 hover:bg-sky-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Tutoría
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3"></div>
        </div>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 LINKUDP. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

const tutorings = [];
