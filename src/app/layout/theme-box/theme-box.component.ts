// angular import
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

//project import
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-theme-box',
  imports: [CommonModule, SharedModule],
  templateUrl: './theme-box.component.html',
  styleUrls: ['./theme-box.component.scss']
})
export class ThemeBoxComponent {}
