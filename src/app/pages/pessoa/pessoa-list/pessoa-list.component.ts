import { Component, DestroyRef, inject, OnInit, ViewChild } from '@angular/core';
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
import { API_CONFIG } from 'src/app/app-config';
import { PessoaService } from 'src/app/theme/shared/services/pessoa.service';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { igrejaIdSignal, perfilSignal } from 'src/app/theme/shared/_helpers/shared-signals';
import { SharedModule } from "src/app/theme/shared/shared.module";
import { DatePicker } from 'primeng/datepicker';
import { DatasService } from 'src/app/theme/shared/services/datas-service.service';
import { DatasDTO } from 'src/app/theme/shared/models/datas.dto';
import { UiModalComponent } from 'src/app/theme/shared/components/modal/ui-modal/ui-modal.component';
import { SharedService } from 'src/app/theme/shared/services/shared.service';
import { Subject, Subscription } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';


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

  private destroyRef = inject(DestroyRef); // 1. Injete a referência de destruição

  positionChamadaObreiro: 'left' | 'right' | 'top' | 'bottom' | 'center' | 'topleft' | 'topright' | 'bottomleft' | 'bottomright' = 'top';

  visibleChamadaObreiro: boolean = false;

  // Acionamento da modal no HTML  aqui pelo componente (#modalFrequencia)
  @ViewChild('modalChamada') public modalChamada: UiModalComponent | undefined;

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

  dataForm!: FormGroup;
  pessoaListForm!: FormGroup;

  error = '';

  totalMembros: number = 0;
  totalObreiros: number = 0;
  totalNovos: number = 0;
  totalCongregados: number = 0;

  subscription!: Subscription;

  totalGeralMembros!: number;

  totalRegistros: number = 0

  statusNome: string = 'Ativo';

  pessoas: PessoaListDTO[] = [];

  printItems!: MenuItem[];

  datas: DatasDTO = new DatasDTO();

  public page = 0;
  public linesPerPage: any = 8;
  public nomeSemAcento = ''; // Coluna alternativa para gravar dados sem acento
  public cpfOuCnpj = ''

  constructor(
    private pessoaService: PessoaService,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private datasService: DatasService,
    private sharedService: SharedService,
    private toastr: ToastrService,
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

  ngOnDestroy() {
    // console.log('Limpando recursos do componente de Frequência...');
    // Se você tiver alguma Subscription manual (this.subscription.unsubscribe())
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }


  private buildPessoaListForm() {
    this.pessoaListForm = this.formBuilder.group({
      id: [0],
      nome: [null],
      ano: [null]
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
      decimo_quarto: [null],

      primeiroSem: [null],
      segundoSem: [null],
      terceiroSem: [null],
      quartoSem: [null],
      quintoSem: [null],
      sextoSem: [null],
      setimoSem: [null],
      oitavoSem: [null],
      nonoSem: [null],
      decimoSem: [null],
      decimo_primeiroSem: [null],
      decimo_segundoSem: [null],
      decimo_terceiroSem: [null],
      decimo_quartoSem: [null]
    });
  }

  // Passa a data selecionada no Datepicker ano para value
  imprimirChamadaObreiros(value = this.pessoaListForm.controls['ano'].value) {
    const partes = value.split('/');
    const mes = partes[0] - (+1);
    const ano = partes[1];

    // Geração dos dias da semana
    this.getDiasDaSemanaNoMes(+ano, +mes);
  }

  //  ROTINA PARA CALCULAR DIAS DE CULTO DOM-TER-QUI | DOM-QUA-SEX
  getDiasDaSemanaNoMes(ano: number, mes: number) {
    const weekdays = [];
    const startDate = new Date(ano, mes, 1);
    const endDate = new Date(ano, mes + 1, 1);

    // Mapeamento dos nomes curtos
    const nomesDias = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];

    for (let date = new Date(startDate); date < endDate; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay();
      let incluir = false;

      // Lógica de filtro baseada nas propriedades da classe
      if (this.dom_ter_qui && (dayOfWeek === 0 || dayOfWeek === 2 || dayOfWeek === 4)) {
        incluir = true;
      } else if (this.dom_qua_sex && (dayOfWeek === 0 || dayOfWeek === 3 || dayOfWeek === 5)) {
        incluir = true;
      }

      if (incluir) {
        weekdays.push({
          dia: new Date(date),           // Ex: 24
          diaSemana: nomesDias[dayOfWeek], // Ex: "SAB"
        });
      }
    }
    // Dias da semana
    this.dataForm.controls['primeiro'].setValue(weekdays[0].dia.toLocaleDateString('pt-BR'));
    this.dataForm.controls['segundo'].setValue(weekdays[1].dia.toLocaleDateString('pt-BR'));
    this.dataForm.controls['terceiro'].setValue(weekdays[2].dia.toLocaleDateString('pt-BR'));
    this.dataForm.controls['quarto'].setValue(weekdays[3].dia.toLocaleDateString('pt-BR'));
    this.dataForm.controls['quinto'].setValue(weekdays[4].dia.toLocaleDateString('pt-BR'));
    this.dataForm.controls['sexto'].setValue(weekdays[5].dia.toLocaleDateString('pt-BR'));
    this.dataForm.controls['setimo'].setValue(weekdays[6].dia.toLocaleDateString('pt-BR'));
    this.dataForm.controls['oitavo'].setValue(weekdays[7].dia.toLocaleDateString('pt-BR'));
    this.dataForm.controls['nono'].setValue(weekdays[8].dia.toLocaleDateString('pt-BR'));
    this.dataForm.controls['decimo'].setValue(weekdays[9].dia.toLocaleDateString('pt-BR'));
    this.dataForm.controls['decimo_primeiro'].setValue(weekdays[10].dia.toLocaleDateString('pt-BR'));
    this.dataForm.controls['decimo_segundo'].setValue(weekdays[11].dia.toLocaleDateString('pt-BR'));

    if (weekdays[12]) {
      this.dataForm.controls['decimo_terceiro'].setValue(weekdays[12].dia.toLocaleDateString('pt-BR'));
    } else {
      this.dataForm.controls['decimo_terceiro'].setValue(null);
    }

    if (weekdays[13]) {
      this.dataForm.controls['decimo_quarto'].setValue(weekdays[13].dia.toLocaleDateString('pt-BR'));
    } else {
      this.dataForm.controls['decimo_quarto'].setValue(null);
    }

    // Nomes Curtos Semana DOM | TER | Etc...
    this.dataForm.controls['primeiroSem'].setValue(weekdays[0].diaSemana);
    this.dataForm.controls['segundoSem'].setValue(weekdays[1].diaSemana);
    this.dataForm.controls['terceiroSem'].setValue(weekdays[2].diaSemana);
    this.dataForm.controls['quartoSem'].setValue(weekdays[3].diaSemana);
    this.dataForm.controls['quintoSem'].setValue(weekdays[4].diaSemana);
    this.dataForm.controls['sextoSem'].setValue(weekdays[5].diaSemana);
    this.dataForm.controls['setimoSem'].setValue(weekdays[6].diaSemana);
    this.dataForm.controls['oitavoSem'].setValue(weekdays[7].diaSemana);
    this.dataForm.controls['nonoSem'].setValue(weekdays[8].diaSemana);
    this.dataForm.controls['decimoSem'].setValue(weekdays[9].diaSemana);
    this.dataForm.controls['decimo_primeiroSem'].setValue(weekdays[10].diaSemana);
    this.dataForm.controls['decimo_segundoSem'].setValue(weekdays[11].diaSemana);

    if (weekdays[12]) {
      this.dataForm.controls['decimo_terceiroSem'].setValue(weekdays[12].diaSemana);
    } else {
      this.dataForm.controls['decimo_terceiroSem'].setValue(null);
    }

    if (weekdays[13]) {
      this.dataForm.controls['decimo_quartoSem'].setValue(weekdays[13].diaSemana);
    } else {
      this.dataForm.controls['decimo_quartoSem'].setValue(null);
    }


    this.updateDatas();

    return weekdays;
  }

  // FIM ROTINA PARA CALCULAR DIAS DE CULTO DOM-TER-QUI | DOM-QUA-SEX


  updateDatas() {
    const data: DatasDTO = Object.assign(new DatasDTO(), this.dataForm.value);
    data.id = 1;
    this.datasService.update(data)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
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
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
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
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe(
        response => {
          response ? this.totalMembros = response : 0;
        },
        () => { });
  }

  countObreirosAtivos() {
    const tipoMembro = 'Obreiro';
    const situacaoCadastral = 'Ativo';
    this.pessoaService.countMembrosAtivosFromIgreja(this.igrejaId, situacaoCadastral, tipoMembro)
      .subscribe(
        response => {
          response ? this.totalObreiros = response : 0;
        },
        () => { });
  }

  getPrintItems = [
    {
      label: 'Lista de obreiros Ativos',
      icon: 'fas fa-users',
      target: '_blank',
      url: `${API_CONFIG.baseUrl}/relatorios/list/?nome=lista-de-obreiros&igreja=${this.igrejaId}`

    },
    {
      label: 'Lista de obreiros Ativos - Foto',
      icon: 'fas fa-users',
      target: '_blank',
      url: `${API_CONFIG.baseUrl}/relatorios/list/?nome=lista-de-obreiros-foto&igreja=${this.igrejaId}`

    },
    {
      separator: true,
    },
    {
      label: 'Chamada de Obreiros',
      icon: 'fas fa-users',
      command: () => {
        this.pessoaListForm.controls['ano'].setValue(this.sharedService.mesAno());
        this.positionChamadaObreiro = 'top';
        this.visibleChamadaObreiro = true; // Abre a modal
      }
    },
    {
      separator: true,
    },
    // {
    //   label: 'Ficha de Membro',
    //   icon: 'pi pi-user',
    //   command: () => {
    //     //Relatórios da Segunda Fabrica Estatica/Consolidada - Agora basta criar o relatorio no jasper e passar o nome junto com o filtro
    //     this.pessoaService.gerarFichaMembro(this.id)
    //       .subscribe({
    //         next: (blob) => {
    //           const url = window.URL.createObjectURL(blob);
    //           window.open(url, '_blank'); // Abre o PDF direto em uma nova aba
    //         },
    //         error: (err) => {
    //           this.toastr.error('Erro ao gerar o relatório Livro Caixa Mensal.');
    //           console.error(err);
    //         }
    //       });
    //   }
    // },
    {
      // label: 'Ficha em branco',
      // icon: 'fas fa-book-reader',
      // // target: '_blank',
      // // url: `${API_CONFIG.baseUrl}/relatorios/list/?nome=ficha-branco&igreja=${this.igrejaId}`

    }
  ];

  countNovos() {
    const situacaoCadastral = 'Ativo';
    this.pessoaService.countNovos(this.igrejaId, situacaoCadastral)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe(
        response => {
          response ? this.totalNovos = response.length : 0;
        },
        () => { });
  }

  imprimirFichaMembro(id: any) {
      //Relatórios da Segunda Fabrica Estatica/Consolidada - Agora basta criar o relatorio no jasper e passar o nome junto com o filtro
        this.pessoaService.gerarFichaMembro(id)
          .subscribe({
            next: (blob) => {
              const url = window.URL.createObjectURL(blob);
              window.open(url, '_blank'); // Abre o PDF direto em uma nova aba
            },
            error: (err) => {
              this.toastr.error('Erro ao gerar o relatório Livro Caixa Mensal.');
              console.error(err);
            }
          });
  }

  countCongregadosAtivos() {
    const tipoMembro = 'Congregado';
    const situacaoCadastral = 'Ativo';
    this.pessoaService.countMembrosAtivosFromIgreja(this.igrejaId, situacaoCadastral, tipoMembro)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe(
        response => {
          response ? this.totalCongregados = response : 0;
        },
        () => { });
  }

  private showError(error: { message: any; }) {
    this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.message });
  }


}
