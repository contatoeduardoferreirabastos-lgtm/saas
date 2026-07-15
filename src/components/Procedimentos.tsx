import React, { useState } from 'react';
import { Procedure } from '../types';
import { Plus, Edit, Trash2, Clock, DollarSign, Tag, FileText, X, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils';

interface ProcedimentosProps {
  procedures: Procedure[];
  onAddProcedure: (procedure: Omit<Procedure, 'id'>) => void;
  onUpdateProcedure: (procedure: Procedure) => void;
  onDeleteProcedure: (id: string) => void;
}

export default function Procedimentos({ procedures, onAddProcedure, onUpdateProcedure, onDeleteProcedure }: ProcedimentosProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [price, setPrice] = useState(150);
  const [category, setCategory] = useState('Geral');
  const [description, setDescription] = useState('');

  const handleOpenAdd = () => {
    setEditingProcedure(null);
    setName('');
    setDurationMinutes(30);
    setPrice(150);
    setCategory('Geral');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (proc: Procedure) => {
    setEditingProcedure(proc);
    setName(proc.name);
    setDurationMinutes(proc.durationMinutes);
    setPrice(proc.price);
    setCategory(proc.category);
    setDescription(proc.description || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name,
      durationMinutes: Number(durationMinutes),
      price: Number(price),
      category,
      description
    };

    if (editingProcedure) {
      onUpdateProcedure({
        ...editingProcedure,
        ...data
      });
    } else {
      onAddProcedure(data);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6" id="procedimentos-container">
      
      {/* Top Header Controls bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm" id="procedimentos-header-bar">
        <div>
          <h3 className="font-semibold text-slate-800 text-sm md:text-base">Serviços & Procedimentos</h3>
          <p className="text-xs text-slate-400">Gerencie o portfólio de atendimentos e os tempos padrões utilizados na agenda</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs px-3.5 py-2 rounded-lg shadow-sm shadow-sky-100 transition-colors cursor-pointer"
          id="add-procedure-btn"
        >
          <Plus className="w-4 h-4" />
          Novo Procedimento
        </button>
      </div>

      {/* Services List Table/Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" id="procedimentos-table-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-4 pl-6">Nome do Procedimento</th>
                <th className="p-4">Categoria</th>
                <th className="p-4">Duração Padrão</th>
                <th className="p-4">Valor Sugerido</th>
                <th className="p-4 pr-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {procedures.map((proc) => (
                <tr key={proc.id} className="hover:bg-slate-50/40 transition-colors group">
                  {/* Name & Desc */}
                  <td className="p-4 pl-6 max-w-xs sm:max-w-md">
                    <div className="font-semibold text-slate-800 text-sm group-hover:text-sky-600 transition-colors">{proc.name}</div>
                    {proc.description && (
                      <div className="text-slate-400 mt-0.5 font-medium leading-relaxed truncate">{proc.description}</div>
                    )}
                  </td>

                  {/* Category */}
                  <td className="p-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      proc.category === 'Estética' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                      proc.category === 'Prevenção' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      proc.category === 'Tratamento' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                      'bg-slate-50 text-slate-600 border-slate-150'
                    }`}>
                      {proc.category}
                    </span>
                  </td>

                  {/* Duration */}
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 font-bold text-slate-600">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>{proc.durationMinutes} minutos</span>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="p-4 font-bold text-slate-800 text-sm">
                    {formatCurrency(proc.price)}
                  </td>

                  {/* Actions */}
                  <td className="p-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button 
                        onClick={() => handleOpenEdit(proc)}
                        className="p-1.5 border border-slate-200 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-slate-50 transition-colors cursor-pointer"
                        title="Editar"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm(`Deseja mesmo excluir o procedimento ${proc.name}?`)) {
                            onDeleteProcedure(proc.id);
                          }
                        }}
                        className="p-1.5 border border-slate-200 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-50 transition-colors cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Warning alert card about Slot calculation */}
      <div className="p-4 bg-sky-50 border border-sky-100 rounded-xl text-xs sm:text-sm text-sky-800 flex items-start gap-3 shadow-2xs">
        <AlertCircle className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sky-900 mb-0.5">Como a Duração afeta a Agenda Pública?</h4>
          <p className="leading-relaxed">
            A duração cadastrada em cada serviço determina automaticamente o intervalo de tempo necessário na agenda. O sistema analisa se o profissional escolhido possui um bloco contínuo de horários livres correspondente à duração do procedimento, prevenindo furos, encavalamentos e otimizando o fluxo de atendimentos.
          </p>
        </div>
      </div>

      {/* MODAL: ADD / EDIT PROCEDURE */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-200">
            <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-sky-600" />
                <h3 className="font-semibold text-slate-800 text-base">
                  {editingProcedure ? 'Editar Procedimento' : 'Novo Procedimento'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Nome do Serviço</label>
                <input 
                  type="text" 
                  placeholder="Ex: Tratamento de Canal dente molar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Categoria</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 outline-none"
                  >
                    <option value="Geral">Geral</option>
                    <option value="Prevenção">Prevenção</option>
                    <option value="Tratamento">Tratamento</option>
                    <option value="Estética">Estética</option>
                    <option value="Cirurgia">Cirurgia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Duração (Minutos)</label>
                  <select 
                    value={durationMinutes} 
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 outline-none"
                  >
                    <option value="15">15 min</option>
                    <option value="30">30 min</option>
                    <option value="45">45 min</option>
                    <option value="60">60 min (1h)</option>
                    <option value="90">90 min (1h30)</option>
                    <option value="120">120 min (2h)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Preço Cobrado (R$)</label>
                <div className="relative">
                  <span className="text-xs text-slate-400 font-bold absolute left-3 top-1/2 -translate-y-1/2">
                    R$
                  </span>
                  <input 
                    type="number" 
                    placeholder="150"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none focus:border-sky-500"
                    required
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Descrição do Serviço (Opcional)</label>
                <textarea 
                  placeholder="Explicação resumida do que é feito..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 outline-none focus:border-sky-500 resize-none"
                />
              </div>

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
                  {editingProcedure ? 'Salvar Alterações' : 'Criar Procedimento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
