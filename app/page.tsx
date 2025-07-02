"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Users, Calendar, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const { user, loading } = useAuth();

  const dashboardHref = user ? (user.role === 'STUDENT' ? '/dashboard/student' : '/dashboard/tutor') : '/login';

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 bg-sky-50">
          <div className="container px-4 md:px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-sky-800">
              Tu Éxito Académico Comienza Aquí
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
              Conectamos a estudiantes con tutores expertos de la UDP para potenciar tu aprendizaje.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              {!loading && (
                <>
                  {user ? (
                    <Link href={dashboardHref}>
                      <Button size="lg" className="bg-sky-600 text-white hover:bg-sky-700">
                        Ir al Dashboard <LayoutDashboard className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Link href="/register">
                        <Button size="lg" className="bg-sky-600 text-white hover:bg-sky-700">
                          Comenzar Ahora <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                      <Link href="/login">
                        <Button size="lg" variant="outline" className="text-sky-600 border-sky-600 hover:bg-sky-100">
                          Iniciar Sesión
                        </Button>
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="w-full py-16 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800">
              ¿Cómo Funciona?
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-center text-gray-500">
              Encuentra ayuda o comparte tu conocimiento en tres simples pasos.
            </p>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center p-6">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-sky-100 text-sky-600">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-gray-800">1. Regístrate</h3>
                <p className="mt-2 text-gray-500">
                  Crea tu perfil como estudiante, tutor, o ambos. Es rápido y fácil.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-sky-100 text-sky-600">
                  <BookOpen className="h-8 w-8" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-gray-800">2. Explora</h3>
                <p className="mt-2 text-gray-500">
                  Busca tutorías por materia o explora la lista de tutores disponibles.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-sky-100 text-sky-600">
                  <Calendar className="h-8 w-8" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-gray-800">3. Agenda</h3>
                <p className="mt-2 text-gray-500">
                  Revisa la disponibilidad del tutor y agenda una sesión en el horario que más te acomode.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-16 md:py-24 bg-gray-50">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800">
              Una Plataforma Pensada para Ti
            </h2>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="p-6 bg-white border rounded-lg shadow-sm">
                <h3 className="text-xl font-bold text-sky-700">Tutores Verificados</h3>
                <p className="mt-2 text-gray-500">
                  Todos nuestros tutores son estudiantes de la UDP con excelente rendimiento académico.
                </p>
              </div>
              <div className="p-6 bg-white border rounded-lg shadow-sm">
                <h3 className="text-xl font-bold text-sky-700">Flexibilidad de Horarios</h3>
                <p className="mt-2 text-gray-500">
                  Agenda tutorías en los horarios que mejor se adapten a tu vida universitaria.
                </p>
              </div>
              <div className="p-6 bg-white border rounded-lg shadow-sm">
                <h3 className="text-xl font-bold text-sky-700">Feedback y Calificaciones</h3>
                <p className="mt-2 text-gray-500">
                  Deja tu opinión sobre las tutorías y ayuda a otros a encontrar al mejor tutor.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 bg-white">
        <div className="container text-center text-sm text-gray-500">
          © 2025 LINKUDP. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
