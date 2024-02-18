import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[directiva-prueba]'
})
export class PruebaDirective {

  private element: any;

  constructor(private e: ElementRef) {
    console.warn('directiva funcionando', e);
    this.element = e.nativeElement;
    this.setStyles();
  }

  private setStyles(): void {
    const requiredStyles: any = {
      'background-color': 'yellow',
      'color': 'red',
      'font-weight': 'bold',
    };

    for (const property of Object.keys(requiredStyles)) {
      this.element.style.setProperty(property, requiredStyles[property])
    }

  }

}