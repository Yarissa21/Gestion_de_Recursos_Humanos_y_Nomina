import React, { useState } from 'react';
 
interface LoginForm {
  email: string;
  password: string;
  remember: boolean;
}
 
interface LoginErrors {
  email?: string;
  password?: string;
}
 
interface LoginPageProps {
  onLogin?: (email: string) => void;
}
 
const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [form, setForm] = useState<LoginForm>({ email: '', password: '', remember: false });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
 
  const validate = (): boolean => {
    const newErrors: LoginErrors = {};
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Ingresa un correo válido.';
    }
    if (form.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
 
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      onLogin?.(form.email);
    }, 1200);
  };
 
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white border border-gray-100 rounded-xl p-8 w-full max-w-sm shadow-sm">
 
        
        <div className="flex items-center gap-2.5 mb-7">
          <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="6" r="3" fill="white"/>
              <path d="M3 15c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p className="text-[15px] font-medium text-gray-900">Grupo 2</p>
            <p className="text-[11px] text-gray-400">Gestión de Recursos Humanos</p>
          </div>
        </div>
 
        <h2 className="text-xl font-medium text-gray-900 mb-1">Bienvenido</h2>
        <p className="text-[13px] text-gray-500 mb-5">Inicia sesión para continuar</p>
 
        
        {success && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5 mb-4 text-[13px] text-emerald-800">
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="#1D9E75" strokeWidth="1.2"/>
              <path d="M5 8l2 2 4-4" stroke="#1D9E75" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            Credenciales correctas — redirigiendo al dashboard...
          </div>
        )}
 
        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="mb-4">
            <label className="block text-[12px] font-medium text-gray-500 mb-1" htmlFor="email">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="nombre@empresa.com"
              className={`w-full h-9 px-3 text-[14px] border rounded-lg bg-white text-gray-900 outline-none transition-colors
                ${errors.email ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-blue-400'}`}
            />
            {errors.email && <p className="text-[12px] text-red-600 mt-1">{errors.email}</p>}
          </div>
 
          {/* Password */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[12px] font-medium text-gray-500" htmlFor="password">
                Contraseña
              </label>
              <button
                type="button"
                className="text-[12px] text-blue-600 hover:underline"
                onClick={() => {/* Handle forgot password */}}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                className={`w-full h-9 px-3 pr-10 text-[14px] border rounded-lg bg-white text-gray-900 outline-none transition-colors
                  ${errors.password ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-blue-400'}`}
              />
              <button
                type="button"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPass(v => !v)}
                aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
                  {showPass ? (
                    <>
                      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"/>
                      <line x1="2" y1="2" x2="14" y2="14"/>
                    </>
                  ) : (
                    <>
                      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"/>
                      <circle cx="8" cy="8" r="2"/>
                    </>
                  )}
                </svg>
              </button>
            </div>
            {errors.password && <p className="text-[12px] text-red-600 mt-1">{errors.password}</p>}
          </div>
 
          {/* Submit */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full h-10 bg-blue-500 hover:bg-blue-700 disabled:bg-blue-300 text-white text-[14px] font-medium rounded-lg cursor-pointer transition-colors"
          >
            {loading ? 'Verificando...' : success ? 'Acceso concedido' : 'Iniciar sesión'}
          </button>
        </form>
 
       
 
        <p className="text-center text-[11px] text-gray-400 mt-5">
          Al ingresar aceptas los términos de uso y la política de privacidad.
        </p>
      </div>
    </div>
  );
};
 
export default LoginPage;