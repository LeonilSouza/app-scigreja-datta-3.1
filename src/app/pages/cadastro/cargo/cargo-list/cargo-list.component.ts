import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { LazyLoadEvent, SharedModule } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CargoDTO } from 'src/app/models/cargo.dto';
import { CargoService } from 'src/app/services/cargo.service';
import { Router, RouterLink } from '@angular/router';
import { GLOBALS } from 'src/app/_helpers/globals';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardComponent } from '../../../../shared/components/card/card.component';

@Component({
    selector: 'app-cargo-list',
    templateUrl: './cargo-list.component.html',
    styleUrls: ['./cargo-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [CardComponent, ButtonModule, FormsModule, RouterLink, TableModule, SharedModule, NgIf, NgbTooltip]
})
export class CargoListComponent implements OnInit {

  @ViewChild('dtcargo') grid!: Table;

  totalCargosSistema: number;
  totalCargosIgreja: number;
  
  totalRegistros: number = 0
  igrejaId: number = GLOBALS.igrejaId;

  perfil: string = GLOBALS.perfil;

  cargos: CargoDTO[] = [];

  public page = 0;
  public linesPerPage = 6;
  public nome ='';

   constructor(
    private cargoService: CargoService,
    private router: Router,
    
      ) { }


  ngOnInit() {     
    // this.grid.reset();//atualiza a tabela do primeng
   };

  loadCargosLazy(event: LazyLoadEvent) {
    const page = event!.first! / event!.rows!; // divisão para encontrar a paginações
    this.loadCargos(this.igrejaId, this.nome,  page, this.linesPerPage);
  }


  loadCargos(igrejaId, nome,  page, linesPerPage )  {  
    this.cargoService.getPageCargoFromIgreja(igrejaId, nome, page, linesPerPage)
    .subscribe(
       response => {
         this.cargos = response['content'].sort((a,b) => b.id - a.id);
         this.totalRegistros = response.totalElements
        },
        (error) => {
          if (error.status == 403) {
            this.router.navigate(['login/signin'])

          } else {
            this.router.navigate(['login/signin'])
          }
        });
    }


}
