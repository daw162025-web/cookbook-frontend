import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { IngredientService } from '../../services/ingredient.service';
import { CategoryService } from '../../services/category.service';
import { RecipeService } from '../../services/recipe.service';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-edit-recipe',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './edit-recipe.html',
  styleUrl: './edit-recipe.css'
})
export class EditRecipeComponent implements OnInit {
  recipeForm: FormGroup;
  private fb = inject(FormBuilder);
  private ingredientService = inject(IngredientService);
  private categoryService = inject(CategoryService);
  private recipeService = inject(RecipeService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  selectedFiles: { [key: number]: File } = {};
  availableIngredients: any[] = [];
  availableCategories: any[] = [];
  isSubmitting = false;
  recipeId!: number;
  originalImages: string[] = [];
  loadingData = true;

  constructor() {
    this.recipeForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      category_ids: [[], Validators.required], // Inicializado como array
      difficulty: ['', Validators.required],
      prepTime: [''],
      totalTime: ['', Validators.required],
      ingredients: this.fb.array([]),
      steps: this.fb.array([]),
      images: this.fb.array([])
    });
  }

  ngOnInit() {
    // Cargar datos
    this.ingredientService.getIngredients().subscribe({
      next: (data) => {
        this.availableIngredients = data;
        this.cdr.detectChanges();
      }
    });

    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.availableCategories = data;
        this.cdr.detectChanges();
      }
    });

    // Analizar la ruta para obtener el ID de la receta y cargarla
    this.route.paramMap.subscribe(params => {
      this.recipeId = Number(params.get('id'));
      if (this.recipeId) {
        this.loadRecipeDetails();
      }
    });
  }

  loadRecipeDetails() {
    this.recipeService.getRecipe(this.recipeId).subscribe({
      next: (recipe: any) => {
        // Rellenar datos base
        let catsIds = recipe.categories ? recipe.categories.map((c: any) => Number(c.id)) : [];

        this.recipeForm.patchValue({
          title: recipe.title,
          description: recipe.description,
          difficulty: recipe.difficulty,
          prepTime: '',
          totalTime: recipe.duration,
          category_ids: catsIds
        });

        this.recipeForm.controls['category_ids'].setValue(catsIds);

        // Guardar array de imagenes antiguas de forma segura
        // Función para limpiar URLs de forma robusta
        const cleanUrlArray = (val: any): string[] => {
          if (!val) return [];
          let current = val;
          const maxAttempts = 3;
          let attempts = 0;
          while (attempts < maxAttempts) {
            if (Array.isArray(current)) {
              if (current.length === 1 && typeof current[0] === 'string' && current[0].startsWith('[')) {
                try { current = JSON.parse(current[0]); continue; } catch { break; }
              }
              return current.map(item => typeof item === 'string' ? item.replace(/[\[\]"\\ ]/g, '') : item);
            }
            if (typeof current === 'string' && current.startsWith('[')) {
              try { current = JSON.parse(current); continue; } catch { return [current.replace(/[\[\]"\\ ]/g, '')]; }
            }
            break;
            attempts++;
          }
          return Array.isArray(current) ? current : [String(current).replace(/[\[\]"\\ ]/g, '')];
        };

        this.originalImages = cleanUrlArray(recipe.image_url);

        // Rellenar ingredientes
        this.ingredients.clear();
        if (recipe.ingredients && recipe.ingredients.length > 0) {
          recipe.ingredients.forEach((ing: any) => {
            this.ingredients.push(this.fb.group({
              cantidad: [ing.pivot ? ing.pivot.quantity : ''],
              nombre: [ing.name, Validators.required]
            }));
          });
        } else {
          this.addIngredient();
        }

        // Rellenar pasos
        this.steps.clear();
        let instructions = [];
        try {
          instructions = typeof recipe.instructions === 'string' ? JSON.parse(recipe.instructions) : recipe.instructions;
        } catch (e) { }

        if (Array.isArray(instructions) && instructions.length > 0) {
          instructions.forEach((step: string) => {
            this.steps.push(this.fb.control(step, Validators.required));
          });
        } else {
          this.addStep();
        }

        // Iniciar un input de imagen vacio
        this.addImage();
        this.loadingData = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("No se pudo cargar la receta", err);
        this.router.navigate(['/']);
      }
    });
  }

  get images() { return this.recipeForm.get('images') as FormArray; }
  addImage() { this.images.push(this.fb.control('')); }
  removeImage(index: number) {
    if (this.images.length > 1) {
      this.images.removeAt(index);
      delete this.selectedFiles[index];
    }
  }

  removeOriginalImage(index: number) {
    this.originalImages.splice(index, 1);
  }

  onFileChange(event: any, index: number) {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      this.selectedFiles[index] = file;
      this.images.at(index).patchValue(file.name);
    }
  }

  get ingredients() { return this.recipeForm.get('ingredients') as FormArray; }
  addIngredient() {
    this.ingredients.push(this.fb.group({
      cantidad: [''],
      nombre: ['', Validators.required]
    }));
  }
  removeIngredient(index: number) {
    if (this.ingredients.length > 1) {
      this.ingredients.removeAt(index);
    }
  }

  trackByIndex(index: number, obj: any): any { return index; }

  get steps() { return this.recipeForm.get('steps') as FormArray; }
  addStep() { this.steps.push(this.fb.control('', Validators.required)); }
  removeStep(index: number) {
    if (this.steps.length > 1) {
      this.steps.removeAt(index);
    }
  }

  selectCategory(id: number) {
    let currentCats = this.recipeForm.get('category_ids')?.value || [];
    if (!Array.isArray(currentCats)) currentCats = [];

    const index = currentCats.findIndex((c: any) => Number(c) === Number(id));
    if (index > -1) {
      currentCats.splice(index, 1);
    } else {
      currentCats.push(Number(id));
    }
    this.recipeForm.get('category_ids')?.setValue([...currentCats]);
  }

  isCategorySelected(id: number): boolean {
    const currentCats = this.recipeForm.get('category_ids')?.value || [];
    if (!Array.isArray(currentCats)) return false;
    return currentCats.some((c: any) => Number(c) === Number(id));
  }

  onSubmit() {
    if (this.recipeForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const formData = new FormData();
      const formValue = this.recipeForm.value;

      const prep = parseInt(formValue.prepTime) || 0;
      const total = parseInt(formValue.totalTime) || 0;
      const duration = prep + total;

      formData.append('title', formValue.title);
      formData.append('description', formValue.description);
      formData.append('difficulty', formValue.difficulty);
      formData.append('duration', duration.toString() === '0' ? '1' : duration.toString());

      const catIds: number[] = formValue.category_ids || [];
      catIds.forEach(id => {
        formData.append('category_ids[]', id.toString());
      });

      formData.append('ingredients', JSON.stringify(formValue.ingredients));
      formData.append('steps', JSON.stringify(formValue.steps));

      // Enviar las imágenes antiguas que no se han borrado
      formData.append('existing_images', JSON.stringify(this.originalImages));

      // Adjuntar fotos nuevas
      Object.keys(this.selectedFiles).forEach((indexStr) => {
        const i = parseInt(indexStr, 10);
        formData.append('images[]', this.selectedFiles[i]);
      });

      this.recipeService.updateRecipe(this.recipeId, formData).subscribe({
        next: (res) => {
          this.router.navigate(['/recipe', this.recipeId]);
        },
        error: (err) => {
          console.error('Error actualizando receta:', err);
          alert('Hubo un error al actualizar la receta.');
          this.isSubmitting = false;
        }
      });
    } else {
      this.recipeForm.markAllAsTouched();
    }
  }
}
