import React, { useState, useCallback, useEffect } from 'react';
import { Recipe, ShoppingListItem, View, Ingredient } from './types';
import { DIETARY_FILTERS } from './constants';
import { suggestRecipes } from './services/geminiService';
import Header from './components/Header';
import InputArea from './components/InputArea';
import Sidebar from './components/Sidebar';
import RecipeList from './components/RecipeList';
import CookingModeView from './components/CookingModeView';
import ShoppingListView from './components/ShoppingListView';
import { Loader, AlertTriangle } from 'lucide-react';
import { blobToBase64 } from './utils/fileUtils';

const SHOPPING_LIST_STORAGE_KEY = 'smartKitchenShoppingList';
const FAVORITE_RECIPES_STORAGE_KEY = 'smartKitchenFavoriteRecipes';

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.UPLOAD);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load data from localStorage on initial render
  useEffect(() => {
    try {
      const storedShoppingList = window.localStorage.getItem(SHOPPING_LIST_STORAGE_KEY);
      if (storedShoppingList) {
        setShoppingList(JSON.parse(storedShoppingList));
      }
      const storedFavoriteRecipes = window.localStorage.getItem(FAVORITE_RECIPES_STORAGE_KEY);
      if (storedFavoriteRecipes) {
        setFavoriteRecipes(JSON.parse(storedFavoriteRecipes));
      }
    } catch (error) {
      console.error("Failed to parse data from localStorage", error);
    }
  }, []);

  // Save shopping list to localStorage whenever it changes
  useEffect(() => {
    try {
      window.localStorage.setItem(SHOPPING_LIST_STORAGE_KEY, JSON.stringify(shoppingList));
    } catch (error) {
      console.error("Failed to save shopping list to localStorage", error);
    }
  }, [shoppingList]);
  
  // Save favorite recipes to localStorage whenever it changes
  useEffect(() => {
    try {
      window.localStorage.setItem(FAVORITE_RECIPES_STORAGE_KEY, JSON.stringify(favoriteRecipes));
    } catch (error) {
      console.error("Failed to save favorite recipes to localStorage", error);
    }
  }, [favoriteRecipes]);

  const handleSubmit = useCallback(async (input: { type: 'image' | 'audio' | 'text', data: File | Blob | string }) => {
    if (!input.data) {
      setError('Por favor, proporciona alguna entrada.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setView(View.LOADING);

    try {
      let base64Data: string;
      const inputType = input.type;

      if (typeof input.data === 'string') {
        base64Data = input.data;
      } else { // It's a File or Blob
        base64Data = await blobToBase64(input.data);
      }
      
      const { suggestedRecipes } = await suggestRecipes({ type: inputType, data: base64Data }, activeFilters);

      setRecipes(suggestedRecipes);
      setView(View.RECIPES);
    } catch (e) {
      console.error(e);
      setError('No se pudo procesar la entrada ni obtener recetas. Por favor, inténtalo de nuevo.');
      setView(View.UPLOAD);
    } finally {
      setIsLoading(false);
    }
  }, [activeFilters]);

  const handleRecipeSelect = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setView(View.COOKING);
  };

  const handleAddToShoppingList = (data: { recipeName: string, items: Ingredient[], servings: string }) => {
    setShoppingList(prevList => {
      const existingRecipeIndex = prevList.findIndex(item => item.recipeName === data.recipeName);
      const newList = [...prevList];

      if (existingRecipeIndex > -1) {
        // La receta existe, combina los artículos y elimina duplicados
        const existingRecipe = prevList[existingRecipeIndex];
        const existingItemNames = new Set(existingRecipe.items.map(item => item.name.toLowerCase()));
        const newItems = data.items.filter(item => !existingItemNames.has(item.name.toLowerCase()));
        
        newList[existingRecipeIndex] = {
           ...existingRecipe,
            items: [...existingRecipe.items, ...newItems]
        };
      } else {
        // Nueva receta, añádela a la lista
        newList.push({ recipeName: data.recipeName, items: data.items, servings: data.servings });
      }

      return newList;
    });
    setView(View.SHOPPING);
  };
  
  const handleRemoveShoppingItem = (recipeName: string, itemToRemove: Ingredient) => {
    setShoppingList(prevList => {
      return prevList.map(recipe => {
        if (recipe.recipeName === recipeName) {
          return {
            ...recipe,
            items: recipe.items.filter(item => item.name !== itemToRemove.name)
          };
        }
        return recipe;
      }).filter(recipe => recipe.items.length > 0); // Remove recipe if it has no items left
    });
  };

  const handleRemoveRecipeFromList = (recipeNameToRemove: string) => {
    setShoppingList(prev => prev.filter(recipe => recipe.recipeName !== recipeNameToRemove));
  }

  const handleClearShoppingList = () => {
    setShoppingList([]);
  }

  const handleToggleFavorite = (recipe: Recipe) => {
    setFavoriteRecipes(prev => {
      const isFavorite = prev.some(r => r.recipeName === recipe.recipeName);
      if (isFavorite) {
        return prev.filter(r => r.recipeName !== recipe.recipeName);
      } else {
        return [...prev, recipe];
      }
    });
  };

  const resetToHome = () => {
    setView(View.UPLOAD);
    setRecipes([]);
    setSelectedRecipe(null);
    setError(null);
    // Data lists are intentionally NOT cleared to persist them
  };

  const shoppingListTotalItems = shoppingList.reduce((total, recipe) => total + recipe.items.length, 0);

  const renderContent = () => {
    if (isLoading || view === View.LOADING) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
          <Loader className="animate-spin h-12 w-12 mb-4" />
          <p className="text-lg font-semibold">Buscando recetas...</p>
          <p>¡Nuestro chef de IA está preparando algo delicioso!</p>
        </div>
      );
    }

    if (error) {
       return (
        <div className="flex flex-col items-center justify-center h-full text-center text-red-500 bg-red-50 p-8 rounded-lg">
          <AlertTriangle className="h-12 w-12 mb-4" />
          <p className="text-lg font-semibold">Ocurrió un Error</p>
          <p>{error}</p>
        </div>
      );
    }

    switch (view) {
      case View.UPLOAD:
        return <InputArea onSubmit={handleSubmit} disabled={isLoading} />;
      case View.RECIPES:
        return <RecipeList title="Sugerencias del Chef" recipes={recipes} onSelectRecipe={handleRecipeSelect} favoriteRecipes={favoriteRecipes} onToggleFavorite={handleToggleFavorite} />;
      case View.COOKING:
        if (!selectedRecipe) return null;
        return (
          <CookingModeView
            recipe={selectedRecipe}
            onAddToShoppingList={handleAddToShoppingList}
            isFavorite={favoriteRecipes.some(r => r.recipeName === selectedRecipe.recipeName)}
            onToggleFavorite={() => handleToggleFavorite(selectedRecipe)}
          />
        );
      case View.SHOPPING:
         return <ShoppingListView list={shoppingList} onRemoveItem={handleRemoveShoppingItem} onRemoveRecipe={handleRemoveRecipeFromList} onClearList={handleClearShoppingList} />;
      case View.FAVORITES:
        return <RecipeList title="Mis Recetas Guardadas" recipes={favoriteRecipes} onSelectRecipe={handleRecipeSelect} favoriteRecipes={favoriteRecipes} onToggleFavorite={handleToggleFavorite} />;
      default:
        return <InputArea onSubmit={handleSubmit} disabled={isLoading} />;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-800 flex flex-col">
      <Header onLogoClick={resetToHome} />
      <div className="flex-grow container mx-auto p-4 lg:p-6 flex flex-col md:flex-row gap-6">
        <Sidebar
          filters={DIETARY_FILTERS}
          activeFilters={activeFilters}
          setActiveFilters={setActiveFilters}
          shoppingListCount={shoppingListTotalItems}
          onShowShoppingList={() => setView(View.SHOPPING)}
          onShowFavorites={() => setView(View.FAVORITES)}
          currentView={view}
        />
        <main className="flex-1 bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;