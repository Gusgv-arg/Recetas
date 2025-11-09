import React from 'react';
import { Recipe } from '../types';
import RecipeCard from './RecipeCard';
import { BookOpen } from 'lucide-react';

interface RecipeListProps {
  title: string;
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  favoriteRecipes: Recipe[];
  onToggleFavorite: (recipe: Recipe) => void;
}

const RecipeList: React.FC<RecipeListProps> = ({ title, recipes, onSelectRecipe, favoriteRecipes, onToggleFavorite }) => {
  if (recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h2 className="text-2xl font-bold mb-2">No se Encontraron Recetas</h2>
        <p className="text-gray-500">Actualmente no hay recetas aquí. ¡Intenta buscar algunas o ajusta tus filtros!</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-gray-800">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => {
          const isFavorite = favoriteRecipes.some(fav => fav.recipeName === recipe.recipeName);
          return (
            <RecipeCard 
              key={recipe.recipeName} 
              recipe={recipe} 
              onSelect={() => onSelectRecipe(recipe)}
              isFavorite={isFavorite}
              onToggleFavorite={() => onToggleFavorite(recipe)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default RecipeList;