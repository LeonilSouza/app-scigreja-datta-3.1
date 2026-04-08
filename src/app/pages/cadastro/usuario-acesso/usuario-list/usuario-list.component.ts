import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LazyLoadEvent, SharedModule } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { UsuarioDTO } from 'src/app/theme/shared/models/usuario.dto';
import { UsuarioService } from 'src/app/theme/shared/services/usuario.service';
import { StorageService } from 'src/app/theme/shared/services/storage.service';
import { InputGroup } from "primeng/inputgroup";
import { nomeIgrejaSignal, igrejaIdSignal, nomeUsuarioSignal, perfilSignal, setorIdSignal } from 'src/app/theme/shared/_helpers/shared-signals';

@Component({
  selector: 'app-usuario-list',
  templateUrl: './usuario-list.component.html',
  styleUrls: ['./usuario-list.component.scss'],
  standalone: true,
  imports: [
    CardComponent,
    ButtonModule,
    FormsModule,
    RouterLink,
    TableModule,
    SharedModule,
    NgbTooltip,
    InputGroup
  ]
})
export class UsuarioListComponent implements OnInit {

  nomeIgrejaSignal = nomeIgrejaSignal; //Signal 
  igrejaIdSignal = igrejaIdSignal;
  nomeUsuarioSignal = nomeUsuarioSignal;
  perfilSignal = perfilSignal;
  setorIdSignal = setorIdSignal;

  nomeIgreja = nomeIgrejaSignal();
  igrejaId = igrejaIdSignal();
  nomeUsuario = nomeUsuarioSignal();
  perfil = perfilSignal();

  @ViewChild('dtusuario') grid!: Table;

  totalRegistros: number = 0

  usuarios: UsuarioDTO[] = [];

  public page = 0;
  public linesPerPage = 8;
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


  loadUsuarios(name: string, page: number, linesPerPage: number) {
    this.usuarioService
      .getPageFromUsuario(name, page, linesPerPage)
      .subscribe(
        response => {
          this.usuarios = response['content'].sort((a: { id: number; }, b: { id: number; }) => b.id - a.id)
          this.totalRegistros = response.totalElements
        }),
      (      error: { status: number; }) => {
        if (error.status == 403) {
          this.router.navigate(['auth/signin'])

        } else {
          this.router.navigate(['maintenance/offline-ui'])
        }
      };
  }
}
