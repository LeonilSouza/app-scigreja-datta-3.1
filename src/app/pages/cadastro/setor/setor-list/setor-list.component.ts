import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { LazyLoadEvent, SharedModule } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { Router, RouterLink } from '@angular/router';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { SetorDTO } from 'src/app/theme/shared/models/setor.dto';
import { SetorService } from 'src/app/theme/shared/services/setor.service';
import { nomeIgrejaSignal, igrejaIdSignal, nomeUsuarioSignal, perfilSignal, setorIdSignal } from 'src/app/theme/shared/_helpers/shared-signals';
import { SharedService } from 'src/app/theme/shared/services/shared.service';
import { InputGroup } from 'primeng/inputgroup';


@Component({
    selector: 'app-setor-list',
    templateUrl: './setor-list.component.html',
    styleUrls: ['./setor-list.component.scss'],
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
    ],
     providers: [
        SetorService,
        SharedService
    ]
})
export class SetorListComponent implements OnInit {
    nomeIgrejaSignal = nomeIgrejaSignal; //Signal 
    igrejaIdSignal = igrejaIdSignal;
    nomeUsuarioSignal = nomeUsuarioSignal;
    perfilSignal = perfilSignal;
    setorIdSignal = setorIdSignal;
  
    nomeIgreja = nomeIgrejaSignal();
    igrejaId = igrejaIdSignal();
    nomeUsuario = nomeUsuarioSignal();
    perfil = perfilSignal();
    setorId = setorIdSignal();

  @ViewChild('dtsetor') grid!: Table;

  totalSetores: number;
  total: number;

  totalRegistros = 0

  setores: SetorDTO[] = [];

  public page = 0;
  public linesPerPage = 6;
  public nome = '';

  constructor(
    private setorService: SetorService,
    private router: Router
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
            this.router.navigate(['login'])

          } else {
            this.router.navigate(['login'])
          }
        }
      });
  }

}
