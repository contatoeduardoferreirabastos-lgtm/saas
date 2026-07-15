import React, { useState, useMemo } from 'react';
import { ClinicConfig, Dentist, Procedure, Appointment } from '../types';
import { Calendar as CalendarIcon, Clock, User, Sparkles, Check, ChevronLeft, ChevronRight, Phone, Mail, FileText, Gift, Award, Stethoscope } from 'lucide-react';
import { getAvailableSlots, formatDateBR, formatCurrency } from '../utils';

interface BookingPageProps {
  config: ClinicConfig;
  dentists: Dentist[];
  procedures: Procedure[];
  onNewBookingSimulation: (booking: Omit<Appointment, 'id' | 'status'>) => void;
  isInsidePreview?: boolean; // Changes layout styling if embedded inside admin preview panel
}

export default function BookingPage({ config, dentists, procedures, onNewBookingSimulation, isInsidePreview = false }: BookingPageProps) {
  const [step, setStep] = useState<number>(1);
  const [selectedProcedureId, setSelectedProcedureId] = useState<string>('');
  const [selectedDentistId, setSelectedDentistId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('2026-07-15'); // default to current mock date
  const [selectedTime, setSelectedTime] = useState<string>('');
  
  // Form contact inputs
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientInsurance, setPatientInsurance] = useState('');
  const [patientNotes, setPatientNotes] = useState('');

  // Filtering based on clinic configurations
  const activeProcedures = useMemo(() => {
    return procedures.filter(p => config.allowedProcedures.includes(p.id));
  }, [procedures, config.allowedProcedures]);

  const activeDentists = useMemo(() => {
    return dentists.filter(d => config.allowedDentists.includes(d.id));
  }, [dentists, config.allowedDentists]);

  const selectedProcedureObj = useMemo(() => {
    return activeProcedures.find(p => p.id === selectedProcedureId);
  }, [activeProcedures, selectedProcedureId]);

  const selectedDentistObj = useMemo(() => {
    return activeDentists.find(d => d.id === selectedDentistId);
  }, [activeDentists, selectedDentistId]);

  // Generate date selectors (next 7 days starting from today 2026-07-15)
  const availableDates = useMemo(() => {
    const list = [];
    const baseDate = new Date(2026, 6, 15); // July 15 (0-indexed month is 6)
    for (let i = 0; i < 7; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      
      const weekdaysPT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const monthsPT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

      list.push({
        key: `${yyyy}-${mm}-${dd}`,
        dayLabel: dd,
        weekdayLabel: weekdaysPT[d.getDay()],
        monthLabel: monthsPT[d.getMonth()]
      });
    }
    return list;
  }, []);

  // Calculate available slots in real-time
  const calculatedTimeSlots = useMemo(() => {
    if (!selectedProcedureObj || !selectedDentistObj || !selectedDate) return [];
    
    // Simulate query of general booked appointments from system parent state or seed list
    // In production, parent supplies full list. Here, we can filter standard mock list.
    // For visual simulation, let's generate slots:
    const mockAppointmentsList: Appointment[] = [
      {
        id: 'ap-1',
        patientName: 'Carlos Henrique',
        patientPhone: '(11) 99123-4567',
        patientEmail: 'carlos@gmail.com',
        dentistId: 'd-1',
        dentistName: 'Dra. Amanda Silva',
        procedureId: 'p-4',
        procedureName: 'Clareamento Dental',
        date: '2026-07-15',
        time: '09:00',
        durationMinutes: 60,
        status: 'confirmed'
      },
      {
        id: 'ap-2',
        patientName: 'Mariana Costa',
        patientPhone: '(11) 98234-5678',
        patientEmail: 'mari@gmail.com',
        dentistId: 'd-3',
        dentistName: 'Dra. Beatriz Santos',
        procedureId: 'p-2',
        procedureName: 'Limpeza',
        date: '2026-07-15',
        time: '11:00',
        durationMinutes: 45,
        status: 'completed'
      }
    ];

    return getAvailableSlots(selectedDate, selectedDentistObj, selectedProcedureObj, mockAppointmentsList);
  }, [selectedDate, selectedDentistObj, selectedProcedureObj]);

  // Style helper: Convert buttonRadius enum to Tailwind class
  const buttonRadiusClass = useMemo(() => {
    if (config.buttonRadius === 'square') return 'rounded-none';
    if (config.buttonRadius === 'full') return 'rounded-full';
    return 'rounded-xl';
  }, [config.buttonRadius]);

  // Style helper: font family class mapping
  const fontFamilyStyle = useMemo(() => {
    if (config.fontFamily === 'Space Grotesk') return { fontFamily: '"Space Grotesk", sans-serif' };
    if (config.fontFamily === 'Outfit') return { fontFamily: '"Outfit", sans-serif' };
    return { fontFamily: '"Inter", sans-serif' };
  }, [config.fontFamily]);

  const handleNextStep = () => {
    if (step === 1 && selectedProcedureId) {
      setStep(2);
    } else if (step === 2 && selectedDentistId) {
      setStep(3);
    } else if (step === 3 && selectedTime) {
      setStep(4);
    }
  };

  const handleBackStep = () => {
    if (step > 1 && step <= 4) {
      setStep(step - 1);
    }
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !patientPhone || !patientEmail) return;

    onNewBookingSimulation({
      patientName,
      patientPhone,
      patientEmail,
      patientInsurance: patientInsurance || undefined,
      dentistId: selectedDentistId,
      dentistName: selectedDentistObj?.name || '',
      procedureId: selectedProcedureId,
      procedureName: selectedProcedureObj?.name || '',
      date: selectedDate,
      time: selectedTime,
      durationMinutes: selectedProcedureObj?.durationMinutes || 30,
      notes: patientNotes || undefined
    });

    setStep(5); // Success step
  };

  const handleResetForm = () => {
    setStep(1);
    setSelectedProcedureId('');
    setSelectedDentistId('');
    setSelectedTime('');
    setPatientName('');
    setPatientPhone('');
    setPatientEmail('');
    setPatientInsurance('');
    setPatientNotes('');
  };

  return (
    <div 
      className={`min-h-full flex flex-col justify-between selection:bg-indigo-200 ${
        isInsidePreview ? 'p-3' : 'max-w-xl mx-auto p-4 sm:p-6 bg-white min-h-screen border-x border-slate-100 shadow-sm'
      }`}
      style={{ 
        backgroundColor: isInsidePreview ? '#ffffff' : config.backgroundColor,
        color: config.textColor,
        ...fontFamilyStyle
      }}
      id="public-booking-page"
    >
      
      {/* Top Brand Banner */}
      <div>
        <div className="flex flex-col items-center text-center space-y-3 pb-4 border-b border-slate-200 relative">
          
          {/* Capa/Banner behind inside browser mode */}
          {!isInsidePreview && config.bannerUrl && (
            <div className="w-full h-24 rounded-xl overflow-hidden mb-2 relative">
              <img 
                src={config.bannerUrl} 
                alt="Banner" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover filter brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          )}

          {/* Logo */}
          <div className="relative">
            <img 
              src={config.logoUrl} 
              alt={config.name} 
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-full border-2 object-cover bg-white shadow-xs"
              style={{ borderColor: config.primaryColor }}
            />
          </div>

          <div>
            <h1 className="font-bold text-base sm:text-lg leading-tight" style={{ color: config.textColor }}>
              {config.name}
            </h1>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Agendamento Online Seguro</p>
          </div>

          {/* Welcome Text in step 1 */}
          {step === 1 && (
            <p className="text-[11px] sm:text-xs text-slate-500 max-w-sm leading-relaxed px-2 font-medium">
              {config.welcomeText}
            </p>
          )}

          {/* Mini step bar */}
          {step < 5 && (
            <div className="flex items-center justify-center gap-1 mt-1">
              {[1, 2, 3, 4].map(s => (
                <div 
                  key={s} 
                  className="w-6 h-1 rounded-full transition-all duration-300"
                  style={{ 
                    backgroundColor: s === step ? config.primaryColor : s < step ? config.secondaryColor : '#e2e8f0'
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Step Content */}
        <div className="py-4 shrink-0">
          
          {/* STEP 1: CHOOSE PROCEDURE */}
          {step === 1 && (
            <div className="space-y-3">
              <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wider text-slate-400 mb-1">
                1. Escolha o Procedimento
              </h3>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {activeProcedures.map(proc => (
                  <button
                    key={proc.id}
                    type="button"
                    onClick={() => {
                      setSelectedProcedureId(proc.id);
                      setStep(2); // Auto proceed
                    }}
                    className={`w-full text-left p-3 border transition-all text-xs flex justify-between items-start gap-4 ${buttonRadiusClass} ${
                      selectedProcedureId === proc.id 
                        ? 'bg-sky-50/40 border-sky-400' 
                        : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50'
                    }`}
                    style={{ 
                      borderColor: selectedProcedureId === proc.id ? config.primaryColor : undefined
                    }}
                  >
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-800">{proc.name}</h4>
                      {proc.description && (
                        <p className="text-[10px] text-slate-400 mt-0.5 font-medium leading-relaxed truncate">{proc.description}</p>
                      )}
                      <span className="text-[10px] text-slate-400 font-bold block mt-1.5 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Duração aproximada: {proc.durationMinutes} min
                      </span>
                    </div>
                    
                    <span className="font-extrabold text-slate-700 text-xs sm:text-sm shrink-0">
                      {formatCurrency(proc.price)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: CHOOSE DENTIST */}
          {step === 2 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wider text-slate-400">
                  2. Selecione o Dentista
                </h3>
                <button 
                  onClick={handleBackStep}
                  className="text-[11px] font-bold underline text-slate-400 hover:text-slate-600"
                >
                  Voltar
                </button>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {activeDentists.map(dentist => (
                  <button
                    key={dentist.id}
                    type="button"
                    onClick={() => {
                      setSelectedDentistId(dentist.id);
                      setStep(3); // Auto proceed
                    }}
                    className={`w-full text-left p-3 border transition-all flex items-center gap-3 ${buttonRadiusClass} ${
                      selectedDentistId === dentist.id 
                        ? 'bg-sky-50/40 border-sky-400 shadow-2xs' 
                        : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50'
                    }`}
                    style={{ 
                      borderColor: selectedDentistId === dentist.id ? config.primaryColor : undefined
                    }}
                  >
                    <img 
                      src={dentist.photoUrl} 
                      alt={dentist.name} 
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-lg object-cover bg-slate-100 border border-slate-200"
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-800">{dentist.name}</h4>
                      <p className="text-[10px] text-sky-700 font-bold" style={{ color: config.secondaryColor }}>
                        {dentist.specialty}
                      </p>
                      {dentist.bio && (
                        <p className="text-[9px] text-slate-400 mt-0.5 truncate">{dentist.bio}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: SELECT DATE & TIME */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wider text-slate-400">
                  3. Escolha Dia e Hora
                </h3>
                <button 
                  onClick={handleBackStep}
                  className="text-[11px] font-bold underline text-slate-400 hover:text-slate-600"
                >
                  Voltar
                </button>
              </div>

              {/* Horizontal scroll dates */}
              <div className="space-y-1.5">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Selecione o Dia</span>
                <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
                  {availableDates.map(dateObj => {
                    const isSelected = selectedDate === dateObj.key;
                    return (
                      <button
                        key={dateObj.key}
                        type="button"
                        onClick={() => {
                          setSelectedDate(dateObj.key);
                          setSelectedTime(''); // clear selected hour
                        }}
                        className={`p-2 min-w-[56px] text-center border transition-all flex flex-col items-center shrink-0 ${buttonRadiusClass} ${
                          isSelected 
                            ? 'bg-sky-500 text-white shadow-2xs' 
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                        style={{ 
                          backgroundColor: isSelected ? config.primaryColor : undefined,
                          borderColor: isSelected ? config.primaryColor : undefined
                        }}
                      >
                        <span className="text-[9px] font-bold uppercase opacity-80">{dateObj.weekdayLabel}</span>
                        <span className="text-sm font-extrabold my-0.5">{dateObj.dayLabel}</span>
                        <span className="text-[8px] font-bold uppercase opacity-80">{dateObj.monthLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Available hours grid */}
              <div className="space-y-2">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Horários Disponíveis</span>
                
                {calculatedTimeSlots.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-32 overflow-y-auto pr-1">
                    {calculatedTimeSlots.map(time => {
                      const isSelected = selectedTime === time;
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => {
                            setSelectedTime(time);
                            setStep(4); // Auto proceed to info form
                          }}
                          className={`py-2 px-1 text-center border transition-all text-xs font-bold ${buttonRadiusClass} ${
                            isSelected 
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs' 
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                          style={{ 
                            backgroundColor: isSelected ? config.secondaryColor : undefined,
                            borderColor: isSelected ? config.secondaryColor : undefined
                          }}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 text-center text-[11px] text-slate-400 italic rounded-xl border border-slate-100">
                    Nenhum horário livre encontrado para este dentista nesta data. Tente selecionar outro dia acima ou escolha outro profissional.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: CONTACT INFORMATION */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wider text-slate-400">
                  4. Informe seus Contatos
                </h3>
                <button 
                  onClick={handleBackStep}
                  className="text-[11px] font-bold underline text-slate-400 hover:text-slate-600"
                >
                  Voltar
                </button>
              </div>

              <form onSubmit={handleConfirmBooking} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Seu Nome Completo</label>
                  <input 
                    type="text" 
                    placeholder="Nome e sobrenome"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-sky-500 focus:bg-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">WhatsApp / Telefone</label>
                    <input 
                      type="text" 
                      placeholder="(11) 99999-9999"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-sky-500 focus:bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">E-mail Principal</label>
                    <input 
                      type="email" 
                      placeholder="seuemail@provedor.com"
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-sky-500 focus:bg-white"
                      required
                    />
                  </div>
                </div>

                {/* Optional Insurance based on config trigger */}
                {config.showInsuranceField && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Plano ou Convênio Odontológico</label>
                    <input 
                      type="text" 
                      placeholder="Deixe em branco para particular"
                      value={patientInsurance}
                      onChange={(e) => setPatientInsurance(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-sky-500 focus:bg-white"
                    />
                  </div>
                )}

                {/* Optional Notes based on config trigger */}
                {config.showNotesField && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Observações / Sintomas</label>
                    <textarea 
                      placeholder="Ex: Muita sensibilidade no dente canal, receio de anestesia, etc."
                      value={patientNotes}
                      onChange={(e) => setPatientNotes(e.target.value)}
                      rows={2}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-sky-500 focus:bg-white resize-none"
                    />
                  </div>
                )}

                {/* Submit Confirm button */}
                <button
                  type="submit"
                  className="w-full py-3 text-xs sm:text-sm font-bold text-white shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  style={{ 
                    backgroundColor: config.primaryColor,
                    borderRadius: config.buttonRadius === 'square' ? '0px' : config.buttonRadius === 'full' ? '9999px' : '12px'
                  }}
                >
                  <Sparkles className="w-4.5 h-4.5 text-yellow-300" />
                  Confirmar Agendamento Automático
                </button>
              </form>
            </div>
          )}

          {/* STEP 5: BOOKING SUCCESS TIMELINE */}
          {step === 5 && (
            <div className="text-center py-6 space-y-4 animate-fade-in">
              <div 
                className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white shadow-lg animate-bounce"
                style={{ backgroundColor: '#10b981' }} // emerald-500 for success
              >
                <Check className="w-8 h-8" />
              </div>

              <div>
                <h3 className="font-extrabold text-slate-800 text-base sm:text-lg">Consulta Agendada!</h3>
                <p className="text-[11px] text-emerald-600 font-bold uppercase tracking-wider mt-1">Status: Confirmada com Sucesso</p>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed max-w-sm mx-auto">
                  Tudo certo! Seu agendamento foi sincronizado com o painel interno da clínica e um lembrete automático via WhatsApp será enviado 24h antes da consulta.
                </p>
              </div>

              {/* Receipt details */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 max-w-sm mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-400">Dentista</span>
                  <span className="font-bold text-slate-700">{selectedDentistObj?.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-400">Procedimento</span>
                  <span className="font-bold text-slate-700">{selectedProcedureObj?.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-400">Data e Hora</span>
                  <span className="font-bold text-indigo-600">{formatDateBR(selectedDate)} às {selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Localização</span>
                  <span className="font-medium text-slate-700 text-[10px] text-right truncate max-w-[200px]">{config.address}</span>
                </div>
              </div>

              {/* Close/Voltar button */}
              <button
                onClick={handleResetForm}
                className="px-5 py-2.5 text-xs font-bold text-white transition-colors"
                style={{ 
                  backgroundColor: config.primaryColor,
                  borderRadius: config.buttonRadius === 'square' ? '0px' : config.buttonRadius === 'full' ? '9999px' : '10px'
                }}
              >
                Realizar Novo Agendamento
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Footer copyright */}
      <div className="text-center pt-3 border-t border-slate-100 text-[9px] font-bold text-slate-400 flex items-center justify-center gap-1">
        <Stethoscope className="w-3.5 h-3.5" style={{ color: config.primaryColor }} />
        <span>OdontoAgenda © 2026 • Plataforma de Agendamento Certificada</span>
      </div>

    </div>
  );
}
