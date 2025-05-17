import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Filter } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <span className="text-xl font-bold text-sky-600 cursor-default select-none">LINKUDP</span>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Iniciar Sesión
            </Link>
            <Link href="/register" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Registrarse
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-sky-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-sky-700">
                  Conecta con tutores universitarios
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  LINKUDP te ayuda a encontrar tutores para tus materias universitarias de forma rápida y sencilla.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/register">
                  <Button className="bg-sky-600 hover:bg-sky-700">Registrarse</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="container px-4 py-12 md:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-sky-700">Tutorías Disponibles</h2>
              <p className="text-muted-foreground">Encuentra la tutoría que necesitas para tus materias.</p>
            </div>
            <div className="flex items-center gap-2">
              <Input className="max-w-[200px]" placeholder="Buscar tutoría..." />
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filtrar tutorías</span>
              </Button>
            </div>
          </div>
          <div className="grid gap-6 pt-8 md:grid-cols-2 lg:grid-cols-3">
            {tutorings.map((tutoring) => (
              <Link href={`/tutoring/${tutoring.id}`} key={tutoring.id}>
                <Card className="h-full overflow-hidden transition-all hover:border-sky-300 hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-medium">{tutoring.title}</CardTitle>
                      <Badge variant="outline" className="bg-sky-50 text-sky-700">
                        {tutoring.area}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs text-muted-foreground">Tutor: {tutoring.tutor}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{tutoring.description}</p>
                  </CardContent>
                  <CardFooter className="border-t bg-muted/50 px-4 py-2">
                    <div className="flex w-full justify-between text-xs text-muted-foreground">
                      <span>Horario: {tutoring.schedule}</span>
                      <span>Duración: {tutoring.duration}</span>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 LINKUDP. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}

const tutorings = [
  {
    id: "1",
    title: "Cálculo Diferencial",
    area: "Matemáticas",
    tutor: "Carlos Mendoza",
    description: "Tutoría para estudiantes de primer año que necesitan reforzar conceptos de cálculo diferencial.",
    schedule: "Lunes y Miércoles 15:00-17:00",
    duration: "2 horas",
  },
  {
    id: "2",
    title: "Programación en Python",
    area: "Informática",
    tutor: "Ana Gómez",
    description: "Aprende los fundamentos de la programación utilizando Python desde cero.",
    schedule: "Martes 10:00-12:00",
    duration: "2 horas",
  },
  {
    id: "3",
    title: "Física Mecánica",
    area: "Física",
    tutor: "Roberto Sánchez",
    description: "Refuerza tus conocimientos en física mecánica y prepárate para tus exámenes.",
    schedule: "Jueves 14:00-16:00",
    duration: "2 horas",
  },
  {
    id: "4",
    title: "Estadística Aplicada",
    area: "Matemáticas",
    tutor: "Laura Martínez",
    description: "Tutoría especializada en estadística aplicada para estudiantes de ciencias sociales.",
    schedule: "Viernes 16:00-18:00",
    duration: "2 horas",
  },
  {
    id: "5",
    title: "Química Orgánica",
    area: "Química",
    tutor: "Miguel Ángel Torres",
    description: "Refuerza tus conocimientos en química orgánica con ejercicios prácticos.",
    schedule: "Lunes 09:00-11:00",
    duration: "2 horas",
  },
  {
    id: "6",
    title: "Economía Básica",
    area: "Economía",
    tutor: "Patricia Flores",
    description: "Conceptos fundamentales de microeconomía y macroeconomía para estudiantes de primer año.",
    schedule: "Miércoles 17:00-19:00",
    duration: "2 horas",
  },
]
