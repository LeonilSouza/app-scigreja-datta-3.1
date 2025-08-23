import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { LazyLoadEvent, MessageService, SharedModule } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { GLOBALS } from 'src/app/_helpers/globals';

import { TituloMinisterialDTO } from 'src/app/models/titulo-ministerial.dto';
import { TituloMinisterialService } from 'src/app/services/titulo-ministerial-service';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardComponent } from '../../../../shared/components/card/card.component';

@Component({
    selector: 'app-titulo-ministerial-list',
    templateUrl: './titulo-ministerial-list.component.html',
    styleUrls: ['./titulo-ministerial-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [CardComponent, ButtonModule, FormsModule, RouterLink, TableModule, SharedModule, NgIf, NgbTooltip]
})
export class TituloMinisterialListComponent implements OnInit {

  @ViewChild('dttitulo') grid!: Table;

  totalMinisterioSistema: number;
  totalMinisterioIgreja: number;
  
  totalRegistros: number = 0
  igrejaId: number = GLOBALS.igrejaId;

  perfil: string = GLOBALS.perfil;

  tituloMinisteriais: TituloMinisterialDTO[] = [];

  error = '';

  public page = 0;
  public linesPerPage = 6;
  public nome ='';

   constructor(
    private tituloMinisterialService: TituloMinisterialService,
    private messageService: MessageService
    
      ) { }


  ngOnInit() {     
    // this.grid.reset();//atualiza a tabela do primeng
   };

  loadTituloMinisteriaisLazy(event: LazyLoadEvent) {
    const page = event!.first! / event!.rows!; // divisão para encontrar a paginações
    this.loadTituloMinisteriais(this.igrejaId, this.nome.toLocaleLowerCase(),  page, this.linesPerPage);
  }

    loadTituloMinisteriais(igrejaId, nome,  page, linesPerPage )  {  
      this.tituloMinisterialService.getByPageTituloMinisterialFromIgreja(igrejaId, nome, page, linesPerPage)
      .subscribe({
        next: (response) => {
          this.tituloMinisteriais = response['content'].sort((a,b) => b.id - a.id);
          this.totalRegistros = response.totalElements
        },
        error: (error) => {
          this.error = error;
          this.showError(error)
        }
      });
      }
  
      private showError(error) {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.message });
      }
  

    

}
