import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './recipe-card.html', 
  styleUrls: ['./recipe-card.css']
})
export class RecipeCardComponent {
  @Input() recipe: any; 
}