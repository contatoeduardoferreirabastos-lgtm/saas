import React, { useState, useMemo } from 'react';
import { Appointment, Dentist, Procedure } from '../types';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Lock, User, Clock, AlertCircle, Edit, Check, X, ShieldAlert } from 'lucide-react';
import { formatDateBR, getAvailableSlots, formatCurrency } from '../utils';

interface AgendaProps {
  appointments: Appointment[];
  dentists: Dentist[];
  procedures: Procedure[];
  onAddAppointment: (app: Omit<Appointment, 'id'>) => void;
  onUpdateAppointment: (app: Appointment) => void;
}

export default function Agenda({ appointments, dentists, procedures, onAddAppointment, onUpdateAppointment }: AgendaProps) {
  const [view, setView] = useState<'day' | 'week' | 'month'>('day');
  const [currentDate, setCurrentDate] = useState<string>('2026-07-15'); // Current date in mock environment
  const [selectedDentistFilter, setSelectedDentistFilter] = useState<string>('all');
  
  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Appointment | null>(null);

  // New Appointment Form State
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientPhone, setNewPatientPhone] = useState('');
  const [newPatientEmail, setNewPatientEmail] = useState('');
  const [newDentistId, setNewDentistId] = useState('');
  const [newProcedureId, setNewProcedureId] = useState('');
  const [newDate, setNewDate] = useState('2026-07-15');
  const [newTime, setNewTime] = useState('08:00');
  const [newInsurance, setNewInsurance] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [isBlockedSlot, setIsBlockedSlot] = useState(false);

  // Drag and Drop State
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);

  // Working Hours definition
  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:10', '11:30', '12:00', 
    '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  const handleDateChange = (days: number) => {
    const parts = currentDate.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    
    const d = new Date(year, month, day);
    d.setDate(d.getDate() + days);
    
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setCurrentDate(`${yyyy}-${mm}-${dd}`);
  };

  const activeDentists = useMemo(() => {
    if (selectedDentistFilter === 'all') return dentists;
    return dentists.filter(d => d.id === selectedDentistFilter);
  }, [dentists, selectedDentistFilter]);

  // Appointment mapping for quick lookup
  const appointmentsByDentistAndTime = useMemo(() => {
    const map: Record<string, Record<string, Appointment>> = {};
    dentists.forEach(d => {
      map[d.id] = {};
    });

    appointments.forEach(app => {
      if (app.date === currentDate) {
        if (!map[app.dentistId]) map[app.dentistId] = {};
        map[app.dentistId][app.time] = app;
      }
    });
    return map;
  }, [appointments, currentDate, dentists]);

  // Handle Drag & Drop Remarcar
  const handleDragStart = (e: React.DragEvent, appId: string) => {
    setDraggedAppId(appId);
    e.dataTransfer.setData('text/plain', appId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Required to allow drop
  };

  const handleDrop = (e: React.DragEvent, dentistId: string, time: string) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData('text/plain') || draggedAppId;
    if (!appId) return;

    const app = appointments.find(a => a.id === appId);
    if (app) {
      const updated: Appointment = {
        ...app,
        dentistId,
        dentistName: dentists.find(d => d.id === dentistId)?.name || app.dentistName,
        time,
        date: currentDate // moves to the active calendar date
      };
      onUpdateAppointment(updated);
    }
    setDraggedAppId(null);
  };

  const handleOpenNewModal = (dentistId = '', time = '') => {
    setNewDentistId(dentistId || dentists[0]?.id || '');
    setNewProcedureId(procedures[0]?.id || '');
    setNewDate(currentDate);
    setNewTime(time || '08:00');
    setNewPatientName('');
    setNewPatientPhone('');
    setNewPatientEmail('');
    setNewInsurance('');
    setNewNotes('');
    setIsBlockedSlot(false);
    setIsNewModalOpen(true);
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    const dentist = dentists.find(d => d.id === newDentistId);
    const procedure = procedures.find(p => p.id === newProcedureId);

    if (isBlockedSlot) {
      onAddAppointment({
        patientName: '🔒 HORÁRIO BLOQUEADO (MANUTENÇÃO/ALMOÇO)',
        patientPhone: '',
        patientEmail: '',
        dentistId: newDentistId,
        dentistName: dentist?.name || '',
        procedureId: 'blocked',
        procedureName: 'Bloqueio de Agenda',
        date: newDate,
        time: newTime,
        durationMinutes: 30,
        status: 'cancelled', // mark cancelled as a backend flag or just use special render
        notes: newNotes || 'Bloqueio manual'
      });
    } else {
      onAddAppointment({
        patientName: newPatientName,
        patientPhone: newPatientPhone,
        patientEmail: newPatientEmail,
        patientInsurance: newInsurance,
        dentistId: newDentistId,
        dentistName: dentist?.name || '',
        procedureId: newProcedureId,
        procedureName: procedure?.name || '',
        date: newDate,
        time: newTime,
        durationMinutes: procedure?.durationMinutes || 30,
        status: 'confirmed',
        notes: newNotes
      });
    }
    setIsNewModalOpen(false);
  };

  const handleUpdateStatus = (status: Appointment['status']) => {
    if (selectedApp) {
      onUpdateAppointment({
        ...selectedApp,
        status
      });
      setIsDetailModalOpen(false);
    }
  };

  return (
    <div className="space-y-6" id="agenda-container">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm" id="agenda-controls-bar">
        {/* Navigation & Date selector */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleDateChange(-1)} 
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
          <span className="font-semibold text-slate-800 text-sm md:text-base whitespace-nowrap min-w-[150px] text-center">
            {formatDateBR(currentDate)}
          </span>
          <button 
            onClick={() => handleDateChange(1)} 
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
          <button 
            onClick={() => setCurrentDate('2026-07-15')} 
            className="text-xs text-sky-700 hover:text-sky-800 font-bold px-2.5 py-1.5 bg-sky-50 rounded-lg hover:bg-sky-100 transition-colors cursor-pointer"
          >
            Hoje
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Dentist selector */}
          <select 
            value={selectedDentistFilter} 
            onChange={(e) => setSelectedDentistFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-600 font-semibold outline-none"
          >
            <option value="all">Todos os Dentistas</option>
            {dentists.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          {/* View switcher */}
          <div className="flex bg-slate-100 rounded-lg p-0.5" id="view-switcher">
            <button 
              onClick={() => setView('day')} 
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${view === 'day' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Dia
            </button>
            <button 
              onClick={() => setView('week')} 
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${view === 'week' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Semana
            </button>
            <button 
              onClick={() => setView('month')} 
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${view === 'month' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Mês
            </button>
          </div>

          {/* New Button */}
          <button 
            onClick={() => handleOpenNewModal()}
            className="inline-flex items-center gap-1 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs px-3.5 py-2 rounded-lg shadow-sm shadow-sky-100 transition-colors cursor-pointer"
            id="agenda-add-btn"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Agendamento
          </button>
        </div>
      </div>

      {/* Main Agenda Grid */}
      {view === 'day' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto" id="agenda-day-grid">
          <div className="min-w-[600px]">
            {/* Header Column/Row */}
            <div className="grid grid-cols-[100px_1fr] border-b border-slate-200 bg-slate-50">
              <div className="p-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-center border-r border-slate-200 flex items-center justify-center">
                Horário
              </div>
              <div className="grid" style={{ gridTemplateColumns: `repeat(${activeDentists.length}, minmax(0, 1fr))` }}>
                {activeDentists.map(dentist => (
                  <div key={dentist.id} className="p-3 text-center border-r border-slate-200 last:border-r-0">
                    <h4 className="font-semibold text-slate-700 text-sm">{dentist.name}</h4>
                    <p className="text-[10px] text-slate-400 font-medium">{dentist.specialty}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Time Rows */}
            <div className="divide-y divide-slate-100">
              {timeSlots.map(time => (
                <div key={time} className="grid grid-cols-[100px_1fr] min-h-[56px] hover:bg-slate-50/20 transition-colors">
                  {/* Time label */}
                  <div className="p-2 border-r border-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 bg-slate-50/50">
                    {time}
                  </div>

                  {/* Dentist Cells */}
                  <div className="grid" style={{ gridTemplateColumns: `repeat(${activeDentists.length}, minmax(0, 1fr))` }}>
                    {activeDentists.map(dentist => {
                      const app = appointmentsByDentistAndTime[dentist.id]?.[time];

                      if (app) {
                        const isBlocked = app.procedureId === 'blocked';
                        
                        return (
                          <div 
                            key={dentist.id} 
                            className="p-1 border-r border-slate-200 last:border-r-0 h-full relative"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, dentist.id, time)}
                          >
                            <div 
                              draggable={!isBlocked}
                              onDragStart={(e) => handleDragStart(e, app.id)}
                              onClick={() => {
                                setSelectedApp(app);
                                setIsDetailModalOpen(true);
                              }}
                              className={`h-full rounded-lg p-2 text-left cursor-pointer transition-all shadow-xs border relative overflow-hidden group select-none ${
                                isBlocked 
                                  ? 'bg-repeating-stripes border-slate-200 text-slate-500' 
                                  : app.status === 'confirmed' ? 'bg-sky-50 border-sky-200 text-sky-850 hover:bg-sky-100/80' :
                                    app.status === 'completed' ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' :
                                    app.status === 'pending' ? 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100/80' :
                                    'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100/80'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <span className="font-bold text-xs line-clamp-1 block leading-tight">
                                  {isBlocked ? '🔒 Bloqueado' : app.patientName}
                                </span>
                                <span className="text-[9px] opacity-70 shrink-0 font-bold ml-1">
                                  {app.durationMinutes}m
                                </span>
                              </div>
                              <p className="text-[10px] opacity-80 mt-0.5 line-clamp-1">
                                {isBlocked ? app.notes : app.procedureName}
                              </p>
                              {/* Grab handle visual indicator on hover */}
                              {!isBlocked && (
                                <div className="absolute right-1 bottom-1 opacity-0 group-hover:opacity-40 text-[8px] font-bold tracking-tight uppercase">
                                  Arrastar ✥
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }

                      // Empty Cell - Clickable to create booking
                      return (
                        <div 
                          key={dentist.id} 
                          className="border-r border-slate-200 last:border-r-0 p-1 h-full hover:bg-sky-50/30 transition-colors cursor-pointer flex items-center justify-center group"
                          onClick={() => handleOpenNewModal(dentist.id, time)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, dentist.id, time)}
                        >
                          <span className="opacity-0 group-hover:opacity-100 text-[11px] font-semibold text-sky-600 transition-opacity flex items-center gap-0.5 bg-sky-50 px-2 py-1 rounded border border-sky-100">
                            <Plus className="w-3 h-3" />
                            Reservar
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {view !== 'day' && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 shadow-sm" id="agenda-alternative-views">
          <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-700 text-sm sm:text-base">Visualização Avançada</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Por limitações de espaço de tela no painel, a visão de Semana e Mês é simplificada. Recomendamos a <strong>Visão de Dia</strong> para controle profissional de encaixes, arrastar e soltar e verificação de conflitos.
          </p>
          <button 
            onClick={() => setView('day')}
            className="mt-4 text-xs font-semibold text-sky-600 bg-sky-50 hover:bg-sky-100 px-3.5 py-1.5 rounded-lg border border-sky-100 cursor-pointer"
          >
            Voltar para Visão Dia
          </button>
        </div>
      )}

      {/* MODAL: NEW APPOINTMENT */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 animate-slide-up">
            <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-sky-600" />
                <h3 className="font-semibold text-slate-800 text-base">Novo Agendamento Manual</h3>
              </div>
              <button onClick={() => setIsNewModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNew} className="p-5 space-y-4">
              {/* Type Switcher (Regular Booking or Block) */}
              <div className="flex bg-slate-100 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setIsBlockedSlot(false)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${!isBlockedSlot ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'}`}
                >
                  Consulta com Paciente
                </button>
                <button
                  type="button"
                  onClick={() => setIsBlockedSlot(true)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${isBlockedSlot ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'}`}
                >
                  Bloqueio Manual de Horário
                </button>
              </div>

              {/* Dentist & Date/Time Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Dentista</label>
                  <select 
                    value={newDentistId} 
                    onChange={(e) => setNewDentistId(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 outline-none"
                    required
                  >
                    {dentists.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Horário</label>
                  <select 
                    value={newTime} 
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 outline-none"
                    required
                  >
                    {timeSlots.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Patient Fields (Only if not blocked slot) */}
              {!isBlockedSlot ? (
                <>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Nome do Paciente</label>
                      <input 
                        type="text" 
                        placeholder="Nome completo"
                        value={newPatientName}
                        onChange={(e) => setNewPatientName(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 outline-none focus:border-sky-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Telefone</label>
                        <input 
                          type="text" 
                          placeholder="(11) 99999-9999"
                          value={newPatientPhone}
                          onChange={(e) => setNewPatientPhone(e.target.value)}
                          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 outline-none focus:border-sky-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">E-mail</label>
                        <input 
                          type="email" 
                          placeholder="paciente@email.com"
                          value={newPatientEmail}
                          onChange={(e) => setNewPatientEmail(e.target.value)}
                          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 outline-none focus:border-sky-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Procedimento</label>
                        <select 
                          value={newProcedureId} 
                          onChange={(e) => setNewProcedureId(e.target.value)}
                          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 outline-none"
                          required
                        >
                          {procedures.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({p.durationMinutes} min)</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Convênio / Seguro</label>
                        <input 
                          type="text" 
                          placeholder="Particular ou Nome do Convênio"
                          value={newInsurance}
                          onChange={(e) => setNewInsurance(e.target.value)}
                          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Motivo do Bloqueio</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Almoço da Dra. Amanda, Manutenção da Cadeira, etc."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 outline-none focus:border-sky-500"
                    required
                  />
                </div>
              )}

              {/* Notes Field (Always there, but labeled differently) */}
              {!isBlockedSlot && (
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Observações / Notas Clínicas</label>
                  <textarea 
                    placeholder="Histórico rápido, precauções, etc..."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    rows={2}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 outline-none focus:border-sky-500 resize-none"
                  />
                </div>
              )}

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Confirmar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: APPOINTMENT DETAILS */}
      {isDetailModalOpen && selectedApp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 animate-slide-up">
            <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 text-sm md:text-base">Detalhes do Agendamento</h3>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Patient Basic Header */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-sm border border-sky-100">
                  {selectedApp.patientName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm sm:text-base">{selectedApp.patientName}</h4>
                  <p className="text-xs text-slate-500">{selectedApp.patientPhone || 'Sem telefone'}</p>
                </div>
              </div>

              {/* App Info Grid */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dentista</span>
                  <span className="text-xs font-semibold text-slate-700">{selectedApp.dentistName}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Procedimento</span>
                  <span className="text-xs font-semibold text-slate-700">{selectedApp.procedureName}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Data e Horário</span>
                  <span className="text-xs font-semibold text-slate-700">{formatDateBR(selectedApp.date)} às {selectedApp.time}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Duração</span>
                  <span className="text-xs font-semibold text-slate-700">{selectedApp.durationMinutes} minutos</span>
                </div>
              </div>

              {selectedApp.patientInsurance && (
                <div>
                  <span className="block text-xs font-medium text-slate-400">Convênio</span>
                  <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-1 rounded border border-sky-100 inline-block mt-0.5">
                    {selectedApp.patientInsurance}
                  </span>
                </div>
              )}

              {selectedApp.notes && (
                <div>
                  <span className="block text-xs font-medium text-slate-400">Observações</span>
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-150 mt-1 leading-relaxed">
                    {selectedApp.notes}
                  </p>
                </div>
              )}

              {/* Status Manager Action buttons */}
              <div>
                <span className="block text-xs font-medium text-slate-400 mb-2">Alterar Status da Consulta</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => handleUpdateStatus('confirmed')}
                    className={`px-2 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold border transition-colors cursor-pointer ${selectedApp.status === 'confirmed' ? 'bg-sky-600 border-sky-600 text-white shadow-xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('completed')}
                    className={`px-2 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold border transition-colors cursor-pointer ${selectedApp.status === 'completed' ? 'bg-slate-600 border-slate-200 text-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    Concluir
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('pending')}
                    className={`px-2 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold border transition-colors cursor-pointer ${selectedApp.status === 'pending' ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    Pendente
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('cancelled')}
                    className={`px-2 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold border transition-colors cursor-pointer ${selectedApp.status === 'cancelled' ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    Cancelar
                  </button>
                </div>
              </div>

              {/* Info alert about Drag & Drop */}
              <div className="p-2.5 bg-sky-50 border border-sky-100 rounded-lg text-[10px] sm:text-xs text-sky-800 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-sky-500 shrink-0" />
                <span>Você também pode reagendar arrastando este card para outra célula de horário na tabela!</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
