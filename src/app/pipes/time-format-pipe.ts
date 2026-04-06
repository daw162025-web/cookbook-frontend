import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeFormat',
  standalone: true
})
export class TimeFormatPipe implements PipeTransform {
  transform(value: string | number | undefined): string {
    if (!value) return 'N/A';

    // Convertimos a string por si viene como número
    const timeStr = value.toString().toLowerCase().trim();

    // Si ya contiene "min", lo dejamos como está pero normalizado
    if (timeStr.includes('min')) {
      return timeStr;
    }

    // Si solo son números, le añadimos el sufijo
    return `${timeStr} min`;
  }
}