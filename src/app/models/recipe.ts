export interface Ingredient {
  id: number;
  name: string;
  type?: string | null;
  created_at?: string;
  updated_at?: string;
  pivot?: {
    recipe_id: number;
    ingredient_id: number;
    quantity?: string; // Añade esto para mostrar "200"
    unit?: string;     // Añade esto para mostrar "gramos"
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
  // Campos adicionales para la vista
  avg_rating?: number; // Promedio de la tabla 'ratings'
  user?: {
    name: string; // Nombre del autor desde la tabla 'users'
  };
  category?: {
    id: number;
    name: string;
  };
  ingredients?: Ingredient[];
}

// para leer la respuesta exacta de Laravel al crear/actualizar
export interface RecipeResponse {
  message: string;
  recipe: Recipe;
}

