import React from 'react';
import { ChefHat, LogOut } from 'lucide-react';
import { User } from '@supabase/supabase-js';

interface HeaderProps {
    onLogoClick: () => void;
    user: User;
    onSignOut: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogoClick, user, onSignOut }) => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 lg:px-6 py-4 flex justify-between items-center">
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={onLogoClick}
          >
          <ChefHat className="h-8 w-8 text-green-600" />
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            Asistente de Cocina <span className="text-green-600">Inteligente</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:block">{user.email}</span>
            <button
                onClick={onSignOut}
                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
                <LogOut className="h-4 w-4" />
                <span>Cerrar Sesión</span>
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
