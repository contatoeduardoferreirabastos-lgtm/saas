import React, { useState, useEffect } from 'react';
import { 
  Appointment, Dentist, Procedure, Patient, ClinicConfig, NotificationTemplate 
} from './types';
import { 
  DEFAULT_APPOINTMENTS, DEFAULT_DENTISTS, DEFAULT_PROCEDURES, DEFAULT_PATIENTS, 
  DEFAULT_CLINIC_CONFIG, DEFAULT_NOTIFICATIONS 
} from './data';

// Components
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Agenda from './components/Agenda';
import Pacientes from './components/Pacientes';
import Dentistas from './components/Dentistas';
import Procedimentos from './components/Procedimentos';
import LinkAgendamento from './components/LinkAgendamento';
import Configuracoes from './components/Configuracoes';
import BookingPage from './components/BookingPage';

// Icons
import { 
  Stethoscope, LayoutDashboard, Calendar, Users, Briefcase, Tag, Link as LinkIcon, 
  Settings, LogOut, ExternalLink, Globe, Menu, X, Check, Copy 
} from 'lucide-react';

export default function App() {
  // Local active session
  const [currentUser, setCurrentUser] = useState<{ uid: string; email: string; clinicName: string } | null>(() => {
    const saved = localStorage.getItem('odonto_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return !!localStorage.getItem('odonto_current_user');
  });

  // Global States
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [config, setConfig] = useState<ClinicConfig>(DEFAULT_CLINIC_CONFIG);
  
  const [notifications, setNotifications] = useState<NotificationTemplate[]>(() => {
    const saved = localStorage.getItem('odonto_notifications');
    return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATIONS;
  });

  const [loading, setLoading] = useState<boolean>(true);

  // Navigation: active admin tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Controls if we are viewing the public booking screen
  const [viewMode, setViewMode] = useState<'admin' | 'public_booking'>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.has('slug') ? 'public_booking' : 'admin';
  });

  // Mobile menu toggle
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Synchronize States with Local Storage based on views and users
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');

    if (slug) {
      // 1. PUBLIC PATIENT BOOKING VIEW
      setLoading(true);
      
      const usersRaw = localStorage.getItem('odonto_users');
      const usersList = usersRaw ? JSON.parse(usersRaw) : [];
      
      let ownerUid: string | null = null;
      let foundConfig: ClinicConfig | null = null;
      
      for (const u of usersList) {
        const cfgRaw = localStorage.getItem(`odonto_${u.uid}_clinic_config`);
        if (cfgRaw) {
          const cfg = JSON.parse(cfgRaw) as ClinicConfig;
          if (cfg.slug === slug) {
            ownerUid = u.uid;
            foundConfig = cfg;
            break;
          }
        }
      }

      if (ownerUid && foundConfig) {
        setConfig(foundConfig);
        
        const rawDentists = localStorage.getItem(`odonto_${ownerUid}_dentists`);
        setDentists(rawDentists ? JSON.parse(rawDentists) : DEFAULT_DENTISTS);

        const rawProcedures = localStorage.getItem(`odonto_${ownerUid}_procedures`);
        setProcedures(rawProcedures ? JSON.parse(rawProcedures) : DEFAULT_PROCEDURES);

        const rawAppointments = localStorage.getItem(`odonto_${ownerUid}_appointments`);
        setAppointments(rawAppointments ? JSON.parse(rawAppointments) : DEFAULT_APPOINTMENTS);
      } else {
        // Fallback to default simulation config
        setConfig(DEFAULT_CLINIC_CONFIG);
        setDentists(DEFAULT_DENTISTS);
        setProcedures(DEFAULT_PROCEDURES);
        setAppointments(DEFAULT_APPOINTMENTS);
      }
      setLoading(false);
    } else {
      // 2. CLINIC OWNER PANEL VIEW
      if (currentUser) {
        const uid = currentUser.uid;
        setLoading(true);
        
        // Load config
        const rawConfig = localStorage.getItem(`odonto_${uid}_clinic_config`);
        if (rawConfig) {
          setConfig(JSON.parse(rawConfig));
        } else {
          const initialConfig: ClinicConfig = {
            ...DEFAULT_CLINIC_CONFIG,
            name: currentUser.clinicName,
            slug: currentUser.clinicName.trim().toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9]+/g, '-'),
            email: currentUser.email,
            ownerId: uid
          };
          localStorage.setItem(`odonto_${uid}_clinic_config`, JSON.stringify(initialConfig));
          setConfig(initialConfig);
        }

        // Load dentists
        const rawDentists = localStorage.getItem(`odonto_${uid}_dentists`);
        if (rawDentists) {
          setDentists(JSON.parse(rawDentists));
        } else {
          const initialized = DEFAULT_DENTISTS.map(d => ({ ...d, ownerId: uid }));
          localStorage.setItem(`odonto_${uid}_dentists`, JSON.stringify(initialized));
          setDentists(initialized);
        }

        // Load procedures
        const rawProcedures = localStorage.getItem(`odonto_${uid}_procedures`);
        if (rawProcedures) {
          setProcedures(JSON.parse(rawProcedures));
        } else {
          const initialized = DEFAULT_PROCEDURES.map(p => ({ ...p, ownerId: uid }));
          localStorage.setItem(`odonto_${uid}_procedures`, JSON.stringify(initialized));
          setProcedures(initialized);
        }

        // Load patients
        const rawPatients = localStorage.getItem(`odonto_${uid}_patients`);
        if (rawPatients) {
          setPatients(JSON.parse(rawPatients));
        } else {
          const initialized = DEFAULT_PATIENTS.map(p => ({ ...p, ownerId: uid }));
          localStorage.setItem(`odonto_${uid}_patients`, JSON.stringify(initialized));
          setPatients(initialized);
        }

        // Load appointments
        const rawAppointments = localStorage.getItem(`odonto_${uid}_appointments`);
        if (rawAppointments) {
          setAppointments(JSON.parse(rawAppointments));
        } else {
          const initialized = DEFAULT_APPOINTMENTS.map(a => ({ ...a, ownerId: uid }));
          localStorage.setItem(`odonto_${uid}_appointments`, JSON.stringify(initialized));
          setAppointments(initialized);
        }
        
        setLoading(false);
      } else {
        // Fallback default setup
        setAppointments(DEFAULT_APPOINTMENTS);
        setDentists(DEFAULT_DENTISTS);
        setProcedures(DEFAULT_PROCEDURES);
        setPatients(DEFAULT_PATIENTS);
        setConfig(DEFAULT_CLINIC_CONFIG);
        setLoading(false);
      }
    }
  }, [currentUser, viewMode]);

  // Sync notifications changes to local storage
  useEffect(() => {
    localStorage.setItem('odonto_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Handle simulated booking completed by patients on public booking page
  const handleNewPublicBooking = async (newBooking: Omit<Appointment, 'id' | 'status'>) => {
    const ownerId = config.ownerId || currentUser?.uid || 'default-owner';

    const confirmedBooking: Appointment = {
      ...newBooking,
      id: 'ap-' + Date.now(),
      status: 'confirmed',
      ownerId: ownerId
    };

    // Load and update appointments list
    const rawAppointments = localStorage.getItem(`odonto_${ownerId}_appointments`);
    const currentAppointments: Appointment[] = rawAppointments ? JSON.parse(rawAppointments) : DEFAULT_APPOINTMENTS;
    const updatedAppointments = [confirmedBooking, ...currentAppointments];
    
    localStorage.setItem(`odonto_${ownerId}_appointments`, JSON.stringify(updatedAppointments));
    if (currentUser?.uid === ownerId) {
      setAppointments(updatedAppointments);
    }

    // Load and update patients list
    const rawPatients = localStorage.getItem(`odonto_${ownerId}_patients`);
    const currentPatients: Patient[] = rawPatients ? JSON.parse(rawPatients) : DEFAULT_PATIENTS;
    
    const existingIndex = currentPatients.findIndex(p => p.phone === newBooking.patientPhone || p.email === newBooking.patientEmail);
    if (existingIndex > -1) {
      const existing = currentPatients[existingIndex];
      const updatedHistory = [
        {
          date: newBooking.date,
          procedureName: newBooking.procedureName,
          dentistName: newBooking.dentistName,
          notes: newBooking.notes || 'Agendado automaticamente via link público'
        },
        ...(existing.history || [])
      ];
      currentPatients[existingIndex] = {
        ...existing,
        history: updatedHistory
      };
    } else {
      const newPatient: Patient = {
        id: 'pt-' + Date.now(),
        name: newBooking.patientName,
        email: newBooking.patientEmail,
        phone: newBooking.patientPhone,
        birthday: '1995-01-01',
        insurance: newBooking.patientInsurance || 'Particular',
        generalObservations: 'Paciente cadastrado automaticamente via Link de Agendamento.',
        history: [
          {
            date: newBooking.date,
            procedureName: newBooking.procedureName,
            dentistName: newBooking.dentistName,
            notes: newBooking.notes || 'Agendamento Inicial'
          }
        ],
        attachments: [],
        ownerId: ownerId
      };
      currentPatients.unshift(newPatient);
    }
    
    localStorage.setItem(`odonto_${ownerId}_patients`, JSON.stringify(currentPatients));
    if (currentUser?.uid === ownerId) {
      setPatients(currentPatients);
    }
  };

  // Callback handlers for CRUD updates
  const handleAddAppointment = async (app: Omit<Appointment, 'id'>) => {
    if (!currentUser) return;
    const newApp: Appointment = { ...app, id: 'ap-' + Date.now(), ownerId: currentUser.uid };
    const updated = [newApp, ...appointments];
    setAppointments(updated);
    localStorage.setItem(`odonto_${currentUser.uid}_appointments`, JSON.stringify(updated));
  };

  const handleUpdateAppointment = async (updatedApp: Appointment) => {
    if (!currentUser) return;
    const updated = appointments.map(a => a.id === updatedApp.id ? updatedApp : a);
    setAppointments(updated);
    localStorage.setItem(`odonto_${currentUser.uid}_appointments`, JSON.stringify(updated));
  };

  const handleAddPatient = async (pat: Omit<Patient, 'id'>) => {
    if (!currentUser) return;
    const newPat: Patient = { ...pat, id: 'pt-' + Date.now(), ownerId: currentUser.uid };
    const updated = [newPat, ...patients];
    setPatients(updated);
    localStorage.setItem(`odonto_${currentUser.uid}_patients`, JSON.stringify(updated));
  };

  const handleUpdatePatient = async (updatedPat: Patient) => {
    if (!currentUser) return;
    const updated = patients.map(p => p.id === updatedPat.id ? updatedPat : p);
    setPatients(updated);
    localStorage.setItem(`odonto_${currentUser.uid}_patients`, JSON.stringify(updated));
  };

  const handleAddDentist = async (dent: Omit<Dentist, 'id'>) => {
    if (!currentUser) return;
    const dId = 'd-' + Date.now();
    const newDent: Dentist = { ...dent, id: dId, ownerId: currentUser.uid };
    const updatedDentists = [newDent, ...dentists];
    setDentists(updatedDentists);
    localStorage.setItem(`odonto_${currentUser.uid}_dentists`, JSON.stringify(updatedDentists));

    // Automatically add to config allowed lists
    const updatedAllowed = [...(config.allowedDentists || []), dId];
    const updatedConfig = { ...config, allowedDentists: updatedAllowed };
    setConfig(updatedConfig);
    localStorage.setItem(`odonto_${currentUser.uid}_clinic_config`, JSON.stringify(updatedConfig));
  };

  const handleUpdateDentist = async (updatedDent: Dentist) => {
    if (!currentUser) return;
    const updated = dentists.map(d => d.id === updatedDent.id ? updatedDent : d);
    setDentists(updated);
    localStorage.setItem(`odonto_${currentUser.uid}_dentists`, JSON.stringify(updated));
  };

  const handleDeleteDentist = async (id: string) => {
    if (!currentUser) return;
    const updatedDentists = dentists.filter(d => d.id !== id);
    setDentists(updatedDentists);
    localStorage.setItem(`odonto_${currentUser.uid}_dentists`, JSON.stringify(updatedDentists));

    const updatedAllowed = (config.allowedDentists || []).filter(dId => dId !== id);
    const updatedConfig = { ...config, allowedDentists: updatedAllowed };
    setConfig(updatedConfig);
    localStorage.setItem(`odonto_${currentUser.uid}_clinic_config`, JSON.stringify(updatedConfig));
  };

  const handleAddProcedure = async (proc: Omit<Procedure, 'id'>) => {
    if (!currentUser) return;
    const pId = 'p-' + Date.now();
    const newProc: Procedure = { ...proc, id: pId, ownerId: currentUser.uid };
    const updatedProcedures = [newProc, ...procedures];
    setProcedures(updatedProcedures);
    localStorage.setItem(`odonto_${currentUser.uid}_procedures`, JSON.stringify(updatedProcedures));

    // Automatically add to config allowed lists
    const updatedAllowed = [...(config.allowedProcedures || []), pId];
    const updatedConfig = { ...config, allowedProcedures: updatedAllowed };
    setConfig(updatedConfig);
    localStorage.setItem(`odonto_${currentUser.uid}_clinic_config`, JSON.stringify(updatedConfig));
  };

  const handleUpdateProcedure = async (updatedProc: Procedure) => {
    if (!currentUser) return;
    const updated = procedures.map(p => p.id === updatedProc.id ? updatedProc : p);
    setProcedures(updated);
    localStorage.setItem(`odonto_${currentUser.uid}_procedures`, JSON.stringify(updated));
  };

  const handleDeleteProcedure = async (id: string) => {
    if (!currentUser) return;
    const updatedProcedures = procedures.filter(p => p.id !== id);
    setProcedures(updatedProcedures);
    localStorage.setItem(`odonto_${currentUser.uid}_procedures`, JSON.stringify(updatedProcedures));

    const updatedAllowed = (config.allowedProcedures || []).filter(pId => pId !== id);
    const updatedConfig = { ...config, allowedProcedures: updatedAllowed };
    setConfig(updatedConfig);
    localStorage.setItem(`odonto_${currentUser.uid}_clinic_config`, JSON.stringify(updatedConfig));
  };

  const handleUpdateConfig = async (newConfig: ClinicConfig) => {
    if (!currentUser) return;
    const updated = { ...newConfig, ownerId: currentUser.uid };
    setConfig(updated);
    localStorage.setItem(`odonto_${currentUser.uid}_clinic_config`, JSON.stringify(updated));
  };

  const handleResetDefaults = async () => {
    if (!currentUser) return;
    if (confirm('Deseja mesmo redefinir as personalizações visuais do seu link para o padrão original?')) {
      const updated = { ...DEFAULT_CLINIC_CONFIG, ownerId: currentUser.uid };
      setConfig(updated);
      localStorage.setItem(`odonto_${currentUser.uid}_clinic_config`, JSON.stringify(updated));
    }
  };

  const handleCopyLinkGlobal = () => {
    const fullLink = `${window.location.origin}/?slug=${config.slug}`;
    navigator.clipboard.writeText(fullLink);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('odonto_current_user');
  };

  // Loading spinner view
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6" id="loading-spinner">
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col items-center gap-4 text-center max-w-xs relative overflow-hidden">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
            <Stethoscope className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm tracking-tight uppercase">OdontoAgenda</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">Iniciando Banco Local...</p>
          </div>
          <div className="w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mt-2" />
        </div>
      </div>
    );
  }

  // Patient Booking Link View
  if (viewMode === 'public_booking') {
    return (
      <div className="bg-slate-50 min-h-screen" id="public-booking-container">
        <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between text-xs font-bold shadow-md relative z-40">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>PÁGINA PÚBLICA DE AGENDAMENTO (PREVIEW)</span>
          </div>
          <button 
            onClick={() => {
              window.history.pushState({}, '', window.location.origin);
              setViewMode('admin');
            }}
            className="bg-sky-600 hover:bg-sky-500 px-3.5 py-1.5 rounded-lg text-xs text-white font-extrabold cursor-pointer transition-colors"
          >
            Voltar ao Painel Administrativo
          </button>
        </div>

        <BookingPage 
          config={config}
          dentists={dentists}
          procedures={procedures}
          onNewBookingSimulation={handleNewPublicBooking}
        />
      </div>
    );
  }

  // Not logged in screen
  if (!isLoggedIn || !currentUser) {
    return (
      <Login 
        onLoginSuccess={(userObj) => {
          setCurrentUser(userObj);
          setIsLoggedIn(true);
        }} 
      />
    );
  }

  // Sidebar list items
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'patients', label: 'Pacientes', icon: Users },
    { id: 'dentists', label: 'Dentistas/Profissionais', icon: Briefcase },
    { id: 'procedures', label: 'Procedimentos/Serviços', icon: Tag },
    { id: 'link', label: 'Link de Agendamento', icon: LinkIcon, highlight: true },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans" id="app-viewport">
      
      {/* Sidebar Navigation */}
      <aside 
        className={`bg-white text-slate-800 w-full md:w-64 shrink-0 border-r border-slate-200 transition-all duration-300 relative z-30 flex flex-col justify-between ${
          isMobileMenuOpen ? 'block' : 'hidden md:flex'
        }`}
        id="app-sidebar"
      >
        <div>
          {/* Brand header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              {config.logoUrl ? (
                <img 
                  src={config.logoUrl} 
                  alt={config.name} 
                  className="w-8 h-8 rounded-full border border-slate-200 object-cover bg-white shrink-0 shadow-xs"
                />
              ) : (
                <div className="p-1.5 bg-sky-600 rounded-lg text-white shrink-0">
                  <Stethoscope className="w-5 h-5" />
                </div>
              )}
              <div className="min-w-0">
                <h2 className="font-extrabold text-xs sm:text-sm tracking-tight leading-none text-sky-900 uppercase truncate" title={config.name}>
                  {config.name || 'OdontoAgenda'}
                </h2>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block mt-0.5">Painel da Clínica</span>
              </div>
            </div>
            
            <button 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items list */}
          <nav className="p-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all text-left cursor-pointer ${
                    isActive 
                      ? 'bg-sky-50 text-sky-700 font-bold shadow-xs border border-sky-100/50' 
                      : item.highlight
                        ? 'text-sky-600 hover:bg-sky-50 hover:text-sky-700 bg-sky-50/20'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                  <span className="flex-1 truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          <div className="flex items-center gap-3 p-1.5 rounded-lg bg-slate-50 border border-slate-100">
            <div className="w-8 h-8 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center uppercase">
              {currentUser?.email ? currentUser.email.slice(0, 2) : 'CL'}
            </div>
            <div className="min-w-0">
              <span className="block text-xs font-bold text-slate-800 truncate">{currentUser?.email || 'Administrador'}</span>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Acesso Local</span>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors text-left cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0 text-rose-500" />
            Sair do Painel
          </button>
        </div>
      </aside>

      {/* Main Panel Area */}
      <div className="flex-1 flex flex-col min-w-0" id="main-panel">
        
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200 h-16 px-8 flex items-center justify-between shrink-0" id="app-header">
          
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Unidade:</span>
            <span className="text-xs font-extrabold text-slate-700 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full">
              {config.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            
            <button 
              onClick={() => setViewMode('public_booking')}
              className="inline-flex items-center gap-1 bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium text-xs px-4 py-2 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              id="view-public-page-btn"
            >
              <Globe className="w-3.5 h-3.5" />
              Ver Página Pública
              <ExternalLink className="w-3 h-3 text-slate-400 ml-0.5" />
            </button>

            <button 
              onClick={handleCopyLinkGlobal}
              className="inline-flex items-center gap-1 bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs px-4 py-2 rounded-lg shadow-sm shadow-sky-100 transition-colors cursor-pointer"
              id="copy-public-link-btn"
            >
              {copyFeedback ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copyFeedback ? 'Copiado!' : 'Copiar Link'}
            </button>
          </div>

        </header>

        {/* Dynamic Tab Body */}
        <main className="p-4 sm:p-6 flex-1 overflow-y-auto" id="app-main-viewport">
          
          {activeTab === 'dashboard' && (
            <Dashboard 
              appointments={appointments}
              dentists={dentists}
              patients={patients}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'agenda' && (
            <Agenda 
              appointments={appointments}
              dentists={dentists}
              procedures={procedures}
              onAddAppointment={handleAddAppointment}
              onUpdateAppointment={handleUpdateAppointment}
            />
          )}

          {activeTab === 'patients' && (
            <Pacientes 
              patients={patients}
              appointments={appointments}
              onAddPatient={handleAddPatient}
              onUpdatePatient={handleUpdatePatient}
            />
          )}

          {activeTab === 'dentists' && (
            <Dentistas 
              dentists={dentists}
              onAddDentist={handleAddDentist}
              onUpdateDentist={handleUpdateDentist}
              onDeleteDentist={handleDeleteDentist}
            />
          )}

          {activeTab === 'procedures' && (
            <Procedimentos 
              procedures={procedures}
              onAddProcedure={handleAddProcedure}
              onUpdateProcedure={handleUpdateProcedure}
              onDeleteProcedure={handleDeleteProcedure}
            />
          )}

          {activeTab === 'link' && (
            <LinkAgendamento 
              config={config}
              dentists={dentists}
              procedures={procedures}
              onUpdateConfig={handleUpdateConfig}
              onResetDefaults={handleResetDefaults}
            />
          )}

          {activeTab === 'settings' && (
            <Configuracoes 
              config={config}
              onUpdateConfig={handleUpdateConfig}
            />
          )}

        </main>

      </div>

    </div>
  );
}
