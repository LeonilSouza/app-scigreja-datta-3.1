// angular import
import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert',
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent {
  // public props
  readonly type = input<string>(undefined);
  readonly dismiss = input<string>(undefined);

  // public method
  dismissAlert(element) {
    element.remove();
  }
}
