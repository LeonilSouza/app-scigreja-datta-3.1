// Angular import
import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation, input } from '@angular/core';

@Component({
  selector: 'app-ui-modal',
  imports: [CommonModule],
  templateUrl: './ui-modal.component.html',
  styleUrls: ['./ui-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UiModalComponent {
  // public props
  readonly dialogClass = input.required<string>();
  readonly hideHeader = input(false);
  readonly hideFooter = input(false);
  readonly containerClick = input(true);
  visible = false;
  visibleAnimate = false;

  // public method
  show(): void {
    this.visible = true;
    setTimeout(() => (this.visibleAnimate = true), 100);
    (document.querySelector('body') as HTMLBodyElement).classList.add('modal-open');
  }

  hide(): void {
    this.visibleAnimate = false;
    setTimeout(() => (this.visible = false), 300);
    (document.querySelector('body') as HTMLBodyElement).classList.remove('modal-open');
  }

  onContainerClicked(event: MouseEvent): void {
    if ((<HTMLElement>event.target).classList.contains('modal') && this.containerClick() === true) {
      this.hide();
    }
  }
}
