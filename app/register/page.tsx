// app/auth/register/page.tsx (o la ruta correcta de tu página de registro)

"use client";

import { useState, ChangeEvent } from "react"; // Importado ChangeEvent
import Link from "next/link";
// import { useRouter } from 'next/navigation'; // No necesitas useRouter aquí si useAuth lo maneja
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
import { useAuth } from "@/hooks/use-auth"; // Asegúrate que la ruta sea correcta
import { Eye, EyeOff } from "lucide-react"; // Para mostrar/ocultar contraseña

// Definición de la interfaz RegisterData (debe coincidir con la de use-auth.ts)
interface RegisterPageFormData {
  full_name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "STUDENT" | "TUTOR" | "BOTH"; // Roles permitidos por el backend
}

export default function RegisterPage() {
  // const router = useRouter(); // No es necesario si useAuth maneja la redirección
  const { register, loading, error: authError } = useAuth(); // Renombrar 'error' para evitar conflicto si usas error local

  const [formData, setFormData] = useState<RegisterPageFormData>({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "STUDENT", // Valor por defecto
  });
  const [pageError, setPageError] = useState<string | null>(null); // Para errores específicos de la página
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (pageError) setPageError(null); // Limpiar errores de página al escribir
    if (authError) {
      /* Podrías limpiar authError aquí llamando a una función en el hook si la tienes */
    }
  };

  const handleRoleChange = (value: string) => {
    // Asegurarse que el valor coincida con los roles definidos
    if (value === "STUDENT" || value === "TUTOR" || value === "BOTH") {
      setFormData((prev) => ({
        ...prev,
        role: value as "STUDENT" | "TUTOR" | "BOTH",
      }));
    } else {
      // Manejar un valor inesperado, por ejemplo, volver al por defecto o mostrar error
      console.warn("Valor de rol inesperado:", value);
      setFormData((prev) => ({ ...prev, role: "STUDENT" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPageError(null);
  
    const { full_name, email, password, confirmPassword } = formData;
  
    // Validación de campos obligatorios
    if (!full_name || !email || !password || !confirmPassword) {
      setPageError("Todos los campos son obligatorios.");
      return;
    }
  
    // Validar longitud y mayúscula
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
  
    if (!hasMinLength || !hasUppercase) {
      setPageError("La contraseña debe tener al menos 8 caracteres y una letra mayúscula.");
      return;
    }
  
    if (password !== confirmPassword) {
      setPageError("Las contraseñas no coinciden.");
      return;
    }
  
    // ⚠️ Si llegamos aquí, todas las validaciones fueron correctas
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
  
  

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-100 via-slate-50 to-sky-200 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <Link href="/" className="inline-block">
            {/* Considera añadir tu logo aquí */}
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
                className="border-slate-300 focus:border-sky-500 focus:ring-sky-500"
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
                className="border-slate-300 focus:border-sky-500 focus:ring-sky-500"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimo 8 caracteres y una letra mayúscula."
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="border-slate-300 focus:border-sky-500 focus:ring-sky-500 pr-10"
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
                  className="border-slate-300 focus:border-sky-500 focus:ring-sky-500 pr-10"
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
                onValueChange={handleRoleChange} // Usar onValueChange para RadioGroup
                className="grid grid-cols-1 gap-3 sm:grid-cols-2"
              >
                <div className="flex items-center space-x-2 rounded-md border border-slate-300 p-3 hover:border-sky-400 has-[input:checked]:border-sky-500 has-[input:checked]:bg-sky-50">
                  <RadioGroupItem value="STUDENT" id="student" />
                  <Label
                    htmlFor="student"
                    className="flex w-full cursor-pointer flex-col"
                  >
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
                  <Label
                    htmlFor="tutor"
                    className="flex w-full cursor-pointer flex-col"
                  >
                    <span className="font-medium text-slate-800">Tutor</span>
                    <span className="text-xs text-slate-500">
                      Ofrecer tutorías y ayudar.
                    </span>
                  </Label>
                </div>
                {/* Opcional: Añadir rol BOTH si es una opción directa en el registro */}
                {/* <div className="flex items-center space-x-2 rounded-md border border-slate-300 p-3 hover:border-sky-400 has-[input:checked]:border-sky-500 has-[input:checked]:bg-sky-50 sm:col-span-2">
                  <RadioGroupItem value="BOTH" id="both" />
                  <Label htmlFor="both" className="flex w-full cursor-pointer flex-col">
                    <span className="font-medium text-slate-800">Ambos (Estudiante y Tutor)</span>
                    <span className="text-xs text-slate-500">Acceder a todas las funcionalidades.</span>
                  </Label>
                </div> */}
              </RadioGroup>
            </div>
            {/* Mostrar errores de la página (ej. contraseñas no coinciden) */}
            {pageError && (
              <p className="rounded-md border border-red-300 bg-red-50 p-3 text-center text-sm text-red-600">
                {pageError}
              </p>
            )}
            {/* Mostrar errores del hook de autenticación (ej. email ya existe) */}
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
