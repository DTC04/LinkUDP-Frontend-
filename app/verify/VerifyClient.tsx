'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('Verificando...');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setMessage('Token inválido.');
      return;
    }

    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/verify?token=${token}`)
      .then((res) => {
        setMessage(res.data.message);
      })
      .catch((err) => {
        setMessage('El token es inválido o ha expirado.');
      });
  }, [searchParams]);

  return (
    <div className="container">
      <h1>Verificación de Correo Electrónico</h1>
      <p>{message}</p>
    </div>
  );
}
