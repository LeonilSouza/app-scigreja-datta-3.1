// angular import
import { Component, OnInit, ViewChild } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { InputGroup } from 'primeng/inputgroup';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { DisciplinaService } from 'src/app/theme/shared/services/disciplina.service';
import { DisciplinaDTO } from 'src/app/theme/shared/models/disciplina.dto';
import { SharedModule } from "src/app/theme/shared/shared.module";
import { igrejaIdSignal, perfilSignal } from 'src/app/theme/shared/_helpers/shared-signals';


// project import

@Component({
  selector: 'app-disciplina-list',
  templateUrl: './disciplina-list.component.html',
  styleUrl: './disciplina-list.component.scss',
  standalone:true,
  imports: [
    RouterModule,
    TableModule,
    InputGroup,
    ButtonModule,
    RouterLink,
    SharedModule
  ],
  providers: [DisciplinaService, DecimalPipe, MessageService]
})
export class DisciplinaListComponent implements OnInit {

  igrejaIdSignal = igrejaIdSignal;
  perfilSignal = perfilSignal;

  igrejaId = igrejaIdSignal();
  perfil = perfilSignal();

  @ViewChild('dtdisciplina') grid!: Table;

  totalDisciplinasSistema!: number;
  totalDisciplinasIgreja!: number;

  totalRegistros: number = 0

  disciplinas: DisciplinaDTO[] = [];

  error = '';

  public page = 0;
  public linesPerPage = 8;
  public nome = '';

  constructor(
    private disciplinaService: DisciplinaService,
    private messageService: MessageService,


  ) { }



  ngOnInit() {
    // this.grid.reset();//atualiza a tabela do primeng

  };

  loadDisciplinasLazy(event: any) {
    const page = event!.first! / event!.rows!; // divisão para encontrar a paginações
    this.loadDisciplinas(this.igrejaId, this.nome.toLowerCase(), page, this.linesPerPage);
  }


  loadDisciplinas(igrejaId: number, nome: string, page: number, linesPerPage: number) {
    this.disciplinaService.getByPageDisciplinaFromIgreja(igrejaId, nome, page, linesPerPage)
      .subscribe({
        next: (response) => {
          this.disciplinas = response['content'].sort((a: { id: number; }, b: { id: number; }) => b.id - a.id);
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

