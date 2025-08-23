import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { LazyLoadEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { GLOBALS } from 'src/app/_helpers/globals';
import { CargoDTO } from 'src/app/models/cargo.dto';
import { Router } from '@angular/router';
import { TipoFaltaService } from 'src/app/services/tipo-falta.service';

@Component({
    selector: 'app-tipo-falta-list',
    templateUrl: './tipo-falta-list.component.html',
    styleUrls: ['./tipo-falta-list.component.scss'],
    encapsulation: ViewEncapsulation.None

})
export class TipoFaltaListComponent implements OnInit {

  @ViewChild('dttipoFalta') grid!: Table;

  totalSistema: number;
  totalIgreja: number;
  
  totalRegistros: number = 0
  igrejaId: number = GLOBALS.igrejaId;

  perfil: string = GLOBALS.perfil;

  tipoFaltas: CargoDTO[] = [];

  public page = 0;
  public linesPerPage = 6;
  public nome ='';

   constructor(
    private tipoFaltaService: TipoFaltaService,
    private router: Router,
    
      ) { }


  ngOnInit() {     
    // Não precisa mais chamar loadConfisoes() aqui por causa do Lazy carregamento do primeNg que ja faz isso
    // this.grid.reset();//atualiza a tabela do primeng
   };

  loadTipoFaltasLazy(event: LazyLoadEvent) {
    const page = event!.first! / event!.rows!; // divisão para encontrar a paginações
    this.loadTipoFaltas(this.igrejaId, this.nome.toLocaleLowerCase(),  page, this.linesPerPage);
  }


  loadTipoFaltas(igrejaId, nome,  page, linesPerPage )  {  
    this.tipoFaltaService.getByPageTipoFaltaFromIgreja(igrejaId, nome, page, linesPerPage)
    .subscribe(
       response => {
         this.tipoFaltas = response['content'].sort((a,b) => b.id - a.id);
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
