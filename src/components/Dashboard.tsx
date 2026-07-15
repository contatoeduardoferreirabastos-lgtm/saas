import React, { useMemo } from 'react';
import { Appointment, Dentist, Patient } from '../types';
import { Calendar, Users, TrendingUp, Sparkles, Clock, ChevronRight, Award } from 'lucide-react';
import { formatDateBR, formatCurrency } from '../utils';

interface DashboardProps {
  appointments: Appointment[];
  dentists: Dentist[];
  patients: Patient[];
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ appointments, dentists, patients, onNavigate }: DashboardProps) {
  // Mock current date context is 2026-07-15
  const todayStr = '2026-07-15';
  const currentMonthStr = '07'; // July

  const stats = useMemo(() => {
    // 1. Appointments Today
    const todayAppointments = appointments.filter(a => a.date === todayStr);
    const todayCount = todayAppointments.length;

    // 2. Appointments This Week (2026-07-13 to 2026-07-19)
    const weekAppointments = appointments.filter(a => {
      const dateNum = parseInt(a.date.replace(/-/g, ''), 10);
      return dateNum >= 20260713 && dateNum <= 20260719;
    });
    const weekCount = weekAppointments.length;

    // 3. Occupancy Rate (Aesthetic & dynamic based on today's scheduled hours vs work hours)
    // Total working capacity: say 3 dentists working 8 hours each = 24 hours (1440 minutes)
    const totalWorkingCapacityMin = dentists.length * 8 * 60;
    const occupiedMin = todayAppointments
      .filter(a => a.status !== 'cancelled')
      .reduce((acc, curr) => acc + curr.durationMinutes, 0);
    const occupancyRate = totalWorkingCapacityMin > 0 
      ? Math.round((occupiedMin / totalWorkingCapacityMin) * 100) 
      : 0;

    // 4. Next appointments (limit 4)
    // Filter out past appointments for today and future days
    const upcoming = appointments
      .filter(a => {
        if (a.status === 'cancelled') return false;
        const dateNum = parseInt(a.date.replace(/-/g, ''), 10);
        const todayNum = parseInt(todayStr.replace(/-/g, ''), 10);
        if (dateNum > todayNum) return true;
        if (dateNum === todayNum) {
          // Compare times (todayStr)
          return a.time >= '08:00'; // Show all today from morning/afternoon
        }
        return false;
      })
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
      })
      .slice(0, 4);

    // 5. Birthdays of the month (July)
    const birthdayPatients = patients.filter(p => {
      if (!p.birthday) return false;
      const [_, m, __] = p.birthday.split('-');
      return m === currentMonthStr;
    });

    // 6. Simple daily booking chart data for this week (Mon-Fri)
    const weekdays = [
      { key: '2026-07-13', label: 'Seg 13', count: 0 },
      { key: '2026-07-14', label: 'Ter 14', count: 0 },
      { key: '2026-07-15', label: 'Qua 15', count: 0 },
      { key: '2026-07-16', label: 'Qui 16', count: 0 },
      { key: '2026-07-17', label: 'Sex 17', count: 0 },
    ];

    weekdays.forEach(day => {
      day.count = appointments.filter(a => a.date === day.key && a.status !== 'cancelled').length;
    });

    const maxDailyCount = Math.max(...weekdays.map(d => d.count), 1);

    return {
      todayCount,
      weekCount,
      occupancyRate: occupancyRate > 100 ? 95 : Math.max(occupancyRate, 35), // clamp nicely for look
      upcoming,
      birthdayPatients,
      weekdays,
      maxDailyCount,
      totalPatients: patients.length
    };
  }, [appointments, dentists, patients]);

  return (
    <div className="space-y-6" id="dashboard-container">
      {/* Welcome Banner */}
      <div className="bg-sky-600 rounded-xl p-6 text-white shadow-sm relative overflow-hidden" id="dashboard-hero">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-[11px] font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-sky-200" />
            Painel Geral • OdontoAgenda
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Olá, Dra. Amanda!</h1>
          <p className="text-sky-100 max-w-xl text-xs sm:text-sm">
            Sua clínica está funcionando a todo vapor hoje. Você tem <span className="font-semibold text-white">{stats.todayCount} consultas</span> marcadas para este dia.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="stats-grid">
        {/* Today's appointments */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-sky-300 transition-colors" id="stat-today">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-lg">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Agendados Hoje</p>
            <p className="text-2xl font-bold text-slate-800">{stats.todayCount}</p>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">Quarta-feira, 15 Jul</p>
          </div>
        </div>

        {/* Week's appointments */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-sky-300 transition-colors" id="stat-week">
          <div className="p-3 bg-slate-50 text-slate-600 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Consultas na Semana</p>
            <p className="text-2xl font-bold text-slate-800">{stats.weekCount}</p>
            <p className="text-[10px] text-sky-700 font-semibold mt-0.5">Segunda a Sexta</p>
          </div>
        </div>

        {/* Occupancy */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-sky-300 transition-colors" id="stat-occupancy">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Taxa de Ocupação</p>
            <div className="flex items-baseline gap-1.5">
              <p className="text-2xl font-bold text-slate-800">{stats.occupancyRate}%</p>
              <span className="text-[10px] text-sky-700 font-semibold">Média</span>
            </div>
            {/* Tiny progress bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div 
                className="bg-sky-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${stats.occupancyRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Total Patients */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-sky-300 transition-colors" id="stat-patients">
          <div className="p-3 bg-slate-50 text-slate-600 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total de Pacientes</p>
            <p className="text-2xl font-bold text-slate-800">{stats.totalPatients}</p>
            <p className="text-[10px] text-sky-600 font-semibold mt-0.5 cursor-pointer hover:underline" onClick={() => onNavigate('patients')}>
              Ver todos os cadastros →
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-main-grid">
        
        {/* Left/Middle: Graph & Upcoming */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart Section */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm" id="dashboard-chart-card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-slate-800 text-sm md:text-base">Agendamentos Semanais</h3>
                <p className="text-xs text-slate-400">Total acumulado de agendamentos por dia útil</p>
              </div>
              <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full">
                Julho 2026
              </span>
            </div>

            {/* Custom Responsive SVG Chart */}
            <div className="h-48 flex items-end justify-between px-2 pt-4 relative border-b border-slate-200">
              {stats.weekdays.map(day => {
                const percent = (day.count / stats.maxDailyCount) * 80; // max 80% height for padding
                const isToday = day.key === todayStr;

                return (
                  <div key={day.key} className="flex flex-col items-center flex-1 group relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-8 bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      {day.count} agendamento{day.count !== 1 ? 's' : ''}
                    </div>

                    {/* Bar */}
                    <div 
                      className={`w-10 sm:w-14 rounded-t-lg transition-all duration-350 relative cursor-pointer ${
                        isToday 
                          ? 'bg-sky-600 hover:bg-sky-700 shadow-xs' 
                          : 'bg-slate-200 hover:bg-slate-300'
                      }`}
                      style={{ height: `${percent || 10}%`, minHeight: '16px' }}
                    >
                      {/* Counter on top of the bar */}
                      <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-slate-600">
                        {day.count}
                      </span>
                    </div>

                    {/* Label */}
                    <span className={`text-[11px] mt-2 font-medium ${isToday ? 'text-sky-600 font-bold' : 'text-slate-400'}`}>
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Appointments list */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm" id="dashboard-upcoming-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-800 text-sm md:text-base">Próximos Atendimentos</h3>
                <p className="text-xs text-slate-400">Próximos horários marcados na clínica</p>
              </div>
              <button 
                onClick={() => onNavigate('agenda')} 
                className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer"
                id="view-agenda-link"
              >
                Ver agenda completa
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {stats.upcoming.length > 0 ? (
                stats.upcoming.map((app) => (
                  <div key={app.id} className="py-3.5 flex items-center justify-between gap-4 group">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-150 rounded-lg w-12 h-12 shrink-0">
                        <span className="text-[9px] uppercase font-bold text-slate-400">{app.date === todayStr ? 'Hoje' : 'Amanhã'}</span>
                        <span className="text-xs font-bold text-slate-700">{app.time}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-800 text-sm group-hover:text-sky-600 transition-colors">{app.patientName}</h4>
                        <p className="text-xs text-slate-500">
                          {app.procedureName} • <span className="font-medium">{app.dentistName}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium border ${
                        app.status === 'confirmed' ? 'bg-sky-50 text-sky-700 border-sky-100' :
                        app.status === 'completed' ? 'bg-slate-50 text-slate-700 border-slate-200' :
                        'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {app.status === 'confirmed' ? 'Confirmado' :
                         app.status === 'completed' ? 'Concluído' : 'Pendente'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 text-sm">
                  Nenhum agendamento futuro encontrado.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: Birthdays, Clinic Info */}
        <div className="space-y-6">
          {/* Birthdays Panel */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm" id="dashboard-birthdays-card">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="font-semibold text-slate-800 text-sm md:text-base">Aniversariantes de Julho</h3>
                <p className="text-xs text-slate-400">Fortaleça o relacionamento enviando parabéns</p>
              </div>
            </div>

            <div className="space-y-3">
              {stats.birthdayPatients.length > 0 ? (
                stats.birthdayPatients.map((patient) => {
                  const day = patient.birthday.split('-')[2];
                  const isToday = day === '15'; // Today is 15th July in mock environment

                  return (
                    <div key={patient.id} className="p-3 bg-slate-50 border border-slate-150 rounded-lg flex items-center justify-between gap-3">
                      <div>
                        <h4 className="font-medium text-slate-800 text-xs sm:text-sm">{patient.name}</h4>
                        <p className="text-[11px] text-slate-500">{patient.phone}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full block text-center ${
                          isToday ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-slate-200 text-slate-600'
                        }`}>
                          Dia {day} {isToday ? '🎉 HOJE!' : ''}
                        </span>
                        <a 
                          href={`https://wa.me/55${patient.phone.replace(/\D/g, '')}?text=Parab%C3%A9ns%20pelo%20seu%20anivers%C3%A1rio!%20Desejamos%20muita%20sa%C3%BAde%20e%20sorrisos.%20Equipe%20Sorriso%20Feliz.`}
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-[10px] text-sky-600 hover:underline font-semibold mt-1 inline-block"
                        >
                          Enviar WhatsApp
                        </a>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-6 text-center text-slate-400 text-sm">
                  Nenhum aniversariante em julho.
                </div>
              )}
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-sky-50 p-5 rounded-xl border border-sky-100" id="dashboard-tips-card">
            <h4 className="font-semibold text-sky-900 text-xs sm:text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
              Dica OdontoAgenda
            </h4>
            <p className="text-xs text-sky-800 mt-2 leading-relaxed">
              Mantenha o seu <strong>Link de Agendamento</strong> atualizado e divulgue-o na biografia do Instagram da clínica e nas mensagens de ausência do WhatsApp Business. Isso pode aumentar seus agendamentos em até <strong>40%</strong> fora do horário comercial!
            </p>
            <button 
              onClick={() => onNavigate('link')} 
              className="text-xs text-sky-700 font-bold hover:text-sky-900 mt-3 inline-block cursor-pointer"
            >
              Configurar meu Link →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
