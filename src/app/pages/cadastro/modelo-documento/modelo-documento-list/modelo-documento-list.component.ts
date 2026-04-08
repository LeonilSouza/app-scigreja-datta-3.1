import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { LazyLoadEvent, SharedModule } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { Router, RouterLink } from '@angular/router';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DepartamentoService } from 'src/app/theme/shared/services/departamento.service';
import { CargoService } from 'src/app/theme/shared/services/cargo.service';
import { VariavelService } from 'src/app/theme/shared/services/variavel.service';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { ModeloDocumentoService } from 'src/app/theme/shared/services/modelo-documento.service';
import { nomeIgrejaSignal, igrejaIdSignal, nomeUsuarioSignal, perfilSignal, setorIdSignal } from 'src/app/theme/shared/_helpers/shared-signals';
import { ModeloDocumentoDTO } from 'src/app/theme/shared/models/modelo-documento.dto';
import { StorageService } from 'src/app/theme/shared/services/storage.service';
import { InputGroup } from 'primeng/inputgroup';
@Component({
  selector: 'app-modelo-documento-list',
  templateUrl: './modelo-documento-list.component.html',
  styleUrls: ['./modelo-documento-list.component.scss'],
  standalone: true,
  imports: [
    ButtonModule,
    FormsModule, RouterLink,
    CardComponent,
    TableModule,
    SharedModule,
    NgbTooltip,
    InputGroup
  ],
  providers: [
    ModeloDocumentoService,
    DepartamentoService,
    CargoService,
    VariavelService
  ]
})

export class ModeloDocumentoListComponent implements OnInit {

  nomeIgrejaSignal = nomeIgrejaSignal; //Signal 
  igrejaIdSignal = igrejaIdSignal;
  nomeUsuarioSignal = nomeUsuarioSignal;
  perfilSignal = perfilSignal;
  setorIdSignal = setorIdSignal;

  nomeIgreja = nomeIgrejaSignal();
  igrejaId = igrejaIdSignal();
  nomeUsuario = nomeUsuarioSignal();
  perfil = perfilSignal();
  setorId = setorIdSignal();

  @ViewChild('dtmodelodocumento') grid!: Table;


  totalRegistros: number = 0
  modeloDocumentos: ModeloDocumentoDTO[] = [];

  public page = 0;
  public linesPerPage = 8;
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


  loadModeloDocumentos(igrejaId: number, nome: string, tipo: string, page: number, linesPerPage: number) {
    // Carrega modeloDocumentoDepartamentos
    this.modeloDocumentoService.getByPageModeloDocumentoFromIgreja(igrejaId, nome, tipo, page, linesPerPage)
      .subscribe({
        next: (response) => {
          this.modeloDocumentos = response['content'].sort((b: { id: number; }, a: { id: number; }) => b.id - a.id)
          this.totalRegistros = response.totalElements

        },
        error: (error): void => {
          if (error.status == 403) {
            this.router.navigate(['login'])

          } else {
            this.router.navigate(['login'])
          }
        }
      })
  }
}