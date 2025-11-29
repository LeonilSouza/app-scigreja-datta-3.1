// angular import
import { Component, OnInit, ViewChild } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { InputGroup } from 'primeng/inputgroup';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { DepartamentoDTO } from 'src/app/theme/shared/models/departamento.dto';
import { SharedModule } from "src/app/theme/shared/shared.module";
import { igrejaIdSignal, perfilSignal } from 'src/app/theme/shared/_helpers/shared-signals';
import { DepartamentoService } from 'src/app/theme/shared/services/departamento.service';


// project import

@Component({
  selector: 'app-departamento-list',
  imports: [RouterModule, TableModule, InputGroup, ButtonModule, RouterLink, SharedModule],
  templateUrl: './departamento-list.component.html',
  styleUrl: './departamento-list.component.scss',
  providers: [DepartamentoService, DecimalPipe, MessageService]
})
export class DepartamentoListComponent implements OnInit {

  igrejaIdSignal = igrejaIdSignal;
  perfilSignal = perfilSignal;

  igrejaId = igrejaIdSignal();
  perfil = perfilSignal();

  @ViewChild('dtdepartamento') grid!: Table;

  totalDepartamentosSistema!: number;
  totalDepartamentosIgreja!: number;

  totalRegistros: number = 0

  departamentos: DepartamentoDTO[] = [];

  error = '';

  public page = 0;
  public linesPerPage = 8;
  public nome = '';

  constructor(
    private departamentoService: DepartamentoService,
    private messageService: MessageService,


  ) { }



  ngOnInit() {
    // this.grid.reset();//atualiza a tabela do primeng

  };

  loadDepartamentosLazy(event: any) {
    const page = event!.first! / event!.rows!; // divisão para encontrar a paginações
    this.loadDepartamentos(this.igrejaId, this.nome.toLowerCase(), page, this.linesPerPage);
  }


  loadDepartamentos(igrejaId: number, nome: string, page: number, linesPerPage: number) {
    this.departamentoService.getByPageDepartamentoFromIgreja(igrejaId, nome, page, linesPerPage)
      .subscribe({
        next: (response) => {
          this.departamentos = response['content'].sort((a: { id: number; }, b: { id: number; }) => b.id - a.id);
          this.totalRegistros = response.totalElements
        },
        error: (error) => {
          this.error = error;
          this.showError(error)
        }
      });
  }

  private showError(error: { message: any; }) {
    this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.message });
  }


}

