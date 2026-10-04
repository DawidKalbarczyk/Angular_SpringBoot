import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'bignumbers',
})
export class BignumbersPipe implements PipeTransform {
  private formatter = new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 2 });

  transform(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === '') return '';

    const num = typeof value === 'number'
      ? value
      : Number(String(value).replace(/\s/g, '').replace(',', '.'));

    if (!Number.isFinite(num)) return String(value);

    return this.formatter.format(num).replace(/\u00A0/g, ' ');
  }
}