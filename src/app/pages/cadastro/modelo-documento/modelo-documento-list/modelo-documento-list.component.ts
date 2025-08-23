import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { LazyLoadEvent, SharedModule } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { GLOBALS } from 'src/app/_helpers/globals';
import { StorageService } from 'src/app/services/storage.service';
import { Router, RouterLink } from '@angular/router';
import { ModeloDocumentoDTO } from 'src/app/models/modelo-documento.dto';
import { ModeloDocumentoService } from 'src/app/services/modelo-documento.service';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { NgIf } from '@angular/common';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
@Component({
    selector: 'app-modelo-documento-list',
    templateUrl: './modelo-documento-list.component.html',
    styleUrls: ['./modelo-documento-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [ButtonModule, FormsModule, RouterLink, CardComponent, TableModule, SharedModule, NgIf, NgbTooltip]
})

export class ModeloDocumentoListComponent implements OnInit {

  @ViewChild('dtmodelodocumento') grid!: Table;


  totalRegistros: number = 0
  igrejaId: number = GLOBALS.igrejaId;
  perfil: string = GLOBALS.perfil;
  modeloDocumentos: ModeloDocumentoDTO[] = [];

  public page = 0;
  public linesPerPage = 6;
  public nome = '';
  public tipo = 'Padrao';

  constructor(
    private modeloDocumentoService: ModeloDocumentoService,
    private router: Router,

    public storage: StorageService

  ) {
  }


  ngOnInit() {
    // O CARREGAMENTO FICA POIR CONTA DO LAZY loadDocumentoLazy
    // this.setor= this.loadSetorIdUser();
  };

  loadDocumentoLazy(event: LazyLoadEvent) {
    const page = event!.first! / event!.rows!; // divisão para encontrar a paginações
    this.loadModeloDocumentos(this.igrejaId, this.nome, this.tipo, page, this.linesPerPage);
  }


  loadModeloDocumentos(igrejaId, nome, tipo, page, linesPerPage) {
    // Carrega modeloDocumentoDepartamentos
    this.modeloDocumentoService.getByPageModeloDocumentoFromIgreja(igrejaId, nome, tipo, page, linesPerPage)
      .subscribe({
        next: (response) => {
          this.modeloDocumentos = response['content'].sort((b, a) => b.id - a.id)
          this.totalRegistros = response.totalElements

        },
        error: (error): void => {
          if (error.status == 403) {
            this.router.navigate(['login/signin'])

          } else {
            this.router.navigate(['login/signin'])
          }
        }
      })
  }
}