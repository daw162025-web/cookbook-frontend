import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'difficultyLabel',
  standalone: true
})
export class DifficultyPipe implements PipeTransform {
  transform(value: string | undefined): string {
    if (!value) return 'N/A';
    
    const labels: Record<string, string> = {
      'facil': 'Fácil',
      'media': 'Media',
      'dificil': 'Difícil'
    };
    
    return labels[value.toLowerCase()] || value;
  }
}