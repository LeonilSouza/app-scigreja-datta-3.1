import { Component, DestroyRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import moment from 'moment';
import Swal from 'sweetalert2';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { API_CONFIG } from 'src/app/app-config';
import { ContaDTO } from 'src/app/theme/shared/models/conta.dto';
import { FormaDTO } from 'src/app/theme/shared/models/forma.dto';
import { CategoriaDTO } from 'src/app/theme/shared/models/categoria.dto';
import { PessoaService } from 'src/app/theme/shared/services/pessoa.service';
import { SharedService } from 'src/app/theme/shared/services/shared.service';
import { CategoriaService } from 'src/app/theme/shared/services/categoria.service';
import { ContaService } from 'src/app/theme/shared/services/conta.service';
import { CentroCustoService } from 'src/app/theme/shared/services/centro-custo.service';
import { FormaService } from 'src/app/theme/shared/services/forma.service';
import { CentroCustoDTO } from 'src/app/theme/shared/models/centro-custo.dto';
import { PessoaDTO } from 'src/app/theme/shared/models/pessoa.dto';
import { ContasPagarService } from 'src/app/theme/shared/services/contas-pagar.service';
import { igrejaIdSignal, nomeIgrejaSignal, nomeUsuarioSignal, setorIdSignal } from 'src/app/theme/shared/_helpers/shared-signals';
import { DatePicker } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'; // Importe o operador
import { Table } from 'primeng/table';
import { ContasPagarDTO } from 'src/app/theme/shared/models/contas-pagar.dto';
import { Fluid } from 'primeng/fluid';


export class ContasPagarFiltro {
  igrejaId?: number = igrejaIdSignal();
  setorId?: number = setorIdSignal();
  nome?: string = ''.toLowerCase();
  dtInicio?: string = '';
  dtFim?: string = '';
  page: number = 0;
  linesPerPage: number = 10;
  contas?: string = "";
  categorias?: string = "";
  formas?: string = "";
  tipoContasPagar?: string = "";
}

@Component({
  selector: 'app-contas-pagar-list-form',
  templateUrl: './contas-pagar-list-form.component.html',
  styleUrls: ['./contas-pagar-list-form.component.scss'],
  standalone: true,
  imports: [
    RouterModule,
    DatePicker,
    ButtonModule,
    SharedModule,
    Fluid,
    InputNumberModule
  ],
  providers: [
    ContasPagarService,
    CategoriaService,
    ContaService,
    CentroCustoService,
    PessoaService,
    FormaService

  ]
})
export class ContasPagarListFormComponent implements OnInit {

  positionContasPagar: 'left' | 'right' | 'top' | 'bottom' | 'center' | 'topleft' | 'topright' | 'bottomleft' | 'bottomright' = 'top';
  visibleContasPagar: boolean = false;

  private destroyRef = inject(DestroyRef); // 1. Injete a referência de destruição

  nomeIgrejaSignal = nomeIgrejaSignal; //Signal 
  igrejaIdSignal = igrejaIdSignal;
  nomeUsuarioSignal = nomeUsuarioSignal;
  setorIdSignal = setorIdSignal;

  isParcelamento: boolean = false;

  nomeIgreja = nomeIgrejaSignal();
  igrejaId = igrejaIdSignal();
  nomeUsuario = nomeUsuarioSignal();
  setorId = setorIdSignal();

  imodo = signal<number>(0);
  // private destroy$: Subject<void> = new Subject<void>();

  filtro = new ContasPagarFiltro();

  pesquisa?: boolean = false;

  descricao: string;

  indexId: number;
  indexIdTransferencia: number;

  length = signal(0);

  transf: number;

  @ViewChild('dtContasPagar') grid!: Table;

  // Mes atual
  rangeDates: String;
  dtInicio: string = "";
  dtFim: string = "";

  // Saldo dia anterior
  dataDiaAnterior: string = ""; // Data para pegar o saldo anterior


  pessoaId: number = 0;

  dataAtual: any = moment();

  status = [
    { label: 'Pendente' },
    { label: 'Pago' },
    { label: 'Cancelado' },
    { label: 'Atrasado' },

  ]

  frequencia = [
    { label: 'Uma única vez' },
    { label: 'Mensal' },
    { label: 'Semanal' },
    { label: 'Quinzenal' },
    { label: 'Anual' }
  ]

  totalRegistros: number = 0
  totalRegistrosConta: number = 0

  contasPagarId: number;
  cadastrado: string = 'sim';
  categoriaFiltrada: string;

  contasBanco!: ContaDTO[];
  selectedContas!: ContaDTO[];

  contasPagar: ContasPagarDTO[] = [];
  categorias: CategoriaDTO[] = [];  // Armazena todas as categorias. Não usada nos combos
  categoriasFiltradas: CategoriaDTO[] = []; // Armazena as categorias filtradas por tipo. Usada nos combo.
  centroCustos: CentroCustoDTO[] = [];
  pessoas: PessoaDTO[] = [];
  formas: FormaDTO[] = [];

  error = '';

  public page = 0;
  public linesPerPage: any = 10;


  public activeTab: string;

  contasPagarNome: string = "";
  subscription: Subscription;
  contasPagarForm: FormGroup;

  pessoa: PessoaDTO = new PessoaDTO();
  categoria: CategoriaDTO = new CategoriaDTO();
  pageTitle: string;
  submittingForm: boolean = false;

  imaskConfig = {
    mask: Number,
    scale: 2,
    thousandsSeparator: '.',
    padFractionalZeros: true,
    normalizeZeros: true,
    radix: ','
  };

  printItems: MenuItem[];

  selecaoItemsIndividual: MenuItem[];
  selecaoItemsMultiplos: MenuItem[];

  constructor(
    private contasPagarService: ContasPagarService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private confirmationService: ConfirmationService,
    public pessoaService: PessoaService,
    private messageService: MessageService,
    public translate: TranslateService,
    private sharedService: SharedService,
    private categoriaService: CategoriaService,
    private contaService: ContaService,
    private centroCustoService: CentroCustoService,
    private formaService: FormaService

  ) {
    this.activeTab = 'home';
  }

  ngOnInit() {
    this.buildContasPagarForm();
    this.loadContasBanco();
    this.loadCategorias();
    this.loadCentroCustos();
    this.loadPessoas();
    this.loadFormas();
    this.periodo();
    this.rangeDates = this.sharedService.rangeMesAtual();
    this.dtInicio = this.sharedService.primeiroDiaMes();
    this.dtFim = this.sharedService.ultimoDiaMes();

    this.dtInicio = this.sharedService.primeiroDiaMes();
    this.dtFim = this.sharedService.ultimoDiaMes();

    // Data um dia anterior
    const data_americana = this.sharedService.formataDataUS(this.dtInicio);
    const data_subtraida = this.sharedService.dataSubDay(data_americana, 1);
    this.dataDiaAnterior = data_subtraida;
  };

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }


  loadContasPagarLazy(event: any) {
    const page = event!.first! / event!.rows!; // divisão para encontrar a paginações
    this.linesPerPage = event.rows;
    this.loadContasPagar();
  }


  loadCategorias() {
    this.categoriaService.getListCategoriaFromIgreja(this.igrejaId)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: response => {
          this.categoriasFiltradas = response.filter(cat => cat.tipo == 'Despesa'); // Armazena todas as categorias de Despesa
          this.contasPagarForm.controls['categoriaId'].setValue(this.categoriasFiltradas[0].id)
        }
      }),
      this.error; () => { }
  }

  loadFormas() {
    this.formaService.getListFormaFromIgreja(this.igrejaId)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: response => {
          this.formas = response;
          this.contasPagarForm.controls['formaId'].setValue(this.formas[0].id)
        },
        error: () => { }
      })
  }

  loadCentroCustos() {
    this.centroCustoService.getListCentroCustoFromIgreja(this.igrejaId)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: response => {
          this.centroCustos = response;
          this.contasPagarForm.controls['centroCustoId'].setValue(this.centroCustos[0].id)
        },
        error: () => { }
      })
  }


  submitForm() {
    this.submittingForm = true;
    if (this.imodo() === 0)
      this.createContasPagar();
    else
      this.updateContasPagar();

  }

  limpaCheckbox() {
    this.selectedContas ? this.selectedContas = [] : this.selectedContas = [];
    this.length.set(0);
  }

  private buildContasPagarForm() {

    this.contasPagarForm = this.formBuilder.group({
      // Dados da Conta Mestre
      id: [null],
      descricao: ['', Validators.required],
      saldoResidual: [null],
      frequencia: [null],
      valor: [null, [Validators.required, Validators.min(0.01)]],
      dataVencimento: ['', Validators.required],
      igrejaId: [this.igrejaId], // Aqui você pegaria do seu serviço de auth
      cadastrado: ['sim'],
      contaBancoId: [null],
      setorId: [this.setorId],
      formaId: [null, [Validators.required]],
      centroCustoId:  [null, [Validators.required]],
      categoriaId: [null, [Validators.required]],
      pessoaId: [null, [Validators.required]],

      // pessoa: this.formBuilder.group({
      //   id: [null, Validators.required]
      // }),
      // Campo extra para o DTO
      quantidadeParcelas: [1, [Validators.required, Validators.min(1)]]
    });
  }

 parcelar() {
  this.contasPagarForm.controls['frequencia'].setValue('Mensal');

 }
  salvar() {
    if (this.contasPagarForm.valid) {
      const dados = {
        contaMestre: {
          descricao: this.contasPagarForm.value.descricao,
          valor: this.contasPagarForm.value.valor,
          dataVencimento: this.sharedService.formataDataBR(this.contasPagarForm.value.dataVencimento),
          formaPagamento: this.contasPagarForm.value.formaPagamento,
          igrejaId: this.contasPagarForm.value.igrejaId,
          pessoa: this.contasPagarForm.value.pessoaId
        },
        quantidadeParcelas: this.contasPagarForm.value.quantidadeParcelas
      };
      this.contasPagarService.gerarParcelas(dados.contaMestre, dados.quantidadeParcelas).subscribe({
        next: () => this.toastr.success('Parcelas geradas com sucesso!'),
        error: (err) => console.error('Erro ao gerar parcelas', err)
      });
    }
  }



  cadastradoC() {
    this.cadastrado = 'sim'
    this.contasPagarForm.controls['descricao'].setValue("");
  }
  cadastradoNC() {
    this.cadastrado = 'nao'
    this.contasPagarForm.controls['cadastrado'].setValue('nao');
    this.contasPagarForm.controls['pessoaId'].setValue(0);
    this.contasPagarForm.controls['descricao'].setValue("");
    this.pessoaId = 0;

  }

  loadContasPagar() {
    this.contasPagarService
      .getByPageContasPagarFromIgreja(this.igrejaId, this.dtInicio, this.dtFim, this.page, this.linesPerPage)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: (response) => {
          this.contasPagar = response['content']
          this.totalRegistros = response.totalElements
        },
        error: (error) => {
          this.error = error;
          this.showError(error)
        }
      });

  }

  loadContasBanco() {
    this.contaService.getListContaFromIgreja(this.igrejaId)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: (response) => {
          this.contasBanco = response;
          this.totalRegistros = response.totalElements;
        },
        error: (error) => {
          this.error = error;
          this.showError(error)
        }
      });
  }

  imprimirRecibo(id) {
    if (!id) {
      Swal.fire('Exclusão', 'Nenhum registro encontrado', 'info');
    } else {
      let url = (`${API_CONFIG.baseUrl}/relatorios/recibos/?nome=recibo-contasPagar&igreja=${this.igrejaId}&contasPagar_id=${id}`)
      window.open(url, "_blank");
    }
  }

  getPrinters() {
    this.printItems = [
      {
        label: 'Entradas',
        icon: 'pi pi-dollar',
        target: '_blank',
        url: (`${API_CONFIG.baseUrl}/relatorios/entradas/?nome=entrada-dizimo-oferta&igreja=${this.igrejaId}&dt_inicio=${this.dtInicio}&dt_fim=${this.dtFim}`)
      },
      { separator: true },
      {
        label: 'Dízimo de obreiros',
        icon: 'pi pi-dollar',
        target: '_blank',
        url: (`${API_CONFIG.baseUrl}/relatorios/entradas/?nome=entrada-dizimo-obreiros&igreja=${this.igrejaId}&dt_inicio=${this.dtInicio}&dt_fim=${this.dtFim}`)
      },
      { separator: true },
      {
        label: 'Livro caixa - Diário',
        icon: 'pi pi-dollar',
        target: '_blank',
        url: (`${API_CONFIG.baseUrl}/relatorios/entradas/?nome=livro-caixa-diario&igreja=${this.igrejaId}&dt_inicio=${this.dtInicio}&dt_fim=${this.dtFim}`)
      },
      { separator: true },
      {
        label: 'Livro caixa - Mensal Simplificado',
        icon: 'pi pi-calendar',
        target: '_blank',
        // url: (`${API_CONFIG.baseUrl}/relatorios/despesas/?nome=livro-caixa-mensal-simplificado&igreja=${this.igrejaId}&dt_inicio=${this.dtInicio}&dt_fim=${this.dtFim}&saldo_anterior=${this.saldoAnterior || 0}&total_receita=${this.totalReceitaDizimOferta || 0}`)
      },
      { separator: true },
      {
        label: 'Livro caixa - Mensal Detalhado',
        icon: 'pi pi-calendar',
        target: '_blank',
        // url: (`${API_CONFIG.baseUrl}/relatorios/despesas/?nome=livro-caixa-mensal-detalhado&igreja=${this.igrejaId}&dt_inicio=${this.dtInicio}&dt_fim=${this.dtFim}&saldo_anterior=${this.saldoAnterior || 0}&total_receita=${this.totalReceitaDizimOferta || 0}`)
      },
      { separator: true },
      {
        label: 'Demostrativo de Receitas e Permutas - CONGREGAÇÃO',
        icon: 'pi pi-dollar',
        target: '_blank',
        // url: (`${API_CONFIG.baseUrl}/relatorios/entradas/?nome=relacao-entradas-dizimo-transferencias-congregacao&igreja=${this.igrejaId}&dt_inicio=${this.dtInicio}&dt_fim=${this.dtFim}`)
      },
      { separator: true },
      {
        label: 'Transferências - SETOR',
        icon: 'pi pi-dollar',
        target: '_blank',
        // url: (`${API_CONFIG.baseUrl}/relatorios/entradas/setor/?nome=relacao-entradas-dizimo-transferencias-setor&setor=${this.setorId}&dt_inicio=${this.dtInicio}&dt_fim=${this.dtFim}`)
      },
      { separator: true },
      {
        label: 'Resumo - SETOR', // O percentualMaior e o percentualMenor o jasper repassa de cada igreja do relatorio principal para o sub relatorio
        icon: 'pi pi-dollar',
        target: '_blank',
        url: (`${API_CONFIG.baseUrl}/relatorios/entradas/setor/resumo/?nome=resumo-entradas-setor&setor=${this.setorId}&dt_inicio=${this.dtInicio}&dt_fim=${this.dtFim}`)
      },
      { separator: true },
      {
        label: 'Relatório - SETOR',
        icon: 'pi pi-dollar',
        target: '_blank',
        url: (`${API_CONFIG.baseUrl}/relatorios/entradas/setor/?nome=relatorio-entradas-setor-quadro&setor=${this.setorId}&dt_inicio=${this.dtInicio}&dt_fim=${this.dtFim}`)
      },
      { separator: true },
      {
        label: 'Fechamento - SETOR',
        icon: 'pi pi-dollar',
        target: '_blank',
        url: (`${API_CONFIG.baseUrl}/relatorios/entradas/setor/?nome=fechamento-setor&setor=${this.setorId}&dt_inicio=${this.dtInicio}&dt_fim=${this.dtFim}`)
      },
    ];
  }

  periodo() {
    if (this.rangeDates == null) {
      this.dtInicio = this.sharedService.dataAtualFormatada();
      this.rangeDates = this.dtInicio + " - " + this.dtInicio;
      this.dtInicio = this.dtInicio;
    } else {
      this.dtInicio = this.rangeDates[0];
      this.dtFim = this.rangeDates[1];
      if (this.dtInicio.length < 10 && this.dtFim.length < 10) {
        this.dtInicio = this.rangeDates.substring(0, 10);
        this.dtFim = this.rangeDates.substring(13, 23);
      } else {
        this.dtInicio = this.rangeDates[0];
        this.dtFim = this.rangeDates[1];
      }
    }
    if (this.dtFim == null) {
      this.dtFim = this.dtInicio;
      this.filtro.dtFim = this.dtInicio;
    }
  }

  resetContasPagar() {
    window.location.reload()

  }

  // METODOS CONTA
  public createContasPagar() {
    // this.contasPagarForm.controls['nome'].setValue(this.contasPagarForm.controls['nome'].value.toUpperCase());
    this.contasPagarForm.controls['descricao'].setValue(this.sharedService.formataNome(this.contasPagarForm.controls['descricao'].value));

    const contasPagar: ContasPagarDTO = this.contasPagarForm.value;
    contasPagar
    console.log(contasPagar)
    this.contasPagarService.create(contasPagar)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: response => {
          console.log(response)
          // this.contasPagar.id = parseInt(this.extractId(response.headers.get('location'))); // Extrai o Id da URI retornada do banco      
          // this.contasPagarService.getPageContasPagarFromIgreja(this.filtro)
          // this.contasPagarForm.controls['nome'].setValue(null);
          // this.contasPagarForm.controls['pessoaId'].setValue(0)
          // this.contasPagarForm.controls['valor'].setValue(null)
          this.toastr.success('Registro inserido com sucesso!', 'Contas a Pagar');
          // this.loadContas();
        },
        error: () => { }
      })
  }

  public updateContasPagar() {
    // this.contasPagarForm.controls['nome'].setValue(this.contasPagarForm.controls['nome'].value.toUpperCase());
    this.contasPagarForm.controls['nome'].setValue(this.sharedService.formataNome(this.contasPagarForm.controls['nome'].value));

    let value = this.contasPagarForm.controls['tipoContasPagar'].value
    switch (value) {
      case "Receita":
        if (this.contasPagarForm.controls['valor'].value < 0) {
          this.contasPagarForm.controls['valor'].setValue(this.contasPagarForm.controls['valor'].value * -1);
        }
        break;

      case "Despesa":
        if (this.contasPagarForm.controls['valor'].value > 0) {
          this.contasPagarForm.controls['valor'].setValue(this.contasPagarForm.controls['valor'].value * -1);
        }
        break;

      default:
    }

    const contasPagar: ContasPagarDTO = Object.assign(this.contasPagarForm.value);
    this.contasPagarService.update(contasPagar)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: () => {
          // this.contasPagarService.getPageContasPagarFromIgreja(this.filtro)
          this.toastr.success('Registro atualizado com sucesso!', 'Atualização');
          // this.loadContas();
        },
        error: () => { }
      })
  }

  loadPessoas() {
    let situacaoCadastral = 'Ativo'
    this.pessoaService.getPessoasAtivasFromIgreja(this.igrejaId, situacaoCadastral)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: (response) => {
          this.pessoas = response;
        },
        error: () => { }
      });
  }

  getTotalCreditoSemTransferencia() {
    this.filtro.tipoContasPagar = 'Receita'
    if (this.rangeDates !== null) {
      this.dtInicio = this.rangeDates[0];
      this.dtFim = this.rangeDates[1];
      if (this.dtInicio.length < 10 && this.dtFim.length < 10) {
        this.dtInicio = this.rangeDates.substring(0, 10);
        this.dtFim = this.rangeDates.substring(13, 23);
      } else {
        this.dtInicio = this.rangeDates[0];
        this.dtFim = this.rangeDates[1];
      }
    }

  }

  getTotalGeralCredito() {
    this.filtro.tipoContasPagar = 'Receita'
    if (this.rangeDates !== null) {
      this.dtInicio = this.rangeDates[0];
      this.dtFim = this.rangeDates[1];
      if (this.dtInicio.length < 10 && this.dtFim.length < 10) {
        this.dtInicio = this.rangeDates.substring(0, 10);
        this.dtFim = this.rangeDates.substring(13, 23);
      } else {
        this.dtInicio = this.rangeDates[0];
        this.dtFim = this.rangeDates[1];
      }
    }
  }

  getTotalGeralDebito() {
    this.filtro.tipoContasPagar = 'Despesa'
    if (this.rangeDates !== null) {
      this.dtInicio = this.rangeDates[0];
      this.dtFim = this.rangeDates[1];
      if (this.dtInicio.length < 10 && this.dtFim.length < 10) {
        this.dtInicio = this.rangeDates.substring(0, 10);
        this.dtFim = this.rangeDates.substring(13, 23);
      } else {
        this.dtInicio = this.rangeDates[0];
        this.dtFim = this.rangeDates[1];
      }
    }
  }

  getTotalOfertas() {
    this.filtro.tipoContasPagar = 'Receita'
    if (this.rangeDates !== null) {
      this.dtInicio = this.rangeDates[0];
      this.dtFim = this.rangeDates[1];
      if (this.dtInicio.length < 10 && this.dtFim.length < 10) {
        this.dtInicio = this.rangeDates.substring(0, 10);
        this.dtFim = this.rangeDates.substring(13, 23);
      } else {
        this.dtInicio = this.rangeDates[0];
        this.dtFim = this.rangeDates[1];
      }
    }
  }


  getTotalMissoes() {
    this.filtro.tipoContasPagar = 'Receita'
    if (this.rangeDates !== null) {
      this.dtInicio = this.rangeDates[0];
      this.dtFim = this.rangeDates[1];
      if (this.dtInicio.length < 10 && this.dtFim.length < 10) {
        this.dtInicio = this.rangeDates.substring(0, 10);
        this.dtFim = this.rangeDates.substring(13, 23);
      } else {
        this.dtInicio = this.rangeDates[0];
        this.dtFim = this.rangeDates[1];
      }
    }

    // this.contasPagarService.getTotalMissoesFromIgreja(this.filtro)
    //   .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
    //   .subscribe({
    //     next: response => {
    //       response !== null ? this.totalMissoes = response : this.totalMissoes = 0.00;
    //     }
    //   }),
    //   this.error; () => { }
  }

  // getTotalSaldoAnterior() {
  //   this.contasPagarService.getTotalRDSaldoAnteriorFromIgreja(this.igrejaId, this.dataDiaAnterior)
  //     .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
  //     .subscribe({
  //       next: response => {
  //         response !== null ? this.saldoAnterior = response : this.saldoAnterior = 0.00;
  //       }
  //     }),
  //     this.error; () => { }
  // }

  // getTotalReceitaDizimoOferta() {
  //   this.filtro.tipoContasPagar = 'Receita'
  //   this.contasPagarService.getTotalReceitaDizimOfertaFromIgreja(this.igrejaId, this.dtInicio, this.dtFim)
  //     .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
  //     .subscribe({
  //       next: response => {
  //         response !== null ? this.totalReceitaDizimOferta = response : this.totalReceitaDizimOferta = 0.00;
  //       }
  //     }),
  //     this.error; () => { }
  // }


  private loadPessoa(value) {
    this.pessoaService.getById(value)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: (response) => {
          this.pessoa = response;
          this.pessoaId = this.pessoa.id
          this.contasPagarForm.controls['pessoaId'].setValue(this.pessoa.id);
          this.contasPagarForm.controls['nome'].setValue(this.pessoa.nome);
          this.contasPagarForm.controls['tituloMin'].setValue(this.pessoa.tituloMin.trim());
        },
        error: () => { }
      });
  }

  ///////////////////////////// Enentos DropDown   ///////////////////////////


  onChangeFrequencia(event) {
    console.log(event.value)
    // if (event.value !== "" && event.value > '0') {
    //   this.filtro.contas = event.value.toString();
    // }

    // if (event.value == "") {
    //   this.filtro.contas = this.contaIds;
    // }
  }

  onChangeContas(event) {
    if (event.value !== "" && event.value > '0') {
      this.filtro.contas = event.value.toString();
    }

    if (event.value == "") {

    }
  }

  onChangeCategorias(event) {
    
  }

  onChangeNomeHistorico(value) {
    this.loadPessoa(value.value);
  }

  onChangeTransferenciaCategoria(value) {
  
    this.contasPagarForm.controls['categoriaId'].setValue(value.value);
  }


  onChangeTransferenciaOrigem(event) {
    // this.contaBancoId = event.value;
    // this.contasPagarIdOrigem = event.value;
  }

  onChangeTransferenciaDestino(event) {
    
  }

  onChangePessoa(event) {
    this.contasPagarForm.controls['pessoaId'].setValue(event.value)

  }

  onChangeFormaPagamento(event) {
     this.contasPagarForm.controls['formaPagamento'].setValue(event.value)

  }

  private getCategoria(value) {
    this.categoriaService.findById(value)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: (response) => {
          this.categoria = response;
          this.contasPagarForm.controls['tipoContasPagar'].setValue(response.tipo);
        },
        error: () => { }
      });
  }

  onChangeTPCategorias(tipo) {
    this.getCategoria(tipo.value)
  }

  onChangeTPConta(event) {
    this.getConta(event.value)
  }

  private getConta(value) {
    // let conta_id = this.contas.filter(tc => tc.id == value); //Armazema todas as categorias de um tipo passado por parametro
    // let tipo_conta = conta_id.map(tp => {
    //   return tp.tipo; // Retorna uma string de ids do tipo passado no parametro.
    // })
    // this.contasPagarForm.controls['tipoConta'].setValue(tipo_conta.toString());
  }

  public doSelectTipoContasPagar = (value: any) => {
    if (value === 'Padrao') {
      this.contasPagarForm.controls['igrejaId'].setValue(null);
    } else {
      this.contasPagarForm.controls['igrejaId'].setValue(this.igrejaId);
    }

  }


  //EXCLUIR LANÇAMENTOS 
  exclusaoContasPagar(indexId, indexIdTransferencia) {

    if (this.selectedContas == null || this.length() == 0 || undefined) {
      Swal.fire('Lançamento | Seleção', 'Nenhum registro selecionado', 'info');
    } else {
      Swal.fire({
        title: 'Exclusão',
        text: 'Tem certeza que deseja excluir ' + this.length() + ' registro?',
        icon: 'error',
        showCloseButton: true,
        showCancelButton: true,
      }).then((willDelete) => {
        if (willDelete.dismiss) {
          this.selectedContas = [];
          this.length.set(0);
          // Swal.fire('Exclusão Cancelada', 'Seu registro está seguro', 'success');
        } else {
          if (this.length() <= 1) {
            if (this.indexId) { this.excluirContasPagar(indexId); }
            if (this.indexIdTransferencia) { this.excluirSelectedContasPagar(indexIdTransferencia); }
            this.toastr.success('Exclusão', 'Registro excluido com sucesso!');
          }

          // if (this.length() > 1) {
          //   for (let index = 0; index < this.length(); index++) {
          //     indexIdTransferencia = this.selectedContas[index].contasPagarIdTransferencia;
          //     if (indexIdTransferencia) {
          //       this.excluirSelectedContasPagar(indexIdTransferencia);
          //     }
          //     this.excluirContasPagar(this.selectedContas[index].id);
          //   }
          //   this.toastr.success('Exclusão', 'Registros excluidos com sucesso!');
          // }
          // this.loadContas();

          this.grid.first = 0;
        }
      });
    }

  }

  excluirContasPagar(indexId) {
    this.contasPagarService.delete(indexId)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: () => {
          // this.contasPagarService.getPageContasPagarFromIgreja(this.filtro)
          // this.loadContas();
          this.grid.reset();
          this.selectedContas = null;
        },
        error: () => { }
      })
  }


  excluirSelectedContasPagar(indexIdTransferencia) {
    this.contasPagarService.delete(indexIdTransferencia)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: () => {
          this.grid.reset();
          // this.contasPagarService.getPageContasPagarFromIgreja(this.filtro)
          // this.toastr.success('Exclusão', 'Registro excluido com sucesso!');
          // this.messageService.add({ severity: 'success', summary: 'Successo', detail: 'Registro excluido com sucesso!' });
          // this.loadContas();
        },
        error: () => { }
      })
  }


  confirmarExclusaoContasPagarTransferencia(contasPagar: ContasPagarDTO): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir este registro?',
      accept: () => {
        this.excluirContasPagarTransferencia(contasPagar);
        this.grid.first = 0;
      }
    });
  }

  excluirContasPagarTransferencia(contasPagar: ContasPagarDTO) {
    this.contasPagarService.delete(contasPagar.id)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: () => {
          // this.contasPagarService.delete(contasPagar.contasPagarIdTransferencia)
          //   .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
          //   .subscribe({
          //     next: () => {
          //       this.contasPagarService.getPageContasPagarFromIgreja(this.filtro)
          //       this.toastr.success('Exclusão', 'Registro excluido com sucesso!');
          //       this.loadContas();
          //     },
          //     error: () => { }
          //   })
        }
      })
  }

  confirmarExclusaoContasPagarPermuta(contasPagar: ContasPagarDTO): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir este registro?',
      accept: () => {
        this.grid.first = 0;
      }
    });
  }

  resetModal() {
    this.contasPagarForm.reset();
     this.isParcelamento = false;
  }
  setModalEdicao(value) {
    if (value == 'Transferencia') {
      value = 'Receita'
    }
    this.filtraCategorias(value);
    this.pageTitle = "Editando Movimento".toUpperCase();
    this.imodo.set(1);
  }

  setModalInclusao() {
    this.resetModal();
    this.cadastradoC();
    this.imodo.set(0);
    this.loadCategorias();
    this.loadCentroCustos();

    let cat1 = this.categorias.filter(cat => cat.tipo == "Despesa"); //Armazema todas as categorias=Despesa
    this.categoriasFiltradas = cat1;
    this.pageTitle = "NOVO";
    this.contasPagarForm.controls['cadastrado'].setValue('sim');
    this.contasPagarForm.controls['igrejaId'].setValue(this.igrejaId);
    this.contasPagarForm.controls['dataVencimento'].setValue(this.sharedService.dataAtualFormatada());
    this.contasPagarForm.controls['formaId'].setValue(this.formas[0].id);
    this.contasPagarForm.controls['contaBancoId'].setValue(this.contasBanco[0].id);
    this.contasPagarForm.controls['descricao'].setValue('Despesa');
    this.contasPagarForm.controls['setorId'].setValue(this.setorId);
    this.contasPagarForm.controls['valor'].setValue(0.00);
    this.contasPagarForm.controls['quantidadeParcelas'].setValue(2);
  }

  filtraCategorias(value: string) {
    let cat1 = this.categorias.filter(cat => cat.tipo == value); //Armazema todas as categorias de um tipo passado por parametro
    this.categoriasFiltradas = cat1;
  }

  private extractId(location: string): string { // Extrai o Id da URL
    let position = location.lastIndexOf('/');
    return location.substring(position + 1, location.length);
  }


  private showError(error) {
    this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.message });
  }

}

