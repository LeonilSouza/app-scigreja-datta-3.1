import { Route } from "@angular/router";
import { DefaultComponent } from "./default/default.component";
import { ErrorComponent } from "../pages/maintenance/error/error.component";

export const DASHBOARD_ROUTE: Route[] = [
  {
    path: '',
    redirectTo: 'default',
    pathMatch: 'full',
  },
  {
    path: 'default',
    component: DefaultComponent,
  },
  { path: "**", component: ErrorComponent },
];
