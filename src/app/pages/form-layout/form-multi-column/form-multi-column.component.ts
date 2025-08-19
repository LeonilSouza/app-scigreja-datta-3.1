// angular import
import { Component } from '@angular/core';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-form-multi-column',
  imports: [SharedModule],
  templateUrl: './form-multi-column.component.html',
  styleUrl: './form-multi-column.component.scss'
})
export class FormMultiColumnComponent {}
