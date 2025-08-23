import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LazyLoadEvent, SharedModule } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { UsuarioDTO } from 'src/app/models/usuario.dto';
import { StorageService } from 'src/app/services/storage.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { GLOBALS } from 'src/app/_helpers/globals';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardComponent } from '../../../../shared/components/card/card.component';

@Component({
    selector: 'app-usuario-list',
    templateUrl: './usuario-list.component.html',
    styleUrls: ['./usuario-list.component.scss'],
    standalone: true,
    imports: [CardComponent, ButtonModule, FormsModule, RouterLink, TableModule, SharedModule, NgIf, NgbTooltip]
})
export class UsuarioListComponent implements OnInit {

  @ViewChild('dtusuario') grid!: Table;

  totalRegistros: number = 0

  perfil: string = GLOBALS.perfil;

  usuarios: UsuarioDTO[] = [];

  public page = 0;
  public linesPerPage = 6;
  public name = '';

  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
    public http: HttpClient,
    public storage: StorageService

  ) {
  }


  ngOnInit() {
    // O CARREGAMENTO FICA POIR CONTA DO LAZY loadUsuarioLazy
    // this.loadUsuarios(); 
  };

  loadUsuariosLazy(event: LazyLoadEvent) {
    const page = event!.first! / event!.rows!; // divisão para encontrar a paginações
    this.loadUsuarios(this.name.toLocaleLowerCase(), page, this.linesPerPage);
  }


  loadUsuarios(name, page, linesPerPage) {
      this.usuarioService
        .getPageFromUsuario(name, page, linesPerPage)
        .subscribe(
          response => {
            this.usuarios = response['content'].sort((a, b) => b.id - a.id)
            this.totalRegistros = response.totalElements
          }),
        error => {
          if (error.status == 403) {
            this.router.navigate(['auth/signin'])

          } else {
            this.router.navigate(['maintenance/offline-ui'])
          }
        };
  }
}
