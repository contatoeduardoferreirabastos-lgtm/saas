import React, { useState, useMemo } from 'react';
import { Patient, Appointment } from '../types';
import { Search, Plus, User, Phone, Mail, Calendar, Sparkles, FileText, Upload, Trash2, Edit2, Check, X, ClipboardList, Eye, Printer, Download } from 'lucide-react';
import { formatDateBR } from '../utils';

interface PacientesProps {
  patients: Patient[];
  appointments: Appointment[];
  onAddPatient: (patient: Omit<Patient, 'id'>) => void;
  onUpdatePatient: (patient: Patient) => void;
}

export default function Pacientes({ patients, appointments, onAddPatient, onUpdatePatient }: PacientesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(patients[0]?.id || null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Patient Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newBirthday, setNewBirthday] = useState('');
  const [newInsurance, setNewInsurance] = useState('');
  const [newObservations, setNewObservations] = useState('');

  // Observation Edit State (inline in details panel)
  const [isEditingObs, setIsEditingObs] = useState(false);
  const [editObsValue, setEditObsValue] = useState('');

  // Attachment Upload Form (simple simulation modal)
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
  const [newAttachmentName, setNewAttachmentName] = useState('');
  const [newAttachmentSize, setNewAttachmentSize] = useState('2.4 MB');
  const [uploadedBase64, setUploadedBase64] = useState<string>('');
  
  // Viewing attachment state
  const [activeViewingAttachment, setActiveViewingAttachment] = useState<any | null>(null);

  const selectedPatient = useMemo(() => {
    return patients.find(p => p.id === selectedPatientId);
  }, [patients, selectedPatientId]);

  const filteredPatients = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return patients;
    return patients.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.email.toLowerCase().includes(q) ||
        (p.insurance && p.insurance.toLowerCase().includes(q))
    );
  }, [patients, searchQuery]);

  // Aggregate past and future appointments for the selected patient
  const patientAppointments = useMemo(() => {
    if (!selectedPatient) return [];
    return appointments
      .filter(app => app.patientPhone === selectedPatient.phone || app.patientEmail === selectedPatient.email)
      .sort((a, b) => b.date.localeCompare(a.date)); // descending date order
  }, [selectedPatient, appointments]);

  const handleAddPatient = (e: React.FormEvent) => {
    e.preventDefault();
    const newPatient: Omit<Patient, 'id'> = {
      name: newName,
      email: newEmail,
      phone: newPhone,
      birthday: newBirthday,
      insurance: newInsurance || 'Particular',
      generalObservations: newObservations,
      history: [],
      attachments: []
    };
    onAddPatient(newPatient);
    setIsAddModalOpen(false);
    
    // Auto-select newly created patient if we want
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewBirthday('');
    setNewInsurance('');
    setNewObservations('');
  };

  const handleSaveObservations = () => {
    if (selectedPatient) {
      onUpdatePatient({
        ...selectedPatient,
        generalObservations: editObsValue
      });
      setIsEditingObs(false);
    }
  };

  const handleStartEditObservations = () => {
    if (selectedPatient) {
      setEditObsValue(selectedPatient.generalObservations || '');
      setIsEditingObs(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewAttachmentName(file.name);
      
      const sizeInBytes = file.size;
      const sizeInMB = sizeInBytes / (1024 * 1024);
      const sizeStr = sizeInMB > 1 
        ? `${sizeInMB.toFixed(1)} MB` 
        : `${(sizeInBytes / 1024).toFixed(0)} KB`;
      setNewAttachmentSize(sizeStr);

      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddAttachment = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPatient && newAttachmentName) {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      const updatedAttachments = [
        ...selectedPatient.attachments,
        {
          name: newAttachmentName.endsWith('.pdf') || newAttachmentName.endsWith('.png') || newAttachmentName.endsWith('.jpg') 
            ? newAttachmentName 
            : `${newAttachmentName}.pdf`,
          date: dateStr,
          size: newAttachmentSize || '1.8 MB',
          content: uploadedBase64 || undefined
        }
      ];
      onUpdatePatient({
        ...selectedPatient,
        attachments: updatedAttachments
      });
      setIsAttachmentModalOpen(false);
      setNewAttachmentName('');
      setUploadedBase64('');
    }
  };

  const handleDeleteAttachment = (index: number) => {
    if (selectedPatient) {
      const updated = [...selectedPatient.attachments];
      updated.splice(index, 1);
      onUpdatePatient({
        ...selectedPatient,
        attachments: updated
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="patients-container">
      
      {/* Left Column: Search & Patient List */}
      <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-sm" id="patients-list-card">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800 text-sm md:text-base">Fichas de Pacientes</h3>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs px-2.5 py-1.5 rounded-lg shadow-sm shadow-sky-100 transition-colors cursor-pointer"
            id="new-patient-btn"
          >
            <Plus className="w-3.5 h-3.5" />
            Cadastrar
          </button>
        </div>

        {/* Search bar */}
        <div className="relative" id="patient-search-wrapper">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Buscar por nome, fone, e-mail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all font-medium"
          />
        </div>

        {/* List items */}
        <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1" id="patients-scroll-list">
          {filteredPatients.length > 0 ? (
            filteredPatients.map(patient => (
              <button
                key={patient.id}
                onClick={() => {
                  setSelectedPatientId(patient.id);
                  setIsEditingObs(false);
                }}
                className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                  selectedPatientId === patient.id 
                    ? 'bg-sky-50 border-sky-200 text-sky-900' 
                    : 'bg-white border-transparent hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    selectedPatientId === patient.id ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {patient.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-xs sm:text-sm truncate">{patient.name}</h4>
                    <p className="text-[10px] text-slate-400 font-semibold truncate">{patient.phone}</p>
                  </div>
                </div>
                {patient.insurance && patient.insurance !== 'Particular' && (
                  <span className="text-[9px] bg-slate-150 text-slate-600 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
                    {patient.insurance.split(' ')[0]}
                  </span>
                )}
              </button>
            ))
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Nenhum paciente cadastrado encontrado.
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Complete details panel */}
      <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm" id="patient-details-card">
        {selectedPatient ? (
          <div className="space-y-6" id="patient-selected-panel">
            {/* Profile Info Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  {selectedPatient.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <h2 className="font-bold text-slate-800 text-lg md:text-xl tracking-tight">{selectedPatient.name}</h2>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    Nascimento: {formatDateBR(selectedPatient.birthday)}
                  </p>
                </div>
              </div>

              {/* Badges / Convênio */}
              <div className="text-left sm:text-right">
                <span className="text-xs text-slate-400 block font-bold uppercase tracking-wider">Convênio / Seguro</span>
                <span className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-100 inline-block mt-1">
                  {selectedPatient.insurance || 'Nenhum (Particular)'}
                </span>
              </div>
            </div>

            {/* Quick Contacts details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-150">
              <div className="flex items-center gap-2.5 text-slate-600">
                <Phone className="w-4 h-4 text-sky-600 shrink-0" />
                <div className="min-w-0">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold">Telefone Principal</span>
                  <span className="text-xs font-semibold text-slate-700">{selectedPatient.phone}</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600">
                <Mail className="w-4 h-4 text-sky-600 shrink-0" />
                <div className="min-w-0">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold">E-mail Cadastrado</span>
                  <span className="text-xs font-semibold text-slate-700 truncate block">{selectedPatient.email}</span>
                </div>
              </div>
            </div>

            {/* General Medical Notes / Observations */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-xs sm:text-sm uppercase tracking-wide flex items-center gap-1.5">
                  <ClipboardList className="w-4 h-4 text-sky-600" />
                  Observações Clínicas Gerais
                </h4>
                {isEditingObs ? (
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={handleSaveObservations}
                      className="p-1 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setIsEditingObs(false)}
                      className="p-1 text-slate-400 hover:bg-slate-50 rounded cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={handleStartEditObservations}
                    className="text-xs text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer font-semibold"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Editar
                  </button>
                )}
              </div>

              {isEditingObs ? (
                <textarea
                  value={editObsValue}
                  onChange={(e) => setEditObsValue(e.target.value)}
                  rows={3}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-700 outline-none focus:border-sky-500 focus:bg-white resize-none"
                />
              ) : (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 min-h-[60px] text-xs text-slate-600 leading-relaxed italic">
                  {selectedPatient.generalObservations || 'Nenhuma observação clínica registrada para este paciente.'}
                </div>
              )}
            </div>

            {/* History of Consultations (Timeline) */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm uppercase tracking-wide">Histórico de Consultas</h4>
              <div className="relative border-l-2 border-slate-200 pl-4 space-y-4">
                {patientAppointments.length > 0 ? (
                  patientAppointments.map((app) => (
                    <div key={app.id} className="relative group">
                      {/* Timeline dot */}
                      <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white ${
                        app.status === 'completed' ? 'bg-slate-400' : 'bg-sky-600'
                      }`} />
                      
                      {/* Box content */}
                      <div className="text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-500">{formatDateBR(app.date)} • {app.time}</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${
                            app.status === 'completed' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                            app.status === 'confirmed' ? 'bg-sky-50 text-sky-750 border-sky-100' :
                            'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {app.status === 'completed' ? 'Concluída' : app.status === 'confirmed' ? 'Confirmada' : 'Pendente'}
                          </span>
                        </div>
                        <p className="font-bold text-slate-700 mt-1">{app.procedureName}</p>
                        <p className="text-slate-500">Dentista responsável: <span className="font-medium text-slate-700">{app.dentistName}</span></p>
                        {app.notes && (
                          <p className="text-slate-500 italic mt-1 bg-slate-50 p-1.5 rounded border border-slate-150 max-w-md">
                            "{app.notes}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 italic py-2">
                    Nenhuma consulta registrada na agenda para este paciente.
                  </div>
                )}
              </div>
            </div>

            {/* Simple Attachments section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-xs sm:text-sm uppercase tracking-wide">Anexos & Exames (Raio-X, PDFs)</h4>
                <button 
                  onClick={() => setIsAttachmentModalOpen(true)}
                  className="text-xs text-sky-600 hover:text-sky-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Anexar arquivo
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedPatient.attachments.length > 0 ? (
                  selectedPatient.attachments.map((file, index) => (
                    <div key={index} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3 hover:border-sky-300 hover:bg-sky-50/10 transition-all group">
                      <div 
                        className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                        onClick={() => setActiveViewingAttachment(file)}
                        title="Clique para abrir o anexo"
                      >
                        <div className="p-1.5 bg-sky-50 rounded-md text-sky-600 shrink-0 group-hover:bg-sky-100 transition-colors">
                          <FileText className="w-4.5 h-4.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="block text-xs font-semibold text-slate-700 truncate group-hover:text-sky-700 transition-colors">{file.name}</span>
                          <span className="text-[10px] text-slate-400 block font-medium">{file.date} • {file.size}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 shrink-0">
                        <button 
                          onClick={() => setActiveViewingAttachment(file)}
                          className="text-slate-400 hover:text-sky-600 p-1 cursor-pointer"
                          title="Visualizar"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteAttachment(index)}
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="sm:col-span-2 py-6 text-center text-slate-400 text-xs italic bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    Nenhum exame anexado. Clique no botão acima para anexar arquivos.
                  </div>
                )}
              </div>
            </div>

          </div>
        ) : (
          <div className="py-24 text-center text-slate-400" id="patient-empty-panel">
            Selecione um paciente na lista à esquerda para ver os detalhes da ficha clínica.
          </div>
        )}
      </div>

      {/* MODAL: NEW PATIENT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-sky-600" />
                <h3 className="font-semibold text-slate-800 text-base">Novo Cadastro de Paciente</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPatient} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Nome Completo</label>
                <input 
                  type="text" 
                  placeholder="Nome do paciente"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 outline-none focus:border-sky-500 focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Telefone Celular</label>
                  <input 
                    type="text" 
                    placeholder="(11) 99999-9999"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 outline-none focus:border-sky-500 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">E-mail</label>
                  <input 
                    type="email" 
                    placeholder="paciente@email.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 outline-none focus:border-sky-500 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Data de Nascimento</label>
                  <input 
                    type="date" 
                    value={newBirthday}
                    onChange={(e) => setNewBirthday(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 outline-none focus:border-sky-500 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Convênio / Seguro</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Amil, Bradesco, Particular..."
                    value={newInsurance}
                    onChange={(e) => setNewInsurance(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 outline-none focus:border-sky-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Observações Clínicas Iniciais (Opcional)</label>
                <textarea 
                  placeholder="Alergias conhecidas, sensibilidade dental, receios..."
                  value={newObservations}
                  onChange={(e) => setNewObservations(e.target.value)}
                  rows={2}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 outline-none focus:border-sky-500 focus:bg-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cadastrar Paciente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD ATTACHMENT */}
      {isAttachmentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-200">
            <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 text-sm">Anexar Documento / Raio-X</h3>
              <button onClick={() => setIsAttachmentModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAttachment} className="p-5 space-y-4">
              {/* Custom interactive file uploader box */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Escolher arquivo local</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50 hover:bg-slate-100/50 transition-colors text-center relative group">
                  <input 
                    type="file" 
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="space-y-1">
                    <div className="mx-auto w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-600 group-hover:scale-105 transition-transform">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold text-slate-700">Arraste ou clique para selecionar</p>
                    <p className="text-[10px] text-slate-400">Imagens (PNG, JPG) ou PDFs de até 5MB</p>
                  </div>
                </div>
              </div>

              {/* Editable file name */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Nome do Arquivo no Prontuário</label>
                <input 
                  type="text" 
                  placeholder="Ex: Raio_X_Lateral, Tomografia..."
                  value={newAttachmentName}
                  onChange={(e) => setNewAttachmentName(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 outline-none focus:border-sky-500 focus:bg-white font-medium"
                  required
                />
              </div>

              {/* Simulated File Size Display */}
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Tamanho Detectado</span>
                <span className="font-bold text-slate-700">{newAttachmentSize}</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsAttachmentModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Salvar Anexo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW ATTACHMENT */}
      {activeViewingAttachment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 animate-slide-up">
            <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-600" />
                <div>
                  <h3 className="font-bold text-slate-800 text-sm truncate max-w-[280px] sm:max-w-xs">{activeViewingAttachment.name}</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Anexado em {activeViewingAttachment.date} • {activeViewingAttachment.size}</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveViewingAttachment(null)} 
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              
              {/* Document display routing */}
              {activeViewingAttachment.content ? (
                /* Real base64 file upload preview */
                activeViewingAttachment.content.startsWith('data:image/') ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center p-2 max-h-96">
                    <img 
                      src={activeViewingAttachment.content} 
                      alt={activeViewingAttachment.name} 
                      className="max-w-full max-h-80 object-contain rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center space-y-3">
                    <FileText className="w-12 h-12 text-slate-400 mx-auto" />
                    <div>
                      <p className="text-xs font-bold text-slate-700">Visualização de PDF não disponível diretamente no navegador</p>
                      <p className="text-[10px] text-slate-400 mt-1">Este arquivo está guardado de forma segura no prontuário digital.</p>
                    </div>
                    <a 
                      href={activeViewingAttachment.content} 
                      download={activeViewingAttachment.name}
                      className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Baixar Arquivo PDF
                    </a>
                  </div>
                )
              ) : activeViewingAttachment.name.includes('Raio-X') ? (
                /* Gorgeous stylized dental X-ray visualization */
                <div className="space-y-2">
                  <div className="bg-slate-950 border-4 border-slate-800 p-4 rounded-xl flex flex-col items-center justify-center relative select-none">
                    <div className="absolute top-2 left-3 text-[8px] font-bold text-sky-400 font-mono tracking-widest uppercase">RX LABS INC • {activeViewingAttachment.date}</div>
                    <div className="absolute top-2 right-3 text-[8px] font-bold text-rose-400 font-mono tracking-widest">DR. R. RAMOS</div>
                    
                    <div className="w-full h-44 rounded-lg bg-slate-900 flex items-center justify-center overflow-hidden border border-slate-800 my-2">
                      <svg viewBox="0 0 200 100" className="w-64 h-32 text-white/40 drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]">
                        <path d="M 20 80 Q 100 20 180 80" stroke="currentColor" strokeWidth="6" fill="none" strokeDasharray="3 3" />
                        
                        {/* Upper teeth skeletons */}
                        {[30, 50, 70, 90, 110, 130, 150, 170].map((x, i) => (
                          <g key={i} transform={`translate(${x - 8}, ${60 - Math.sin((x-20)/160*Math.PI)*30})`}>
                            <rect x="2" y="0" width="12" height="18" rx="4" fill="currentColor" opacity="0.65" />
                            <path d="M 4 18 Q 8 28 8 28 Q 12 18 12 18" stroke="currentColor" strokeWidth="2.5" fill="none" />
                          </g>
                        ))}
                        
                        {/* Lower arch path */}
                        <path d="M 25 90 Q 100 40 175 90" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.3" />
                      </svg>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest text-center">ARCADA SUPERIOR COMPLETA - RADIOGRAFIA PANORÂMICA</span>
                  </div>
                  <div className="p-3 bg-sky-50 rounded-lg border border-sky-100 text-[11px] text-sky-850">
                    <strong>Laudo Preliminar:</strong> Elementos dentários íntegros, sem sinais de lesões periapicais agudas ou reabsorções ósseas patológicas visíveis na arcada superior.
                  </div>
                </div>
              ) : (
                /* Gorgeous stylized medical prescription/planning layout for Plano de Tratamento or Tomografia */
                <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-xs space-y-4 text-slate-700">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="font-extrabold text-sm text-sky-900 tracking-wide uppercase">Clínica Sorriso Feliz</h4>
                      <p className="text-[10px] text-slate-400 font-semibold block mt-0.5">Gestão Odontológica Integral</p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">PRONTUÁRIO #{selectedPatient.id.toUpperCase()}</span>
                  </div>

                  <div className="text-xs space-y-1">
                    <p><strong>Paciente:</strong> {selectedPatient.name}</p>
                    <p><strong>Data de Emissão:</strong> {activeViewingAttachment.date}</p>
                    <p><strong>Exame/Ficha:</strong> {activeViewingAttachment.name}</p>
                  </div>

                  <div className="space-y-1.5 border-t border-slate-100 pt-3 text-xs">
                    <p className="font-bold text-slate-800 text-xs sm:text-sm">Especificações Gerais:</p>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-150 leading-relaxed italic text-[11px] text-slate-600">
                      {activeViewingAttachment.name.includes('Plano') ? (
                        <>
                          1. Limpeza profilática e remoção de tártaros periódica (concluído)<br/>
                          2. Clareamento dental a laser de consultório (confirmado)<br/>
                          3. Instalação e ativação semanal de alinhadores invisíveis estéticos.<br/>
                          <span className="block mt-2 font-bold text-slate-800 text-xs">Atenção ao paciente: {selectedPatient.generalObservations || 'Sem restrições anotadas.'}</span>
                        </>
                      ) : (
                        <>
                          Exame tomográfico computadorizado da região mandibular para estudo de implante dentário de precisão.<br/>
                          Densidade óssea preservada com margem segura de 12.8mm para fixação de pino protético sem invasão do canal alveolar mandibular.
                        </>
                      )}
                    </div>
                  </div>

                  {/* Doctor Signature Block */}
                  <div className="pt-6 flex flex-col items-end text-right border-t border-slate-100">
                    <div className="w-36 border-b border-slate-300 pb-1 flex items-center justify-center italic text-xs text-slate-400">
                      Assinado Digitalmente
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 mt-1 uppercase">Dra. Amanda Silva</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Ortodontista Chefe • CRO-SP 98765</span>
                  </div>
                </div>
              )}

              {/* Action Toolbar buttons */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-200">
                <button 
                  onClick={() => alert('Impressão de documento iniciada (simulado)')}
                  className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-lg border border-slate-300 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir
                </button>
                
                <button 
                  onClick={() => setActiveViewingAttachment(null)}
                  className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer"
                >
                  Fechar Visualizador
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
