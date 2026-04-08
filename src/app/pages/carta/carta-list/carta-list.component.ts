import { Component, OnInit, ViewChild } from '@angular/core';
import { LazyLoadEvent, MenuItem } from 'primeng/api';
import { Router, RouterLink } from '@angular/router';

import { Table, TableModule } from 'primeng/table';
import { Subject } from 'rxjs';
import { CartaService } from 'src/app/theme/shared/services/carta.service';
import { CartaDTO } from 'src/app/theme/shared/models/carta.dto';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { igrejaIdSignal, nomeIgrejaSignal, nomeUsuarioSignal, perfilSignal, setorIdSignal } from 'src/app/theme/shared/_helpers/shared-signals';
import { SplitButtonModule } from 'primeng/splitbutton';
import { InputGroup } from "primeng/inputgroup";
import { ButtonModule } from 'primeng/button';


@Component({
  selector: 'app-carta-list',
  templateUrl: './carta-list.component.html',
  styleUrls: ['./carta-list.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    SharedModule,
    TableModule,
    RouterLink,
    SplitButtonModule,
    InputGroup,
    ButtonModule
],
  providers: [
    CartaService
  ]

})
export class CartaListComponent implements OnInit {

  nomeIgrejaSignal = nomeIgrejaSignal; //Signal 
  igrejaIdSignal = igrejaIdSignal;
  nomeUsuarioSignal = nomeUsuarioSignal;
  perfilSignal = perfilSignal;
  setorIdSignal = setorIdSignal;

  nomeIgreja = nomeIgrejaSignal();
  igrejaId = igrejaIdSignal();
  nomeUsuario = nomeUsuarioSignal();
  perfil = perfilSignal();

  private destroy$: Subject<void> = new Subject<void>();
  @ViewChild('dtcarta') grid!: Table;

  totalEntradas!: number;
  totalSaidas!: number;


  totalRegistros: number = 0

  cartas: CartaDTO[] = [];

  printItems!: MenuItem[];

  public page = 0;
  public linesPerPage = 6;
  public nome = '';

  constructor(
    private cartaService: CartaService,
    private router: Router

  ) { }

  ngOnInit() {
    // this.loadCartas(this.nome, this.page, this.linesPerPage); // Valores Default // Não precisa mais por causa do Lazy
    this.countEntradas();
    this.countSaidas();
    this.printItems = this.getPrintItems;

  };

  loadCartasLazy(event: LazyLoadEvent) {
    const page = event!.first! / event!.rows!; // divisão para encontrar a paginações
    this.linesPerPage = event.rows!;
    this.loadCartas(this.nome.toLocaleLowerCase(), page, this.linesPerPage);
  }

  getPrintItems = [
    {
      label: 'Cartas',
      icon: 'fas fa-file-alt',
      target: '_blank',
      // url: `${API_CONFIG.baseUrl}/relatorios/list/?nome=lista-de-obreiros&igreja=${this.igrejaId}`

    }
  ];


  loadCartas(nome: string, page: number, linesPerPage: number) {
    this.cartaService.getByPageCartaFromIgreja(this.igrejaId, nome, page, linesPerPage)
      .subscribe({
        next: (response) => {
          this.cartas = response['content']
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

  countEntradas() {
    const tipoCarta = 'Entrada';
    this.cartaService.countEntradasFromIgreja(this.igrejaId, tipoCarta)
      .subscribe({
        next: (response) => {
          this.totalEntradas = response;
        },
        error: (error): void => { }
      })
  }

  countSaidas() {
    const tipoCarta = 'Saida';
    this.cartaService.countEntradasFromIgreja(this.igrejaId, tipoCarta)
      .subscribe({
        next: (response) => {
          this.totalSaidas = response;
        },
        error: (): void => { }
      }
      )
  }
}
