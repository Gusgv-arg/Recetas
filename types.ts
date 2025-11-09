// FIX: Removed a self-import of the 'Ingredient' type which was causing a conflict with the local 'Ingredient' interface declaration below.
export interface Ingredient {
  name: string;
  quantity: string;
}

export interface Recipe {
  recipeName: string;
  difficulty: 'Fácil' | 'Media' | 'Difícil';
  prepTime: string;
  calories: number;
  servings: string;
  ingredients: Ingredient[];
  steps: string[];
}

export interface Substitution {
  name: string;
  amount: string;
  notes?: string;
}

export interface ShoppingListItem {
  recipeName: string;
  items: Ingredient[];
  servings: string;
}

export enum View {
  UPLOAD,
  LOADING,
  RECIPES,
  COOKING,
  SHOPPING,
  FAVORITES
}