import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LazyLoadEvent, SharedModule } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { IgrejaAtivaDTO } from 'src/app/models/igreja-ativa.dto';
import { LocalIgreja, UsuarioDTO } from 'src/app/models/usuario.dto';
import { SharedService } from 'src/app/services/shared.service';
import { StorageService } from 'src/app/services/storage.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { GLOBALS } from 'src/app/_helpers/globals';
import { CardComponent } from '../../../../shared/components/card/card.component';

@Component({
    selector: 'app-igreja-ativa',
    templateUrl: './igreja-ativa.component.html',
    styleUrls: ['./igreja-ativa.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [CardComponent, TableModule, SharedModule]
})

export class IgrejaAtivaComponent implements OnInit {

  nomeIgreja: string;

  igrejas: IgrejaAtivaDTO[] = [];

  igreja: IgrejaAtivaDTO;

  usuario: UsuarioDTO;

  @ViewChild('dtIgrejaAtiva') grid!: Table;

  totalRegistros: number = 0

  public page = 0;
  public linesPerPage = 6;
  public nome = '';

  constructor(
    public router: Router,
    private storage: StorageService,
    private sharedService: SharedService,
    private toastr: ToastrService,
    private usuarioService: UsuarioService
  ) {
    this.nomeIgreja = GLOBALS.nomeIgreja
  }

  ngOnInit() {
    // this.sedesEFiliais();

  }

  loadIgrejaAtivaLazy(event: LazyLoadEvent) {
    const page = event!.first! / event!.rows!; // divisão para encontrar a paginações
    this.sedesEFiliais();
  }

  sedesEFiliais() {// Funcionando perfeito mesmo dedepis de trocar para setor
    let localUser = this.storage.getLocalUser();
    if (localUser && localUser.email) {
      let email = localUser.email;
      this.usuarioService.getUsuarioFromEmail(email)
        .subscribe(
          response => {
            this.igrejas = response['igrejas'].sort((b, a) => b.id - a.id)
            this.totalRegistros = this.igrejas.length;
            this.usuario = response;
          },
          () => alert('Erro ao carregar a lista')
        )
    }
  }

  showSuccess() {
    this.toastr.success('', 'Igreja ativada com sucesso! ' + (this.nomeIgreja) + '', { timeOut: 3000 });
  }

  trocaIgreja(igreja) {
    GLOBALS.igrejaId = igreja.id
    GLOBALS.nomeIgreja = igreja.nome
    GLOBALS.setorId = igreja['setor'].id
    this.nomeIgreja = igreja.nome,
    
      this.sharedService.setNomeIgreja(igreja.nome);
      this.sharedService.setSetorId(igreja.setorId);

    // Grava a última igreja Ativada
    // Grava igrejaAtivaId e igrejaAtivaNome no banco
    this.usuario.igrejaAtivaId = igreja.id;
    this.usuario.igrejaAtivaNome = igreja.nome;
    const usuario: UsuarioDTO = Object.assign(new UsuarioDTO(), this.usuario);
    this.usuarioService.update(usuario)
      .subscribe({
        next: () => {}
      })

    // Grava no locaStorage
    let igr: LocalIgreja = {
      igrejaId: igreja.id,
      setorId: igreja['setor'].id,
      nomeIgreja: igreja.nome,
      nomeUser: GLOBALS.nomeUsuario,
      perfil: GLOBALS.perfil
    };
    this.storage.setLocalIgreja(igr);
    this.showSuccess();
    () => alert('Erro ao carregar a lista')
  }
}
