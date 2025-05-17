"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';

export default function StudentOnboardingPage() {
  const router = useRouter();
  const {updateStudentProfile, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    university: "",
    career: "",
    study_year: 1, // Valor inicial válido
    interests: "", // Cambia a string para el textarea
    bio: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "study_year" || name === "year") {
      setFormData((prev) => ({ ...prev, study_year: parseInt(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Convierte los intereses a array de números si es posible
    let interestCourseIds: number[] = [];
    if (formData.interests.trim() !== "") {
      interestCourseIds = formData.interests
        .split(",")
        .map((s) => parseInt(s.trim()))
        .filter((n) => !isNaN(n));
    }
    await updateStudentProfile({
      university: formData.university,
      career: formData.career,
      study_year: formData.study_year,
      interestCourseIds,
      bio: formData.bio,
    });
  };

  return (
    <div className="container py-10">
      <div className="mb-6 flex items-center">
        <Link href="/" className="mr-4">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-sky-700">
          Completa tu perfil de estudiante
        </h1>
      </div>

      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Información académica</CardTitle>
          <CardDescription>
            Esta información nos ayudará a encontrar tutores adecuados para ti
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="university">Universidad</Label>
              <Input
                id="university"
                name="university"
                placeholder="Universidad Diego Portales"
                value={formData.university}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="career">Carrera</Label>
              <Input
                id="career"
                name="career"
                placeholder="Ej: Ingeniería Civil"
                value={formData.career}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="year">Año de estudio</Label>
              <Select
                onValueChange={(value) => handleSelectChange("study_year", value)}
              >
                <SelectTrigger id="year">
                  <SelectValue placeholder="Selecciona tu año de estudio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Primer año</SelectItem>
                  <SelectItem value="2">Segundo año</SelectItem>
                  <SelectItem value="3">Tercer año</SelectItem>
                  <SelectItem value="4">Cuarto año</SelectItem>
                  <SelectItem value="5">Quinto año</SelectItem>
                  <SelectItem value="6">Sexto año o superior</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="interests">Áreas de interés</Label>
              <Textarea
                id="interests"
                name="interests"
                placeholder="Ej: 1, 2, 3 (IDs de cursos de interés)"
                value={formData.interests}
                onChange={handleChange}
                rows={2}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bio">Acerca de ti (opcional)</Label>
              <Textarea
                id="bio"
                name="bio"
                placeholder="Cuéntanos un poco sobre ti, tus objetivos académicos, etc."
                value={formData.bio}
                onChange={handleChange}
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="submit" className="bg-sky-600 hover:bg-sky-700">
              Guardar y continuar
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
