import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-un-authorized',
  imports: [RouterModule, CommonModule],
  templateUrl: './un-authorized.component.html',
  styleUrl: './un-authorized.component.scss'
})
export class UnAuthorizedComponent {}
