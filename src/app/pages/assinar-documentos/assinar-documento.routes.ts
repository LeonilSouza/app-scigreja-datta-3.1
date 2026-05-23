import { Routes } from '@angular/router';
import { AssinarDocumentoComponent } from './assinar-documentos-form/assinar-documento.component';

export const ASSINAR_DOCUMENTO_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: AssinarDocumentoComponent,
        data: {
          title: 'Assinar documentos',
          path: 'assinar-documentos',
        },
      },
      {
        path: 'assinar-documentos',
        component: AssinarDocumentoComponent,
        data: {
          title: 'Assinar documentos',
          path: 'assinar-documentos',
        },
      }
    ],
  },
];

