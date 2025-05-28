"use client";

import { useState, ChangeEvent, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/hooks/use-auth";
import { Eye, EyeOff } from "lucide-react";

interface RegisterPageFormData {
  full_name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "STUDENT" | "TUTOR" | "BOTH";
}

export default function RegisterPage() {
  const { register, loading, error: authError } = useAuth();

  const [formData, setFormData] = useState<RegisterPageFormData>({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "STUDENT",
  });

  const [pageError, setPageError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (pageError) setPageError(null);
  };

  const handleRoleChange = (value: string) => {
    if (value === "STUDENT" || value === "TUTOR" || value === "BOTH") {
      setFormData((prev) => ({
        ...prev,
        role: value as "STUDENT" | "TUTOR" | "BOTH",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPageError(null);

    const { full_name, email, password, confirmPassword } = formData;

    if (!full_name || !email || !password || !confirmPassword) {
      setPageError("Todos los campos son obligatorios.");
      return;
    }

    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);

    if (!hasMinLength || !hasUppercase) {
      setPageError(
        "La contraseña debe tener al menos 8 caracteres y una letra mayúscula."
      );
      return;
    }

    if (password !== confirmPassword) {
      setPageError("Las contraseñas no coinciden.");
      return;
    }

    const result = await register({
      full_name,
      email,
      password,
      role: formData.role,
    });

    if (result) {
      console.log("Registro exitoso desde RegisterPage");
    }
  };

  useEffect(() => {
    // Si ya hay cookie de sesión, redirige
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("access_token="));
    if (token) {
      window.location.href = "/dashboard/student"; // Cambia ruta si es necesario
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-100 via-slate-50 to-sky-200 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold tracking-tight text-sky-700">
              LinkUDP
            </h1>
          </Link>
          <CardTitle className="mt-2 text-2xl">Crear una Cuenta</CardTitle>
          <CardDescription>
            Ingresa tus datos para unirte a nuestra comunidad.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid gap-1.5">
              <Label htmlFor="full_name">Nombre Completo</Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="Ej: Ana Pérez"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu.correo@udp.cl"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres y una mayúscula"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-slate-500 hover:text-sky-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repite tu contraseña"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-slate-500 hover:text-sky-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="font-medium">Quiero registrarme como:</Label>
              <RadioGroup
                value={formData.role}
                onValueChange={handleRoleChange}
                className="grid grid-cols-1 gap-3 sm:grid-cols-2"
              >
                <div className="flex items-center space-x-2 rounded-md border border-slate-300 p-3 hover:border-sky-400 has-[input:checked]:border-sky-500 has-[input:checked]:bg-sky-50">
                  <RadioGroupItem value="STUDENT" id="student" />
                  <Label htmlFor="student" className="flex w-full flex-col">
                    <span className="font-medium text-slate-800">
                      Estudiante
                    </span>
                    <span className="text-xs text-slate-500">
                      Buscar tutores y recibir ayuda.
                    </span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-md border border-slate-300 p-3 hover:border-sky-400 has-[input:checked]:border-sky-500 has-[input:checked]:bg-sky-50">
                  <RadioGroupItem value="TUTOR" id="tutor" />
                  <Label htmlFor="tutor" className="flex w-full flex-col">
                    <span className="font-medium text-slate-800">Tutor</span>
                    <span className="text-xs text-slate-500">
                      Ofrecer tutorías y ayudar.
                    </span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {pageError && (
              <p className="rounded-md border border-red-300 bg-red-50 p-3 text-center text-sm text-red-600">
                {pageError}
              </p>
            )}
            {authError && (
              <p className="rounded-md border border-red-300 bg-red-50 p-3 text-center text-sm text-red-600">
                {authError}
              </p>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button
              type="submit"
              className="w-full bg-sky-600 py-3 text-base hover:bg-sky-700"
              disabled={loading}
            >
              {loading ? "Registrando..." : "Crear Cuenta"}
            </Button>

            <Button
              type="button"
              onClick={() =>
                (window.location.href =
                  "http://localhost:3000/auth/google")
              }
              className="w-full bg-red-600 py-3 text-base hover:bg-red-700"
            >
              Registrarse con Google
            </Button>

            <div className="text-center text-sm text-slate-600">
              ¿Ya tienes una cuenta?{" "}
              <Link
                href="/login"
                className="font-medium text-sky-600 underline-offset-4 hover:text-sky-700 hover:underline"
              >
                Iniciar sesión
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
