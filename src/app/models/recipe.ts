export interface Ingredient {
  id: number;
  name: string;
  type?: string | null;
  created_at?: string;
  updated_at?: string;
  pivot?: {
    recipe_id: number;
    ingredient_id: number;
  };
}

export interface Recipe {
  id?: number;
  user_id: number;
  category_id: number | string; // Acepta número o texto 
  title: string;
  description: string;
  instructions: string;
  duration: number | string;    // Acepta número o texto 
  difficulty: string;
  status: string;
  image_url?: string;           
  created_at?: string;
  updated_at?: string;
  ingredients?: Ingredient[];   // Array usando la interfaz de arriba
}

// para leer la respuesta exacta de Laravel al crear/actualizar
export interface RecipeResponse {
  message: string;
  recipe: Recipe;
}