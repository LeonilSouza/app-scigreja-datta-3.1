// angular import
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-offline-ui',
  imports: [CommonModule, RouterModule],
  templateUrl: './offline-ui.component.html',
  styleUrls: ['./offline-ui.component.scss']
})
export default class OfflineUiComponent {}
