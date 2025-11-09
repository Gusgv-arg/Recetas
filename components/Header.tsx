import React from 'react';
import { ChefHat } from 'lucide-react';

interface HeaderProps {
    onLogoClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogoClick }) => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 lg:px-6 py-4">
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={onLogoClick}
          >
          <ChefHat className="h-8 w-8 text-green-600" />
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            Asistente de Cocina <span className="text-green-600">Inteligente</span>
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;