import { StorageService } from 'src/app/services/storage.service';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { GLOBALS } from 'src/app/_helpers/globals';
import { CasoService } from '../../../services/caso.service';
import { IgrejaDTO } from 'src/app/models/igreja.dto';
import { Router } from '@angular/router';
import { Table } from 'primeng/table';
import { LazyLoadEvent, MenuItem, PrimeNGConfig } from 'primeng/api';
import { Subscription } from 'rxjs';

import moment from 'moment';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IgrejaService } from 'src/app/services/igreja.service';
import { TranslateService } from '@ngx-translate/core';
import { API_CONFIG } from 'src/app/config/api-config';


@Component({
  selector: 'app-casos-tratado-list',
  templateUrl: './caso-list.component.html',
  styleUrls: ['./caso-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CasoListComponent implements OnInit {

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

  igreja: IgrejaDTO;

  perfil: string = GLOBALS.perfil;

  igrejaId: number = GLOBALS.igrejaId;

  totalRegistros: number = 0

  casos: IgrejaDTO[] = [];

  public activeTab: string;

  public titleCard: 'Casos';

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
    public igrejaService: IgrejaService,
    private router: Router,
    public translate: TranslateService,
    public primeNGConfig: PrimeNGConfig, 
    private formBuilder: FormBuilder
  ) {
    this.activeTab = 'prova';

    //Calendar PrimeNG
    translate.setDefaultLang('pt-br');

    this.subscription = this.translate.stream('primeng').subscribe(data => {
      this.primeNGConfig.setTranslation(data);
    });
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
      this.loadProvasVencidas(this.nome.toLocaleLowerCase(), this.situacao, page, this.linesPerPage);
    } else if (this.arquivados) {
      const page = event!.first! / event!.rows!; // divisão para encontrar a paginações
      this.loadTodasProvas(this.nome.toLocaleLowerCase(), page, this.linesPerPage);
    } else {
      const page = event!.first! / event!.rows!; // divisão para encontrar a paginações
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
    this.casoService.countCasoAtivoFromIgreja(GLOBALS.igrejaId, situacao)
      .subscribe(
        response => {
          this.totalCasosAtivo = response;
        },
        error => { });
  }

  countTotalProvasVencida() {
    const situacao = 'Prova';
    this.casoService.countProvaVencidaFromIgreja(GLOBALS.igrejaId, situacao)
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
