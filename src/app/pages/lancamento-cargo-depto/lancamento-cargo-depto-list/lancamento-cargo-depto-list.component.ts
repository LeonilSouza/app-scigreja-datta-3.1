import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { Table, TableModule } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { LancamentoCargoDeptoService } from 'src/app/theme/shared/services/lancamento-cargo-depto.service';
import { DepartamentoService } from 'src/app/theme/shared/services/departamento.service';
import { CargoService } from 'src/app/theme/shared/services/cargo.service';
import { nomeIgrejaSignal, igrejaIdSignal, nomeUsuarioSignal, perfilSignal, setorIdSignal } from 'src/app/theme/shared/_helpers/shared-signals';
import { InputGroup } from 'primeng/inputgroup';
import { ButtonModule } from 'primeng/button';
import { LancamentoCargoDeptoDTO } from 'src/app/theme/shared/models/lancamento-cargo-depto.dto';

@Component({
  selector: 'app-lancamento-cargo-depto-list',
  templateUrl: './lancamento-cargo-depto-list.component.html',
  styleUrls: ['./lancamento-cargo-depto-list.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    TableModule,
    InputGroup,
    ButtonModule,
    RouterLink,
    CommonModule,
    SharedModule,
  ],
  providers: [
    LancamentoCargoDeptoService,
    DepartamentoService,
    CargoService
  ]

})
export class LancamentoCargoDeptoListComponent implements OnInit {

  nomeIgrejaSignal = nomeIgrejaSignal; //Signal 
  igrejaIdSignal = igrejaIdSignal;
  nomeUsuarioSignal = nomeUsuarioSignal;
  perfilSignal = perfilSignal;
  setorIdSignal = setorIdSignal;

  nomeIgreja = nomeIgrejaSignal();
  igrejaId = igrejaIdSignal();
  nomeUsuario = nomeUsuarioSignal();
  perfil = perfilSignal();


  @ViewChild('dtlancamentocargodepto') grid!: Table;


  public page = 0;
  public linesPerPage = 6;
  public nome = '';

  totalRegistros: number = 0

  lancamentoCargoDeptos: LancamentoCargoDeptoDTO[] = [];


  constructor(

    private lancamentoCargoDeptoService: LancamentoCargoDeptoService,
    private router: Router) { }

  ngOnInit() {
    // this.grid.reset();//atualiza a tabela do primeng
  };

  loadLancamentoCargoDeptoLazy(event: LazyLoadEvent) {
    const page = event!.first! / event!.rows!; // divisão para encontrar a paginações
    this.loadLancamentoCargoDepto(this.igrejaId, this.nome.toLocaleLowerCase(), page, this.linesPerPage);
  }

  loadLancamentoCargoDepto(igrejaId, nome, page, linesPerPage) {
    // Carrega LancamentoCargoDeptoDepartamentos
    this.lancamentoCargoDeptoService.getByPageLancamentoCargoDeptoFromIgreja(igrejaId, nome, page, linesPerPage)
      .subscribe(
        response => {
          this.lancamentoCargoDeptos = response['content'].sort((a, b) => b.id - a.id);
          this.totalRegistros = response.totalElements
        },
        error => {
          if (error.status == 403) {
            this.router.navigate(['login'])

          } else {
            this.router.navigate(['login'])
          }
        });
  }

}
