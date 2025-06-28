"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MailCheck, Hourglass } from 'lucide-react';
import axios from 'axios';

export default function VerifyEmailPendingPage() {
  const { user, refetchUser, loading } = useAuth();
  const router = useRouter();
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    if (user?.email_verified) {
      const targetDashboard = user.role === 'STUDENT' ? '/dashboard/student' : '/dashboard/tutor';
      router.push(targetDashboard);
    }
  }, [user, router]);

  const handleAlreadyVerifiedClick = async () => {
    await refetchUser();
  };

  const handleResendVerification = async () => {
    if (!user?.email) {
      setResendStatus('error');
      setResendMessage('No se pudo encontrar tu correo electrónico para reenviar el enlace.');
      return;
    }
    setResendStatus('sending');
    try {
      await axios.post('http://localhost:3000/auth/resend-verification', { email: user.email });
      setResendStatus('sent');
      setResendMessage('Se ha reenviado un nuevo enlace de verificación a tu correo.');
    } catch (error) {
      setResendStatus('error');
      setResendMessage('Hubo un problema al reenviar el correo. Inténtalo más tarde.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900 mb-4">
            <Hourglass className="h-10 w-10 text-sky-600" />
          </div>
          <CardTitle className="text-2xl">Verificación de Correo Pendiente</CardTitle>
          <CardDescription>
            Revisa tu bandeja de entrada para completar el registro.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Hemos enviado un enlace de verificación a <strong>{user?.email || 'tu correo electrónico'}</strong>. Por favor, haz clic en ese enlace para activar tu cuenta.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Si no ves el correo, revisa tu carpeta de spam o correo no deseado.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button 
            className="w-full bg-sky-600 hover:bg-sky-700" 
            onClick={handleAlreadyVerifiedClick}
            disabled={loading}
          >
            <MailCheck className="mr-2 h-4 w-4" />
            {loading ? 'Verificando...' : 'Ya verifiqué mi correo'}
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleResendVerification}
            disabled={resendStatus === 'sending' || resendStatus === 'sent'}
          >
            {resendStatus === 'sending' ? 'Reenviando...' : 'Reenviar enlace de verificación'}
          </Button>
          {resendMessage && (
            <p className={`text-sm ${resendStatus === 'error' ? 'text-red-500' : 'text-green-500'}`}>
              {resendMessage}
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
