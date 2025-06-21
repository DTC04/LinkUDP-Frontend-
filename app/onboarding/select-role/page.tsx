'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { GraduationCap, BookOpen, User, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

export default function SelectRolePage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<'STUDENT' | 'TUTOR' | null>(null)
  const [userId, setUserId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('http://localhost:3000/auth/me', { withCredentials: true })
      .then(res => {
        setUserId(res.data.id)
        setLoading(false)
      })
      .catch(() => {
        router.push('/login')
      })
  }, [router])

  const handleSubmit = async () => {
    if (!selectedRole || !userId) return
    const res = await axios.post('http://localhost:3000/auth/assign-role', {
      role: selectedRole,
      userId,
    }, { withCredentials: true })

    router.push(res.data.redirectTo)
  }

  if (loading) return <p className="text-center mt-10">Cargando...</p>

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">¿Cuál es tu rol?</h1>
          <p className="text-gray-600">Selecciona tu perfil para personalizar tu experiencia en LinkUDP</p>
        </div>

        <RadioGroup
          value={selectedRole || ''}
          onValueChange={(value) => setSelectedRole(value as 'STUDENT' | 'TUTOR')}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          {/* Estudiante a la izquierda */}
          <div className="relative">
            <RadioGroupItem value="STUDENT" id="student" className="sr-only" />
            <Label htmlFor="student" className="cursor-pointer">
              <Card
                className={`transition-all duration-300 hover:shadow-lg border-2 ${
                  selectedRole === 'STUDENT'
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CardContent className="p-8 text-center">
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      selectedRole === 'STUDENT' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Estudiante</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Rol recomendado. Luego podrás convertirte en tutor si lo deseas.
                  </p>
                  <div className="flex items-center justify-center text-sm text-gray-500">
                    <User className="w-4 h-4 mr-1" />
                    Aprender y crecer
                  </div>
                </CardContent>
              </Card>
            </Label>
          </div>

          {/* Tutor a la derecha */}
          <div className="relative">
            <RadioGroupItem value="TUTOR" id="tutor" className="sr-only" />
            <Label htmlFor="tutor" className="cursor-pointer">
              <Card
                className={`transition-all duration-300 hover:shadow-lg border-2 ${
                  selectedRole === 'TUTOR'
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CardContent className="p-8 text-center">
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      selectedRole === 'TUTOR' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <GraduationCap className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Tutor</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Recomendado para quienes solo planean ofrecer tutorías a estudiantes.
                  </p>
                  <div className="flex items-center justify-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-1" />
                    Enseñar y guiar
                  </div>
                </CardContent>
              </Card>
            </Label>
          </div>
        </RadioGroup>

        <div className="text-center">
          <Button
            onClick={handleSubmit}
            disabled={!selectedRole}
            className="px-8 py-3 text-lg font-medium bg-sky-600 hover:bg-sky-700"
            size="lg"
          >
            Confirmar rol
          </Button>
        </div>
      </div>
    </div>
  )
}
