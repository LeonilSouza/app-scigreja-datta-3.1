import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { LazyLoadEvent, SharedModule } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { GLOBALS } from 'src/app/_helpers/globals';
import { Router, RouterLink } from '@angular/router';
import { VariavelDTO } from 'src/app/models/variavel.dto';
import { VariavelService } from 'src/app/services/variavel.service';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardComponent } from '../../../../shared/components/card/card.component';
@Component({
    selector: 'app-variavel-list',
    templateUrl: './variavel-list.component.html',
    styleUrls: ['./variavel-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [CardComponent, ButtonModule, FormsModule, RouterLink, TableModule, SharedModule, NgbTooltip]
})

export class VariavelListComponent implements OnInit {

  @ViewChild('dtvariavel') grid!: Table;


  totalRegistros: number = 0
  igrejaId: number = GLOBALS.igrejaId;
  perfil: string = GLOBALS.perfil;
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


  loadVariaveis(variavel, page, linesPerPage) {
    this.variavelService.getByPageVariavel(variavel, page, linesPerPage)
      .subscribe({
        next: (response) => {
          this.variaveis = response['content'].sort((a, b) => b.id - a.id)
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