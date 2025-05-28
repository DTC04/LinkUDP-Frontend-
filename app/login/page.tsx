'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card, CardContent, CardDescription,
  CardFooter, CardHeader, CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(formData);
    // redirección automática está en useAuth()
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3000/auth/google';
  };

  useEffect(() => {
    // Si ya hay cookie, redirigir automáticamente
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('access_token='));
    if (token) {
      router.push('/dashboard/student'); // Ajusta ruta si es necesario
    }
  }, [router]);

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <span className="text-xl font-bold text-sky-600 cursor-default select-none">
        LINKUDP
      </span>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-sky-700">
            Iniciar sesión
          </CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder a la plataforma
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="ejemplo@udp.cl"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="text-right text-sm">
              <Link href="#" className="text-sky-600 hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-sky-600 hover:bg-sky-700" disabled={loading}>
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </Button>
            <Button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Iniciar sesión con Google
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              ¿No tienes una cuenta?{' '}
              <Link
                href="/register"
                className="underline underline-offset-4 hover:text-primary"
              >
                Registrarse
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
