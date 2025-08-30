import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { LazyLoadEvent, SharedModule } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { GLOBALS } from 'src/app/app-config';
import { CargoDTO } from 'src/app/theme/shared/models/cargo.dto';
import { CargoService } from 'src/app/theme/shared/services/cargo.service';
import { InputGroup } from 'primeng/inputgroup';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-cargo-list',
  templateUrl: './cargo-list.component.html',
  styleUrls: ['./cargo-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
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
  ],
  providers: [CargoService],
})
export class CargoListComponent implements OnInit {
  @ViewChild('dtcargo') grid!: Table;

  totalCargosSistema: number;
  totalCargosIgreja: number;

  totalRegistros: number = 0;
  igrejaId: number = GLOBALS.igrejaId;

  perfil: string = GLOBALS.perfil;

  cargos: CargoDTO[] = [];

  public page = 0;
  public linesPerPage = 8;
  public nome = '';

  constructor(
    private cargoService: CargoService,
    private router: Router
  ) {}

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
