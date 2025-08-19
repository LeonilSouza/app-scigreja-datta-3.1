// Angular import
import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation, effect, inject, input } from '@angular/core';
import { ThemeService } from '../../../service1/theme.service';

// project import

@Component({
  selector: 'app-animation-modal',
  imports: [CommonModule],
  templateUrl: './animation-modal.component.html',
  styleUrls: ['./animation-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AnimationModalComponent {
  private themeService = inject(ThemeService);

  // public props
  readonly modalClass = input<string>();
  readonly contentClass = input<string>();
  readonly modalID = input<string>();
  readonly backDrop = input(false);
  isDarkTheme: string;

  // constructor
  constructor() {
    effect(() => {
      this.ApplyTheme(this.themeService.isDarkTheme());
    });
  }

  // private method
  private ApplyTheme(isDark: string) {
    this.isDarkTheme = isDark;
  }

  // public method
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.close(event);
    }
  }

  close(event) {
    (document.querySelector('#' + event) as HTMLElement).classList.remove('md-show');
  }
}
