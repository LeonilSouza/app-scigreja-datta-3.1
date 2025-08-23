import { Component, OnInit, ViewChild } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { RouterLink, RouterModule } from '@angular/router';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputGroup } from 'primeng/inputgroup';
import { TabsModule } from 'primeng/tabs';
import { PessoaListDTO } from 'src/app/theme/shared/models/pessoa.dto';
import { API_CONFIG, GLOBALS } from 'src/app/app-config';
import { PessoaService } from 'src/app/theme/shared/services/pessoa.service';


@Component({
  selector: 'app-pessoa-list',
  templateUrl: './pessoa-list.component.html',
  styleUrls: ['./pessoa-list.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    SelectModule,
    SplitButtonModule,
    RouterLink,
    TableModule,
    NgbTooltip,
    SelectModule,
    TabsModule,
    InputGroup,
    RouterModule
  ],
  providers: [MessageService]
})

export class PessoaListComponent implements OnInit {

   tabs = [
        { route: 'dashboard', label: 'Dashboard', icon: 'pi pi-home' },
        { route: 'transactions', label: 'Transactions', icon: 'pi pi-chart-line' },
        { route: 'products', label: 'Products', icon: 'pi pi-list' },
        { route: 'messages', label: 'Messages', icon: 'pi pi-inbox' }
    ];

  situacaoCadastral = [
    { nome: 'Ativo', id: 0 }, { nome: 'Inativo', id: 1 },
    { nome: 'Transferido', id: 2 }, { nome: 'Falecido', id: 3 }
  ];

  @ViewChild('dtpessoa') grid!: Table;

  error = '';

  totalMembros: number = 0;
  totalObreiros: number = 0;
  totalNovos: number = 0;
  totalCongregados: number = 0;

  totalGeralMembros!: number;

  totalRegistros: number = 0
  igrejaId: number = GLOBALS.igrejaId;

  perfil: string = GLOBALS.perfil;

  statusNome: string = 'Ativo';

  pessoas: PessoaListDTO[] = [];

  printItems!: MenuItem[];

  public page = 0;
  public linesPerPage: any = 8;
  public nomeSemAcento = ''; // Coluna alternativa para gravar dados sem acento
  public cpfOuCnpj = ''
  pessoaList!: FormGroup;

  constructor(
    private pessoaService: PessoaService,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
  ) {

  }

  ngOnInit() {
    // this.loadPessoas(this.nome, this.page, this.linesPerPage); // Valores Default // Não precisa mais por causa do Lazy
    this.countMembrosAtivos();
    this.countObreirosAtivos();
    this.countNovos();
    this.buildPessoaList();
    this.countCongregadosAtivos();
    this.printItems = this.getPrintItems;
    this.pessoaList.controls['nome'].setValue('Ativo')
  };

  private buildPessoaList() {
    this.pessoaList = this.formBuilder.group({
      id: [0],
      nome: [null]
    });
  }

  loadPessoasLazy(event: any) {
    const page = event!.first! / event!.rows!; // divisão para encontrar a paginações
    this.linesPerPage = event.rows;
    this.loadPessoas(this.nomeSemAcento.toLowerCase(), this.statusNome, page, this.linesPerPage);
  }

  ngAfterContentChecked() {
    this.getTotalGeralMembros();// Membros Ativos
  }

  getTotalGeralMembros() {
    this.totalGeralMembros = this.totalMembros + this.totalObreiros;
  }

  onChangeStatus(nome: { value: string; }) {
    this.statusNome = nome.value;
    this.loadPessoas(this.nomeSemAcento.toLowerCase(), this.statusNome, this.page, this.linesPerPage);
  }

  // doSelectOptionsSituacaoEspiritual = (options: INgxSelectOption[]) => {
  //   // this.loadPessoas(this.nomeSemAcento.toLowerCase(), this.situacaoCadastral, this.pageAux, this.linesPerPage);
  // }

  loadPessoas(nomeSemAcento: string, statusNome: string, page: number, linesPerPage: any) {
    this.pessoaService
      .getByPagePessoasFromIgreja(this.igrejaId, nomeSemAcento, statusNome, page, linesPerPage)
      .subscribe({
        next: (response) => {
          this.pessoas = response['content']
          this.totalRegistros = response.totalElements
        },
        error: (error) => {
          this.error = error;
          this.showError(error)
        }
      });

  }

  countMembrosAtivos() {
    const tipoMembro = 'Membro';
    const situacaoCadastral = 'Ativo';
    this.pessoaService.countMembrosAtivosFromIgreja(GLOBALS.igrejaId, situacaoCadastral, tipoMembro)
      .subscribe(
        response => {
          response ? this.totalMembros = response : 0;
        },
        error => { });
  }

  countObreirosAtivos() {
    const tipoMembro = 'Obreiro';
    const situacaoCadastral = 'Ativo';
    this.pessoaService.countMembrosAtivosFromIgreja(GLOBALS.igrejaId, situacaoCadastral, tipoMembro)
      .subscribe(
        response => {
          response ? this.totalObreiros = response : 0;
        },
        error => { });
  }

  getPrintItems = [
    {
      label: 'Lista de obreiros',
      icon: 'fas fa-file-alt',
      target: '_blank',
      url: `${API_CONFIG.baseUrl}/relatorios/list/?nome=lista-de-obreiros&igreja=${this.igrejaId}`

    },
    {
      label: 'Frequência obreiros',
      icon: 'fas fa-book-reader',
      // target: '_blank',
      // url: `${API_CONFIG.baseUrl}/relatorios/list/?nome=chamada-de-obreiros&igreja=${this.igrejaId}`

    },
    {
      label: 'Ficha de membros',
      icon: 'fas fa-clipboard-list',
      // target: '_blank',
      // url: `${API_CONFIG.baseUrl}/relatorios/list/?nome=ficha-de-membros&igreja=${this.igrejaId}`

    },
    {
      label: 'Ficha em branco',
      icon: 'fas fa-clipboard',
      // target: '_blank',
      // url: `${API_CONFIG.baseUrl}/relatorios/list/?nome=ficha-branco&igreja=${this.igrejaId}`

    },
    {
      label: 'Lista de obreiros I',
      icon: 'fas fa-list',
      // target: '_blank',
      // url: `${API_CONFIG.baseUrl}/relatorios/list/?nome=lista-de-obreiros1&igreja=${this.igrejaId}`

    },
    {
      label: 'Lista de obreiros II',
      icon: 'fas fa-list-ul',
      // target: '_blank',
      // url: `${API_CONFIG.baseUrl}/relatorios/list/?nome=lista-de-obreiros2&igreja=${this.igrejaId}`

    },
    {
      label: 'Lista de obreiros III',
      icon: 'fas fa-list-ol',
      // target: '_blank',
      // url: `${API_CONFIG.baseUrl}/relatorios/list/?nome=lista-de-obreiros3&igreja=${this.igrejaId}`

    },
  ];

  countNovos() {
    const situacaoCadastral = 'Ativo';
    this.pessoaService.countNovos(GLOBALS.igrejaId, situacaoCadastral)
      .subscribe(
        response => {
          response ? this.totalNovos = response.length : 0;
        },
        error => { });
  }

  countCongregadosAtivos() {
    const tipoMembro = 'Congregado';
    const situacaoCadastral = 'Ativo';
    this.pessoaService.countMembrosAtivosFromIgreja(GLOBALS.igrejaId, situacaoCadastral, tipoMembro)
      .subscribe(
        response => {
          response ? this.totalCongregados = response : 0;
        },
        error => { });
  }

  private showError(error: { message: any; }) {
    this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.message });
  }


}
