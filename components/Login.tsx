import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { ChefHat, Mail, Key, Loader2, AlertTriangle } from 'lucide-react';

const GoogleIcon: React.FC = () => (
  <svg className="w-5 h-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
    <path fill="currentColor" d="M488 261.8C488 403.3 381.5 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-65.7 64.9C337 112.2 295.6 96 248 96c-88.8 0-160.1 71.9-160.1 160.1s71.3 160.1 160.1 160.1c98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path>
  </svg>
);


const Login: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('¡Registro exitoso! Por favor, revisa tu correo electrónico para verificar tu cuenta.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: any) {
      setError(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    await supabase.auth.signInWithOAuth({
        provider: 'google',
    });
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full mx-auto">
        <div className="flex justify-center items-center gap-3 mb-6">
            <ChefHat className="h-10 w-10 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
                Asistente de Cocina <span className="text-green-600">Inteligente</span>
            </h1>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
                {isSignUp ? 'Crear una Cuenta' : 'Bienvenido de Nuevo'}
            </h2>
            <p className="text-center text-gray-500 mb-8">
                {isSignUp ? 'Comienza a organizar tus recetas.' : 'Ingresa para continuar a tu cocina.'}
            </p>

            <div className="space-y-4">
                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex justify-center items-center gap-3 py-3 px-4 bg-white border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    <GoogleIcon />
                    <span>{isSignUp ? 'Registrarse con Google' : 'Iniciar sesión con Google'}</span>
                </button>
            </div>
            
            <div className="my-6 flex items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-4 text-xs font-medium text-gray-400">O CONTINUAR CON</span>
                <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
                 {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm flex items-center gap-2"><AlertTriangle size={16} />{error}</div>}
                 {message && <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm">{message}</div>}

                <div>
                    <label htmlFor="email" className="text-sm font-semibold text-gray-600 sr-only">Email</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                             <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu@email.com"
                            required
                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="password"className="text-sm font-semibold text-gray-600 sr-only">Contraseña</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                             <Key className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Contraseña"
                            required
                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300 flex justify-center items-center"
                >
                    {loading ? <Loader2 className="animate-spin h-5 w-5"/> : (isSignUp ? 'Registrarse' : 'Iniciar Sesión')}
                </button>
            </form>
            
            <p className="text-center text-sm text-gray-600 mt-8">
              {isSignUp ? '¿Ya tienes una cuenta?' : '¿No tienes una cuenta?'}
              <button onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null);}} className="font-semibold text-green-600 hover:underline ml-1">
                {isSignUp ? 'Inicia Sesión' : 'Regístrate'}
              </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
