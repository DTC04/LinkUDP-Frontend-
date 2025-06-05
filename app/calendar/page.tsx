"use client"

import { useState, useEffect } from "react" 
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card" // Ajustado a LinkUPD
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select" // Ajustado a LinkUPD
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog" 
import { CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import Link from "next/link"
import { format as formatDateFns, parse as parseDateFns } from "date-fns" // Import parse
import { useRouter } from "next/navigation"; // Importar useRouter
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { useAuth, type UserProfile as AuthUserProfile } from "@/hooks/use-auth" // Importar useAuth

// y se confiará en los estilos de los componentes de LinkUPD o se aplicarán clases de utilidad de LinkUPD.

interface TutoriaEvent {
  id: string | number;
  title: string;
  date: string; // Formato YYYY-MM-DD
  start_time: string; // Hora de inicio, ej: "10:00"
  end_time: string; // Hora de fin, ej: "12:00"
  courseName?: string;
  tutorName?: string;
  // Otros campos relevantes de la tutoría
}

export default function CalendarPage() {
  const isMobile = useIsMobile();
  const { getCurrentUserProfile, loading: authLoading } = useAuth(); // Usar useAuth
  const router = useRouter(); // Inicializar useRouter
  const [currentUserProfile, setCurrentUserProfile] = useState<AuthUserProfile | null>(null);
  const [dashboardUrl, setDashboardUrl] = useState("/login"); // Estado para URL dinámica
  const [profileUrl, setProfileUrl] = useState("/login"); // Estado para URL dinámica

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateForDetails, setSelectedDateForDetails] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TutoriaEvent | null>(null);
  const [allTutorias, setAllTutorias] = useState<TutoriaEvent[]>([]);
  const [loadingTutorias, setLoadingTutorias] = useState(true);

  useEffect(() => {
    const fetchProfileAndTutorias = async () => {
      const profile = await getCurrentUserProfile();
      setCurrentUserProfile(profile);

      if (profile?.user) {
        const role = profile.user.role;
        if (role === "TUTOR" || role === "BOTH") {
          setDashboardUrl("/dashboard/tutor");
          setProfileUrl("/profile/tutor");
        } else if (role === "STUDENT") {
          setDashboardUrl("/dashboard/student");
          setProfileUrl("/profile/student");
        } else {
          setDashboardUrl("/dashboard/student");
          setProfileUrl("/profile");
        }
      }

      setLoadingTutorias(true);
      try {
        let endpoint = "http://localhost:3000/tutorias";
        let isStudentView = false;

        if (profile?.user?.role === "STUDENT" || profile?.user?.role === "BOTH") {
          endpoint = "http://localhost:3000/bookings/me?status=PENDING&status=CONFIRMED";
          isStudentView = true;
        } else if (profile?.user?.role === "TUTOR") {
          endpoint = `http://localhost:3000/tutorias?tutorId=${profile.user.id}`;
        }

        const token = localStorage.getItem('token');
        const response = await fetch(endpoint, {
          credentials: 'include',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        });

        if (!response.ok) {
          if (response.status === 401) {
            console.error("Error de autenticación (401) al cargar tutorías. Redirigiendo a login.");
            localStorage.removeItem('token');
            router.push("/login");
            setLoadingTutorias(false);
            return;
          }
          throw new Error(`Error al cargar las tutorías: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        let formattedTutorias: TutoriaEvent[] = [];
        if (isStudentView) {
          formattedTutorias = data.map((booking: any) => {
            const sessionStartTime = new Date(booking.session.start_time);
            const sessionEndTime = new Date(booking.session.end_time);
            return {
              id: booking.session.id,
              title: booking.session.title,
              date: formatDateFns(sessionStartTime, "yyyy-MM-dd"),
              start_time: formatDateFns(sessionStartTime, "HH:mm"),
              end_time: formatDateFns(sessionEndTime, "HH:mm"),
              courseName: booking.session.course?.name,
              tutorName: booking.session.tutor?.user?.full_name,
            };
          });
        } else {
          formattedTutorias = data.map((tutoria: any) => {
            const tutoriaStartTime = new Date(tutoria.start_time);
            const tutoriaEndTime = new Date(tutoria.end_time);
            return {
              id: tutoria.id,
              title: tutoria.title,
              date: formatDateFns(tutoriaStartTime, "yyyy-MM-dd"),
              start_time: formatDateFns(tutoriaStartTime, "HH:mm"),
              end_time: formatDateFns(tutoriaEndTime, "HH:mm"),
              courseName: tutoria.course?.name,
              tutorName: tutoria.tutor?.user?.full_name,
            };
          });
        }
        setAllTutorias(formattedTutorias);
      } catch (error) {
        console.error("Error fetching tutorias:", error);
        setAllTutorias([]);
      } finally {
        setLoadingTutorias(false);
      }
    };
    fetchProfileAndTutorias();
  }, [getCurrentUserProfile]);

  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const firstDayOfWeek = firstDayOfMonth.getDay() // 0 = Sunday, 1 = Monday, etc.
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const monthName = currentDate.toLocaleString('default', { month: 'long' })

  const previousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  const getEventsForDay = (day: number, month: number = currentMonth, year: number = currentYear): TutoriaEvent[] => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return allTutorias.filter(event => event.date === dateStr);
  }

  const handleDayClick = (day: number) => {
    const newSelectedDate = new Date(currentYear, currentMonth, day);
    setSelectedDateForDetails(newSelectedDate);
    const events = getEventsForDay(day);
    if (events.length > 0) {
      // Podrías optar por no abrir el diálogo automáticamente o manejar múltiples eventos de otra forma
      // setSelectedEvent(events[0]);
      // setIsDialogOpen(true);
    } else {
      setSelectedEvent(null); // Limpiar evento seleccionado si no hay ninguno
    }
  }

  const calendarDays = []

  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(
      <div key={`empty-${i}`} className={cn(isMobile ? 'h-16' : 'h-24 md:h-28', "border border-border/20 bg-background p-1 md:p-2")}></div>
    )
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayEvents = getEventsForDay(day, currentMonth, currentYear)
    const fullDate = new Date(currentYear, currentMonth, day);
    const isSelectedForDetails = selectedDateForDetails?.toDateString() === fullDate.toDateString();
    const isToday = day === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();

    calendarDays.push(
      <div 
        key={day} 
        className={cn(
          isMobile ? 'h-16' : 'h-24 md:h-28',
          "border border-border/20 bg-background p-1 md:p-2 overflow-y-auto cursor-pointer hover:bg-slate-100", // hover:bg-muted/50 a hover:bg-slate-100
          isSelectedForDetails ? "ring-2 ring-inset ring-sky-600" : "ring-transparent"
        )}
        onClick={() => handleDayClick(day)}
      >
        <div className="flex justify-between items-start mb-1">
          <span
            className={cn(
              isMobile ? 'text-xs' : 'text-sm',
              "font-medium",
              isToday ? "bg-sky-600 text-white rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center" : "", // bg-primary a bg-sky-600, text-primary-foreground a text-white
              isSelectedForDetails ? "font-bold text-sky-700" : "" // text-primary a text-sky-700
            )}
          >
            {day}
          </span>
          {dayEvents.length > 0 && (
            <span className={cn(
              "text-xs px-1.5 py-0.5 rounded-full",
              isSelectedForDetails ? "bg-sky-600 text-white" : "bg-sky-100 text-sky-700" // bg-primary a bg-sky-600, text-primary-foreground a text-white, bg-primary/10 a bg-sky-100, text-primary a text-sky-700
            )}>
              {dayEvents.length}
            </span>
          )}
        </div>
        {!isMobile && (
          <div className="mt-1 space-y-1">
            {dayEvents.slice(0, isMobile ? 1 : 2).map((event) => ( // Mostrar 1 en móvil, 2 en desktop
              <div
                key={event.id}
                className={cn(
                  "w-full text-left text-xs truncate rounded px-1.5 py-0.5 cursor-pointer",
                  "bg-sky-100 text-sky-700 hover:bg-sky-200",
                  isSelectedForDetails && selectedEvent?.id === event.id ? "bg-sky-600 text-white" : ""
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedEvent(event);
                  setIsDialogOpen(true);
                }}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > (isMobile ? 1 : 2) && (
              <div className={cn("text-xs px-1.5", isSelectedForDetails ? "text-white/70" : "text-muted-foreground")}>
                {`+${dayEvents.length - (isMobile ? 1 : 2)} más`}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  const totalCellsBeforePaddingEnd = calendarDays.length;
  const cellsInLastRow = totalCellsBeforePaddingEnd % 7;
  let remainingCells = 0;
  if (cellsInLastRow !== 0) {
    remainingCells = 7 - cellsInLastRow;
  }

  const totalRenderedCells = totalCellsBeforePaddingEnd + remainingCells;
  if (totalRenderedCells < 35) { // Mínimo 5 filas
    remainingCells += (35 - totalRenderedCells);
  } else if (totalRenderedCells > 35 && totalRenderedCells < 42) { // Completar hasta 6 filas si es necesario
     remainingCells += (42 - totalRenderedCells);
  }


  for (let i = 0; i < remainingCells; i++) {
    calendarDays.push(
      <div key={`empty-end-${i}`} className={cn(isMobile ? 'h-16' : 'h-24 md:h-28', "border border-border/20 bg-background p-1 md:p-2")}></div>
    )
  }

  const selectedDayEvents = selectedDateForDetails ? getEventsForDay(selectedDateForDetails.getDate(), selectedDateForDetails.getMonth(), selectedDateForDetails.getFullYear()) : [];

  if (isMobile) {
    return (
      <motion.div
        className="space-y-4 p-4 pb-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h2 className="text-xl font-bold tracking-tight text-sky-700">
            Calendario
          </h2>
          <p className="text-muted-foreground text-sm">Visualiza y planifica tus tutorías</p>
        </motion.div>

        <motion.div
          className="flex items-center justify-between gap-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="font-semibold text-base">{monthName} {currentYear}</h3>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          {/* Botón "Crear Tutoría" eliminado de la vista móvil */}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
          <CardContent className="p-3">
            <div className="grid grid-cols-7 gap-0 text-center text-muted-foreground mb-2">
              {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, index) => ( // Abreviaturas en español
                <div key={index} className="py-1 text-xs font-medium">{day}</div>
              ))}
            </div>
            <motion.div
              className="grid grid-cols-7 gap-0"
              variants={{ visible: { transition: { staggerChildren: 0.01 } } }}
              initial="hidden"
              animate="visible"
            >
              {calendarDays}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

        {selectedDateForDetails && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
          >
            <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Tutorías para {selectedDateForDetails.toLocaleDateString('es-ES', { month: 'long', day: 'numeric' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedDayEvents.length > 0 ? (
                selectedDayEvents.map((event: any, index: number) => (
                  <motion.div
                    key={event.id || index} // Usar un ID real del evento
                    className="p-3 rounded-lg border bg-card text-card-foreground shadow-sm cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      setSelectedEvent(event);
                      setIsDialogOpen(true);
                    }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <h4 className="font-semibold text-sm">{event.title}</h4>
                    <p className="text-xs text-muted-foreground">{event.courseName}</p>
                    <p className="text-xs text-muted-foreground">Tutor: {event.tutorName}</p>
                    <p className="text-xs text-muted-foreground">Hora: {event.start_time} - {event.end_time}</p>
                  </motion.div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">{loadingTutorias ? "Cargando tutorías..." : "No hay tutorías programadas para este día."}</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
        )}

        {/* Dialog para detalles de tutoría/evento */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="w-[95vw] max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base">{selectedEvent?.title || "Detalle del Evento"}</DialogTitle> {/* Usar selectedEvent.title */}
              <DialogDescription className="text-sm">Detalles de la tutoría</DialogDescription>
            </DialogHeader>
            {selectedEvent && (
              <div className="space-y-3">
                <p><strong>Curso:</strong> {selectedEvent.courseName || "No especificado"}</p>
                <p><strong>Tutor:</strong> {selectedEvent.tutorName || "No especificado"}</p>
                {/* Correctly parse the YYYY-MM-DD string as a local date before formatting */}
                <p><strong>Fecha:</strong> {formatDateFns(parseDateFns(selectedEvent.date, 'yyyy-MM-dd', new Date()), "dd/MM/yyyy")}</p>
                <p><strong>Hora:</strong> {selectedEvent.start_time} - {selectedEvent.end_time}</p>
                {/* Aquí podrías añadir un enlace a la página de detalles de la tutoría si existe */}
                <Link href={`/tutoring/${selectedEvent.id}`} passHref>
                   <Button variant="link" size="sm" className="p-0 h-auto">Ver detalles completos</Button>
                </Link>
              </div>
            )}
            <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                Cerrar
              </Button>
              {/* <Button size="sm" variant="default" className="w-full sm:w-auto">
                Ver Más
              </Button> */}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    );
  }

  // Desktop layout
  return (
    <div className="flex min-h-screen flex-col"> {/* Envoltura principal para header y footer */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <span className="text-xl font-bold text-sky-600 cursor-default select-none">LINKUDP</span>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link
              href="/tutoring"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Explorar
            </Link>
            <Link
              href="/calendar"
              className="text-sm font-medium text-foreground border-b-2 border-sky-600 pb-1" // Activo
            >
              Calendario
            </Link>
            <Link
              href={dashboardUrl}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Mi Dashboard
            </Link>
            <Link
              href={profileUrl}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Mi Perfil
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1"> {/* Contenido principal del calendario */}
        <motion.div
          className="space-y-6 p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-sky-700">Calendario de Tutorías</h2>
          <p className="text-muted-foreground mt-1">Visualiza y gestiona tus tutorías programadas.</p>
        </div>
        {/* Select de vista y botón Crear Tutoría eliminados de la vista de escritorio */}
      </motion.div>

      <motion.div
        className="flex flex-col md:flex-row gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <motion.div
          className="flex-grow md:w-3/5 lg:w-2/3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-sky-600" />
              <CardTitle>
                {monthName} {currentYear}
              </CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-0 text-center text-muted-foreground">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => ( // Abreviaturas en español
                <div key={day} className="py-2 text-sm font-medium border-b border-border/20">{day}</div>
              ))}
            </div>
            <motion.div
              className="grid grid-cols-7 gap-0"
              variants={{ visible: { transition: { staggerChildren: 0.005 } } }}
              initial="hidden"
              animate="visible"
            >
              {calendarDays}
            </motion.div>
          </CardContent>
        </Card>
        </motion.div>

        <motion.div
          className="md:w-2/5 lg:w-1/3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <Card className="h-full">
          <CardHeader>
            <CardTitle>
              {selectedDateForDetails 
                ? `Tutorías para ${selectedDateForDetails.toLocaleDateString('es-ES', { month: 'long', day: 'numeric' })}`
                : "Selecciona un día"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedDateForDetails ? (
              selectedDayEvents.length > 0 ? (
                selectedDayEvents.map((event: any, index: number) => (
                  <motion.div
                    key={event.id || index}
                    className="p-3 rounded-lg border bg-card text-card-foreground shadow-sm cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      setSelectedEvent(event);
                      setIsDialogOpen(true);
                    }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <h4 className="font-semibold">{event.title}</h4>
                     <p className="text-xs text-muted-foreground">{event.courseName}</p>
                    <p className="text-xs text-muted-foreground">Tutor: {event.tutorName}</p>
                    <p className="text-xs text-muted-foreground">Hora: {event.start_time} - {event.end_time}</p>
                  </motion.div>
                ))
              ) : (
                <p className="text-muted-foreground">{loadingTutorias ? "Cargando tutorías..." : "No hay tutorías programadas para este día."}</p>
              )
            ) : (
              <p className="text-muted-foreground">Haz clic en un día del calendario para ver las tutorías.</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>

    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title || "Detalle de Tutoría"}</DialogTitle> {/* Usar selectedEvent.title */}
            <DialogDescription>Información detallada de la tutoría seleccionada.</DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <p><strong>Curso:</strong> {selectedEvent?.courseName || "No especificado"}</p>
              <p><strong>Tutor:</strong> {selectedEvent?.tutorName || "No especificado"}</p>
              {/* Correctly parse the YYYY-MM-DD string as a local date before formatting */}
              <p><strong>Fecha:</strong> {selectedEvent ? formatDateFns(parseDateFns(selectedEvent.date, 'yyyy-MM-dd', new Date()), "dd/MM/yyyy") : "N/A"}</p>
              <p><strong>Hora:</strong> {selectedEvent?.start_time} - {selectedEvent?.end_time}</p>
               {selectedEvent && (
                <Link href={`/tutoring/${selectedEvent.id}`} passHref>
                   <Button variant="link" size="sm" className="p-0 h-auto text-sky-600">Ver detalles completos de la tutoría</Button>
                </Link>
               )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cerrar
            </Button>
            {/* <Button variant="default">Unirse/Modificar</Button> */}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
      </main> {/* Fin del contenido principal del calendario */}
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