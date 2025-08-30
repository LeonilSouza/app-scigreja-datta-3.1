import { Component, OnInit, ViewChild } from '@angular/core';
import { LazyLoadEvent } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { Router, RouterLink } from '@angular/router';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { GLOBALS } from 'src/app/app-config';
import { IgrejaDTO } from 'src/app/theme/shared/models/igreja.dto';
import { IgrejaService } from 'src/app/theme/shared/services/igreja.service';
import { StorageService } from 'src/app/theme/shared/services/storage.service';
import { UsuarioService } from 'src/app/theme/shared/services/usuario.service';
import { InputGroup } from "primeng/inputgroup";
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-igreja-list',
  templateUrl: './igreja-list.component.html',
  styleUrls: ['./igreja-list.component.scss'],
  standalone: true,
  imports: [
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    TableModule,
    SharedModule,
    NgbTooltip,
    InputGroup
],
providers: []
})

export class IgrejaListComponent implements OnInit {
  @ViewChild('dtigreja') grid!: Table;

  active = 1;
  activePills = 4;
  activeVetical = 'top';

  public activeTab: string;

  igrejaId: number = GLOBALS.igrejaId;

  totalRegistros: number = 0;

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
  }

  loadIgrejasLazy(event: LazyLoadEvent) {
    // Carregamento necessário para pegar o setor do USUARO comum
    let localUser = this.storage.getLocalUser();
    if (localUser && localUser.email) {
      let email = localUser.email;
      this.usuarioService.getUsuarioFromEmail(email).subscribe((response) => {
        this.setor = response['igrejas'][0]['setor']['id'];
        const page = event!.first! / event!.rows!; // divisão para encontrar a paginações
        this.loadIgrejas(this.nome, this.setor, page, this.linesPerPage);
      });
    }
  }

  loadIgrejas(nome, setor, page, linesPerPage) {
    if (this.perfil === 'ADMIN') {
      // Se for Admin Buasca todas as igrejas de todos os setores
      setor = 0; //Para pegar todas as igrejas
      this.igrejaService
        .getPageFromIgreja(nome, setor, page, linesPerPage)
        .subscribe({
          next: (response) => {
            this.igrejas = response['content'].sort((a, b) => b.id - a.id);
            this.totalRegistros = response.totalElements;
          },
          error: (error) => {
            if (error.status == 403) {
              this.router.navigate(['login']);
            } else {
              this.router.navigate(['login']);
            }
          },
        });
    } else {
      //Se  for Usuario, busca Apenas as Igreja do setor que o usuario recebeu acesso
      this.igrejaService
        .getPageFromIgreja(nome, this.setor, page, linesPerPage)
        .subscribe(
          (response) => {
            this.igrejas = response['content'].sort((a, b) => b.id - a.id);
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
}
