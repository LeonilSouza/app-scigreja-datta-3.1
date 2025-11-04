import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Table, TableModule } from 'primeng/table';
import { Subscription } from 'rxjs';

import moment from 'moment';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StorageService } from 'src/app/theme/shared/services/storage.service';
import { CasoService } from 'src/app/theme/shared/services/caso.service';
import { IgrejaService } from 'src/app/theme/shared/services/igreja.service';
import { LazyLoadEvent, MenuItem } from 'primeng/api';
import { IgrejaDTO } from 'src/app/theme/shared/models/igreja.dto';
import { API_CONFIG } from 'src/app/app-config';
import { nomeIgrejaSignal, igrejaIdSignal, nomeUsuarioSignal, perfilSignal, setorIdSignal } from 'src/app/theme/shared/_helpers/shared-signals';
import { DisciplinaService } from 'src/app/theme/shared/services/disciplina.service';
import { PessoaService } from 'src/app/theme/shared/services/pessoa.service';
import { TipoFaltaService } from 'src/app/theme/shared/services/tipo-falta.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SplitButtonModule } from 'primeng/splitbutton';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { InputGroup } from "primeng/inputgroup";
import { ButtonModule } from 'primeng/button';


@Component({
  selector: 'app-casos-tratado-list',
  templateUrl: './caso-list.component.html',
  styleUrls: ['./caso-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SplitButtonModule,
    SharedModule,
    SelectModule,
    ButtonModule,
    DatePicker,
    TableModule,
    RouterLink,
    InputGroup
],
  providers: [
    CasoService,
    IgrejaService,
    DisciplinaService,
    PessoaService,
    TipoFaltaService

  ]
})
export class CasoListComponent implements OnInit {

  nomeIgrejaSignal = nomeIgrejaSignal; //Signal 
  igrejaIdSignal = igrejaIdSignal;
  nomeUsuarioSignal = nomeUsuarioSignal;
  perfilSignal = perfilSignal;
  setorIdSignal = setorIdSignal;

  nomeIgreja = nomeIgrejaSignal();
  igrejaId = igrejaIdSignal();
  nomeUsuario = nomeUsuarioSignal();
  perfil = perfilSignal();

  @ViewChild('dtcaso') grid!: Table;

  dataAtual = moment();

  subscription: Subscription;

  //Necessario apenas para uso da dataAta
  casoListForm: FormGroup;

  totalCasosAtivo: number;
  totalProvasVencida: number;

  active = 1;
  activePills = 4;
  activeVetical = 'top';

  situacao: string = 'Prova';


  totalRegistros: number = 0

  casos: IgrejaDTO[] = [];


  public page = 0;
  public linesPerPage = 6;
  public nome = '';

  printItems: MenuItem[];

  // VARIAVEIS DE CONTROLE
  casosAtivos: boolean = true;
  vencidas: boolean = false;
  arquivados: boolean = false;

  constructor(
    public storage: StorageService,
    private casoService: CasoService,
    private router: Router,
    private formBuilder: FormBuilder
  ) {

  }

  ngOnInit(): void {
    this.countTotalCasosAtivo();
    this.countTotalProvasVencida();
    this.buildCasoListForm();
    this.printItems = this.getPrintItems;
  }

  loadCasosLazy(event: LazyLoadEvent) {
    if (this.vencidas) {
      const page = event!.first! / event!.rows!; // divisão para encontrar a paginações
      this.linesPerPage = event.rows;
      this.loadProvasVencidas(this.nome.toLocaleLowerCase(), this.situacao, page, this.linesPerPage);
    } else if (this.arquivados) {
      const page = event!.first! / event!.rows!; // divisão para encontrar a paginações
      this.linesPerPage = event.rows;
      this.loadTodasProvas(this.nome.toLocaleLowerCase(), page, this.linesPerPage);
    } else {
      const page = event!.first! / event!.rows!; // divisão para encontrar a paginações
      this.linesPerPage = event.rows;
      this.loadCasos(this.nome.toLocaleLowerCase(), this.situacao, page, this.linesPerPage);
    }
  }

  private buildCasoListForm() {
    this.casoListForm = this.formBuilder.group({
      dtCaso: [null]
    });
  }

  // Carrega a data atual para o campo data no modalAta
  setData() {
    this.casoListForm.controls['dtCaso'].setValue(this.dataAtualFormatada());
  }

  dataAtualFormatada() {
    let data = new Date(),
      dia = data.getDate().toString().padStart(2, '0'),
      mes = (data.getMonth() + 1).toString().padStart(2, '0'),
      ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }

  dataUS(value = this.casoListForm.controls['dtCaso'].value) {
    let data_brasileira = value; //Postgres usa este formato no Jasper 
    let data_americana = data_brasileira.split('/').reverse().join('-'); // CONVERTE DATA BRASILEIRA EM AMERICANA. Preciso da data no formato americano p/ jsaper com MySQL.

    let url = (`${API_CONFIG.baseUrl}/relatorios/atas/?nome=ata-casos-tratados&igreja=${this.igrejaId}&data_caso=${data_brasileira}`)
    window.open(url, "_blank");

  }

  loadCasos(nome, situacao, page, linesPerPage): void {
    this.casoService.getByCasosFromIgreja(this.igrejaId, nome, situacao, page, linesPerPage)
      .subscribe(
        response => {
          this.casos = response['content'].sort((a, b) => b.id - a.id)
          this.totalRegistros = response.totalElements
        },
        error => {
          if (error.status == 403) {
            this.router.navigate(['login/signin'])

          } else {
            this.router.navigate(['login/signin'])
          }
        });
  }

  loadProvasVencidas(nome, situacao, page, linesPerPage) {
    this.casoService.getProvasVencidasFromIgreja(this.igrejaId, nome, situacao, page, linesPerPage)
      .subscribe(
        response => {
          this.casos = response['content'].sort((a, b) => b.id - a.id)
          this.totalRegistros = response.totalElements
        },
        error => {
          if (error.status == 403) {
            this.router.navigate(['login/signin'])

          } else {
            this.router.navigate(['login/signin'])
          }
        });
  }

  loadTodasProvas(nome, page, linesPerPage) {
    this.casoService.getArquivadosFromIgreja(this.igrejaId, nome, page, linesPerPage)
      .subscribe(
        response => {
          this.casos = response['content'].sort((a, b) => b.id - a.id)
          this.totalRegistros = response.totalElements

        },
        error => {
          if (error.status == 403) {
            this.router.navigate(['login/signin'])

          } else {
            this.router.navigate(['login/signin'])
          }
        });
  }

  // Métodos dos CheckBox

  // Para buscar todos os casos em ativos ou em andamento
  onChangeCasos($event: { target: { checked: boolean; }; currentTarget: { value: any; }; }) {
    const isChecked = $event.target.checked;
    if (isChecked) {
      this.vencidas = false;
      this.arquivados = false;
      this.casosAtivos = true;
      this.loadCasos(this.nome, this.situacao, this.page, this.linesPerPage)
    } else if (!isChecked) {
      $event.target.checked = true;
    }
  }

  // Para buscar todos os casos com provas vencidas aguardando veredito
  onChangeVencidas($event: { target: { checked: boolean; }; currentTarget: { value: any; }; }) {
    const isChecked = $event.target.checked;
    if (isChecked) {
      this.vencidas = true;
      this.arquivados = false;
      this.casosAtivos = false;
      this.loadProvasVencidas(this.nome, this.situacao, this.page, this.linesPerPage)
    } else if (!isChecked) {
      if (this.casosAtivos === false && this.arquivados === false) {
        this.casosAtivos = true;
        this.loadCasos(this.nome, this.situacao, this.page, this.linesPerPage)
      }
    }
  }

  countTotalCasosAtivo() {
    const situacao = 'Prova';
    this.casoService.countCasoAtivoFromIgreja(this.igrejaId, situacao)
      .subscribe(
        response => {
          this.totalCasosAtivo = response;
        },
        error => { });
  }

  countTotalProvasVencida() {
    const situacao = 'Prova';
    this.casoService.countProvaVencidaFromIgreja(this.igrejaId, situacao)
      .subscribe(
        response => {
          this.totalProvasVencida = response;
        },
        error => { });
  }


  // Para buscar todo os casos arquivados ou encerrados
  onChangeArquivados($event: { target: { checked: boolean; }; }) {
    const isChecked = $event.target.checked;
    if (isChecked) {
      this.arquivados = true;
      this.vencidas = false;
      this.casosAtivos = false;
      this.loadTodasProvas(this.nome, this.page, this.linesPerPage)
    } else if (!isChecked) {
      if (this.casosAtivos === false && this.vencidas === false) {
        this.casosAtivos = true;
        this.loadCasos(this.nome, this.situacao, this.page, this.linesPerPage)
      }
    }
  }

  getPrintItems = [
    {
      label: 'Ficha - Tratamento',
      icon: 'pi pi-file',
      target: '_blank',
      url: (`${API_CONFIG.baseUrl}/relatorios/list/?nome=ficha-tratamento-caso&igreja=${this.igrejaId}`)

    },
    {
      label: 'Posição - Provas',
      icon: 'pi pi-check',
      target: '_blank',
      url: (`${API_CONFIG.baseUrl}/relatorios/list/?nome=posicao-tratamento-caso&igreja=${this.igrejaId}`)
    }
  ];


  limpaPesaquisa() {
    this.nome = '';
  }

}
