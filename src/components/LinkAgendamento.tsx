import React, { useState, useEffect } from 'react';
import { ClinicConfig, Dentist, Procedure } from '../types';
import { Link, Copy, Check, RefreshCw, Eye, EyeOff, Layout, Type, Sparkles, Sliders, Palette, CheckSquare, Square, Smartphone, Tablet, Monitor } from 'lucide-react';
import BookingPage from './BookingPage';

interface LinkAgendamentoProps {
  config: ClinicConfig;
  dentists: Dentist[];
  procedures: Procedure[];
  onUpdateConfig: (config: ClinicConfig) => void;
  onResetDefaults: () => void;
}

export default function LinkAgendamento({ config, dentists, procedures, onUpdateConfig, onResetDefaults }: LinkAgendamentoProps) {
  const [localConfig, setLocalConfig] = useState<ClinicConfig>({ ...config });
  const [copied, setCopied] = useState(false);
  const [slugStatus, setSlugStatus] = useState<'checking' | 'available' | 'idle'>('idle');
  const [activePreviewDevice, setActivePreviewDevice] = useState<'mobile' | 'tablet'>('mobile');

  // Synchronize localConfig if prop changes
  useEffect(() => {
    setLocalConfig({ ...config });
  }, [config]);

  const handleCopyLink = () => {
    const fullLink = `${window.location.origin}/?slug=${localConfig.slug}`;
    navigator.clipboard.writeText(fullLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setLocalConfig(prev => ({ ...prev, slug: rawValue }));
    
    // Simulate real-time check
    setSlugStatus('checking');
    setTimeout(() => {
      setSlugStatus('available');
    }, 600);
  };

  const handleSave = () => {
    onUpdateConfig(localConfig);
  };

  const handleToggleDentist = (id: string) => {
    setLocalConfig(prev => {
      const current = prev.allowedDentists;
      const next = current.includes(id) 
        ? current.filter(x => x !== id) 
        : [...current, id];
      return { ...prev, allowedDentists: next };
    });
  };

  const handleToggleProcedure = (id: string) => {
    setLocalConfig(prev => {
      const current = prev.allowedProcedures;
      const next = current.includes(id) 
        ? current.filter(x => x !== id) 
        : [...current, id];
      return { ...prev, allowedProcedures: next };
    });
  };

  // Generate a mock SVG QR Code for real-time visual fidelity
  const qrCodeSvg = (
    <svg viewBox="0 0 100 100" className="w-24 h-24 text-slate-800">
      {/* Outer borders and squares for a realistic QR look */}
      <rect x="0" y="0" width="100" height="100" fill="white" />
      <rect x="10" y="10" width="30" height="30" fill="currentColor" />
      <rect x="15" y="15" width="20" height="20" fill="white" />
      <rect x="18" y="18" width="14" height="14" fill="currentColor" />
      
      <rect x="60" y="10" width="30" height="30" fill="currentColor" />
      <rect x="65" y="15" width="20" height="20" fill="white" />
      <rect x="68" y="18" width="14" height="14" fill="currentColor" />

      <rect x="10" y="60" width="30" height="30" fill="currentColor" />
      <rect x="15" y="65" width="20" height="20" fill="white" />
      <rect x="18" y="68" width="14" height="14" fill="currentColor" />

      {/* Random small QR spots */}
      <rect x="45" y="15" width="6" height="6" fill="currentColor" />
      <rect x="45" y="27" width="10" height="4" fill="currentColor" />
      <rect x="15" y="45" width="4" height="10" fill="currentColor" />
      <rect x="25" y="48" width="8" height="6" fill="currentColor" />

      <rect x="48" y="48" width="20" height="20" fill="currentColor" />
      <rect x="53" y="53" width="10" height="10" fill="white" />
      <rect x="56" y="56" width="4" height="4" fill="currentColor" />

      <rect x="75" y="45" width="10" height="10" fill="currentColor" />
      <rect x="80" y="65" width="8" height="15" fill="currentColor" />
      <rect x="48" y="75" width="15" height="10" fill="currentColor" />
      <rect x="68" y="80" width="12" height="6" fill="currentColor" />
    </svg>
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="link-agendamento-container">
      
      {/* Left Columns (5/12 or 6/12): Customization Controls */}
      <div className="xl:col-span-7 bg-white rounded-xl border border-slate-200 p-5 space-y-6 shadow-sm h-[720px] overflow-y-auto" id="link-controls-panel">
        
        {/* Title */}
        <div>
          <h3 className="font-semibold text-slate-800 text-sm md:text-base flex items-center gap-1.5">
            <Link className="w-5 h-5 text-sky-600" />
            Configuração do Link de Agendamento
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Customize todo o fluxo de reservas dos pacientes sem mexer em nenhuma linha de código</p>
        </div>

        {/* 1. Slug Link Generation Box */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3" id="link-slug-config">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Seu Link Exclusivo</label>
          <div className="flex gap-2">
            <div className="flex-1 flex rounded-lg border border-slate-200 bg-white overflow-hidden focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500 transition-all">
              <span className="inline-flex items-center px-3 bg-slate-100 text-slate-400 text-xs font-semibold select-none border-r border-slate-200">
                odontoagenda.app/
              </span>
              <div className="relative flex-1">
                <input 
                  type="text" 
                  value={localConfig.slug}
                  onChange={handleSlugChange}
                  className="w-full text-xs px-3 py-2.5 bg-transparent border-0 text-slate-700 font-semibold outline-none"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {slugStatus === 'checking' ? (
                    <RefreshCw className="w-3.5 h-3.5 text-slate-400 animate-spin" />
                  ) : slugStatus === 'available' ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded">OK</span>
                  ) : null}
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleCopyLink}
              className="px-3.5 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 font-semibold text-xs transition-colors flex items-center gap-1 shrink-0 cursor-pointer shadow-sm shadow-sky-100"
              title="Copiar Link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-350" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>

          {/* Quick QR Code download view */}
          <div className="flex items-center gap-4 pt-2 bg-white p-3 rounded-lg border border-slate-200">
            {qrCodeSvg}
            <div className="space-y-1">
              <h4 className="font-bold text-slate-700 text-xs">QR Code da Clínica</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed max-w-xs">
                Imprima e cole no balcão da recepção ou adicione em folhetos. Seus pacientes só precisam apontar a câmera do celular.
              </p>
              <button 
                type="button" 
                onClick={() => alert('Download do QR Code iniciado (simulado)')}
                className="text-[10px] text-sky-650 font-bold hover:underline cursor-pointer"
              >
                Baixar QR Code (PNG) ↓
              </button>
            </div>
          </div>
        </div>

        {/* 2. Visual Personalization controls */}
        <div className="space-y-4" id="link-visual-controls">
          <h4 className="font-bold text-slate-700 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-2">
            <Palette className="w-4 h-4 text-sky-600" />
            Identidade Visual & Cores
          </h4>

          {/* Color pickers */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Cor Primária</label>
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1.5">
                <input 
                  type="color" 
                  value={localConfig.primaryColor}
                  onChange={(e) => setLocalConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="w-7 h-7 rounded cursor-pointer border-0 p-0 bg-transparent"
                />
                <span className="text-[10px] font-mono text-slate-500 uppercase">{localConfig.primaryColor}</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Cor Secundária</label>
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1.5">
                <input 
                  type="color" 
                  value={localConfig.secondaryColor}
                  onChange={(e) => setLocalConfig(prev => ({ ...prev, secondaryColor: e.target.value }))}
                  className="w-7 h-7 rounded cursor-pointer border-0 p-0 bg-transparent"
                />
                <span className="text-[10px] font-mono text-slate-500 uppercase">{localConfig.secondaryColor}</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Cor do Fundo</label>
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1.5">
                <input 
                  type="color" 
                  value={localConfig.backgroundColor}
                  onChange={(e) => setLocalConfig(prev => ({ ...prev, backgroundColor: e.target.value }))}
                  className="w-7 h-7 rounded cursor-pointer border-0 p-0 bg-transparent"
                />
                <span className="text-[10px] font-mono text-slate-500 uppercase">{localConfig.backgroundColor}</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Cor do Texto</label>
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1.5">
                <input 
                  type="color" 
                  value={localConfig.textColor}
                  onChange={(e) => setLocalConfig(prev => ({ ...prev, textColor: e.target.value }))}
                  className="w-7 h-7 rounded cursor-pointer border-0 p-0 bg-transparent"
                />
                <span className="text-[10px] font-mono text-slate-500 uppercase">{localConfig.textColor}</span>
              </div>
            </div>
          </div>

          {/* Font & Button Style selector */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
                <Type className="w-3.5 h-3.5 text-slate-400" />
                Fonte das Letras
              </label>
              <select 
                value={localConfig.fontFamily}
                onChange={(e) => setLocalConfig(prev => ({ ...prev, fontFamily: e.target.value as ClinicConfig['fontFamily'] }))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 font-semibold outline-none"
              >
                <option value="Inter">Inter (Clássica/Médica)</option>
                <option value="Space Grotesk">Space Grotesk (Moderna)</option>
                <option value="Outfit">Outfit (Tecnológica/Suave)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
                <Layout className="w-3.5 h-3.5 text-slate-400" />
                Estilo dos Botões
              </label>
              <select 
                value={localConfig.buttonRadius}
                onChange={(e) => setLocalConfig(prev => ({ ...prev, buttonRadius: e.target.value as ClinicConfig['buttonRadius'] }))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 font-semibold outline-none"
              >
                <option value="square">Quadrados</option>
                <option value="rounded">Bordas Arredondadas</option>
                <option value="full">Completamente Redondos</option>
              </select>
            </div>
          </div>

          {/* Welcome editable text */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Texto de Boas-vindas da Clínica</label>
            <textarea 
              value={localConfig.welcomeText}
              onChange={(e) => setLocalConfig(prev => ({ ...prev, welcomeText: e.target.value }))}
              rows={2}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 outline-none focus:border-sky-500 focus:bg-white resize-none font-medium"
            />
          </div>
        </div>

        {/* 3. Form fields config */}
        <div className="space-y-4" id="link-fields-config">
          <h4 className="font-bold text-slate-700 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-2">
            <Sliders className="w-4 h-4 text-sky-600" />
            Campos do Formulário Público
          </h4>
          
          <div className="flex flex-wrap gap-4 bg-slate-50/50 p-3 rounded-lg border border-slate-200">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600 select-none">
              <input 
                type="checkbox" 
                checked={localConfig.showInsuranceField}
                onChange={(e) => setLocalConfig(prev => ({ ...prev, showInsuranceField: e.target.checked }))}
                className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-400 cursor-pointer"
              />
              Mostrar campo "Convênio"
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600 select-none">
              <input 
                type="checkbox" 
                checked={localConfig.showNotesField}
                onChange={(e) => setLocalConfig(prev => ({ ...prev, showNotesField: e.target.checked }))}
                className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-400 cursor-pointer"
              />
              Mostrar campo "Observações"
            </label>
          </div>
        </div>

        {/* 4. Active Dentists & Procedures selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="link-filters-config">
          
          {/* Dentists to list */}
          <div className="space-y-2">
            <h5 className="font-bold text-slate-700 text-xs">Quais Dentistas listar?</h5>
            <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-36 overflow-y-auto bg-slate-50/30 p-1">
              {dentists.map(d => {
                const checked = localConfig.allowedDentists.includes(d.id);
                return (
                  <label key={d.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 cursor-pointer text-xs text-slate-600 font-bold select-none">
                    <input 
                      type="checkbox" 
                      checked={checked}
                      onChange={() => handleToggleDentist(d.id)}
                      className="w-3.5 h-3.5 text-sky-600 border-slate-300 rounded focus:ring-sky-400 cursor-pointer"
                    />
                    <span>{d.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Procedures to list */}
          <div className="space-y-2">
            <h5 className="font-bold text-slate-700 text-xs">Quais Procedimentos expor?</h5>
            <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-36 overflow-y-auto bg-slate-50/30 p-1">
              {procedures.map(p => {
                const checked = localConfig.allowedProcedures.includes(p.id);
                return (
                  <label key={p.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 cursor-pointer text-xs text-slate-600 font-bold select-none">
                    <input 
                      type="checkbox" 
                      checked={checked}
                      onChange={() => handleToggleProcedure(p.id)}
                      className="w-3.5 h-3.5 text-sky-600 border-slate-300 rounded focus:ring-sky-400 cursor-pointer"
                    />
                    <span className="truncate">{p.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer save/restore buttons */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <button 
            type="button" 
            onClick={onResetDefaults}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 underline cursor-pointer"
          >
            Restaurar Configurações Padrão
          </button>
          
          <button 
            type="button" 
            onClick={handleSave}
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold text-xs shadow-sm shadow-sky-100 transition-colors flex items-center gap-1.5 cursor-pointer"
            id="save-branding-btn"
          >
            <Sparkles className="w-4 h-4 text-yellow-300 shrink-0" />
            Salvar e Aplicar Alterações
          </button>
        </div>

      </div>

      {/* Right Column (5/12): Live preview screen mockup */}
      <div className="xl:col-span-5 flex flex-col items-center justify-start space-y-4" id="link-preview-panel">
        
        {/* Device switcher toolbar */}
        <div className="flex items-center justify-between w-full px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Preview ao Vivo em Tempo Real</span>
          </div>

          <div className="flex bg-slate-100 rounded-lg p-0.5">
            <button 
              onClick={() => setActivePreviewDevice('mobile')} 
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${activePreviewDevice === 'mobile' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
              title="Celular"
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setActivePreviewDevice('tablet')} 
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${activePreviewDevice === 'tablet' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
              title="Tablet"
            >
              <Tablet className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Device Wrapper container */}
        <div className="w-full flex items-center justify-center bg-slate-100 rounded-2xl border border-slate-200/60 p-4 relative" id="mock-device-viewport">
          
          {/* Inner device shell mock with explicit width based on selected device */}
          <div className={`bg-white border-[10px] border-slate-900 overflow-hidden shadow-2xl relative flex flex-col h-[580px] transition-all duration-350 ${
            activePreviewDevice === 'mobile' ? 'w-[320px] rounded-[32px]' : 'w-[480px] rounded-[24px]'
          }`}>
            
            {/* Camera notch/sensor notch mock for mobile, or tablet camera for tablet */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-900 rounded-b-xl z-30 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-slate-800 mr-2" />
              <div className="w-8 h-1 bg-slate-800 rounded" />
            </div>

            {/* Inner frame viewport */}
            <div className="w-full h-full overflow-y-auto select-none" id="preview-frame-scroll">
              
              {/* Dynamic render of BookingPage inside mock frame */}
              <BookingPage 
                config={localConfig}
                dentists={dentists}
                procedures={procedures}
                onNewBookingSimulation={(booking) => {
                  alert(`[Preview Simulado] Você enviou com sucesso um agendamento para ${booking.patientName}! No sistema de produção, ele seria adicionado instantaneamente.`);
                }}
                isInsidePreview={true}
              />
            </div>
            
          </div>
        </div>

      </div>

    </div>
  );
}
