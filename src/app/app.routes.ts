import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { CategoriesComponent } from './pages/categories/categories';
import { SearchComponent } from './pages/search/search';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { RecipeDetailComponent } from './pages/recipe-detail/recipe-detail';
import { CreateRecipeComponent } from './pages/create-recipe/create-recipe';
import { MyRecipesComponent } from './pages/my-recipes/my-recipes';
import { EditRecipeComponent } from './pages/edit-recipe/edit-recipe';
import { Favorites } from './pages/favorites/favorites';
import { adminGuard } from './guards/admin-guard';
import {PublicLayout} from './layouts/public-layout/public-layout'
import {AdminLayout} from './layouts/admin-layout/admin-layout'

export const routes: Routes = [
  {
    path: '',
    component: PublicLayout,
    children: [
    { path: '', component: HomeComponent },
    { path: 'categories', component: CategoriesComponent },
    { path: 'search', component: SearchComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'recipe/:id', component: RecipeDetailComponent },
    { path: 'create-recipe', component: CreateRecipeComponent },
    { path: 'edit-recipe/:id', component: EditRecipeComponent },
    { path: 'my-recipes', component: MyRecipesComponent },
    { path: 'favorites', component: Favorites },
  ]
  },

  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [adminGuard], // Aquí aplicamos la protección
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard').then(m => m.DashboardComponent)
      },
      // {
      //   path: 'users',
      //   loadComponent: () => import('./admin/users-management/users-management.component').then(m => m.UsersManagementComponent)
      // },
      {
        path: '', redirectTo: 'dashboard', pathMatch: 'full'
      }
    ]
  },
  { path: '**', redirectTo: '' }
  
];