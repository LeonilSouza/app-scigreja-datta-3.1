import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { LazyLoadEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { Router } from '@angular/router';
import { DepartamentoDTO } from 'src/app/models/departamento.dto';
import { DepartamentoService } from 'src/app/services/departamento.service';
import { GLOBALS } from 'src/app/_helpers/globals';

@Component({
  selector: 'app-departamento-list',
  templateUrl: './departamento-list.component.html',
  styleUrls: ['./departamento-list.component.scss'],
  encapsulation: ViewEncapsulation.None

})
export class DepartamentoListComponent implements OnInit {

  @ViewChild('dtministerial') grid!: Table;
  
  totalRegistros: number = 0
  igrejaId: number = GLOBALS.igrejaId;
  perfil: string = GLOBALS.perfil;
  departamentos: DepartamentoDTO[] = [];

  public page = 0;
  public linesPerPage = 6;
  public nome ='';

   constructor(
    private departamentoService: DepartamentoService,
    private router: Router
    
      ) { }


  ngOnInit() {     
    // this.grid.reset();//atualiza a tabela do primeng
   };

  loadDepartamentosLazy(event: LazyLoadEvent) {
    const page = event!.first! / event!.rows!; // divisão para encontrar a paginações
    this.loadDepartamentos(this.igrejaId, this.nome.toLowerCase(),  page, this.linesPerPage);
  }


  loadDepartamentos(igrejaId, nome,  page, linesPerPage )  {  
    this.departamentoService.getByPageDepartamentoFromIgreja(igrejaId, nome, page, linesPerPage)
    .subscribe(
       response => {
        this.departamentos = response['content'].sort((a,b) => b.id - a.id);
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
