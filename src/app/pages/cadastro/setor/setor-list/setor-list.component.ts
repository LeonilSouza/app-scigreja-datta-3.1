import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { LazyLoadEvent, SharedModule } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { GLOBALS } from 'src/app/_helpers/globals';
import { SetorDTO } from 'src/app/models/setor.dto';
import { SetorService } from 'src/app/services/setor.service';
import { Router, RouterLink } from '@angular/router';
import { StorageService } from 'src/app/services/storage.service';
import { STORAGE_KEYS } from 'src/app/config/storage-keys.config';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardComponent } from '../../../../shared/components/card/card.component';


@Component({
    selector: 'app-setor-list',
    templateUrl: './setor-list.component.html',
    styleUrls: ['./setor-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [CardComponent, ButtonModule, FormsModule, RouterLink, TableModule, SharedModule, NgIf, NgbTooltip]
})
export class SetorListComponent implements OnInit {

  @ViewChild('dtsetor') grid!: Table;

  totalSetores: number;
  total: number;

  totalRegistros = 0
  igrejaId: number = GLOBALS.igrejaId;

  perfil: string = GLOBALS.perfil;

  setores: SetorDTO[] = [];

  public page = 0;
  public linesPerPage = 6;
  public nome = '';

  constructor(
    private setorService: SetorService,
    private router: Router,
    private storage: StorageService

  ) {

  }

  ngOnInit() {
    this.countSetores();
    // this.grid.reset();//atualiza a tabela do primeng
  }

  loadSetoresLazy(event: LazyLoadEvent) {
    const page = event!.first! / event!.rows!; // divisão para encontrar a paginações
    this.loadSetores(this.nome.toLocaleLowerCase(), page, this.linesPerPage);
  }


  loadSetores(nome, page, linesPerPage) {
      this.setorService
        .getPageSetor(nome, page, linesPerPage)
        .subscribe({
          next: (response) => {
            this.setores = response['content'].sort((a, b) => b.id - a.id);
            this.totalRegistros = response.totalElements;
          },
          error: (error) => {
            if (error.status == 403) {
              this.router.navigate(['login/signin'])

            } else {
              this.router.navigate(['maintenance/offline-ui'])
            }
          }
        });
  }

  countSetores() {
    this.setorService
      .geCountSetor()
      .subscribe({
        next: (response) => {
          this.totalSetores = response;
        },
        error: (error) => {
          if (error.status == 403) {
            this.router.navigate(['login/signin'])

          } else {
            this.router.navigate(['login/signin'])
          }
        }
      });
  }

}
