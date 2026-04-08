import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { LazyLoadEvent, MessageService, SharedModule } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { nomeIgrejaSignal, igrejaIdSignal, nomeUsuarioSignal, perfilSignal, setorIdSignal } from 'src/app/theme/shared/_helpers/shared-signals';
import { InputGroup } from 'primeng/inputgroup';
import { TituloMinisterialService } from 'src/app/theme/shared/services/titulo-ministerial-service';
import { TituloMinisterialDTO } from 'src/app/theme/shared/models/titulo-ministerial.dto';

@Component({
  selector: 'app-titulo-ministerial-list',
  templateUrl: './titulo-ministerial-list.component.html',
  styleUrls: ['./titulo-ministerial-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CardComponent,
    ButtonModule,
    FormsModule,
    RouterLink,
    TableModule,
    SharedModule,
    NgbTooltip,
    InputGroup
  ],
  providers: [
    TituloMinisterialService
  ]
})
export class TituloMinisterialListComponent implements OnInit {

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


  @ViewChild('dttitulo') grid!: Table;

  totalMinisterioSistema!: number;
  totalMinisterioIgreja!: number;totalRegistros: number = 0
  tituloMinisteriais: TituloMinisterialDTO[] = [];

  error = '';

  public page = 0;
  public linesPerPage = 6;
  public nome = '';
  
  titulos: any;

  constructor(
    private tituloMinisterialService: TituloMinisterialService,
    private messageService: MessageService

  ) { }


  ngOnInit() {
    // this.grid.reset();//atualiza a tabela do primeng
  };

  loadTituloMinisteriaisLazy(event: LazyLoadEvent) {
    const page = event!.first! / event!.rows!; // divisão para encontrar a paginações
    this.loadTituloMinisteriais(this.igrejaId, this.nome.toLocaleLowerCase(), page, this.linesPerPage);
  }

  loadTituloMinisteriais(igrejaId: number, nome: string, page: number, linesPerPage: number) {
    this.tituloMinisterialService.getByPageTituloMinisterialFromIgreja(igrejaId, nome, page, linesPerPage)
      .subscribe({
        next: (response) => {
          this.tituloMinisteriais = response['content'].sort((a: { id: number; }, b: { id: number; }) => b.id - a.id);
          this.totalRegistros = response.totalElements
        },
        error: (error) => {
          this.error = error;
          this.showError(error)
        }
      });
  }

  private showError(error: { message: any; }) {
    this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.message });
  }




}
