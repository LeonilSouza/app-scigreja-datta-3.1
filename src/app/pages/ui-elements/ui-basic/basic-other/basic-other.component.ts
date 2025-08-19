// angular import
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-basic-other',
  imports: [CommonModule, SharedModule],
  templateUrl: './basic-other.component.html',
  styleUrls: ['./basic-other.component.scss']
})
export class BasicOtherComponent {}
