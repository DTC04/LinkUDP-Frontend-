'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

export default function SelectRolePage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'STUDENT' | 'TUTOR' | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:3000/auth/me', { withCredentials: true })
      .then(res => {
        setUserId(res.data.id);
        setLoading(false);
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  const handleSubmit = async () => {
    if (!selectedRole || !userId) return;
    const res = await axios.post('http://localhost:3000/auth/assign-role', {
      role: selectedRole,
      userId,
    }, { withCredentials: true });

    router.push(res.data.redirectTo);
  };

  if (loading) return <p className="text-center mt-10">Cargando...</p>;

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-xl font-bold mb-4 text-center">Selecciona tu rol</h1>
      <RadioGroup
        value={selectedRole || ''}
        onValueChange={(value) => setSelectedRole(value as 'STUDENT' | 'TUTOR')}
        className="space-y-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="STUDENT" id="student" />
          <Label htmlFor="student">Estudiante</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="TUTOR" id="tutor" />
          <Label htmlFor="tutor">Tutor</Label>
        </div>
      </RadioGroup>

      <Button className="mt-6 w-full bg-sky-600 hover:bg-sky-700" onClick={handleSubmit}>
        Confirmar rol
      </Button>
    </div>
  );
}
