import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recipe-card.html', 
  styleUrls: ['./recipe-card.css']
})
export class RecipeCardComponent {
  @Input() recipe: any; 
}