// Angular import
import { Directive, ElementRef, HostListener, inject } from '@angular/core';

@Directive({
  selector: '[appTodoCardComplete]'
})
export class TodoCardCompleteDirective {
  private elements = inject(ElementRef);

  // public method
  @HostListener('click', ['$event'])
  // eslint-disable-next-line
  onToggle($event: any) {
    $event.preventDefault();
    this.elements.nativeElement.classList.toggle('complete');
  }
}
