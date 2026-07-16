import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'paginas' })
export class PaginasPipe implements PipeTransform {
  transform(total: number): number[] {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
}
