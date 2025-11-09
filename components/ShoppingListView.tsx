import React from 'react';
import { ShoppingCart, Trash2, XCircle, BookOpen, Users } from 'lucide-react';
import { ShoppingListItem, Ingredient } from '../types';

interface ShoppingListViewProps {
  list: ShoppingListItem[];
  onRemoveItem: (recipeName: string, item: Ingredient) => void;
  onRemoveRecipe: (recipeName: string) => void;
  onClearList: () => void;
}

const ShoppingListView: React.FC<ShoppingListViewProps> = ({ list, onRemoveItem, onRemoveRecipe, onClearList }) => {
  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between mb-6 gap-4">
          <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 mr-3 text-green-600" />
              <h2 className="text-3xl font-bold text-gray-800">Lista de Compras</h2>
          </div>
          {list.length > 0 && (
            <button 
              onClick={onClearList}
              className="px-4 py-2 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 transition-colors text-sm flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Limpiar Todo
            </button>
          )}
      </div>
      
      {list.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
          <XCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="font-semibold">Tu lista de compras está vacía.</p>
          <p>Añade ingredientes de una receta para verlos aquí.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {list.map((recipeItem) => (
            <div key={recipeItem.recipeName} className="bg-white p-4 sm:p-6 rounded-xl shadow">
                <div className="flex justify-between items-start mb-4 border-b pb-3">
                    <div>
                        <div className="flex items-center mb-1">
                            <BookOpen className="h-5 w-5 mr-3 text-green-500"/>
                            <h3 className="text-xl font-bold text-gray-800">{recipeItem.recipeName}</h3>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 ml-8">
                            <Users className="h-4 w-4 mr-2" />
                            <span>{recipeItem.servings}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => onRemoveRecipe(recipeItem.recipeName)}
                        className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 ml-4"
                        aria-label={`Eliminar todos los artículos para ${recipeItem.recipeName}`}
                    >
                        <Trash2 className="h-5 w-5" />
                    </button>
                </div>
                <ul className="space-y-3">
                    {recipeItem.items.map((item) => (
                        <li
                        key={item.name}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                        <div className="flex items-center">
                            <span className="text-gray-800 font-semibold mr-2 w-24 text-right">{item.quantity}</span>
                            <span className="text-gray-700 capitalize">{item.name}</span>
                        </div>
                        <button
                            onClick={() => onRemoveItem(recipeItem.recipeName, item)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            aria-label={`Eliminar ${item.name}`}
                        >
                            <Trash2 className="h-5 w-5" />
                        </button>
                        </li>
                    ))}
                </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShoppingListView;