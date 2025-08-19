// angular import
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

//project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
@Component({
  selector: 'app-theme-horizontal',
  imports: [CommonModule, SharedModule],
  templateUrl: './theme-horizontal.component.html',
  styleUrls: ['./theme-horizontal.component.scss']
})
export class ThemeHorizontalComponent {}
