import { Pipe, PipeTransform } from '@angular/core';
import { spMonths } from './interfaces';

@Pipe({
  name: 'monthSpanish',
  standalone: true
})
export class MonthSpanishPipe implements PipeTransform {

transform(month: number, format: 'long' | 'short' = 'long'): string {
  if (month < 0 || month > 11) throw new Error(`'${month}' Month doesn't exist`);

  if (format === 'long')
    return spMonths[month].longStr;
  else
    return spMonths[month].shortStr;
}

}
