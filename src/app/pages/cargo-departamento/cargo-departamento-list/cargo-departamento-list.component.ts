import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { Table, TableModule } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { CargoDepartamentoService } from 'src/app/theme/shared/services/cargo-departamento.service';
import { DepartamentoService } from 'src/app/theme/shared/services/departamento.service';
import { CargoService } from 'src/app/theme/shared/services/cargo.service';
import { CargoDeptoDTO } from 'src/app/theme/shared/models/cargo-depto.dto';
import { nomeIgrejaSignal, igrejaIdSignal, nomeUsuarioSignal, perfilSignal, setorIdSignal } from 'src/app/theme/shared/_helpers/shared-signals';
import { InputGroup } from 'primeng/inputgroup';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-cargo-departamento-list',
  templateUrl: './cargo-departamento-list.component.html',
  styleUrls: ['./cargo-departamento-list.component.scss'],
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
    CargoDepartamentoService,
    DepartamentoService,
    CargoService
  ]

})
export class CargoDepartamentoListComponent implements OnInit {

  nomeIgrejaSignal = nomeIgrejaSignal; //Signal 
  igrejaIdSignal = igrejaIdSignal;
  nomeUsuarioSignal = nomeUsuarioSignal;
  perfilSignal = perfilSignal;
  setorIdSignal = setorIdSignal;

  nomeIgreja = nomeIgrejaSignal();
  igrejaId = igrejaIdSignal();
  nomeUsuario = nomeUsuarioSignal();
  perfil = perfilSignal();


  @ViewChild('dtcargodepto') grid!: Table;


  public page = 0;
  public linesPerPage = 6;
  public nome = '';

  totalRegistros: number = 0

  cargoDeptos: CargoDeptoDTO[] = [];


  constructor(

    private cargoDeptoService: CargoDepartamentoService,
    private router: Router) { }

  ngOnInit() {
    // this.grid.reset();//atualiza a tabela do primeng
  };

  loadCargoDeptoLazy(event: LazyLoadEvent) {
    const page = event!.first! / event!.rows!; // divisão para encontrar a paginações
    this.loadCargoDepto(this.igrejaId, this.nome.toLocaleLowerCase(), page, this.linesPerPage);
  }

  loadCargoDepto(igrejaId, nome, page, linesPerPage) {
    // Carrega CargoDeptoDepartamentos
    this.cargoDeptoService.getByPageCargoDeptoFromIgreja(igrejaId, nome, page, linesPerPage)
      .subscribe(
        response => {
          this.cargoDeptos = response['content'].sort((a, b) => b.id - a.id);
          this.totalRegistros = response.totalElements
        },
        error => {
          if (error.status == 403) {
            this.router.navigate(['login/signin'])

          } else {
            this.router.navigate(['login/signin'])
          }
        });
  }

}
