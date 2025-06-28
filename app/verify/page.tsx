'use client';

import { useEffect, useState, Suspense } from 'react';
import axios from 'axios';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader } from 'lucide-react';

  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verificando tu correo electrónico...');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('No se proporcionó un token de verificación.');
      return;
    }

    axios
      .get(`http://localhost:3000/auth/verify?token=${token}`)
      .then((res) => {
        setStatus('success');
        setMessage(res.data.message || '¡Correo verificado con éxito!');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'El token es inválido o ha expirado.');
      });
  }, [searchParams]);

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Verificación de Correo Electrónico</CardTitle>
          <CardDescription>
            {status === 'loading' ? 'Espera un momento...' : 'Resultado de la verificación:'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4">
          {status === 'loading' && <Loader className="h-16 w-16 animate-spin text-sky-600" />}
          {status === 'success' && <CheckCircle2 className="h-16 w-16 text-green-500" />}
          {status === 'error' && <XCircle className="h-16 w-16 text-red-500" />}
          <p className={`text-lg text-center ${status === 'error' ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'}`}>
            {message}
          </p>
        </CardContent>
        <CardFooter>
          {status === 'success' && (
            <Button className="w-full bg-sky-600 hover:bg-sky-700" onClick={() => router.push('/login')}>
              Ir a Iniciar Sesión
            </Button>
          )}
          {status === 'error' && (
            <Button className="w-full" variant="outline" onClick={() => router.push('/register')}>
              Volver a Registrarse
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

