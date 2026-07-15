import { Dentist, Procedure, Patient, Appointment, ClinicConfig, NotificationTemplate } from './types';

export const DEFAULT_DENTISTS: Dentist[] = [
  {
    id: 'd-1',
    name: 'Dra. Amanda Silva',
    specialty: 'Ortodontia & Estética',
    workingDays: [1, 2, 3, 4, 5], // Mon-Fri
    workingHours: { start: '08:00', end: '17:00' },
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
    bio: 'Especialista em alinhadores invisíveis e estética dental com mais de 8 anos de experiência.',
    email: 'amanda.silva@odontoagenda.com',
    phone: '(11) 98765-4321',
  },
  {
    id: 'd-2',
    name: 'Dr. Ricardo Ramos',
    specialty: 'Implantodontia & Cirurgia',
    workingDays: [1, 2, 3, 4, 5], // Mon-Fri
    workingHours: { start: '09:00', end: '18:00' },
    photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
    bio: 'Mestre em Implantodontia, focado em cirurgias guiadas de alta precisão e reabilitação oral.',
    email: 'ricardo.ramos@odontoagenda.com',
    phone: '(11) 97654-3210',
  },
  {
    id: 'd-3',
    name: 'Dra. Beatriz Santos',
    specialty: 'Odontopediatria & Endodontia',
    workingDays: [1, 2, 3, 4], // Mon-Thu
    workingHours: { start: '08:00', end: '16:00' },
    photoUrl: 'https://images.unsplash.com/photo-1594824813573-246434e33963?auto=format&fit=crop&q=80&w=300',
    bio: 'Dedicada ao atendimento humanizado de crianças e tratamento endodôntico (canal) sem trauma.',
    email: 'beatriz.santos@odontoagenda.com',
    phone: '(11) 96543-2109',
  }
];

export const DEFAULT_PROCEDURES: Procedure[] = [
  {
    id: 'p-1',
    name: 'Avaliação Inicial & Planejamento',
    durationMinutes: 30,
    price: 150,
    category: 'Geral',
    description: 'Consulta para exame geral, diagnóstico e elaboração do plano de tratamento.',
  },
  {
    id: 'p-2',
    name: 'Limpeza Completa (Profilaxia)',
    durationMinutes: 45,
    price: 180,
    category: 'Prevenção',
    description: 'Remoção de tártaro, placa bacteriana, polimento coronário e aplicação de flúor.',
  },
  {
    id: 'p-3',
    name: 'Tratamento de Canal (Endodontia)',
    durationMinutes: 60,
    price: 650,
    category: 'Tratamento',
    description: 'Tratamento do nervo do dente com anestesia local de alta eficácia.',
  },
  {
    id: 'p-4',
    name: 'Clareamento Dental a Laser',
    durationMinutes: 60,
    price: 800,
    category: 'Estética',
    description: 'Clareamento profissional em consultório para dentes mais brancos instantaneamente.',
  },
  {
    id: 'p-5',
    name: 'Restauração de Resina',
    durationMinutes: 45,
    price: 220,
    category: 'Estética',
    description: 'Reconstrução de dente fraturado ou afetado por cárie com resina estética.',
  }
];

export const DEFAULT_PATIENTS: Patient[] = [
  {
    id: 'pt-1',
    name: 'Carlos Henrique Souza',
    email: 'carlos.souza@gmail.com',
    phone: '(11) 99123-4567',
    birthday: '1985-07-16', // birthday is tomorrow in mock calendar!
    insurance: 'Amil Dental',
    generalObservations: 'Paciente possui sensibilidade na arcada inferior esquerda.',
    history: [
      {
        date: '2026-03-10',
        procedureName: 'Avaliação Inicial & Planejamento',
        dentistName: 'Dra. Amanda Silva',
        notes: 'Paciente necessita de limpeza e avaliação para alinhadores invisíveis.'
      },
      {
        date: '2026-03-15',
        procedureName: 'Limpeza Completa (Profilaxia)',
        dentistName: 'Dra. Amanda Silva',
        notes: 'Profilaxia realizada com sucesso. Próxima em 6 meses.'
      }
    ],
    attachments: [
      { name: 'Raio-X Panorâmico.png', date: '2026-03-10', size: '4.2 MB' },
      { name: 'Plano de Tratamento.pdf', date: '2026-03-11', size: '250 KB' }
    ]
  },
  {
    id: 'pt-2',
    name: 'Mariana Costa Ferreira',
    email: 'mari.ferreira@hotmail.com',
    phone: '(11) 98234-5678',
    birthday: '1992-10-22',
    insurance: 'SulAmérica Odonto',
    generalObservations: 'Alergia a penicilina anotada na ficha do paciente.',
    history: [
      {
        date: '2026-04-05',
        procedureName: 'Tratamento de Canal (Endodontia)',
        dentistName: 'Dra. Beatriz Santos',
        notes: 'Canal dente 24 finalizado sem intercorrências.'
      }
    ],
    attachments: [
      { name: 'Tomografia Mandibular.pdf', date: '2026-04-04', size: '12.8 MB' }
    ]
  },
  {
    id: 'pt-3',
    name: 'José Eduardo Mendes',
    email: 'jose.mendes@uol.com.br',
    phone: '(11) 97345-6789',
    birthday: '1968-07-28',
    insurance: 'Bradesco Dental',
    generalObservations: 'Hipertenso controlado. Verificar pressão antes de procedimentos cirúrgicos.',
    history: [],
    attachments: []
  },
  {
    id: 'pt-4',
    name: 'Ana Júlia de Oliveira',
    email: 'ana.julia.kids@gmail.com',
    phone: '(11) 96456-7890',
    birthday: '2018-12-05',
    insurance: 'Nenhum (Particular)',
    generalObservations: 'Atendimento pediátrico. Paciente tem um pouco de medo do motorzinho.',
    history: [
      {
        date: '2026-02-18',
        procedureName: 'Avaliação Inicial & Planejamento',
        dentistName: 'Dra. Beatriz Santos',
        notes: 'Foco em condicionamento psicológico. Excelente resposta.'
      }
    ],
    attachments: []
  }
];

// Seed some appointments for the dashboard and calendar.
// Let's seed for current date 2026-07-15, 2026-07-16, 2026-07-17
export const DEFAULT_APPOINTMENTS: Appointment[] = [
  {
    id: 'ap-1',
    patientId: 'pt-1',
    patientName: 'Carlos Henrique Souza',
    patientPhone: '(11) 99123-4567',
    patientEmail: 'carlos.souza@gmail.com',
    patientInsurance: 'Amil Dental',
    dentistId: 'd-1',
    dentistName: 'Dra. Amanda Silva',
    procedureId: 'p-4',
    procedureName: 'Clareamento Dental a Laser',
    date: '2026-07-15',
    time: '09:00',
    durationMinutes: 60,
    status: 'confirmed',
    notes: 'Segunda sessão de clareamento do paciente.'
  },
  {
    id: 'ap-2',
    patientId: 'pt-2',
    patientName: 'Mariana Costa Ferreira',
    patientPhone: '(11) 98234-5678',
    patientEmail: 'mari.ferreira@hotmail.com',
    patientInsurance: 'SulAmérica Odonto',
    dentistId: 'd-3',
    dentistName: 'Dra. Beatriz Santos',
    procedureId: 'p-2',
    procedureName: 'Limpeza Completa (Profilaxia)',
    date: '2026-07-15',
    time: '11:00',
    durationMinutes: 45,
    status: 'completed',
    notes: 'Realizou limpeza periódica e aplicação de flúor.'
  },
  {
    id: 'ap-3',
    patientId: 'pt-3',
    patientName: 'José Eduardo Mendes',
    patientPhone: '(11) 97345-6789',
    patientEmail: 'jose.mendes@uol.com.br',
    patientInsurance: 'Bradesco Dental',
    dentistId: 'd-2',
    dentistName: 'Dr. Ricardo Ramos',
    procedureId: 'p-3',
    procedureName: 'Tratamento de Canal (Endodontia)',
    date: '2026-07-15',
    time: '14:30',
    durationMinutes: 60,
    status: 'pending',
    notes: 'Tratamento do canal dente 16.'
  },
  {
    id: 'ap-4',
    patientId: 'pt-4',
    patientName: 'Ana Júlia de Oliveira',
    patientPhone: '(11) 96456-7890',
    patientEmail: 'ana.julia.kids@gmail.com',
    patientInsurance: 'Nenhum (Particular)',
    dentistId: 'd-3',
    dentistName: 'Dra. Beatriz Santos',
    procedureId: 'p-1',
    procedureName: 'Avaliação Inicial & Planejamento',
    date: '2026-07-16',
    time: '10:00',
    durationMinutes: 30,
    status: 'confirmed',
    notes: 'Consulta de rotina infantil.'
  },
  {
    id: 'ap-5',
    patientName: 'Gabriela Lima Medeiros',
    patientPhone: '(11) 95567-8901',
    patientEmail: 'gabriela.med@outlook.com',
    patientInsurance: 'Amil Dental',
    dentistId: 'd-1',
    dentistName: 'Dra. Amanda Silva',
    procedureId: 'p-5',
    procedureName: 'Restauração de Resina',
    date: '2026-07-16',
    time: '15:00',
    durationMinutes: 45,
    status: 'confirmed',
    notes: 'Restauração dente 14.'
  },
  {
    id: 'ap-6',
    patientId: 'pt-3',
    patientName: 'José Eduardo Mendes',
    patientPhone: '(11) 97345-6789',
    patientEmail: 'jose.mendes@uol.com.br',
    patientInsurance: 'Bradesco Dental',
    dentistId: 'd-2',
    dentistName: 'Dr. Ricardo Ramos',
    procedureId: 'p-1',
    procedureName: 'Avaliação Inicial & Planejamento',
    date: '2026-07-17',
    time: '09:00',
    durationMinutes: 30,
    status: 'confirmed',
    notes: 'Avaliação de implante.'
  }
];

export const DEFAULT_CLINIC_CONFIG: ClinicConfig = {
  name: 'Clínica Sorriso Feliz',
  slug: 'clinica-sorriso-feliz',
  phone: '(11) 3456-7890',
  email: 'contato@sorrisofeliz.com.br',
  address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP, 01310-100',
  logoUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=150',
  bannerUrl: 'https://images.unsplash.com/photo-1629909615184-74f495363b67?auto=format&fit=crop&q=80&w=1200',
  workingHours: {
    start: '08:00',
    end: '18:00',
    days: [1, 2, 3, 4, 5]
  },
  primaryColor: '#0ea5e9', // Sky 500
  secondaryColor: '#0369a1', // Sky 700
  backgroundColor: '#f8fafc', // Slate 50
  textColor: '#0f172a', // Slate 900
  buttonRadius: 'rounded',
  fontFamily: 'Inter',
  welcomeText: 'Agende sua consulta com a Clínica Sorriso Feliz de forma rápida, prática e 100% automática.',
  showInsuranceField: true,
  showNotesField: true,
  allowedDentists: ['d-1', 'd-2', 'd-3'],
  allowedProcedures: ['p-1', 'p-2', 'p-3', 'p-4', 'p-5']
};

export const DEFAULT_NOTIFICATIONS: NotificationTemplate[] = [
  {
    id: 'n-1',
    type: 'whatsapp',
    triggerTime: '24h',
    enabled: true,
    messageTemplate: 'Olá, *{paciente}*! Lembramos que sua consulta com o(a) dentista *{dentista}* para realizar o procedimento *{procedimento}* está agendada para amanhã, dia *{data}* às *{hora}*. Para confirmar, responda SIM. Para cancelar ou reagendar, responda NÃO ou entre em contato.'
  },
  {
    id: 'n-2',
    type: 'whatsapp',
    triggerTime: '2h',
    enabled: true,
    messageTemplate: 'Olá, *{paciente}*! Falta pouco para seu sorriso ficar ainda mais bonito. Sua consulta é hoje às *{hora}* na *{clinica}*. Te esperamos lá!'
  },
  {
    id: 'n-3',
    type: 'email',
    triggerTime: '24h',
    enabled: true,
    messageTemplate: 'Prezado(a) {paciente},\n\nEste é um lembrete automático de que sua consulta está agendada para amanhã, {data}, às {hora}, na {clinica} com {dentista} para o procedimento {procedimento}.\n\nEndereço: {endereco}\nTelefone: {telefone}\n\nCaso necessite desmarcar, pedimos a gentileza de nos avisar com antecedência.\n\nAtenciosamente,\nEquipe {clinica}.'
  },
  {
    id: 'n-4',
    type: 'sms',
    triggerTime: '24h',
    enabled: false,
    messageTemplate: 'OdontoAgenda: Lembrete de consulta para {paciente} amanha as {hora} com {dentista}. Responda SIM p/ confirmar.'
  }
];
