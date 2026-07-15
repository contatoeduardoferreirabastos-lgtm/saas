import React, { useState } from 'react';
import { ClinicConfig } from '../types';
import { Settings, Shield, Clock, Phone, MapPin, Mail, Key, Users, Check, RefreshCw, X, Sparkles, Upload } from 'lucide-react';

interface ConfiguracoesProps {
  config: ClinicConfig;
  onUpdateConfig: (config: ClinicConfig) => void;
}

export default function Configuracoes({ config, onUpdateConfig }: ConfiguracoesProps) {
  const [localConfig, setLocalConfig] = useState<ClinicConfig>({ ...config });
  
  // Users list simulation
  const [users, setUsers] = useState([
    { id: 1, name: 'Dra. Amanda Silva', role: 'Administrador', email: 'amanda@sorrisofeliz.com.br', active: true },
    { id: 2, name: 'Juliana Costa', role: 'Recepcionista', email: 'juliana.recepcao@sorrisofeliz.com.br', active: true },
    { id: 3, name: 'Dr. Ricardo Ramos', role: 'Profissional Clínico', email: 'ricardo@sorrisofeliz.com.br', active: true }
  ]);

  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('Recepcionista');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  const daysOfWeekPT = [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Segunda-feira' },
    { value: 2, label: 'Terça-feira' },
    { value: 3, label: 'Quarta-feira' },
    { value: 4, label: 'Quinta-feira' },
    { value: 5, label: 'Sexta-feira' },
    { value: 6, label: 'Sábado' },
  ];

  const handleDayToggle = (day: number) => {
    const current = localConfig.workingHours.days;
    const next = current.includes(day)
      ? current.filter(d => d !== day)
      : [...current, day].sort();
    
    setLocalConfig(prev => ({
      ...prev,
      workingHours: { ...prev.workingHours, days: next }
    }));
  };

  const handleSaveClinicInfo = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(localConfig);
    alert('Configurações gerais salvas com sucesso!');
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUserName && newUserEmail) {
      setUsers([
        ...users,
        {
          id: Date.now(),
          name: newUserName,
          role: newUserRole,
          email: newUserEmail,
          active: true
        }
      ]);
      setNewUserName('');
      setNewUserEmail('');
      setIsAddUserModalOpen(false);
    }
  };

  const handleToggleUserActive = (id: number) => {
    setUsers(users.map(u => u.id === id ? { ...u, active: !u.active } : u));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="configuracoes-container">
      
      {/* Left Column: Clinic Data Forms */}
      <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-6" id="config-clinic-info-card">
        <div>
          <h3 className="font-semibold text-slate-800 text-sm md:text-base flex items-center gap-1.5">
            <Settings className="w-5 h-5 text-sky-600" />
            Configurações Gerais da Clínica
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Defina as informações básicas exibidas nos canais, comprovantes e canais públicos</p>
        </div>

        <form onSubmit={handleSaveClinicInfo} className="space-y-4">
          {/* Logo, Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">Nome Fantasia da Clínica</label>
              <input 
                type="text" 
                value={localConfig.name}
                onChange={(e) => setLocalConfig(prev => ({ ...prev, name: e.target.value }))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 outline-none focus:border-sky-500 focus:bg-white font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Telefone Principal</label>
              <input 
                type="text" 
                value={localConfig.phone}
                onChange={(e) => setLocalConfig(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 outline-none focus:border-sky-500 focus:bg-white"
                required
              />
            </div>
          </div>

          {/* Email & logo link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">E-mail de Contato Público</label>
              <input 
                type="email" 
                value={localConfig.email}
                onChange={(e) => setLocalConfig(prev => ({ ...prev, email: e.target.value }))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 outline-none focus:border-sky-500 focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Logotipo da Clínica (Upload de Arquivo)</label>
              <div className="flex items-center gap-3">
                {localConfig.logoUrl ? (
                  <div className="relative group shrink-0">
                    <img 
                      src={localConfig.logoUrl} 
                      alt="Logo Preview" 
                      className="w-12 h-12 rounded-full border-2 border-slate-200 object-cover bg-white shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setLocalConfig(prev => ({ ...prev, logoUrl: '' }))}
                      className="absolute -top-1 -right-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-0.5 shadow-md hover:scale-105 transition-transform cursor-pointer"
                      title="Remover logotipo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center shrink-0">
                    <Settings className="w-5 h-5 text-slate-400" />
                  </div>
                )}
                
                <div className="flex-1">
                  <label className="inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-lg border border-slate-300 cursor-pointer transition-colors w-full text-center">
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    Selecionar Arquivo de Logo
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setLocalConfig(prev => ({ ...prev, logoUrl: reader.result as string }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden" 
                    />
                  </label>
                  <span className="text-[10px] text-slate-400 mt-1 block">PNG, JPG, SVG de até 2MB</span>
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Endereço Completo</label>
            <input 
              type="text" 
              value={localConfig.address}
              onChange={(e) => setLocalConfig(prev => ({ ...prev, address: e.target.value }))}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 outline-none focus:border-sky-500 focus:bg-white"
              required
            />
          </div>

          {/* General working hours */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h4 className="font-semibold text-slate-700 text-xs flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-sky-600" />
              Horário de Funcionamento Comercial Geral
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Abertura da Clínica</label>
                <input 
                  type="time" 
                  value={localConfig.workingHours.start}
                  onChange={(e) => setLocalConfig(prev => ({ ...prev, workingHours: { ...prev.workingHours, start: e.target.value } }))}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Fechamento da Clínica</label>
                <input 
                  type="time" 
                  value={localConfig.workingHours.end}
                  onChange={(e) => setLocalConfig(prev => ({ ...prev, workingHours: { ...prev.workingHours, end: e.target.value } }))}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 outline-none"
                  required
                />
              </div>
            </div>

            {/* Days selection */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Dias Úteis de Trabalho</label>
              <div className="flex flex-wrap gap-1.5">
                {daysOfWeekPT.map(d => {
                  const isActive = localConfig.workingHours.days.includes(d.value);
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
          </div>

          <div className="flex items-center justify-end pt-3 border-t border-slate-200">
            <button 
              type="submit"
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-sm shadow-sky-100 transition-colors cursor-pointer"
            >
              Salvar Dados Básicos
            </button>
          </div>
        </form>

      </div>

      {/* Right Column: Panel Users & Roles & Permissions */}
      <div className="space-y-6 lg:col-span-1">
        
        {/* User permissions list card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4" id="config-users-permissions-card">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h4 className="font-semibold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
              <Users className="w-4 h-4 text-sky-600" />
              Usuários & Permissões
            </h4>
            <button 
              onClick={() => setIsAddUserModalOpen(true)}
              className="text-xs text-sky-600 hover:text-sky-800 font-bold cursor-pointer"
            >
              + Convidar
            </button>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {users.map(user => (
              <div key={user.id} className="p-3 bg-slate-50 border border-slate-250 rounded-lg flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h5 className="font-semibold text-slate-800 text-xs sm:text-sm">{user.name}</h5>
                  <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                  <span className="text-[9px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 uppercase mt-1.5 inline-block">{user.role}</span>
                </div>

                {/* Toggle switch for active user state */}
                <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                  <input 
                    type="checkbox" 
                    checked={user.active} 
                    onChange={() => handleToggleUserActive(user.id)}
                    className="sr-only peer" 
                  />
                  <div className="w-8 h-4.5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-sky-600" />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Info Box about Security */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-sky-600" />
            Políticas de Segurança
          </h4>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Todas as senhas de recepção e usuários são protegidas em chaves SHA-256 no backend. A clínica possui login individual auditado. Se desejar alterar a senha mestre de acesso do painel administrativo, acesse a central de credenciais do SaaS.
          </p>
        </div>

      </div>

      {/* MODAL: ADD PANEL USER */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-200">
            <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 text-sm">Convidar Novo Operador</h3>
              <button onClick={() => setIsAddUserModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Nome do Operador</label>
                <input 
                  type="text" 
                  placeholder="Ex: Juliana Castro"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 outline-none focus:border-sky-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">E-mail Corporativo</label>
                <input 
                  type="email" 
                  placeholder="operador@sorrisofeliz.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 outline-none focus:border-sky-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Nível de Permissão (Cargo)</label>
                <select 
                  value={newUserRole} 
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 outline-none"
                >
                  <option value="Recepcionista">Recepcionista (Visualizar Agenda & Cadastrar Paciente)</option>
                  <option value="Profissional Clínico">Profissional Clínico (Visualizar fichas & Agenda própria)</option>
                  <option value="Administrador">Administrador (Acesso total + Visualização Financeira/Cores)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button 
                  type="button" 
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Salvar e Convidar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
