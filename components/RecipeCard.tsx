import React from 'react';
import { Recipe } from '../types';
import { Clock, Flame, Heart, Users } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
  onSelect: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const difficultyColors = {
  Fácil: 'bg-green-100 text-green-800',
  Media: 'bg-yellow-100 text-yellow-800',
  Difícil: 'bg-red-100 text-red-800',
};

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onSelect, isFavorite, onToggleFavorite }) => {
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que el evento de clic se propague al div principal
    onToggleFavorite();
  };

  return (
    <div
      onClick={onSelect}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-shadow duration-300 cursor-pointer flex flex-col group"
    >
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start gap-4">
            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">
              {recipe.recipeName}
            </h3>
            <span
              className={`flex-shrink-0 px-3 py-1 text-xs font-semibold rounded-full ${
                  difficultyColors[recipe.difficulty] || 'bg-gray-100 text-gray-800'
              }`}
            >
              {recipe.difficulty}
            </span>
        </div>
        
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-500 text-sm">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            <span>{recipe.prepTime}</span>
          </div>
          <div className="flex items-center">
            <Flame className="h-4 w-4 mr-2" />
            <span>{recipe.calories} kcal</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            <span>{recipe.servings}</span>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-6 py-3 flex justify-between items-center">
        <span className="text-green-600 font-semibold group-hover:underline">Ver Receta &rarr;</span>
        <button 
          onClick={handleFavoriteClick}
          className="p-2 rounded-full hover:bg-red-100 transition-colors text-red-500"
          aria-label={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        >
          <Heart className="h-5 w-5" fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>
    </div>
  );
};

export default RecipeCard;