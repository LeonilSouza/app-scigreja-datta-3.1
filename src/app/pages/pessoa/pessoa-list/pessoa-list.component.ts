import { Component, OnInit, ViewChild } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, RouterLink, RouterModule } from '@angular/router';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputGroup } from 'primeng/inputgroup';
import { TabsModule } from 'primeng/tabs';
import { PessoaListDTO } from 'src/app/theme/shared/models/pessoa.dto';
import { API_CONFIG } from 'src/app/app-config';
import { PessoaService } from 'src/app/theme/shared/services/pessoa.service';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { igrejaIdSignal, perfilSignal } from 'src/app/theme/shared/_helpers/shared-signals';
import moment from 'moment';
import { SharedModule } from "src/app/theme/shared/shared.module";
import { DatePicker } from 'primeng/datepicker';
import { DatasService } from 'src/app/theme/shared/services/datas-service.service';
import { DatasDTO } from 'src/app/theme/shared/models/datas.dto';


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
    DatePicker,
    NgbTooltip,
    TabsModule,
    InputGroup,
    CardComponent,
    RouterModule,
    SharedModule
  ],
  providers: [
    MessageService,
    DatasService
  ]
})

export class PessoaListComponent implements OnInit {

  igrejaIdSignal = igrejaIdSignal;
  perfilSignal = perfilSignal;

  igrejaId = igrejaIdSignal();
  perfil = perfilSignal();

  id!: number;

  datasId!: number;

  dom_ter_qui: boolean = true;
  dom_qua_sex: boolean = false;

  situacaoCadastral = [
    { nome: 'Ativo', id: 0 }, { nome: 'Inativo', id: 1 },
    { nome: 'Transferido', id: 2 }, { nome: 'Falecido', id: 3 }
  ];

  @ViewChild('dtpessoa') grid!: Table;

  dataAtual = moment();

  dataForm!: FormGroup;
  pessoaListForm!: FormGroup;

  error = '';

  totalMembros: number = 0;
  totalObreiros: number = 0;
  totalNovos: number = 0;
  totalCongregados: number = 0;

  totalGeralMembros!: number;

  totalRegistros: number = 0

  statusNome: string = 'Ativo';

  pessoas: PessoaListDTO[] = [];

  printItems!: MenuItem[];

  datas: DatasDTO = new DatasDTO();

  public page = 0;
  public linesPerPage: any = 6;
  public nomeSemAcento = ''; // Coluna alternativa para gravar dados sem acento
  public cpfOuCnpj = ''

  constructor(
    private pessoaService: PessoaService,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private datasService: DatasService
  ) {

  }

  ngOnInit() {
    // this.loadPessoas(this.nome, this.page, this.linesPerPage); // Valores Default // Não precisa mais por causa do Lazy
    this.countMembrosAtivos();
    this.countObreirosAtivos();
    this.countNovos();
    this.buildPessoaListForm();
    this.buildDataForm();
    this.countCongregadosAtivos();
    this.printItems = this.getPrintItems;
    this.pessoaListForm.controls['nome'].setValue('Ativo');
  };

  private buildPessoaListForm() {
    this.pessoaListForm = this.formBuilder.group({
      id: [0],
      nome: [null],
      dtChamada: [null]
    });
  }

  private buildDataForm() {
    this.dataForm = this.formBuilder.group({
      id: [0],
      primeiro: [null],
      segundo: [null],
      terceiro: [null],
      quarto: [null],
      quinto: [null],
      sexto: [null],
      setimo: [null],
      oitavo: [null],
      nono: [null],
      decimo: [null],
      decimo_primeiro: [null],
      decimo_segundo: [null],
      decimo_terceiro: [null],
      decimo_quarto: [null]
    });
  }

  // Seta data atual no DatePicker
  setData() {
    this.pessoaListForm.controls['dtChamada'].setValue(this.dataAtualFormatada());
  }

  // Passa a data selecionada no Datepicker para value
  dataUS(value = this.pessoaListForm.controls['dtChamada'].value) {
    let data_brasileira = value; //Postgres usa este formato no Jasper 
    let data_americana = data_brasileira.split('/').reverse().join('-'); // CONVERTE DATA BRASILEIRA EM AMERICANA. Preciso da data no formato americano p/ jsaper com MySQL.
    let [ano, mes, dia] = data_americana.split('-').map(Number);
    mes = mes - 1; // Meses em javascript vai de 0 a 11

    this.getDiasDaSemanaNoMes(ano, mes);
  }

  getDiasDaSemanaNoMes(ano, mes) {
    const weekdays = [];
    // Define a data de início como o primeiro dia do mês especificado
    const startDate = new Date(ano, mes, 1);
    // Define a data de fim como o primeiro dia do mês seguinte, o que nos permite
    // iterar até o último dia do mês atual sem nos preocuparmos com a quantidade
    // exata de dias (28, 29, 30 ou 31)
    const endDate = new Date(ano, mes + 1, 1);

    // Loop por todos os dias do mês
    for (let date = new Date(startDate); date < endDate; date.setDate(date.getDate() + 1)) {
      // const index = date.getDate()
      const dayOfWeek = date.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado

      // Verifica se o dia da semana é igual aos dias desejados. 0 = Domingo, 1 = segunda, ...
     //  Para cultos Dom | Ter | Quin
      if (this.dom_ter_qui) {
        if (dayOfWeek === 0 || dayOfWeek === 2 || dayOfWeek === 4) {
          // Adiciona a data (ou apenas o dia do mês, se preferir) ao array
          weekdays.push(new Date(date)); // Cria uma nova instância para evitar problemas de referência
        }
      }
       
     //  Para cultos Dom | Qua | Sex
      if (this.dom_qua_sex) {
        if (dayOfWeek === 0 || dayOfWeek === 3 || dayOfWeek === 5) {
          // Adiciona a data (ou apenas o dia do mês, se preferir) ao array
          weekdays.push(new Date(date)); // Cria uma nova instância para evitar problemas de referência
        }
      }
    }
    this.dataForm.controls['primeiro'].setValue(weekdays[0].toLocaleDateString('pt-BR'));
    this.dataForm.controls['segundo'].setValue(weekdays[1].toLocaleDateString('pt-BR'));
    this.dataForm.controls['terceiro'].setValue(weekdays[2].toLocaleDateString('pt-BR'));
    this.dataForm.controls['quarto'].setValue(weekdays[3].toLocaleDateString('pt-BR'));
    this.dataForm.controls['quinto'].setValue(weekdays[4].toLocaleDateString('pt-BR'));
    this.dataForm.controls['sexto'].setValue(weekdays[5].toLocaleDateString('pt-BR'));
    this.dataForm.controls['setimo'].setValue(weekdays[6].toLocaleDateString('pt-BR'));
    this.dataForm.controls['oitavo'].setValue(weekdays[7].toLocaleDateString('pt-BR'));
    this.dataForm.controls['nono'].setValue(weekdays[8].toLocaleDateString('pt-BR'));
    this.dataForm.controls['decimo'].setValue(weekdays[9].toLocaleDateString('pt-BR'));
    this.dataForm.controls['decimo_primeiro'].setValue(weekdays[10].toLocaleDateString('pt-BR'));
    this.dataForm.controls['decimo_segundo'].setValue(weekdays[11].toLocaleDateString('pt-BR'));

    if (weekdays[12]) {
      this.dataForm.controls['decimo_terceiro'].setValue(weekdays[12].toLocaleDateString('pt-BR'));
    } else {
      this.dataForm.controls['decimo_terceiro'].setValue(null);
    }

    if (weekdays[13]) {
      this.dataForm.controls['decimo_quarto'].setValue(weekdays[13].toLocaleDateString('pt-BR'));
    } else {
      this.dataForm.controls['decimo_quarto'].setValue(null);
    }

    this.updateDatas();

    return weekdays;
  }

  updateDatas() {
    const data: DatasDTO = Object.assign(new DatasDTO(), this.dataForm.value);
    data.id = 1;
    this.datasService.update(data)
      .subscribe({
        next: () => {
          let url = (`${API_CONFIG.baseUrl}/relatorios/list/?nome=chamada-de-obreiros&igreja=${this.igrejaId}`)
          window.open(url, "_blank");

        },
        error: () => {
        }

      })
  }


  dataAtualFormatada() {
    let data = new Date(),
      dia = data.getDate().toString().padStart(2, '0'),
      mes = (data.getMonth() + 1).toString().padStart(2, '0'),
      ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }

  onChangeDomTerQui($event: { target: { checked: boolean; }; currentTarget: { value: any; }; }) {
    const isChecked = $event.target.checked;
    if (isChecked) {
      this.dom_ter_qui = true;
      this.dom_qua_sex = false;
    } else if (!isChecked) {
      this.dom_ter_qui = false;
      this.dom_qua_sex = true;
    }
  }
  onChangeDomQuaSex($event: { target: { checked: boolean; }; currentTarget: { value: any; }; }) {
    const isChecked = $event.target.checked;
    if (isChecked) {
      this.dom_ter_qui = false;
      this.dom_qua_sex = true;
    } else if (!isChecked) {
      this.dom_ter_qui = true;
      this.dom_qua_sex = false;
    }
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
    this.pessoaService.countMembrosAtivosFromIgreja(this.igrejaId, situacaoCadastral, tipoMembro)
      .subscribe(
        response => {
          response ? this.totalMembros = response : 0;
        },
        error => { });
  }

  countObreirosAtivos() {
    const tipoMembro = 'Obreiro';
    const situacaoCadastral = 'Ativo';
    this.pessoaService.countMembrosAtivosFromIgreja(this.igrejaId, situacaoCadastral, tipoMembro)
      .subscribe(
        response => {
          response ? this.totalObreiros = response : 0;
        },
        error => { });
  }

  getPrintItems = [
    {
      label: 'Lista de obreiros',
      icon: 'fas fa-users',
      target: '_blank',
      url: `${API_CONFIG.baseUrl}/relatorios/list/?nome=lista-de-obreiros&igreja=${this.igrejaId}`

    },
    {
      separator: true,
    },
    {
      label: 'Lista de Membros',
      icon: 'fas fa-users',
      command: () => {
        // alert('')
      },
      // target: '_blank',
      // url: `${API_CONFIG.baseUrl}/relatorios/list/?nome=chamada-de-obreiros&igreja=${this.igrejaId}`

    },
    {
      separator: true,
    },
    {
      label: 'Ficha de membros',
      icon: 'fas fa-clipboard-list',
      // target: '_blank',
      // url: `${API_CONFIG.baseUrl}/relatorios/list/?nome=ficha-de-membros&igreja=${this.igrejaId}`

    },
    {
      label: 'Ficha em branco',
      icon: 'fas fa-book-reader',
      // target: '_blank',
      // url: `${API_CONFIG.baseUrl}/relatorios/list/?nome=ficha-branco&igreja=${this.igrejaId}`

    }
  ];

  countNovos() {
    const situacaoCadastral = 'Ativo';
    this.pessoaService.countNovos(this.igrejaId, situacaoCadastral)
      .subscribe(
        response => {
          response ? this.totalNovos = response.length : 0;
        },
        error => { });
  }

  countCongregadosAtivos() {
    const tipoMembro = 'Congregado';
    const situacaoCadastral = 'Ativo';
    this.pessoaService.countMembrosAtivosFromIgreja(this.igrejaId, situacaoCadastral, tipoMembro)
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
