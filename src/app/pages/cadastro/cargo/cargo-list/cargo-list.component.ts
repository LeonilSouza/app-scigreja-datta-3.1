import { Component, OnInit, ViewChild } from '@angular/core';
import { LazyLoadEvent, SharedModule } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CargoDTO } from 'src/app/theme/shared/models/cargo.dto';
import { CargoService } from 'src/app/theme/shared/services/cargo.service';
import { InputGroup } from 'primeng/inputgroup';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { nomeIgrejaSignal, igrejaIdSignal, nomeUsuarioSignal, perfilSignal, setorIdSignal } from 'src/app/theme/shared/_helpers/shared-signals';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';

@Component({
  selector: 'app-cargo-list',
  templateUrl: './cargo-list.component.html',
  styleUrls: ['./cargo-list.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    TableModule,
    InputGroup,
    ButtonModule,
    RouterLink,
    SharedModule,
    FormsModule,
    CardComponent
  ],
  providers: [CargoService],
})
export class CargoListComponent implements OnInit {

  nomeIgrejaSignal = nomeIgrejaSignal; //Signal 
  igrejaIdSignal = igrejaIdSignal;
  nomeUsuarioSignal = nomeUsuarioSignal;
  perfilSignal = perfilSignal;
  setorIdSignal = setorIdSignal;

  nomeIgreja = nomeIgrejaSignal();
  igrejaId = igrejaIdSignal();
  nomeUsuario = nomeUsuarioSignal();
  perfil = perfilSignal();

  @ViewChild('dtcargo') grid!: Table;

  totalCargosSistema: number;
  totalCargosIgreja: number;

  totalRegistros: number = 0;

  cargos: CargoDTO[] = [];

  public page = 0;
  public linesPerPage = 8;
  public nome = '';

  constructor(
    private cargoService: CargoService,
    private router: Router
  ) { }

  ngOnInit() {
    // this.grid.reset();//atualiza a tabela do primeng
  }

  loadCargosLazy(event: LazyLoadEvent) {
    const page = event!.first! / event!.rows!; // divisão para encontrar a paginações
    this.loadCargos(this.igrejaId, this.nome.toLowerCase(), page, this.linesPerPage);
  }

  loadCargos(igrejaId, nome, page, linesPerPage) {
    this.cargoService
      .getPageCargoFromIgreja(igrejaId, nome, page, linesPerPage)
      .subscribe(
        (response) => {
          this.cargos = response['content'].sort((a, b) => b.id - a.id);
          this.totalRegistros = response.totalElements;
        },
        (error) => {
          if (error.status == 403) {
            this.router.navigate(['login']);
          } else {
            this.router.navigate(['login']);
          }
        }
      );
  }
}
