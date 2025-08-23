import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DepartamentoDTO } from 'src/app/models/departamento.dto';
import { DepartamentoService } from 'src/app/services/departamento.service';
import { GLOBALS } from 'src/app/shared/global/globals';

@Component({
  selector: 'app-departamento-list',
  templateUrl: './departamento-list.component.html',
  styleUrls: ['./departamento-list.component.scss'],
  encapsulation: ViewEncapsulation.None

})
export class DepartamentoListComponent implements OnInit {


  @ViewChild (DatatableComponent) filterDepartamento: DatatableComponent;

  temp: DepartamentoDTO[] = [];

  rows: DepartamentoDTO[] = [];

  departamentos: DepartamentoDTO[] = [];

  ColumnMode = ColumnMode;

  igrejaId: number = GLOBALS.igrejaId;

  perfil: string = GLOBALS.perfil;


 public count = 100;
  public offset = 0;
  public limit = 10;
  public pageSize = 0;
  public nome = '';

  public changeLimit(event): void {
    this.limit = parseInt(event.target.value);
  }

  public onPage(event): void {
    this.count = event.count;
    this.pageSize = event.pageSize; //page no backend
    this.limit = event.limit; //linesPerPage no backend
    this.offset = event.offset;
    this.nome = event.nome;
  }

   constructor(
    public http: HttpClient,
    private departamentoService: DepartamentoService,
    private router: Router,
    private toast: ToastrService
      ) { }


  ngOnInit() {
    this.igrejaId = GLOBALS.igrejaId
    this.loadDepartamentos(this.igrejaId,this.nome, this.pageSize, this.limit); // Valores Default
   };


   loadDepartamentos(igrejaId, nome, pageSize, limit)  {
    // Carrega Departamentos
     this.departamentoService.getByPageDepartamentoFromIgreja(igrejaId, nome, pageSize, limit)
        .subscribe(
           response => {
             this.departamentos = response['content']
             this.rows = this.departamentos;
             this.temp = [...this.departamentos];
            },
            error => {
              if (error.status == 403) {
                this.router.navigate(['login/signin'])

               } else {
               this.router.navigate(['login/signin'])
              }
            });
      }

  deleteDepartamento(departamentos) {
    const mustDelete = confirm('Deseja realmente excluir este item?');
    if (mustDelete){
      this.departamentoService.delete(departamentos.id).subscribe(
        () => {
          this.rows = this.temp = this.rows.filter(element => element != departamentos)
          this.toast.success('Departamento deletado com sucesso')
        },
        error => {
          this.toast.error('Ocorreu um erro ao tentar excluir')
        });
      }
    }

  updateFilter(event) {
    const nome = event.target.value.toLowerCase();
    this.departamentoService.getByPageDepartamentoFromIgreja(this.igrejaId, nome, this.pageSize, this.limit)
      .subscribe(
         response => {
           this.departamentos = response['content'].sort((a,b) => b.id - a.id)
          })
          // filter our data
          this.temp = this.departamentos.filter(function (d) {
          return d.nome.toLowerCase().indexOf(nome) !== -1 || !nome;
     });
    //atualize as linhas
    this.rows = this.temp;
    // Sempre que o filtro mudar, volte sempre para a primeira página
    this.filterDepartamento.offset = 0;
  }



showError() {
alert('Ocorreu um erro, tente mais tarde.')
}
}
