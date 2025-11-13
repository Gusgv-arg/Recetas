import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import Login from './components/Login';
import KitchenApp from './KitchenApp';
import { Loader } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-600">
            <Loader className="h-10 w-10 animate-spin text-green-600" />
            <p className="mt-4 text-lg">Cargando...</p>
        </div>
    );
  }
  
  if (!session) {
    return <Login />;
  } else {
    return <KitchenApp user={session.user} />;
  }
};

export default App;
