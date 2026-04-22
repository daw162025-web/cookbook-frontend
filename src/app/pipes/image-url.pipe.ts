import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'imageUrl',
  standalone: true
})
export class ImageUrlPipe implements PipeTransform {
  transform(recipe: any): string {
    const fallback = 'assets/placeholder.jpg';
    if (!recipe || !recipe.image_url) return fallback;

    let url: any = '';

    // 1. Extraer la primera URL si es un array
    if (Array.isArray(recipe.image_url)) {
        url = recipe.image_url[0];
    } else {
        url = recipe.image_url;
    }

    // 2. Limpieza recursiva de strings que parecen JSON o arrays anidados
    const maxAttempts = 3;
    let attempts = 0;

    while (attempts < maxAttempts) {
        if (Array.isArray(url)) {
            url = url[0];
        } 
        else if (typeof url === 'string' && (url.startsWith('[') || url.startsWith('"'))) {
            try {
                url = JSON.parse(url);
                continue; 
            } catch (e) {
                url = url.replace(/[\[\]"\\ ]/g, '');
                break;
            }
        } else {
            break;
        }
        attempts++;
    }

    // 3. Limpieza final de caracteres residuales
    if (typeof url === 'string') {
        url = url.replace(/[\[\]"\\ ]/g, '');
        if (!url.startsWith('http') && url.includes('http')) {
            url = url.substring(url.indexOf('http'));
        }
    }

    return (typeof url === 'string' && url.startsWith('http')) ? url : fallback;
  }
}
