import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { LazyLoadEvent, SharedModule } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { Router, RouterLink } from '@angular/router';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { igrejaIdSignal, nomeIgrejaSignal, nomeUsuarioSignal, perfilSignal, setorIdSignal } from 'src/app/theme/shared/_helpers/shared-signals';
import { VariavelDTO } from 'src/app/theme/shared/models/variavel.dto';
import { VariavelService } from 'src/app/theme/shared/services/variavel.service';
import { InputGroup } from 'primeng/inputgroup';
import { CargoService } from 'src/app/theme/shared/services/cargo.service';
import { DepartamentoService } from 'src/app/theme/shared/services/departamento.service';
@Component({
  selector: 'app-variavel-list',
  templateUrl: './variavel-list.component.html',
  styleUrls: ['./variavel-list.component.scss'],
  standalone: true,
  imports: [
    CardComponent,
    ButtonModule,
    FormsModule,
    RouterLink,
    TableModule,
    SharedModule,
    InputGroup,
    NgbTooltip
  ],
  providers: [
    VariavelService,
    DepartamentoService,
    CargoService
  ]
})

export class VariavelListComponent implements OnInit {

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

  @ViewChild('dtvariavel') grid!: Table;


  totalRegistros: number = 0
  variaveis: VariavelDTO[] = [];

  public page = 0;
  public linesPerPage = 6;
  public variavel = '';

  constructor(
    private variavelService: VariavelService,
    private router: Router,

  ) {
  }


  ngOnInit() {
    // O CARREGAMENTO FICA POIR CONTA DO LAZY loadDocumentoLazy
    // this.setor= this.loadSetorIdUser();
  };

  loadVariavelLazy(event: LazyLoadEvent) {
    const page = event!.first! / event!.rows!; // divisão para encontrar a paginações
    this.loadVariaveis(this.variavel.toLocaleLowerCase(), page, this.linesPerPage);
  }


  loadVariaveis(variavel: string, page: number, linesPerPage: number) {
    this.variavelService.getByPageVariavel(variavel, page, linesPerPage)
      .subscribe({
        next: (response) => {
          this.variaveis = response['content'].sort((a: { id: number; }, b: { id: number; }) => b.id - a.id)
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