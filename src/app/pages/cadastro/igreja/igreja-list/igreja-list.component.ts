import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { IgrejaService } from 'src/app/services/igreja.service';
import { LazyLoadEvent, SharedModule } from 'primeng/api';
import { IgrejaDTO } from 'src/app/models/igreja.dto';
import { Table, TableModule } from 'primeng/table';
import { GLOBALS } from 'src/app/_helpers/globals';
import { StorageService } from 'src/app/services/storage.service';
import { Router, RouterLink } from '@angular/router';
import { UsuarioService } from 'src/app/services/usuario.service';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardComponent } from '../../../../shared/components/card/card.component';

@Component({
    selector: 'app-igreja-list',
    templateUrl: './igreja-list.component.html',
    styleUrls: ['./igreja-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [CardComponent, ButtonModule, FormsModule, NgIf, RouterLink, TableModule, SharedModule, NgbTooltip]
})

export class IgrejaListComponent implements OnInit {

  @ViewChild('dtigreja') grid!: Table;

  active = 1;
  activePills = 4;
  activeVetical = 'top';

  public activeTab: string;

  totalRegistros: number = 0


  perfil: string = GLOBALS.perfil;

  igrejas: IgrejaDTO[] = [];

  setor: number = 0;

  public page = 0;
  public linesPerPage = 6;
  public nome = '';

  constructor(
    private igrejaService: IgrejaService,
    private router: Router,
    public storage: StorageService,
    public usuarioService: UsuarioService

  ) {
    this.activeTab = 'home';
    // this.loadSetorIdUser()
  }


  ngOnInit() {
    // O CARREGAMENTO FICA POIR CONTA DO LAZY loadIgrejaLazy
    // this.setor= this.loadSetorIdUser();
  };

  loadIgrejasLazy(event: LazyLoadEvent) {
    // Carregamento necessário para pegar o setor do USUARO comum
    let localUser = this.storage.getLocalUser();
    if (localUser && localUser.email) {
      let email = localUser.email;
      this.usuarioService.getUsuarioFromEmail(email)
        .subscribe(
          response => {
            this.setor= response['igrejas'][0]['setor']['id'];
            const page = event!.first! / event!.rows!; // divisão para encontrar a paginações
            this.loadIgrejas(this.nome, this.setor, page, this.linesPerPage);
          }
        )
    }
  }


  loadIgrejas(nome, setor, page, linesPerPage) {
    if (this.perfil === 'ADMIN') { // Se for Admin Buasca todas as igrejas de todos os setores
      setor = 0;//Para pegar todas as igrejas
      this.igrejaService.getPageFromIgreja(nome, setor, page, linesPerPage)
        .subscribe({
          next: (response) => {
            this.igrejas = response['content'].sort((a, b) => b.id - a.id)
            this.totalRegistros = response.totalElements
          },
          error: error => {
            if (error.status == 403) {
              this.router.navigate(['login/signin'])

            } else {
              this.router.navigate(['login/signin'])
            }
          }
        });

    } else { //Se  for Usuario, busca Apenas as Igreja dop setor que o usuario recebeu acesso
      this.igrejaService.getPageFromIgreja(nome, this.setor, page, linesPerPage)
        .subscribe(
          response => {
            this.igrejas = response['content'].sort((a, b) => b.id - a.id)
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
}