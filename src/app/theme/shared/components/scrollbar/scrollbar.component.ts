// angular import
import { Component, effect, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

// third party
import { NgScrollbarModule } from 'ngx-scrollbar';
import { ThemeService } from '../../service1/theme.service';

@Component({
  selector: 'app-scrollbar',
  imports: [NgScrollbarModule, CommonModule],
  templateUrl: './scrollbar.component.html',
  styleUrl: './scrollbar.component.scss'
})
export class ScrollbarComponent {
  private themeService = inject(ThemeService);

  @Input() customStyle: { [key: string]: string } = {};

  direction: string = 'ltr';

  // constructor
  constructor() {
    effect(() => {
      this.isRtlMode(this.themeService.isRtlTheme());
    });
  }

  // private method
  private isRtlMode(isRtl: boolean) {
    this.direction = isRtl === true ? 'rtl' : 'ltr';
  }
}
