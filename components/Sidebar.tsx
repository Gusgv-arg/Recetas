import React from 'react';
import { Filter, ShoppingCart, Bookmark } from 'lucide-react';
import { View } from '../types';


interface SidebarProps {
  filters: string[];
  activeFilters: string[];
  setActiveFilters: (filters: string[]) => void;
  shoppingListCount: number;
  onShowShoppingList: () => void;
  onShowFavorites: () => void;
  currentView: View;
}

const Sidebar: React.FC<SidebarProps> = ({
  filters,
  activeFilters,
  setActiveFilters,
  shoppingListCount,
  onShowShoppingList,
  onShowFavorites,
  currentView
}) => {
  const handleFilterChange = (filter: string) => {
    setActiveFilters(
      activeFilters.includes(filter)
        ? activeFilters.filter((f) => f !== filter)
        : [...activeFilters, filter]
    );
  };

  return (
    <aside className="w-full md:w-64 lg:w-72 flex-shrink-0">
        <div className="sticky top-6 bg-white rounded-2xl shadow-lg p-6">
            <div className="space-y-2 mb-6">
                <button
                    onClick={onShowShoppingList}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                        currentView === View.SHOPPING ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-green-100 text-gray-700'
                    }`}
                >
                    <div className="flex items-center">
                        <ShoppingCart className="h-5 w-5 mr-3" />
                        <span className="font-semibold">Lista de Compras</span>
                    </div>
                    {shoppingListCount > 0 && (
                        <span className={`px-2.5 py-0.5 rounded-full text-sm font-bold ${
                            currentView === View.SHOPPING ? 'bg-white text-green-600' : 'bg-green-600 text-white'
                        }`}>
                            {shoppingListCount}
                        </span>
                    )}
                </button>
                <button
                    onClick={onShowFavorites}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                        currentView === View.FAVORITES ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-green-100 text-gray-700'
                    }`}
                >
                    <div className="flex items-center">
                        <Bookmark className="h-5 w-5 mr-3" />
                        <span className="font-semibold">Mis Recetas Guardadas</span>
                    </div>
                </button>
            </div>
            
            <div className="flex items-center mb-4 pt-4 border-t">
                <Filter className="h-5 w-5 mr-3 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-800">Filtros Dietéticos</h3>
            </div>
            <div className="space-y-3">
                {filters.map((filter) => (
                <label key={filter} className="flex items-center cursor-pointer">
                    <input
                    type="checkbox"
                    checked={activeFilters.includes(filter)}
                    onChange={() => handleFilterChange(filter)}
                    className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-3 text-gray-700">{filter}</span>
                </label>
                ))}
            </div>
        </div>
    </aside>
  );
};

export default Sidebar;