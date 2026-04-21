import { Component, DestroyRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService, LazyLoadEvent, MenuItem, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import moment from 'moment';
import Swal from 'sweetalert2';
import { ButtonModule } from 'primeng/button';
import { RouterLink, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { LancamentoDTO } from 'src/app/theme/shared/models/lancamento.dto';
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
import { LancamentoService } from 'src/app/theme/shared/services/lancamento.service';
import { igrejaIdSignal, nomeIgrejaSignal, nomeUsuarioSignal, setorIdSignal } from 'src/app/theme/shared/_helpers/shared-signals';
import { DatePicker } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'; // Importe o operador
import { Table } from 'primeng/table';


export class LancamentoFiltro {
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
  tipoLancamento?: string = "";
}

@Component({
  selector: 'app-lancamento-list-form',
  templateUrl: './lancamento-list-form.component.html',
  styleUrls: ['./lancamento-list-form.component.scss'],
  standalone: true,
  imports: [
    RouterModule,
    DatePicker,
    // InputGroup,
    ButtonModule,
    RouterLink,
    SharedModule,
    InputNumberModule,
    // InputGroup,
    // ConfirmDialog,
    // Dialog
  ],
  providers: [
    LancamentoService,
    CategoriaService,
    ContaService,
    CentroCustoService,
    PessoaService,
    FormaService

  ]
})
export class LancamentoListFormComponent implements OnInit {

  positionLancamento: 'left' | 'right' | 'top' | 'bottom' | 'center' | 'topleft' | 'topright' | 'bottomleft' | 'bottomright' = 'top';
  positionModalTransferencia: 'left' | 'right' | 'top' | 'bottom' | 'center' | 'topleft' | 'topright' | 'bottomleft' | 'bottomright' = 'top';
  positionModalPermuta: 'left' | 'right' | 'top' | 'bottom' | 'center' | 'topleft' | 'topright' | 'bottomleft' | 'bottomright' = 'top';

  visibleLancamento: boolean = false;
  visibleModalTransferencia: boolean = false;
  visibleModalPermuta: boolean = false;

  private destroyRef = inject(DestroyRef); // 1. Injete a referência de destruição

  nomeIgrejaSignal = nomeIgrejaSignal; //Signal 
  igrejaIdSignal = igrejaIdSignal;
  nomeUsuarioSignal = nomeUsuarioSignal;
  setorIdSignal = setorIdSignal;

  nomeIgreja = nomeIgrejaSignal();
  igrejaId = igrejaIdSignal();
  nomeUsuario = nomeUsuarioSignal();
  setorId = setorIdSignal();

  imodo = signal<number>(0);
  // private destroy$: Subject<void> = new Subject<void>();

  filtro = new LancamentoFiltro();

  pesquisa?: boolean = false;

  descricao: string = '';

  indexId!: number;
  indexIdTransferencia!: number;

  length = signal(0);

  transf!: number;

  @ViewChild('dtlancamento') grid!: Table;

  // Mes atual
  rangeDates!: string;
  dtInicio: string = "";
  dtFim: string = "";

  // Saldo dia anterior
  dataDiaAnterior: string = ""; // Data para pegar o saldo anterior

  //  formaId: number = 2; //Forma - Transferencia Dinheiro por outra forma //Inicia com a forma Cartao - GT
  transferenciaCategoriaId: number = 1;

  pessoaId: number = 0;
  contaForm!: FormGroup;
  formaForm!: FormGroup;
  categoriaForm!: FormGroup;

  dataAtual: any = moment();

  tpLancamento = [
    { nome: "Todas" },
    { nome: "Receita" },
    { nome: "Despesa" }

  ]

  datas = [
    { nome: "Hoje" },
    { nome: "Mes Atual" },
    { nome: "Mês Anterior" }

  ]
  // Valor Desconsiderando Permuta e Transferencia Alçadas
  totalCreditos: number = 0;

  // Ofertas Alcada 1 e 2 
  total_ofertas_alcadas: number = 0;

  // Valor desconsiderando o debito de Permuta
  totalDebitos: number = 0;

  // totalDizimos: number = 0;
  totalMissoes: number = 0;
  totalOfertas: number = 0;
  totalReceitaDizimo: number = 0;

  saldoAnterior: number = 0;
  saldoFinalContas!: number;

  crtSaldoFinal: boolean = false;
  membroCadastrado: boolean = true;

  totalRegistros: number = 0
  totalRegistrosConta: number = 0

  contaId!: number;
  contaIdTransferencia!: number;
  formaIdTransferencia!: number;
  formaId!: number;
  categoriaId!: number;
  contaIds!: string;
  contaIdsAux!: string;
  contaIdsAux1!: string;
  formasIds!: string;
  formaIdsAux!: string;
  categoriaFiltrada!: string;

  categoriaIds!: string;
  tipoLancamento: string = "".toLowerCase();
  categoriaIdsAux!: string;
  crtCategoria: number = 3; //Para controlar: Todas, Receita e Despesa em categorias

  lancamentos!: LancamentoDTO[];
  selectedLancamentos!: LancamentoDTO[];

  contas: ContaDTO[] = [];
  contasTransferencia: ContaDTO[] = [];
  formasPermuta: FormaDTO[] = [];
  categorias: CategoriaDTO[] = [];  // Armazena todas as categorias. Não usada nos combos
  categoriasFiltradas: CategoriaDTO[] = []; // Armazena as categorias filtradas por tipo. Usada nos combo.
  centroCustos: CentroCustoDTO[] = [];
  pessoas: PessoaDTO[] = [];
  formas: FormaDTO[] = [];

  error = '';

  lancamentoId!: number;

  lancamentoIdOrigem!: number;
  lancamentoIdTransferencia!: number;

  public page = 0;


  public activeTab: string;

  lancamentoNome: string = "";
  subscription!: Subscription;
  lancamentoForm!: FormGroup;
  lancamento: LancamentoDTO = new LancamentoDTO();
  pessoa: PessoaDTO = new PessoaDTO();
  categoria: CategoriaDTO = new CategoriaDTO();
  pageTitle!: string;
  submittingForm: boolean = false;

  imaskConfig = {
    mask: Number,
    scale: 2,
    thousandsSeparator: '.',
    padFractionalZeros: true,
    normalizeZeros: true,
    radix: ','
  };

  printItems!: MenuItem[];

  selecaoItemsIndividual!: MenuItem[];
  selecaoItemsMultiplos!: MenuItem[];

  constructor(
    private lancamentoService: LancamentoService,
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
    this.buildLancamentoForm();
    this.loadCentroCustos();
    this.loadPessoas();
    this.periodo();
    this.rangeDates = this.sharedService.rangeMesAtual();
    this.dtInicio = this.sharedService.primeiroDiaMes();
    this.dtFim = this.sharedService.ultimoDiaMes();

    this.filtro.dtInicio = this.sharedService.primeiroDiaMes();
    this.filtro.dtFim = this.sharedService.ultimoDiaMes();

    // Data um dia anterior
    const data_americana = this.sharedService.formataDataUS(this.dtInicio);
    const data_subtraida = this.sharedService.dataSubDay(data_americana, 1);
    this.dataDiaAnterior = data_subtraida;
    this.getTotalSaldoAnterior();

    this.contaForm = new FormGroup({
      selectedContas: new FormControl<ContaDTO[] | null>(null)
    });

    this.formaForm = new FormGroup({
      selectedFormas: new FormControl<FormaDTO[] | null>(null)
    });

    this.categoriaForm = new FormGroup({
      selectedCategorias: new FormControl<CategoriaDTO[] | null>(null)
    });
  };

  ngOnDestroy() {
    // console.log('Limpando recursos do componente de Frequência...');
    // Se você tiver alguma Subscription manual (this.subscription.unsubscribe())
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }


  aoMudarPagina(event: LazyLoadEvent) { // Metodo será chamado toda vez que mudar de pagina ou houver necessidade de dados novos
    this.page = event!.first! / event!.rows!;
    this.filtro.linesPerPage = event.rows!;
    if (!this.pesquisa) {
      this.loadFormas(); // loadFormas() --> Carrega formas depois categorias depois contas que chama loadLancamentos() na inicialização.
      this.getTotalReceitaDizimo();
    } else {
      this.buscaLancamentos();
      this.getTotalReceitaDizimo();
    }
  }

  linhasSelecionada(event: string | any[]): void {
    this.length.set(event.length);
    if (event.length >= 1) {
      this.indexId = event[0].id;
      this.indexIdTransferencia = event[0].lancamentoIdTransferencia;
    }

  }

  aoDesmarcar(event: any) {
    // Pega o evento de desmaracar o checkbox
    this.length.set(0);
  }

  deleteIndividual() {
    this.exclusaoLancamento(this.indexId, this.indexIdTransferencia);
  }

  deleteMultiplos() {
    this.exclusaoLancamento(this.indexId, this.indexIdTransferencia);
  }


  loadFormas() {
    this.formaService.getListFormaFromIgreja(this.igrejaId)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: response => {
          this.formas = response;
          this.loadFormasPermuta();
          let ids = response.map((f: { id: any; }) => {
            return (f.id).toString();
          })
          this.formasIds = ids.toString();
          this.filtro.formas = ids.toString();

          this.loadCategorias()
        },
        error: () => { }
      })
  }

  loadCategorias() {
    this.categoriaService.getListCategoriaFromIgreja(this.igrejaId)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: response => {
          this.categorias = response; // Armazena todas as categorias de Receitas e Despesa para serem filtradas
          let cat1 = this.categorias.filter(cat => cat.id?.toString());
          let cat2 = cat1.map(c => {
            return c.id?.toString(); // Retorna nova string de todos os ids de categorias. Necessario para o Backend
          })
          this.categoriaIds = cat2.toString();
          this.categoriaIdsAux = cat2.toString();
          this.filtro.categorias = cat2.toString();

          this.loadContas();
        }
      }),
      this.error; () => { }
  }

  loadContas() {
    let total = 0;
    this.contaService.getListContaFromIgreja(this.igrejaId)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: response => {
          if (response.length == 0) {
            Swal.fire('Atenção !!!', 'Nenhuma conta encontrada. Cadastre uma conta', 'warning');
          } else {
            this.contas = response;
            this.loadContasTransferencia();
            this.contasTransferencia = response;
            response.map((t: { totalConta: number; }) => {
              total += t.totalConta;
              this.saldoFinalContas = total;
            })

            let ids = response.map((c: { id: any; }) => {
              return (c.id).toString();
            })
            this.contaIds = ids.toString();
            this.filtro.contas = ids.toString();

            this.loadLancamentos(this.page);
          }
        },
        error: () => { }
      })
  }

  loadContasTransferencia() {
    this.contasTransferencia = this.contas.map(c => {
      return {
        contaIdTransferencia: c.id,
        nome: c.nome
      }
    });
  }

  loadFormasPermuta() {
    let fr1 = this.formas.filter(fr => fr.id !== 1);
    this.formasPermuta = fr1.map(f => {
      return {
        formaIdTransferencia: f.id,
        nome: f.nome
      }
    });
  }

  loadCentroCustos() {
    this.centroCustoService.getListCentroCustoFromIgreja(this.igrejaId)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: response => {
          this.centroCustos = response;
        },
        error: () => { }
      })
  }


  submitFormLancamento() {
    this.submittingForm = true;
    if (this.imodo() === 0)
      this.createLancamento();
    else
      this.updateLancamento();

  }

  limpaCheckbox() {
    this.selectedLancamentos ? this.selectedLancamentos = [] : this.selectedLancamentos = [];
    this.length.set(0);
  }

  submitFormTransferencia() {
    this.submittingForm = true;
    if (this.imodo() === 0) {
      this.createLancamentoTransferencia();
    } else {
      this.updateLancamentoTransferencia();
    }
  }

  submitFormPermuta() {
    this.submittingForm = true;
    if (this.imodo() === 0) {
      this.createLancamentoPermuta();
    } else {
      this.updateLancamentoPermuta();
    }
  }

  private buildLancamentoForm() {
    this.lancamentoForm = this.formBuilder.group({
      id: [null],
      nome: ["", [Validators.required]],
      documento: [null],
      historico: [null, [Validators.required]],
      data: [null],
      competencia: [null, [Validators.required]],
      tipoLancamento: [null],
      valor: [null, [Validators.required]],
      totalConta: [null],
      igrejaId: [this.igrejaId, [Validators.required]],
      tituloMin: [null],
      categoriaId: [null, [Validators.required]],
      pessoaId: [0, [Validators.required]],
      cadastrado: ['sim'],
      contaId: [null, [Validators.required]],
      setorId: [this.setorId],
      formaId: [this.formaId, [Validators.required]],
      centroCustoId: [null],
      contaIdTransferencia: [null],
      lancamentoIdTransferencia: [null],
      formaIdTransferencia: [null],
      lancamentoIdOrigem: [null]
    });
  }

  cadastradoC() {
    this.lancamentoForm.controls['cadastrado'].setValue('sim');
    this.lancamentoForm.controls['nome'].setValue("");
  }
  cadastradoNC() {
    this.lancamentoForm.controls['cadastrado'].setValue('nao');
    this.lancamentoForm.controls['pessoaId'].setValue(0);
    this.lancamentoForm.controls['nome'].setValue("");
    this.lancamentoForm.controls['tituloMin'].setValue('Membro');
    this.pessoaId = 0;

  }

  loadLancamentos(page: number = 0) {
    this.filtro.page = page;
    this.pesquisa ? this.filtro.tipoLancamento : this.filtro.tipoLancamento = "";
    this.lancamentoService.getPageLancamentoFromIgreja(this.filtro)
      // .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: (response) => {
          this.lancamentos = response['content'].sort((a: { id: number; }, b: { id: number; }) => b.id - a.id);
          this.totalRegistros = response.totalElements;
          this.getPrinters();
          // this.getSelecionadosItems();
          this.getTotalGeralCredito();
          this.getTotalOfertasAlcadas();
          this.getTotalGeralDebito();
          this.getTotalOfertas();
          this.getTotalMissoes();

        },
        error: (error) => {
          this.error = error;
          this.showError(error)
        }
      });
  }
  imprimirRecibo(id: any) {
    if (!id) {
      Swal.fire('Exclusão', 'Nenhum registro encontrado', 'info');
    } else {
      let url = (`${API_CONFIG.baseUrl}/relatorios/recibos/?nome=recibo-lancamento&igreja=${this.igrejaId}&lancamento_id=${id}`)
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
        command: () => {
          // Montamos a URL com os valores ATUAIS das variáveis
          const url = `${API_CONFIG.baseUrl}/relatorios/despesas/?nome=livro-caixa-mensal-simplificado` +
            `&igreja=${this.igrejaId}` +
            `&dt_inicio=${this.dtInicio}` +
            `&dt_fim=${this.dtFim}` +
            `&saldo_anterior=${this.saldoAnterior || 0}` +
            `&total_dizimo=${this.totalReceitaDizimo || 0}` +
            `&total_oferta=${this.totalOfertas || 0}`;

          // Abre em uma nova aba
          window.open(url, '_blank');
        }
      },
      { separator: true },
      {
        label: 'Livro caixa - Mensal Detalhado',
        icon: 'pi pi-calendar',
        command: () => {
          // Montamos a URL com os valores ATUAIS das variáveis
          const url = `${API_CONFIG.baseUrl}/relatorios/despesas/?nome=livro-caixa-mensal-detalhado` +
            `&igreja=${this.igrejaId}` +
            `&dt_inicio=${this.dtInicio}` +
            `&dt_fim=${this.dtFim}` +
            `&saldo_anterior=${this.saldoAnterior || 0}` +
            `&total_dizimo=${this.totalReceitaDizimo || 0}` +
            `&total_oferta=${this.totalOfertas || 0}`;

          // Abre em uma nova aba
          window.open(url, '_blank');
        }
      },
      {
        label: 'Ofertas - Alçadas',
        icon: 'pi pi-dollar',
        command: () => {
          // Montamos a URL com os valores ATUAIS das variáveis
          const url = `${API_CONFIG.baseUrl}/relatorios/entradas/?nome=ofertas-alcadas` +
            `&igreja=${this.igrejaId}` +
            `&dt_inicio=${this.dtInicio}` +
            `&dt_fim=${this.dtFim}`;

          // Abre em uma nova aba
          window.open(url, '_blank');
        }
      },
      { separator: true },
      {
        label: 'Demostrativo de Receitas e Permutas - CONGREGAÇÃO',
        icon: 'pi pi-dollar',
        target: '_blank',
        url: (`${API_CONFIG.baseUrl}/relatorios/entradas/?nome=relacao-entradas-dizimo-transferencias-congregacao&igreja=${this.igrejaId}&dt_inicio=${this.dtInicio}&dt_fim=${this.dtFim}`)
      },
      { separator: true },
      {
        label: 'Transferências - SETOR',
        icon: 'pi pi-dollar',
        target: '_blank',
        url: (`${API_CONFIG.baseUrl}/relatorios/entradas/setor/?nome=relacao-entradas-dizimo-transferencias-setor&setor=${this.setorId}&dt_inicio=${this.dtInicio}&dt_fim=${this.dtFim}`)
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
      this.filtro.dtInicio = this.dtInicio;
    } else {
      this.dtInicio = this.rangeDates[0];
      this.dtFim = this.rangeDates[1];
      if (this.dtInicio.length < 10 && this.dtFim.length < 10) {
        this.dtInicio = this.rangeDates.substring(0, 10);
        this.dtFim = this.rangeDates.substring(13, 23);
        this.filtro.dtInicio = this.rangeDates.substring(0, 10);
        this.filtro.dtFim = this.rangeDates.substring(13, 23);
      } else {
        this.dtInicio = this.rangeDates[0];
        this.dtFim = this.rangeDates[1];
        this.filtro.dtInicio = this.rangeDates[0];
        this.filtro.dtFim = this.rangeDates[1];
      }
    }
    if (this.dtFim == null) {
      this.dtFim = this.dtInicio;
      this.filtro.dtFim = this.dtInicio;
    }
  }

  loadLancamento(lancamento: LancamentoDTO) {
    this.lancamentoId = lancamento.id ?? 0;
    this.lancamentoService.findById(this.lancamentoId)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: (response) => {
          this.lancamento = response;
          this.lancamentoForm.patchValue(this.lancamento)   // binds loaded  
          this.contaId = (response as any)['conta'].id;
          this.contaId = (response as any)['forma'].id;
          this.contaIdTransferencia = response.contaIdTransferencia ?? 0;
          this.formaIdTransferencia = response.formaIdTransferencia ?? 0;
          this.contaId = (response as any)['categoria'].id;
          this.lancamentoForm.controls['igrejaId'].setValue(this.igrejaId);
          this.lancamentoForm.controls['pessoaId'].setValue(this.lancamento.pessoaId);
          this.lancamentoForm.controls['categoriaId'].setValue((response as any)['categoria'].id);
          this.lancamentoForm.controls['contaId'].setValue((response as any)['conta'].id);
          this.lancamentoForm.controls['formaId'].setValue((response as any)['forma'].id)
          this.lancamentoForm.controls['valor'].setValue(Math.abs(this.lancamentoForm.controls['valor'].value));

          if (response.valor! > '0' && (response.nome == 'Transferencia' || response.nome == 'Permuta')) {
            //Conta  
            this.lancamentoForm.controls['contaId'].setValue(response.contaIdTransferencia);
            this.lancamentoForm.controls['contaIdTransferencia'].setValue((response as any)['conta'].id);

            // Forma
            // this.lancamentoForm.controls['formaId'].setValue(response.formaIdTransferencia); 
            // this.lancamentoForm.controls['formaIdTransferencia'].setValue(response['forma'].id);

          } else {
            this.lancamentoForm.controls['valor'].setValue(response.valor);
          }

          this.lancamentoForm.controls['centroCustoId'].setValue((response as any)['centroCusto'].id);
          // this.lancamentoForm.controls['valor'].setValue(Math.abs(this.lancamentoForm.controls['valor'].value));// Mostra o numero negativo sem o sinal. Valor absoluto
          this.lancamentoForm.controls['valor'].setValue(this.lancamentoForm.controls['valor'].value);

          //Para Despesa
          if (response.valor! < '0') {
            this.lancamentoForm.controls['valor'].setValue(this.lancamentoForm.controls['valor'].value * -1);
          }

          this.lancamentoNome = lancamento.nome!;

          if (response.pessoaId! > 0) {
            this.lancamentoForm.controls['cadastrado'].setValue('sim');
            this.lancamentoForm.controls['pessoaId'].setValue(response.pessoaId);
            this.pessoaId = response.pessoaId ?? 0;
          }
          if (response.pessoaId == 0) {
            this.lancamentoForm.controls['cadastrado'].setValue('nao');
            this.lancamentoForm.controls['pessoaId'].setValue(0);
            this.pessoaId = 0;
          }
        },
        error: () => { }
      })
  }

  resetLancamento() {
    window.location.reload()

  }

  buscaLancamentos() {
    this.pesquisa = true;
    if (this.rangeDates == null) {
      this.dtInicio = this.rangeDates[0];
      this.filtro.dtInicio = this.rangeDates[0];
      if (this.dtInicio.length < 10) {
        this.dtInicio = (this.rangeDates as string).substring(0, 10);
        this.filtro.dtInicio = (this.rangeDates as string).substring(0, 10);
      } else {
        this.dtInicio = this.rangeDates[0];
        this.filtro.dtInicio = this.rangeDates[0];
      }
    }

    this.crtSaldoFinal = true;
    if (this.dtFim == null) {
      this.dtFim = this.dtInicio
      this.filtro.dtFim = this.dtInicio
    }
    this.rangeDates = this.dtInicio + " - " + this.dtFim;

    this.loadLancamentos(this.page);
    this.getTotalReceitaDizimo(); //Busca apenas o total de receitas do periodo para  entrada no "Livro Caixa"
    this.getTotalGeralCredito();

    // Data do dia anterior
    const data_americana = this.sharedService.formataDataUS(this.dtInicio);
    const data_subtraida = this.sharedService.dataSubDay(data_americana, 1);
    this.dataDiaAnterior = data_subtraida;
    this.getTotalSaldoAnterior();
  }

  // METODOS CONTA
  public createLancamento() {
    // this.lancamentoForm.controls['nome'].setValue(this.lancamentoForm.controls['nome'].value.toUpperCase());
    this.lancamentoForm.controls['nome'].setValue(this.sharedService.formataNome(this.lancamentoForm.controls['nome'].value));

    let value = this.lancamentoForm.controls['tipoLancamento'].value
    switch (value) {
      case "Receita":
        if (this.lancamentoForm.controls['valor'].value < 0) {
          this.lancamentoForm.controls['valor'].setValue(this.lancamentoForm.controls['valor'].value * -1);
        }
        break;

      case "Receita LC":
        if (this.lancamentoForm.controls['valor'].value < 0) {
          this.lancamentoForm.controls['valor'].setValue(this.lancamentoForm.controls['valor'].value * -1);
        }
        break;

      case "Despesa":
        if (this.lancamentoForm.controls['valor'].value > 0) {
          this.lancamentoForm.controls['valor'].setValue(this.lancamentoForm.controls['valor'].value * -1);
        }
        break;

      default:
    }

    const lancamento: LancamentoDTO = this.lancamentoForm.value;
    this.lancamentoService.create(lancamento)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: response => {
          this.lancamento.id = parseInt(this.extractId((response as any).headers.get('location'))); // Extrai o Id da URI retornada do banco      
          this.lancamentoService.getPageLancamentoFromIgreja(this.filtro)
          this.lancamentoForm.controls['nome'].setValue(null);
          this.lancamentoForm.controls['pessoaId'].setValue(0)
          this.lancamentoForm.controls['valor'].setValue(null)
          this.toastr.success('Registro inserido com sucesso!', 'Lançamento');
          this.loadContas();
        },
        error: () => { }
      })
  }

  public updateLancamento() {
    // this.lancamentoForm.controls['nome'].setValue(this.lancamentoForm.controls['nome'].value.toUpperCase());
    this.lancamentoForm.controls['nome'].setValue(this.sharedService.formataNome(this.lancamentoForm.controls['nome'].value));

    let value = this.lancamentoForm.controls['tipoLancamento'].value
    switch (value) {
      case "Receita":
        if (this.lancamentoForm.controls['valor'].value < 0) {
          this.lancamentoForm.controls['valor'].setValue(this.lancamentoForm.controls['valor'].value * -1);
        }
        break;

      case "Despesa":
        if (this.lancamentoForm.controls['valor'].value > 0) {
          this.lancamentoForm.controls['valor'].setValue(this.lancamentoForm.controls['valor'].value * -1);
        }
        break;

      default:
    }

    const lancamento: LancamentoDTO = Object.assign(new LancamentoDTO(), this.lancamentoForm.value);
    this.lancamentoService.update(lancamento)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: () => {
          this.lancamentoService.getPageLancamentoFromIgreja(this.filtro)
          this.toastr.success('Registro atualizado com sucesso!', 'Atualização');
          this.loadContas();
        },
        error: () => { }
      })
  }

  // METODO PARA Transferencia
  public createLancamentoTransferencia() {
    this.lancamentoForm.controls['valor'].setValue(this.lancamentoForm.controls['valor'].value * -1);
    const lancamento: LancamentoDTO = this.lancamentoForm.value;
    this.lancamentoService.create(lancamento)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: response => {
          this.lancamentoIdOrigem = parseInt(this.extractId((response as any).headers.get('location'))); // Extrai o Id da URI retornada do banco 

          this.lancamentoForm.controls['contaId'].setValue(this.contaIdTransferencia);
          lancamento.contaIdTransferencia = this.contaId;
          lancamento.categoriaId = 8;
          let valor = this.lancamentoForm.controls['valor'].value
          valor = valor * -1;
          lancamento.valor = valor;

          lancamento.contaId = this.contaIdTransferencia;
          this.lancamentoService.create(lancamento)
            .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
            .subscribe({
              next: response => {
                this.lancamentoIdTransferencia = parseInt(this.extractId((response as any).headers.get('location'))); // Extrai o Id da URI retornada do banco 

                // Atualiza o campo lancamentoIdOrigem com os ids dos lançamentos de transferencia

                lancamento.id = this.lancamentoIdTransferencia;
                lancamento.contaId = this.contaIdTransferencia;
                lancamento.contaIdTransferencia = this.contaId;
                lancamento.lancamentoIdTransferencia = this.lancamentoIdOrigem;
                // lancamento.tipoConta = this.lancamentoForm.controls['tipoContaDestino'].value.toString();//Atualiza tipoConta Destino
                this.lancamentoService.update(lancamento)
                  .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
                  .subscribe({
                    next: () => {
                      lancamento.contaId = this.contaId;
                      lancamento.id = this.lancamentoIdOrigem;
                      lancamento.contaIdTransferencia = this.contaIdTransferencia;
                      lancamento.lancamentoIdTransferencia = this.lancamentoIdTransferencia;
                      lancamento.categoriaId = 29;
                      let valor = this.lancamentoForm.controls['valor'].value
                      valor = valor;
                      lancamento.valor = valor;
                      // lancamento.tipoConta = this.lancamentoForm.controls['tipoConta'].value.toString(); //Atualiza tipoConta Origem
                      lancamento.tipoLancamento = 'Despesa'
                      this.lancamentoService.update(lancamento)
                        .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
                        .subscribe({
                          next: () => {
                            this.lancamentoService.getPageLancamentoFromIgreja(this.filtro)
                            this.toastr.success('Registro atualizado com sucesso!', 'Atualização');
                            this.loadContas();
                            this.resetLancamento();
                          }
                        })
                    }
                  })
              }
            })
        }
      })
  }

  public updateLancamentoTransferencia() {
    this.lancamentoForm.controls['nome'].setValue(this.sharedService.formataNome(this.lancamentoForm.controls['nome'].value));

    // Lançamento negativo na conta Origem
    this.lancamentoForm.controls['tipoLancamento'].setValue('Receita');
    this.lancamentoForm.controls['categoriaId'].setValue(this.transferenciaCategoriaId);
    this.lancamentoForm.controls['nome'].setValue('Transferencia');
    this.lancamentoForm.controls['valor'].setValue(this.lancamentoForm.controls['valor'].value * -1);
    this.lancamentoForm.controls['contaId'].setValue(this.contaId);
    this.lancamentoForm.controls['contaIdTransferencia'].setValue(this.contaIdTransferencia);

    const lancamento: LancamentoDTO = Object.assign(new LancamentoDTO(), this.lancamentoForm.value);
    this.lancamentoService.update(lancamento)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: () => {
          // this.lancamentoService.getPageLancamentoFromIgreja(this.filtro)
          // this.toastr.success('Registro atualizado com sucesso!', 'Atualização');
          // this.loadContas();
        }
      }),

      // Lançamento positivo na conta Destino
      this.lancamentoForm.controls['tipoLancamento'].setValue('Receita');
    this.lancamentoForm.controls['categoriaId'].setValue(this.transferenciaCategoriaId);
    this.lancamentoForm.controls['nome'].setValue('Transferencia');
    this.lancamentoForm.controls['valor'].setValue(this.lancamentoForm.controls['valor'].value * -1);
    this.lancamentoForm.controls['contaId'].setValue(this.contaId);
    this.lancamentoForm.controls['contaIdTransferencia'].setValue(this.contaIdTransferencia);

    // const lancamento: LancamentoDTO = Object.assign(new LancamentoDTO(), this.lancamentoForm.value);

    this.lancamentoService.update(lancamento)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: () => {
          this.lancamentoService.getPageLancamentoFromIgreja(this.filtro)
          this.toastr.success('Registro inserido com sucesso!', 'Inclusão');
          this.loadContas();
        }
      })
  }


  // METODO PARA Permuta
  public createLancamentoPermuta() {
    this.lancamentoForm.controls['valor'].setValue(this.lancamentoForm.controls['valor'].value * -1);
    const lancamento: LancamentoDTO = this.lancamentoForm.value;
    this.lancamentoService.create(lancamento)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: response => {
          this.lancamentoIdOrigem = parseInt(this.extractId((response as any).headers.get('location'))); // Extrai o Id da URI retornada do banco 

          this.lancamentoForm.controls['formaId'].setValue(this.formaIdTransferencia);
          lancamento.formaIdTransferencia = this.formaId;
          let valor = this.lancamentoForm.controls['valor'].value
          valor = valor * -1;
          lancamento.valor = valor;
          lancamento.categoriaId = 6;

          lancamento.formaId = this.formaIdTransferencia;
          this.lancamentoService.create(lancamento)
            .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
            .subscribe({
              next: response => {
                this.lancamentoIdTransferencia = parseInt(this.extractId((response as any).headers.get('location'))); // Extrai o Id da URI retornada do banco 

                // Atualiza o campo lancamentoIdOrigem com os ids dos lançamentos de transferencia

                lancamento.id = this.lancamentoIdTransferencia;
                lancamento.formaId = this.formaIdTransferencia;
                lancamento.formaIdTransferencia = this.formaId;
                lancamento.lancamentoIdTransferencia = this.lancamentoIdOrigem;
                // lancamento.tipoConta = this.lancamentoForm.controls['tipoContaDestino'].value.toString();//Atualiza tipoConta Destino
                this.lancamentoService.update(lancamento)
                  .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
                  .subscribe({
                    next: () => {
                      lancamento.formaId = this.formaId;
                      lancamento.id = this.lancamentoIdOrigem;
                      lancamento.formaIdTransferencia = this.formaIdTransferencia;
                      lancamento.lancamentoIdTransferencia = this.lancamentoIdTransferencia;
                      lancamento.categoriaId = 6;
                      let valor = this.lancamentoForm.controls['valor'].value
                      valor = valor;
                      lancamento.valor = valor;
                      // lancamento.tipoConta = this.lancamentoForm.controls['tipoConta'].value.toString(); //Atualiza tipoConta Origem
                      lancamento.tipoLancamento = 'Despesa'
                      this.lancamentoService.update(lancamento)
                        .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
                        .subscribe({
                          next: () => {
                            this.lancamentoService.getPageLancamentoFromIgreja(this.filtro)
                            this.toastr.success('Registro atualizado com sucesso!', 'Atualização');
                            this.resetLancamento();
                            this.loadFormas();
                          }
                        })
                    }
                  })
              }
            })
        }
      })
  }

  public updateLancamentoPermuta() {
    this.lancamentoForm.controls['nome'].setValue(this.sharedService.formataNome(this.lancamentoForm.controls['nome'].value));

    // Lançamento negativo na conta Origem
    this.lancamentoForm.controls['tipoLancamento'].setValue('Despesa');
    this.lancamentoForm.controls['nome'].setValue('Permuta');
    this.lancamentoForm.controls['valor'].setValue(this.lancamentoForm.controls['valor'].value * -1);
    this.lancamentoForm.controls['formaId'].setValue(this.formaId);
    this.lancamentoForm.controls['formaIdTransferencia'].setValue(this.formaIdTransferencia);

    const lancamento: LancamentoDTO = Object.assign(new LancamentoDTO(), this.lancamentoForm.value);
    this.lancamentoService.update(lancamento)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: () => { }
      }),

      // Lançamento positivo na conta Destino
      this.lancamentoForm.controls['tipoLancamento'].setValue('Receita');
    this.lancamentoForm.controls['nome'].setValue('Permuta');
    this.lancamentoForm.controls['valor'].setValue(this.lancamentoForm.controls['valor'].value * -1);
    this.lancamentoForm.controls['formaId'].setValue(this.formaId);
    this.lancamentoForm.controls['formaIdTransferencia'].setValue(this.formaIdTransferencia);

    // const lancamento: LancamentoDTO = Object.assign(new LancamentoDTO(), this.lancamentoForm.value);

    this.lancamentoService.update(lancamento)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: () => {
          this.lancamentoService.getPageLancamentoFromIgreja(this.filtro)
          this.toastr.success('Registro atualizado com sucesso!', 'Atualização');
          this.resetLancamento();
          this.loadFormas();
        }
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

  getTotalGeralCredito() { // Inclui todas as Receitas inclusive Permuta, Ofertas Alçadas, missoes......
    this.filtro.tipoLancamento = 'Receita'
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
    this.lancamentoService.getTotalReceitaFromIgreja(this.filtro)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: response => {
          response !== null ? this.totalCreditos = response : this.totalCreditos = 0.00;
        }
      }),
      this.error; () => { }
  }

  getTotalOfertasAlcadas() {
    this.filtro.tipoLancamento = 'Receita'
    this.filtro.categorias = '4,5' // 4= Ofertas Alçadas 1 | 5= Ofertas Alçadas 2
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
    this.lancamentoService.getTotalOfertasAlcadas(this.filtro)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: response => {
          response !== null ? this.total_ofertas_alcadas = response : this.total_ofertas_alcadas = 0.00;
        }
      }),
      this.error; () => { }
  }


  getTotalGeralDebito() {
    this.filtro.tipoLancamento = 'Despesa'
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
    this.lancamentoService.getTotalGeralDebitoFromIgreja(this.filtro)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: response => {
          response !== null ? this.totalDebitos = response * -1 : this.totalDebitos = 0.00;
          this.filtro.tipoLancamento = this.tipoLancamento || ''
        }
      }),
      this.error; () => { }
  }

  getTotalOfertas() {
    this.filtro.tipoLancamento = 'Receita'
    this.filtro.categorias = '2';
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
    this.lancamentoService.getTotalOfertasFromIgreja(this.filtro)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: response => {
          response !== null ? this.totalOfertas = response : this.totalOfertas = 0.00;
        }
      }),
      this.error; () => { }
  }


  getTotalMissoes() {
    this.filtro.tipoLancamento = 'Receita';
    this.filtro.categorias = '7'; // 7=Missões
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

    this.lancamentoService.getTotalMissoesFromIgreja(this.filtro)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: response => {
          response !== null ? this.totalMissoes = response : this.totalMissoes = 0.00;
        }
      }),
      this.error; () => { }
  }

  getTotalSaldoAnterior() {
    this.lancamentoService.getTotalRDSaldoAnteriorFromIgreja(this.igrejaId, this.dataDiaAnterior)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: response => {
          response !== null ? this.saldoAnterior = response : this.saldoAnterior = 0.00;
        }
      }),
      this.error; () => { }
  }

  getTotalReceitaDizimo() {
    this.filtro.tipoLancamento = 'Receita'
    this.lancamentoService.getTotalReceitaDizimoFromIgreja(this.filtro)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: response => {
          response !== null ? this.totalReceitaDizimo = response : this.totalReceitaDizimo = 0.00;
        }
      }),
      this.error; () => { }
  }



  filtraCategoriaIds(value: string) { //Recebe tipo Receita ou Despesa e retorna IDS somente de receita ou de despesa

    //Controla a visibilidade do comobo de categorias 
    value == 'Receita' ? this.crtCategoria = 1 :
      value == 'Despesa' ? this.crtCategoria = 2 :
        value == 'Todas' || '' ? this.crtCategoria = 3 :
          value == 'Receita LC' ? this.crtCategoria = 4 : 3;

    if (value !== 'Todas') {
      let cat1 = this.categorias.filter(cat => cat.tipo == value); //Armazema todas as categorias de um tipo passado por parametro
      let cat2 = cat1.map(c => {
        return c.id?.toString(); // Retorna uma string de ids do tipo passado no parametro.
      })
      this.categoriaFiltrada = value;
      this.filtro.tipoLancamento = value;
      this.tipoLancamento = value; ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      this.categoriaIds = cat2.toString();
      this.filtro.categorias = this.categoriaIds;

    } else {
      this.filtro.tipoLancamento = "";
      this.filtro.categorias = this.categoriaIdsAux;
      this.categoriaIds = this.categoriaIdsAux;
    }

  }

  private loadPessoa(value: number) {
    this.pessoaService.getById(value)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: (response) => {
          this.pessoa = response;
          this.pessoaId = this.pessoa.id ?? 0;
          this.lancamentoForm.controls['pessoaId'].setValue(this.pessoa.id);
          this.lancamentoForm.controls['nome'].setValue(this.pessoa.nome);
          this.lancamentoForm.controls['tituloMin'].setValue(this.pessoa.tituloMin?.trim());
        },
        error: () => { }
      });
  }

  ///////////////////////////// Enentos DropDown   ///////////////////////////

  onChangeFormas(event: { value: string | number; }) {
    // DEIXEI AQUI PARA USO FUTURO
    //Array convertida em uma lista de string
    let length = event.value.toString();
    // Remove as virgulas da string
    const sempontoevirgula = length.replace(/,/g, "");
    //Pega o ultimo número da string
    const tamanho = sempontoevirgula.slice(-1);
    // DEIXEI AQUI PARA USO FUTURO

    // event.value == '' ? this.ctr_formas = false :
    //   tamanho == this.formas.length ? this.ctr_formas = false : this.ctr_formas = true;
    if (event.value !== "" && event.value > '0') {
      this.filtro.formas = event.value.toString();
    }

    if (event.value == "") {
      this.filtro.formas = this.formasIds;
    }
  }

  onChangeContas(event: { value: string | number; }) {
    if (event.value !== "" && event.value > '0') {
      this.filtro.contas = event.value.toString();
    }

    if (event.value == "") {
      this.filtro.contas = this.contaIds;
    }
  }

  onChangeCategorias(event: { value: string | number; }) {
    if (event.value !== "" && event.value > '0') {
      this.filtro.categorias = event.value.toString();
    }

    if (event.value == "") {
      this.filtro.categorias = this.categoriaIds;
    }
  }

  onChangeNomeHistorico(value: { value: any; }) {
    this.loadPessoa(value.value);
  }

  onChangeTransferenciaCategoria(value: { value: number; }) {
    this.transferenciaCategoriaId = value.value
    this.lancamentoForm.controls['categoriaId'].setValue(value.value);
  }


  onChangeTransferenciaOrigem(event: { value: number; }) {
    this.contaId = event.value;
    this.lancamentoIdOrigem = event.value;
  }

  onChangeTransferenciaDestino(event: { value: number; }) {
    this.contaIdTransferencia = event.value;
    this.lancamentoIdTransferencia = event.value;
  }

  onChangePermutaOrigem(event: { value: number; }) {
    this.formaId = event.value;
    this.lancamentoIdOrigem = event.value;
  }

  onChangePermutaDestino(event: { value: number; }) {
    this.lancamentoForm.controls['categoriaId'].setValue(1);
    this.formaIdTransferencia = event.value;
    this.lancamentoIdTransferencia = event.value;
  }

  private getCategoria(value: number) {
    this.categoriaService.findById(value)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: (response) => {
          this.categoria = response;
          this.lancamentoForm.controls['tipoLancamento'].setValue(response.tipo);
        },
        error: () => { }
      });
  }

  onChangeTPCategorias(tipo: { value: any; }) {
    this.getCategoria(tipo.value)
  }

  onChangeTPConta(event: { value: any; }) {
    this.getConta(event.value)
  }

  private getConta(value: number | undefined) {
    let conta_id = this.contas.filter(tc => tc.id == value); //Armazema todas as categorias de um tipo passado por parametro
    let tipo_conta = conta_id.map(tp => {
      return tp.tipo; // Retorna uma string de ids do tipo passado no parametro.
    })
    this.lancamentoForm.controls['tipoConta'].setValue(tipo_conta.toString());
  }


  onChangeCategoriasFiltradas(tipo: { value: string | undefined; }) {
    // this.categoriaForm.controls['categoriaFiltrada'].setValue('Todas');
    if (tipo.value !== 'Todas') {
      // this.ctr_receita = true; 
      this.totalCreditos = 0.00;
    } else {
      this.categoriaForm.controls['selectedCategorias'].patchValue([]);
      this.formaForm.controls['selectedFormas'].patchValue([]);
      // this.totalDizimos = 0.00;
      this.totalReceitaDizimo = 0.00;
    }

    if (tipo.value == "Receita") {
      this.categoriaForm.controls['selectedCategorias'].patchValue([]);
      this.formaForm.controls['selectedFormas'].patchValue([]);
    }

    if (tipo.value == "Despesa") {
      this.categoriaForm.controls['selectedCategorias'].patchValue([]);
      this.formaForm.controls['selectedFormas'].patchValue([]);
    }

    tipo.value !== "Todas" ? this.filtro.tipoLancamento = tipo.value : this.filtro.tipoLancamento = "";
    tipo.value !== "Todas" ? this.tipoLancamento = tipo.value! : this.tipoLancamento = "";
    this.filtraCategoriaIds(tipo.value!);
    tipo.value !== "Todas" ? this.categoriaFiltrada = tipo.value! : this.categoriaFiltrada = "";

    this.filtraCategorias(tipo.value!)
    this.filtro.tipoLancamento = this.categoriaFiltrada;
    this.tipoLancamento = this.categoriaFiltrada

  }

  public doSelectTipoLancamento = (value: any) => {
    if (value === 'Padrao') {
      this.lancamentoForm.controls['igrejaId'].setValue(null);
    } else {
      this.lancamentoForm.controls['igrejaId'].setValue(this.igrejaId);
    }

  }


  //EXCLUIR LANÇAMENTOS 
  exclusaoLancamento(indexId: number, indexIdTransferencia: number | undefined) {

    if (this.selectedLancamentos == null || this.length() == 0 || undefined) {
      Swal.fire('Lançamento | Seleção', 'Nenhum registro selecionado', 'info');
    } else {
      Swal.fire({
        title: 'Exclusão',
        text: 'Tem certeza que deseja excluir ' + this.length() + ' registro?',
        showCloseButton: true,
        showCancelButton: true,
        position: 'top',
      }).then((willDelete) => {
        if (willDelete.dismiss) {
          this.selectedLancamentos = [];
          this.length.set(0);
          // Swal.fire('Exclusão Cancelada', 'Seu registro está seguro', 'success');
        } else {
          if (this.length() <= 1) {
            if (this.indexId) { this.excluirLancamento(indexId); }
            if (this.indexIdTransferencia) { this.excluirSelectedLancamento(indexIdTransferencia ?? 0); }
            this.toastr.success('Exclusão', 'Registro excluido com sucesso!');
          }

          if (this.length() > 1) {
            for (let index = 0; index < this.length(); index++) {
              indexIdTransferencia = this.selectedLancamentos[index].lancamentoIdTransferencia;
              if (indexIdTransferencia) {
                this.excluirSelectedLancamento(indexIdTransferencia);
              }
              this.excluirLancamento(this.selectedLancamentos[index].id);
            }
            this.toastr.success('Exclusão', 'Registros excluidos com sucesso!');
          }
          this.loadContas();

          this.grid.first = 0;
        }
      });
    }

  }

  excluirLancamento(indexId: number | undefined) {
    this.lancamentoService.delete(indexId ?? 0)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: () => {
          this.lancamentoService.getPageLancamentoFromIgreja(this.filtro)
          this.loadContas();
          this.grid.reset();
          this.selectedLancamentos = null!;
        },
        error: () => { }
      })
  }


  excluirSelectedLancamento(indexIdTransferencia: number) {
    this.lancamentoService.delete(indexIdTransferencia)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: () => {
          this.grid.reset();
          // this.lancamentoService.getPageLancamentoFromIgreja(this.filtro)
          // this.toastr.success('Exclusão', 'Registro excluido com sucesso!');
          // this.messageService.add({ severity: 'success', summary: 'Successo', detail: 'Registro excluido com sucesso!' });
          this.loadContas();
        },
        error: () => { }
      })
  }


  confirmarExclusaoLancamentoTransferencia(lancamento: LancamentoDTO): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir este registro?',
      accept: () => {
        this.excluirLancamentoTransferencia(lancamento);
        this.grid.first = 0;
      }
    });
  }

  excluirLancamentoTransferencia(lancamento: LancamentoDTO) {
    this.lancamentoService.delete(lancamento.id ?? 0)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: () => {
          this.lancamentoService.delete(lancamento.lancamentoIdTransferencia!)
            .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
            .subscribe({
              next: () => {
                this.lancamentoService.getPageLancamentoFromIgreja(this.filtro)
                this.toastr.success('Exclusão', 'Registro excluido com sucesso!');
                this.loadContas();
              },
              error: () => { }
            })
        }
      })
  }

  confirmarExclusaoLancamentoPermuta(lancamento: LancamentoDTO): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir este registro?',
      accept: () => {
        this.excluirLancamentoPermuta(lancamento);
        this.grid.first = 0;
      }
    });
  }

  excluirLancamentoPermuta(lancamento: LancamentoDTO) {
    this.lancamentoService.delete(lancamento.id ?? 0)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: () => {
          this.lancamentoService.delete(lancamento.lancamentoIdTransferencia!)
            .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
            .subscribe({
              next: () => {
                this.lancamentoService.getPageLancamentoFromIgreja(this.filtro)
                this.toastr.success('Exclusão', 'Registro excluido com sucesso!');
                this.loadFormas();
              },
              error: () => { }
            })
        }
      })
  }


  resetModal() {
    this.lancamentoForm.reset();
    this.filtraCategorias(""); // Para deixar o combo de Categorias de Receitas de despesas vazia quando retorna da edição de lançamentos
    this.crtCategoria = 3;
  }
  setModalEdicao(value: string) {
    if (value == 'Transferencia') {
      value = 'Receita'
    }
    this.filtraCategorias(value);
    this.pageTitle = "Editando Movimento".toUpperCase();
    this.imodo.set(1);
  }

  setModalInclusao(value: any) {
    this.resetModal();
    this.imodo.set(0);

    switch (value) {
      case "Receita":
        let catReceita = this.categorias.filter((cat): boolean => cat.tipo !== "Despesa"); //Receita LC = Receita Livro Caixa
        this.categoriasFiltradas = catReceita;
        this.pageTitle = "Nova Receita".toUpperCase();
        this.lancamentoForm.controls['cadastrado'].setValue('sim');
        this.lancamentoForm.controls['igrejaId'].setValue(this.igrejaId);
        this.lancamentoForm.controls['tipoLancamento'].setValue('Receita');
        this.lancamentoForm.controls['data'].setValue(this.sharedService.dataAtualFormatada());
        this.lancamentoForm.controls['competencia'].setValue(this.sharedService.mesAno());
        this.lancamentoForm.controls['contaId'].setValue(this.contas[0].id);
        this.lancamentoForm.controls['centroCustoId'].setValue(1);
        this.lancamentoForm.controls['formaId'].setValue(1);
        this.lancamentoForm.controls['categoriaId'].setValue(1);
        this.lancamentoForm.controls['documento'].setValue(this.sharedService.mesAno());
        this.lancamentoForm.controls['historico'].setValue('Dízimo');
        this.lancamentoForm.controls['setorId'].setValue(this.setorId);
        this.lancamentoForm.controls['pessoaId'].setValue(0);
        this.lancamentoForm.controls['nome'].setValue("");
        break;

      case "Oferta":
        let catOferta = this.categorias.filter(cat => (cat.tipo == 'Receita' || cat.tipo == 'Receita LC' || cat.tipo == 'Oferta')); //Receita LC = Receita Livro Caixa
        this.categoriasFiltradas = catOferta;
        this.pageTitle = "Nova Oferta".toUpperCase();
        this.lancamentoForm.controls['cadastrado'].setValue('sim');
        this.lancamentoForm.controls['igrejaId'].setValue(this.igrejaId);
        this.lancamentoForm.controls['tipoLancamento'].setValue('Receita');
        this.lancamentoForm.controls['data'].setValue(this.sharedService.dataAtualFormatada());
        this.lancamentoForm.controls['competencia'].setValue(this.sharedService.mesAno());
        this.lancamentoForm.controls['contaId'].setValue(this.contas[0].id);
        this.lancamentoForm.controls['centroCustoId'].setValue(1);
        this.lancamentoForm.controls['formaId'].setValue(1);
        this.lancamentoForm.controls['categoriaId'].setValue(2);
        this.lancamentoForm.controls['historico'].setValue('Oferta');
        this.lancamentoForm.controls['setorId'].setValue(this.setorId);
        this.lancamentoForm.controls['pessoaId'].setValue(0);
        this.lancamentoForm.controls['nome'].setValue("");
        break;

      case "Despesa":
        let cat1 = this.categorias.filter(cat => cat.tipo == "Despesa"); //Armazema todas as categorias de um tipo passado por parametro
        this.categoriasFiltradas = cat1;
        this.pageTitle = "Nova Despesa".toUpperCase();
        this.lancamentoForm.controls['cadastrado'].setValue('sim');
        this.lancamentoForm.controls['igrejaId'].setValue(this.igrejaId);
        this.lancamentoForm.controls['tipoLancamento'].setValue("Despesa");
        this.lancamentoForm.controls['data'].setValue(this.sharedService.dataAtualFormatada());
        this.lancamentoForm.controls['competencia'].setValue(this.sharedService.mesAno());
        this.lancamentoForm.controls['contaId'].setValue(this.contas[0].id);
        this.lancamentoForm.controls['centroCustoId'].setValue(1);
        this.lancamentoForm.controls['formaId'].setValue(1);
        this.lancamentoForm.controls['categoriaId'].setValue(19);
        this.lancamentoForm.controls['historico'].setValue('Despesa');
        this.lancamentoForm.controls['setorId'].setValue(this.setorId);
        this.lancamentoForm.controls['pessoaId'].setValue(0);
        this.lancamentoForm.controls['nome'].setValue("");
        break;

      case "Transferencia": //Transferencia de forma pgto
        let catTransferencia = this.categorias.filter(cat => (cat.tipo == 'Receita')); //Receita LC = Receita Livro Caixa
        this.categoriasFiltradas = catTransferencia;
        this.pageTitle = "Transferência".toUpperCase();
        this.lancamentoForm.controls['cadastrado'].setValue('nao');
        this.lancamentoForm.controls['igrejaId'].setValue(this.igrejaId);
        this.lancamentoForm.controls['tipoLancamento'].setValue('Receita');
        this.lancamentoForm.controls['data'].setValue(this.sharedService.dataAtualFormatada());
        this.lancamentoForm.controls['competencia'].setValue(this.sharedService.mesAno());
        this.lancamentoForm.controls['contaId'].setValue(this.contas[0].id);// Conta de Origem
        this.contaId = this.contas[0].id ?? 0;
        this.lancamentoForm.controls['centroCustoId'].setValue(1);
        this.lancamentoForm.controls['formaId'].setValue(1);
        this.lancamentoForm.controls['documento'].setValue(this.sharedService.mesAno());
        this.lancamentoForm.controls['historico'].setValue('Transferencia entre contas');
        this.lancamentoForm.controls['setorId'].setValue(this.setorId);
        this.lancamentoForm.controls['pessoaId'].setValue(0);
        this.lancamentoForm.controls['nome'].setValue('Transferencia');
        this.lancamentoForm.controls['tituloMin'].setValue("Membro");
        this.lancamentoForm.controls['categoriaId'].setValue(this.categorias[0].id);
        break;

      case "Permuta": //Transferencia de forma pgto;
        this.pageTitle = "Permuta | Troca".toUpperCase();
        this.lancamentoForm.controls['cadastrado'].setValue('nao');
        this.lancamentoForm.controls['igrejaId'].setValue(this.igrejaId);
        this.lancamentoForm.controls['tipoLancamento'].setValue('Receita');
        this.lancamentoForm.controls['data'].setValue(this.sharedService.dataAtualFormatada());
        this.lancamentoForm.controls['competencia'].setValue(this.sharedService.mesAno());
        this.lancamentoForm.controls['contaId'].setValue(this.contas[0].id);// Conta de Origem
        this.formaId = this.formas[0].id ?? 0;
        this.lancamentoForm.controls['formaIdTransferencia'].setValue('Selecione ....');
        this.lancamentoForm.controls['centroCustoId'].setValue(1);
        this.lancamentoForm.controls['formaId'].setValue(1);
        this.lancamentoForm.controls['documento'].setValue(this.sharedService.mesAno());
        this.lancamentoForm.controls['historico'].setValue('Troca | Permuta');
        this.lancamentoForm.controls['setorId'].setValue(this.setorId);
        this.lancamentoForm.controls['pessoaId'].setValue(0);
        this.lancamentoForm.controls['nome'].setValue('Permuta');
        this.lancamentoForm.controls['contaId'].setValue(this.contas[0].id);// Conta de Origem
        this.lancamentoForm.controls['tituloMin'].setValue("Membro");
        break;

      default:
    }
  }

  filtraCategorias(value: string) {
    let cat1 = this.categorias.filter(cat => cat.tipo == value); //Armazema todas as categorias de um tipo passado por parametro
    this.categoriasFiltradas = cat1;
  }

  private extractId(location: string): string { // Extrai o Id da URL
    let position = location.lastIndexOf('/');
    return location.substring(position + 1, location.length);
  }


  private showError(error: { message: any; }) {
    this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.message });
  }

}

