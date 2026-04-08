import { Component, OnInit, ViewChild } from '@angular/core';
import { LazyLoadEvent } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TipoFaltaService } from 'src/app/theme/shared/services/tipo-falta.service';
import { CargoDTO } from 'src/app/theme/shared/models/cargo.dto';
import { nomeIgrejaSignal, igrejaIdSignal, nomeUsuarioSignal, perfilSignal, setorIdSignal } from 'src/app/theme/shared/_helpers/shared-signals';
import { InputGroup } from 'primeng/inputgroup';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-tipo-falta-list',
  templateUrl: './tipo-falta-list.component.html',
  styleUrls: ['./tipo-falta-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // ModalModule.forRoot(),
    TableModule,
    ButtonModule,
    RouterLink,
    InputGroup,
    SharedModule,
    // NgbTooltip
  ],
  providers: [
    TipoFaltaService
  ]


})
export class TipoFaltaListComponent implements OnInit {

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

  @ViewChild('dttipoFalta') grid!: Table;

  totalSistema!: number;
  totalIgreja!: number;

  totalRegistros: number = 0

  tipoFaltas: CargoDTO[] = [];

  public page = 0;
  public linesPerPage = 6;
  public nome = '';

  constructor(
    private tipoFaltaService: TipoFaltaService,
    private router: Router,

  ) { }


  ngOnInit() {
    // Não precisa mais chamar loadConfisoes() aqui por causa do Lazy carregamento do primeNg que ja faz isso
    // this.grid.reset();//atualiza a tabela do primeng
  };

  loadTipoFaltasLazy(event: LazyLoadEvent) {
    const page = event!.first! / event!.rows!; // divisão para encontrar a paginações
    this.loadTipoFaltas(this.igrejaId, this.nome.toLocaleLowerCase(), page, this.linesPerPage);
  }


  loadTipoFaltas(igrejaId: number, nome: string, page: number, linesPerPage: number) {
    this.tipoFaltaService.getByPageTipoFaltaFromIgreja(igrejaId, nome, page, linesPerPage)
      .subscribe(
        response => {
          this.tipoFaltas = response['content'].sort((a: { id: number; }, b: { id: number; }) => b.id - a.id);
          this.totalRegistros = response.totalElements
        },
        (error) => {
          if (error.status == 403) {
            this.router.navigate(['login'])

          } else {
            this.router.navigate(['login'])
          }
        });
  }


}
