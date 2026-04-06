import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { IngredientService } from '../../services/ingredient.service';
import { CategoryService } from '../../services/category.service';
import { RecipeService } from '../../services/recipe.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-recipe',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-recipe.html',
  styleUrl: './create-recipe.css'
})
export class CreateRecipeComponent implements OnInit {
  recipeForm: FormGroup;
  private fb = inject(FormBuilder);
  private ingredientService = inject(IngredientService);
  private categoryService = inject(CategoryService);
  private recipeService = inject(RecipeService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  selectedFiles: { [key: number]: File } = {};
  availableIngredients: any[] = [];
  availableCategories: any[] = [];
  isSubmitting = false;

  constructor() {
    this.recipeForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      category_ids: [[], Validators.required], // Inicializado como array
      difficulty: ['', Validators.required],
      prepTime: ['', Validators.required],
      totalTime: ['', Validators.required],
      ingredients: this.fb.array([]),
      steps: this.fb.array([]),
      images: this.fb.array([])
    });

    // Iniciar con huecos vacíos para el form
    this.addIngredient();
    this.addIngredient();
    this.addIngredient();

    this.addStep();
    this.addStep();
    this.addStep();

    this.addImage();
  }

  ngOnInit() {
    this.ingredientService.getIngredients().subscribe({
      next: (data) => {
        this.availableIngredients = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando ingredientes', err)
    });

    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.availableCategories = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando categorías', err)
    });
  }

  get images() {
    return this.recipeForm.get('images') as FormArray;
  }

  addImage() {
    this.images.push(this.fb.control('', Validators.required));
  }

  removeImage(index: number) {
    if (this.images.length > 1) {
      this.images.removeAt(index);
      delete this.selectedFiles[index];
    }
  }

  onFileChange(event: any, index: number) {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      this.selectedFiles[index] = file;
      this.images.at(index).patchValue(file.name);
    }
  }

  get ingredients() {
    return this.recipeForm.get('ingredients') as FormArray;
  }

  get steps() {
    return this.recipeForm.get('steps') as FormArray;
  }

  addIngredient() {
    const ingredientForm = this.fb.group({
      cantidad: [''],
      nombre: ['', Validators.required]
    });
    this.ingredients.push(ingredientForm);
  }

  removeIngredient(index: number) {
    if (this.ingredients.length > 1) {
      this.ingredients.removeAt(index);
    }
  }

  // Permite que no se destruya los inputs de archivos al añadir más cajas
  trackByIndex(index: number, obj: any): any {
    return index;
  }

  addStep() {
    this.steps.push(this.fb.control('', Validators.required));
  }

  removeStep(index: number) {
    if (this.steps.length > 1) {
      this.steps.removeAt(index);
    }
  }

  selectCategory(id: number) {
    const currentCats = this.recipeForm.get('category_ids')?.value as number[] || [];
    const index = currentCats.indexOf(id);
    if (index > -1) {
      currentCats.splice(index, 1);
    } else {
      currentCats.push(id);
    }
    this.recipeForm.get('category_ids')?.setValue(currentCats);
  }

  isCategorySelected(id: number): boolean {
    const currentCats = this.recipeForm.get('category_ids')?.value as number[] || [];
    return currentCats.includes(id);
  }

  onSubmit() {
    if (this.recipeForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const formData = new FormData();
      const formValue = this.recipeForm.value;

      // Calcular duracion 
      const prep = parseInt(formValue.prepTime) || 0;
      const total = parseInt(formValue.totalTime) || 0;
      const duration = prep + total;

      // añadir campos de texto
      formData.append('title', formValue.title);
      formData.append('description', formValue.description);
      formData.append('difficulty', formValue.difficulty);
      formData.append('duration', duration.toString() === '0' ? '1' : duration.toString());

      // categorias multiples
      const catIds: number[] = formValue.category_ids || [];
      catIds.forEach(id => {
        formData.append('category_ids[]', id.toString());
      });

      // añadir arrays 
      formData.append('ingredients', JSON.stringify(formValue.ingredients));
      formData.append('steps', JSON.stringify(formValue.steps));

      // añadir los files
      Object.keys(this.selectedFiles).forEach((indexStr) => {
        const i = parseInt(indexStr, 10);
        formData.append('images[]', this.selectedFiles[i]);
      });

      // llamar a laravel
      this.recipeService.createRecipe(formData).subscribe({
        next: (res) => {
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('Error subiendo receta:', err);
          alert('Hubo un error al subir la receta. Revisa la consola.');
          this.isSubmitting = false;
        }
      });

    } else {
      this.recipeForm.markAllAsTouched();
    }
  }
}
