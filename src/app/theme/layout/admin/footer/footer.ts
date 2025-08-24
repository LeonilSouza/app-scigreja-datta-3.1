import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppRoutingModule } from "src/app/app-routing.module";

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {}
