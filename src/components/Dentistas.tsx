import React, { useState } from 'react';
import { Dentist } from '../types';
import { Plus, User, Phone, Mail, Clock, Calendar, Briefcase, Trash2, Edit, X, Sparkles } from 'lucide-react';

interface DentistasProps {
  dentists: Dentist[];
  onAddDentist: (dentist: Omit<Dentist, 'id'>) => void;
  onUpdateDentist: (dentist: Dentist) => void;
  onDeleteDentist: (id: string) => void;
}

export default function Dentistas({ dentists, onAddDentist, onUpdateDentist, onDeleteDentist }: DentistasProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDentist, setEditingDentist] = useState<Dentist | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [workingDays, setWorkingDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri
  const [startHour, setStartHour] = useState('08:00');
  const [endHour, setEndHour] = useState('18:00');
  const [photoUrl, setPhotoUrl] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const daysOfWeekPT = [
    { value: 0, label: 'Dom' },
    { value: 1, label: 'Seg' },
    { value: 2, label: 'Ter' },
    { value: 3, label: 'Qua' },
    { value: 4, label: 'Qui' },
    { value: 5, label: 'Sex' },
    { value: 6, label: 'Sáb' },
  ];

  const handleOpenAdd = () => {
    setEditingDentist(null);
    setName('');
    setSpecialty('');
    setWorkingDays([1, 2, 3, 4, 5]);
    setStartHour('08:00');
    setEndHour('18:00');
    setPhotoUrl('https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300');
    setBio('');
    setEmail('');
    setPhone('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dentist: Dentist) => {
    setEditingDentist(dentist);
    setName(dentist.name);
    setSpecialty(dentist.specialty);
    setWorkingDays(dentist.workingDays);
    setStartHour(dentist.workingHours.start);
    setEndHour(dentist.workingHours.end);
    setPhotoUrl(dentist.photoUrl);
    setBio(dentist.bio || '');
    setEmail(dentist.email || '');
    setPhone(dentist.phone || '');
    setIsModalOpen(true);
  };

  const handleDayToggle = (dayValue: number) => {
    if (workingDays.includes(dayValue)) {
      setWorkingDays(workingDays.filter(d => d !== dayValue));
    } else {
      setWorkingDays([...workingDays, dayValue].sort());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name,
      specialty,
      workingDays,
      workingHours: { start: startHour, end: endHour },
      photoUrl,
      bio,
      email,
      phone
    };

    if (editingDentist) {
      onUpdateDentist({
        ...editingDentist,
        ...data
      });
    } else {
      onAddDentist(data);
    }
    setIsModalOpen(false);
  };
  return (
    <div className="space-y-6" id="dentistas-container">
      
      {/* Top action header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm" id="dentistas-header-bar">
        <div>
          <h3 className="font-semibold text-slate-800 text-sm md:text-base">Corpo Clínico</h3>
          <p className="text-xs text-slate-400">Gerencie os profissionais dentistas e seus horários de atendimento</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs px-3.5 py-2 rounded-lg shadow-sm shadow-sky-100 transition-colors cursor-pointer"
          id="add-dentist-btn"
        >
          <Plus className="w-4 h-4" />
          Adicionar Dentista
        </button>
      </div>

      {/* Grid of professional profile cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" id="dentistas-grid">
        {dentists.map((dentist) => (
          <div key={dentist.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden group hover:border-sky-300 transition-all flex flex-col justify-between h-full">
            
            {/* Header info */}
            <div>
              <div className="flex items-start gap-4">
                <img 
                  src={dentist.photoUrl} 
                  alt={dentist.name} 
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-xl object-cover shadow-sm bg-slate-50 shrink-0 border border-slate-200"
                />
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-800 text-sm sm:text-base truncate group-hover:text-sky-600 transition-colors">{dentist.name}</h4>
                  <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-100 mt-1 inline-block">
                    {dentist.specialty}
                  </span>
                </div>
              </div>

              {/* Bio/Short description */}
              {dentist.bio && (
                <p className="text-xs text-slate-500 mt-4 leading-relaxed line-clamp-2 italic">
                  "{dentist.bio}"
                </p>
              )}

              {/* Contacts */}
              <div className="mt-4 pt-3 border-t border-slate-200 space-y-2">
                {dentist.phone && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                    <Phone className="w-3.5 h-3.5 text-sky-600" />
                    <span>{dentist.phone}</span>
                  </div>
                )}
                {dentist.email && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold min-w-0">
                    <Mail className="w-3.5 h-3.5 text-sky-600" />
                    <span className="truncate">{dentist.email}</span>
                  </div>
                )}
              </div>

              {/* Schedule and working hours detail */}
              <div className="mt-4 bg-slate-50 p-3 rounded-lg border border-slate-250 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Horário de Trabalho
                  </span>
                  <span className="text-slate-700 font-bold">
                    {dentist.workingHours.start} - {dentist.workingHours.end}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 mt-2">
                  {daysOfWeekPT.map((d) => {
                    const isActive = dentist.workingDays.includes(d.value);
                    return (
                      <span 
                        key={d.value}
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          isActive 
                            ? 'bg-sky-600 text-white' 
                            : 'bg-slate-200/60 text-slate-400'
                        }`}
                      >
                        {d.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Action buttons (Footer of card) */}
            <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button 
                onClick={() => handleOpenEdit(dentist)}
                className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-slate-50 transition-colors cursor-pointer"
                title="Editar Profissional"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button 
                onClick={() => {
                  if (confirm(`Tem certeza que deseja remover o(a) dentista ${dentist.name}?`)) {
                    onDeleteDentist(dentist.id);
                  }
                }}
                className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-50 transition-colors cursor-pointer"
                title="Remover Profissional"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* MODAL: ADD / EDIT PROFESSIONAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-sky-600" />
                <h3 className="font-semibold text-slate-800 text-base">
                  {editingDentist ? 'Editar Dentista' : 'Cadastrar Novo Dentista'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Nome Completo</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Dr. Roberto Abreu"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 outline-none focus:border-sky-500 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Especialidade</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Endodontista, Geral"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 outline-none focus:border-sky-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Telefone de Contato</label>
                  <input 
                    type="text" 
                    placeholder="(11) 98888-8888"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">E-mail Corporativo</label>
                  <input 
                    type="email" 
                    placeholder="dentista@odontoagenda.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">URL da Foto</label>
                  <input 
                    type="text" 
                    placeholder="Cole o link da foto ou deixe o padrão"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Day selection */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Dias de Atendimento na Clínica</label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeekPT.map((d) => {
                    const isActive = workingDays.includes(d.value);
                    return (
                      <button
                        type="button"
                        key={d.value}
                        onClick={() => handleDayToggle(d.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                          isActive 
                            ? 'bg-sky-600 border-sky-600 text-white shadow-sm shadow-sky-100' 
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hours selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Início do Turno</label>
                  <input 
                    type="time" 
                    value={startHour}
                    onChange={(e) => setStartHour(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Término do Turno</label>
                  <input 
                    type="time" 
                    value={endHour}
                    onChange={(e) => setEndHour(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Short Bio */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Resumo Curto / Mini Bio</label>
                <textarea 
                  placeholder="Destaque especialidades, tempo de casa, etc..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 outline-none focus:border-sky-500 focus:bg-white resize-none"
                />
              </div>

              {/* Footer buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  {editingDentist ? 'Salvar Alterações' : 'Cadastrar Profissional'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
