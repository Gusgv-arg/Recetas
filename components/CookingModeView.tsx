import React, { useState } from 'react';
import { Recipe, Ingredient, Substitution } from '../types';
import { getIngredientSubstitutions, textToSpeech } from '../services/geminiService';
import { Volume2, ChefHat, Clock, Flame, Sparkles, Loader, X, AlertTriangle, Heart, Users, ShoppingCart } from 'lucide-react';

interface CookingModeViewProps {
  recipe: Recipe;
  onAddToShoppingList: (data: { recipeName: string, items: Ingredient[], servings: string }) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const CookingModeView: React.FC<CookingModeViewProps> = ({ recipe, onAddToShoppingList, isFavorite, onToggleFavorite }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<AudioBufferSourceNode | null>(null);
  
  const [isSubstitutionModalOpen, setIsSubstitutionModalOpen] = useState(false);
  const [substitutionIngredient, setSubstitutionIngredient] = useState<Ingredient | null>(null);
  const [substitutions, setSubstitutions] = useState<Substitution[]>([]);
  const [isSubstitutionsLoading, setIsSubstitutionsLoading] = useState(false);
  const [substitutionError, setSubstitutionError] = useState<string | null>(null);


  const handleSpeak = async (text: string) => {
    if (isSpeaking && currentAudio) {
      currentAudio.stop();
      setCurrentAudio(null);
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    try {
      const audioBuffer = await textToSpeech(text);
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.onended = () => setIsSpeaking(false);
      source.start(0);
      setCurrentAudio(source);
    } catch (error) {
      console.error('TTS Error:', error);
      setIsSpeaking(false);
    }
  };

  const handleAddAllIngredients = () => {
    onAddToShoppingList({ recipeName: recipe.recipeName, items: recipe.ingredients, servings: recipe.servings });
  };
  
  const handleFindSubstitutions = async (ingredient: Ingredient) => {
    setSubstitutionIngredient(ingredient);
    setIsSubstitutionModalOpen(true);
    setIsSubstitutionsLoading(true);
    setSubstitutionError(null);
    setSubstitutions([]);

    try {
      const result = await getIngredientSubstitutions(ingredient.name, ingredient.quantity, recipe.recipeName);
      setSubstitutions(result);
    } catch (e) {
      setSubstitutionError("Lo sentimos, no pudimos encontrar sustitutos en este momento. Por favor, inténtalo de nuevo más tarde.");
    } finally {
      setIsSubstitutionsLoading(false);
    }
  };

  const closeSubstitutionModal = () => {
    setIsSubstitutionModalOpen(false);
    setSubstitutionIngredient(null);
  };


  return (
    <>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-4">
          <h2 className="text-4xl font-extrabold text-gray-900">{recipe.recipeName}</h2>
          <div className="flex-shrink-0 flex items-center gap-2">
            <button 
              onClick={onToggleFavorite}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                isFavorite 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Heart className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
             <button
              onClick={handleAddAllIngredients}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors bg-green-100 text-green-700 hover:bg-green-200"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Añadir a la Lista</span>
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-gray-600 mb-8">
            <div className="flex items-center"><ChefHat className="w-5 h-5 mr-2 text-green-500" /> {recipe.difficulty}</div>
            <div className="flex items-center"><Clock className="w-5 h-5 mr-2 text-green-500" /> {recipe.prepTime}</div>
            <div className="flex items-center"><Flame className="w-5 h-5 mr-2 text-green-500" /> {recipe.calories} kcal</div>
            <div className="flex items-center"><Users className="w-5 h-5 mr-2 text-green-500" /> {recipe.servings}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
              <h3 className="text-xl font-bold mb-3 text-gray-800 border-b-2 border-green-200 pb-2">Ingredientes</h3>
              <ul className="space-y-2 text-gray-700">
                  {recipe.ingredients.map((ing, index) => (
                      <li key={index} className="flex justify-between items-center group">
                          <div>
                            <span className="font-semibold mr-2">{ing.quantity}</span>
                            <span>{ing.name}</span>
                          </div>
                           <button 
                            onClick={() => handleFindSubstitutions(ing)} 
                            title={`Buscar sustitutos para ${ing.name}`}
                            className="opacity-0 group-hover:opacity-100 text-green-500 hover:text-green-700 transition-opacity"
                           >
                            <Sparkles className="w-4 h-4" />
                           </button>
                      </li>
                  ))}
              </ul>
          </div>
          <div className="md:col-span-2">
              <h3 className="text-xl font-bold mb-3 text-gray-800 border-b-2 border-green-200 pb-2">Instrucciones</h3>
              <ol className="space-y-6">
                  {recipe.steps.map((step, index) => (
                  <li key={index} className="flex items-start gap-4">
                      <div className="flex-shrink-0 h-8 w-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                      {index + 1}
                      </div>
                      <div className="flex-grow">
                          <p className="text-lg leading-relaxed text-gray-800">{step}</p>
                          <button onClick={() => handleSpeak(step)} className="text-green-600 hover:text-green-800 mt-2 flex items-center text-sm">
                              <Volume2 className="h-5 w-5 mr-1" />
                              {isSpeaking ? 'Detener' : 'Leer en Voz Alta'}
                          </button>
                      </div>
                  </li>
                  ))}
              </ol>
          </div>
        </div>
      </div>
      
      {isSubstitutionModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300" aria-modal="true" role="dialog">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full relative transform transition-all duration-300 scale-95 animate-modal-enter">
            <button onClick={closeSubstitutionModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Sustitutos para</h3>
            <p className="text-lg text-green-600 font-semibold mb-6 capitalize">{substitutionIngredient?.name}</p>

            {isSubstitutionsLoading && (
              <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                <Loader className="w-8 h-8 animate-spin mb-3" />
                <p>Buscando sustitutos...</p>
              </div>
            )}

            {substitutionError && (
              <div className="flex flex-col items-center justify-center h-48 text-red-600 bg-red-50 p-4 rounded-lg">
                <AlertTriangle className="w-8 h-8 mb-3" />
                <p className="text-center">{substitutionError}</p>
              </div>
            )}

            {!isSubstitutionsLoading && !substitutionError && substitutions.length > 0 && (
              <ul className="space-y-4 max-h-80 overflow-y-auto pr-2">
                {substitutions.map((sub, index) => (
                  <li key={index} className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-bold text-gray-900">{sub.name}</p>
                    <p className="text-sm text-green-700 font-medium">Cantidad: {sub.amount}</p>
                    {sub.notes && <p className="text-sm text-gray-600 mt-1 italic">Nota: {sub.notes}</p>}
                  </li>
                ))}
              </ul>
            )}
            
            {!isSubstitutionsLoading && !substitutionError && substitutions.length === 0 && (
                 <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                    <p>No se encontraron sustitutos.</p>
                 </div>
            )}
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes modal-enter {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-modal-enter {
          animation: modal-enter 0.2s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default CookingModeView;