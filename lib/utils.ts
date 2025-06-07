import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function formatDateUTC(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { timeZone: 'UTC' })
}
export function formatTimeCL(iso: string) {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return 'Hora inválida'
  return d.toLocaleTimeString('es-CL', {
    timeZone: 'America/Santiago',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}