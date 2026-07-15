export interface Dentist {
  id: string;
  name: string;
  specialty: string;
  workingDays: number[]; // 0 for Sunday, 1 for Monday, etc.
  workingHours: { start: string; end: string }; // e.g., { start: '08:00', end: '18:00' }
  photoUrl: string;
  bio?: string;
  email?: string;
  phone?: string;
  ownerId?: string;
}

export interface Procedure {
  id: string;
  name: string;
  durationMinutes: number; // Duration in minutes
  price: number;
  category: string;
  description?: string;
  ownerId?: string;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthday: string; // YYYY-MM-DD
  insurance?: string;
  generalObservations?: string;
  history: AppointmentLog[];
  attachments: { name: string; date: string; size: string; content?: string }[];
  ownerId?: string;
}

export interface AppointmentLog {
  date: string;
  procedureName: string;
  dentistName: string;
  notes: string;
}

export interface Appointment {
  id: string;
  patientId?: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  patientInsurance?: string;
  dentistId: string;
  dentistName: string;
  procedureId: string;
  procedureName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  durationMinutes: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  notes?: string;
  ownerId?: string;
}

export interface ClinicConfig {
  name: string;
  slug: string;
  phone: string;
  email: string;
  address: string;
  logoUrl: string;
  bannerUrl: string;
  workingHours: {
    start: string; // e.g. "08:00"
    end: string; // e.g. "18:00"
    days: number[]; // e.g. [1, 2, 3, 4, 5]
  };
  // Customization
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  buttonRadius: 'square' | 'rounded' | 'full';
  fontFamily: 'Inter' | 'Space Grotesk' | 'Outfit';
  welcomeText: string;
  showInsuranceField: boolean;
  showNotesField: boolean;
  allowedDentists: string[]; // ids of dentists visible on link
  allowedProcedures: string[]; // ids of procedures visible on link
  ownerId?: string;
}

export interface NotificationTemplate {
  id: string;
  type: 'email' | 'whatsapp' | 'sms';
  triggerTime: '24h' | '2h' | 'instant';
  enabled: boolean;
  messageTemplate: string;
}
