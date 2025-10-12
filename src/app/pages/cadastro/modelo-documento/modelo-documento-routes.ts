import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ModeloDocumentoFormComponent } from './modelo-documento-form/modelo-documento-form.component';
import { ModeloDocumentoListComponent } from './modelo-documento-list/modelo-documento-list.component';


export const MODELO_DOCUMENTO_ROUTES: Routes = [
  {
    path: '',
       children: [
         {
           path: '',
           component: ModeloDocumentoListComponent,
           data: {
             title: 'Modelo Documentos',
             path: 'modelodocumentos'
           },
         },
         {
           path: 'new',
           component: ModeloDocumentoFormComponent,
           data: {
             title: 'Modelo Documentos',
             path: 'modelodocumentos'
           },
         },
         {
           path: ':id/edit',
           component: ModeloDocumentoFormComponent,
           data: {
             title: 'Modelo Documentos',
             path: 'modelodocumentos'
           },
         },
       ],
     },
   ];