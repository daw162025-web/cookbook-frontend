export interface Ingredient {
  id: number;
  name: string;
  type?: string | null;
  created_at?: string;
  updated_at?: string;
  pivot?: {
    recipe_id: number;
    ingredient_id: number;
    quantity?: string; 
    unit?: string;     
  };
}

export interface Recipe {
  id: number;
  user_id: number;
  category_id: number | string;
  title: string;
  description: string;
  instructions: string;
  duration: number | string;
  difficulty: string;
  status: string;
  image_url?: string[];
  created_at?: string;
  updated_at?: string;
  avg_rating?: number; // Promedio de las valoraciones
  user?: {
    name: string; // Nombre del autor 
  };
  category?: {
    id: number;
    name: string;
  };
  ingredients?: Ingredient[];
}

// para leer la respuesta exacta de Laravel 
export interface RecipeResponse {
  message: string;
  recipe: Recipe;
}

