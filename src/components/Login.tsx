import React, { useState, useEffect } from 'react';
import { ShieldCheck, Stethoscope, Mail, Lock, Sparkles, KeyRound, Check, Building, Info, UserCheck } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: { uid: string; email: string; clinicName: string }) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Seed default demo user in local storage on mount
  useEffect(() => {
    const rawUsers = localStorage.getItem('odonto_users');
    if (!rawUsers) {
      const defaultUsers = [
        {
          uid: 'default-owner',
          email: 'contato@sorrisofeliz.com.br',
          password: '123456',
          clinicName: 'Clínica Sorriso Feliz'
        }
      ];
      localStorage.setItem('odonto_users', JSON.stringify(defaultUsers));
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    setTimeout(() => {
      const normalizedEmail = email.trim().toLowerCase();
      const rawUsers = localStorage.getItem('odonto_users');
      const users = rawUsers ? JSON.parse(rawUsers) : [];

      const foundUser = users.find((u: any) => u.email === normalizedEmail);

      if (foundUser) {
        if (foundUser.password === password) {
          setSuccess('Acesso autorizado! Entrando no painel...');
          const sessionUser = {
            uid: foundUser.uid,
            email: foundUser.email,
            clinicName: foundUser.clinicName
          };
          localStorage.setItem('odonto_current_user', JSON.stringify(sessionUser));
          setTimeout(() => {
            onLoginSuccess(sessionUser);
            setLoading(false);
          }, 600);
        } else {
          setError('Senha incorreta! Por favor, tente novamente (senha de demonstração: 123456).');
          setLoading(false);
        }
      } else {
        setError('E-mail não encontrado! Crie uma conta na aba ao lado ou acesse com contato@sorrisofeliz.com.br.');
        setLoading(false);
      }
    }, 600);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!clinicName.trim()) {
      setError('Por favor, informe o nome da sua clínica.');
      return;
    }
    if (!email.trim()) {
      setError('Por favor, informe um e-mail de acesso.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve conter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas digitadas não conferem.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const normalizedEmail = email.trim().toLowerCase();
      const rawUsers = localStorage.getItem('odonto_users');
      const users = rawUsers ? JSON.parse(rawUsers) : [];

      const exists = users.some((u: any) => u.email === normalizedEmail);
      if (exists) {
        setError('Este e-mail já está cadastrado no sistema.');
        setLoading(false);
        return;
      }

      const newUid = 'user-' + Date.now();
      const newUser = {
        uid: newUid,
        email: normalizedEmail,
        password: password,
        clinicName: clinicName.trim()
      };

      users.push(newUser);
      localStorage.setItem('odonto_users', JSON.stringify(users));

      setSuccess('Clínica cadastrada e configurada localmente com sucesso! Entrando...');
      
      const sessionUser = {
        uid: newUser.uid,
        email: newUser.email,
        clinicName: newUser.clinicName
      };
      localStorage.setItem('odonto_current_user', JSON.stringify(sessionUser));
      
      setTimeout(() => {
        onLoginSuccess(sessionUser);
        setLoading(false);
      }, 600);
    }, 600);
  };

  const handleDemoSignIn = () => {
    setError('');
    setSuccess('');
    setLoading(true);

    setTimeout(() => {
      const sessionUser = {
        uid: 'default-owner',
        email: 'contato@sorrisofeliz.com.br',
        clinicName: 'Clínica Sorriso Feliz'
      };
      localStorage.setItem('odonto_current_user', JSON.stringify(sessionUser));
      setSuccess('Entrando em modo demonstração local...');
      
      setTimeout(() => {
        onLoginSuccess(sessionUser);
        setLoading(false);
      }, 600);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden" id="login-container">
      {/* Visual background details */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

      {/* Central Login Box */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-sky-600 text-white rounded-xl shadow-sm">
            <Stethoscope className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">OdontoAgenda</h1>
          <p className="text-xs sm:text-sm text-slate-400 font-semibold tracking-wider uppercase">Plataforma de Gestão e Agendamento</p>
        </div>

        {/* Card */}
        <div className="mt-8 bg-white py-8 px-4 sm:rounded-xl border border-slate-200 shadow-sm sm:px-10 relative">
          
          {/* View Toggles */}
          <div className="flex bg-slate-100 p-1 rounded-lg mb-6 text-xs font-semibold">
            <button
              onClick={() => {
                setMode('login');
                setError('');
                setSuccess('');
              }}
              className={`flex-1 py-1.5 text-center rounded-md cursor-pointer transition-colors ${
                mode === 'login' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Fazer Login
            </button>
            <button
              onClick={() => {
                setMode('register');
                setError('');
                setSuccess('');
              }}
              className={`flex-1 py-1.5 text-center rounded-md cursor-pointer transition-colors ${
                mode === 'register' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Cadastrar Nova Clínica
            </button>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-xs text-rose-700 font-medium leading-relaxed mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-xs text-emerald-700 font-medium leading-relaxed mb-4 flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              {success}
            </div>
          )}

          {mode === 'login' ? (
            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">E-mail de Acesso</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contato@sorrisofeliz.com.br"
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-sky-500 focus:bg-white transition-all font-semibold text-slate-700"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Senha de Acesso</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha (padrão: 123456)"
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-sky-500 focus:bg-white transition-all font-semibold text-slate-700"
                    required
                  />
                </div>
              </div>

              {/* Action button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    Acessar Painel da Clínica
                  </>
                )}
              </button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleRegister}>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Nome da Clínica</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    placeholder="Ex: Consultório Odontológico Silva"
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-sky-500 focus:bg-white transition-all font-semibold text-slate-700"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">E-mail de Acesso</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seuemail@provedor.com"
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-sky-500 focus:bg-white transition-all font-semibold text-slate-700"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Senha</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mín. 6 dígitos"
                      className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-sky-500 focus:bg-white transition-all font-semibold text-slate-700"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Confirmar</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a senha"
                      className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-sky-500 focus:bg-white transition-all font-semibold text-slate-700"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <div className="w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 shrink-0" />
                    Criar Conta & Configurar Clínica
                  </>
                )}
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="relative my-6" id="social-login-divider">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-slate-400 font-bold uppercase tracking-widest text-[10px]">Acesso de Demonstração</span>
            </div>
          </div>

          {/* Demo test drive button */}
          <button
            type="button"
            onClick={handleDemoSignIn}
            disabled={loading}
            className="w-full py-2.5 px-4 border border-sky-200 rounded-lg text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
            id="google-login-btn"
          >
            <UserCheck className="w-4.5 h-4.5 shrink-0 text-sky-600" />
            Entrar Instantaneamente com Clínica de Teste
          </button>


          {/* Admin instructions note */}
          <div className="mt-6 pt-4 border-t border-slate-150 space-y-1.5 text-[10px] text-slate-400 leading-relaxed" id="local-sync-footer">
            <h4 className="font-bold text-slate-500 flex items-center gap-1.5 text-xs">
              <KeyRound className="w-4 h-4 text-slate-400" />
              Chave de Segurança das Credenciais
            </h4>
            <p>
              E-mail padrão de demonstração: <strong className="text-slate-600">contato@sorrisofeliz.com.br</strong><br />
              Senha padrão de demonstração: <strong className="text-slate-600">123456</strong>
            </p>
          </div>

        </div>

        {/* Footer credits */}
        <div className="text-center mt-6 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          Desenvolvido para Profissionais e Clínicas.
        </div>
      </div>
    </div>
  );
}
