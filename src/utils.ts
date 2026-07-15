import { Appointment, Dentist, Procedure } from './types';

/**
 * Converts a time string "HH:MM" to total minutes from 00:00
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Converts total minutes from 00:00 back to "HH:MM"
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Check if two time intervals overlap
 * Interval A: [startA, endA]
 * Interval B: [startB, endB]
 */
export function isOverlapping(
  startA: number,
  endA: number,
  startB: number,
  endB: number
): boolean {
  return startA < endB && endA > startB;
}

/**
 * Calculates the available time slots for a specific dentist and procedure on a given date
 */
export function getAvailableSlots(
  date: string,
  dentist: Dentist,
  procedure: Procedure,
  appointments: Appointment[]
): string[] {
  // Convert date to JS Date to check weekday
  // date format: "YYYY-MM-DD"
  const [year, month, day] = date.split('-').map(Number);
  // Note: month in JS Date is 0-indexed, but since we map directly, subtract 1
  const dateObj = new Date(year, month - 1, day);
  const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 1 = Monday...

  // Check if dentist works on this day of the week
  if (!dentist.workingDays.includes(dayOfWeek)) {
    return [];
  }

  const startMinutes = timeToMinutes(dentist.workingHours.start);
  const endMinutes = timeToMinutes(dentist.workingHours.end);
  const duration = procedure.durationMinutes;

  // Filter existing appointments for this dentist on this day (excluding cancelled ones)
  const dayAppointments = appointments.filter(
    (app) =>
      app.dentistId === dentist.id &&
      app.date === date &&
      app.status !== 'cancelled'
  );

  const availableSlots: string[] = [];
  const interval = 30; // 30-minute steps for slot starting times

  for (let current = startMinutes; current + duration <= endMinutes; current += interval) {
    const slotStart = current;
    const slotEnd = current + duration;

    // Check if slot overlaps with any existing appointment
    let hasOverlap = false;
    for (const app of dayAppointments) {
      const appStart = timeToMinutes(app.time);
      const appEnd = appStart + app.durationMinutes;

      if (isOverlapping(slotStart, slotEnd, appStart, appEnd)) {
        hasOverlap = true;
        break;
      }
    }

    if (!hasOverlap) {
      availableSlots.push(minutesToTime(slotStart));
    }
  }

  return availableSlots;
}

/**
 * Formats a date string "YYYY-MM-DD" to brazilian readable format "DD/MM/YYYY"
 */
export function formatDateBR(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

/**
 * Returns month name in Portuguese
 */
export function getMonthNamePT(monthIndex: number): string {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return months[monthIndex];
}

/**
 * Formats currency to BRL (R$)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}
