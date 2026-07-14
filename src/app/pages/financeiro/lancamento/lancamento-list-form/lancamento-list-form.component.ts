import { Component, DestroyRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService, LazyLoadEvent, MenuItem, MessageService } from 'primeng/api';
import { Subscription, forkJoin } from 'rxjs';
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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Table } from 'primeng/table';
import { FileUploadModule } from 'primeng/fileupload';
import { SetorService } from 'src/app/theme/shared/services/setor.service';
import { HttpClient, HttpParams } from '@angular/common/http';

// ═══════════════════════════════════════════════════════
// FILTRO PRINCIPAL — usado pela grid, totais e relatórios
// NÃO ALTERAR OS TIPOS (string) — backend depende disso
// ═══════════════════════════════════════════════════════
export class LancamentoFiltro {
  igrejaId: number = igrejaIdSignal();
  setorId: number = setorIdSignal();
  nome: string = '';
  busca: string = '';
  dtinicio: string = '';
  dtfim: string = '';
  page: number = 0;
  linesPerPage: number = 10;
  contas: string = "";
  categorias: string = "";
  formas: string = "";
  centroCustos: string = "";
  tipoLancamento: string = "";
  incluirPermuta: boolean = false;
  nomeRelatorio: string = "";
}

// ═══════════════════════════════════════════════════════
// FILTRO EXCLUSIVO DO RELATÓRIO ANALÍTICO
// Usa arrays de number para o multiselect
// NÃO interfere no LancamentoFiltro principal
// ═══════════════════════════════════════════════════════
export class RelatorioAnaliticoFiltro {
  categoriasIds: number[] = [];
  formasIds: number[] = [];
  tipoLancamento: string = '';
  formato: string = '';
  contaId: number | null = null; 
  centroCustoIds: number | null = null;
}

@Component({
  selector: 'app-lancamento-list-form',
  templateUrl: './lancamento-list-form.component.html',
  styleUrls: ['./lancamento-list-form.component.scss'],
  standalone: true,
  imports: [
    RouterModule,
    DatePicker,
    ButtonModule,
    RouterLink,
    SharedModule,
    InputNumberModule,
    FileUploadModule
  ],
  providers: [
    LancamentoService,
    CategoriaService,
    ContaService,
    CentroCustoService,
    PessoaService,
    FormaService,
    SetorService
  ]
})
export class LancamentoListFormComponent implements OnInit {

  private searchTimer: any;
  private destroyRef = inject(DestroyRef);

  // ── Signals ──────────────────────────────────────────
  nomeIgrejaSignal = nomeIgrejaSignal;
  igrejaIdSignal = igrejaIdSignal;
  nomeUsuarioSignal = nomeUsuarioSignal;
  setorIdSignal = setorIdSignal;

  nomeIgreja = nomeIgrejaSignal();
  igrejaId = igrejaIdSignal();
  nomeUsuario = nomeUsuarioSignal();
  setorId = setorIdSignal();

  imodo = signal<number>(0);

  // ── Filtros ───────────────────────────────────────────
  filtro = new LancamentoFiltro();

  // Filtro exclusivo do relatório analítico (multiselect)
  relatorioAnalitico = new RelatorioAnaliticoFiltro();

  // ── Modal positions ───────────────────────────────────
  positionLancamento: 'left' | 'right' | 'top' | 'bottom' | 'center' | 'topleft' | 'topright' | 'bottomleft' | 'bottomright' = 'top';
  positionModalTransferencia: 'left' | 'right' | 'top' | 'bottom' | 'center' | 'topleft' | 'topright' | 'bottomleft' | 'bottomright' = 'top';
  positionModalPermuta: 'left' | 'right' | 'top' | 'bottom' | 'center' | 'topleft' | 'topright' | 'bottomleft' | 'bottomright' = 'top';

  // ── Visibilidade de modais ────────────────────────────
  visibleLancamento = false;
  visibleModalTransferencia = false;
  visibleModalPermuta = false;

  // ── Relatório Sintético ───────────────────────────────
  visibleRelatorioSintetico = false;
  positionRelatorioSintetico: 'top' | 'bottom' | 'left' | 'right' | 'center' = 'top';
  gerandoRelatorio = false;
  formatoSintetico: string = '';  // usado só no sintético

  contasRelatorio: any[] = [];
  setoresRelatorio: any[] = [];

  tiposRelatorio = [
    { label: 'Receitas', value: 'Receita' },
    { label: 'Despesas', value: 'Despesa' },
  ];

  formatosRelatorio = [
    { label: 'PDF', value: 'pdf' },
    { label: 'Excel', value: 'excel' },
  ];

  // ── Período ───────────────────────────────────────────
  rangeDates!: string;
  dtinicio: string = "";
  dtfim: string = "";
  dataDiaAnterior = "";

  // ── Controles de UI ──────────────────────────────────
  pesquisa?: boolean = false;
  descricao = '';
  valorTpLancamento: any = 'Todas';
  crtSaldoFinal = false;
  membroCadastrado = true;
  crtCategoria = 3;

  // ── IDs auxiliares (strings para o backend) ──────────
  contaIds!: string;
  contaIdsAux!: string;
  contaIdsAux1!: string;
  formasIds!: string;
  formaIdsAux!: string;
  categoriaIds!: string;
  categoriaIdsAux!: string;
  categoriaFiltrada!: string;
  centroCustoIds!: string;

  // ── IDs individuais ───────────────────────────────────
  contaId!: number;
  contaIdTransferencia!: number;
  formaIdTransferencia!: number;
  formaId!: number;
  categoriaId!: number;
  tipoLancamento = "".toLowerCase();
  transferenciaCategoriaId = 1;
  pessoaId = 0;

  // ── Totais ────────────────────────────────────────────
  totalCreditos: number = 0;
  total_ofertas_alcadas: number = 0;
  totalDebitos: number = 0;
  totalEventos: number = 0;
  totalDiversos: number = 0;
  totalMissoes: number = 0;
  totalOfertas: number = 0;
  totalReceitaDizimo: number = 0;
  saldoAnterior: number = 0;
  saldoFinalContas!: number;
  totalRegistros = 0;
  totalRegistrosConta = 0;

  // ── Índices de seleção ────────────────────────────────
  indexId!: number;
  indexIdTransferencia!: number;
  length = signal(0);
  transf!: number;

  // ── Lançamento IDs de transferência ──────────────────
  lancamentoId!: number;
  lancamentoIdOrigem!: number;
  lancamentoIdTransferencia!: number;

  // ── Listas de dados ───────────────────────────────────
  lancamentos!: LancamentoDTO[];
  selectedLancamentos!: LancamentoDTO[];

  contas: ContaDTO[] = [];
  contasTransferencia: ContaDTO[] = [];
  formasPermuta: FormaDTO[] = [];
  categorias: CategoriaDTO[] = [];   // todas as categorias
  categoriasFiltradas: CategoriaDTO[] = [];   // filtradas por tipo (usadas nos combos)
  centroCustos: CentroCustoDTO[] = [];
  pessoas: PessoaDTO[] = [];
  formas: FormaDTO[] = [];

  // ── Formulários ───────────────────────────────────────
  fb!: FormGroup;
  contaForm!: FormGroup;
  formaForm!: FormGroup;
  categoriaForm!: FormGroup;
  centroCustoForm!: FormGroup;
  lancamentoForm!: FormGroup;
  relatorioSinteticoForm!: FormGroup;

  // ── Modelos ───────────────────────────────────────────
  lancamento: LancamentoDTO = new LancamentoDTO();
  pessoa: PessoaDTO = new PessoaDTO();
  categoria: CategoriaDTO = new CategoriaDTO();

  // ── Misc ──────────────────────────────────────────────
  error = '';
  pageTitle!: string;
  lancamentoNome = "";
  subscription!: Subscription;
  submittingForm = false;
  activeTab: string;

  dataAtual: any = moment();

  tpLancamento = [
    { nome: "Todas" },
    { nome: "Receita" },
    { nome: "Despesa" }
  ];

  datas = [
    { nome: "Hoje" },
    { nome: "Mes Atual" },
    { nome: "Mês Anterior" }
  ];

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

  @ViewChild('dtlancamento') grid!: Table;

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
    private formaService: FormaService,
    private setorService: SetorService,
    public http: HttpClient
  ) {
    this.activeTab = 'home';
  }

  // ════════════════════════════════════════════════════
  // LIFECYCLE
  // ════════════════════════════════════════════════════

  ngOnInit() {
    this.buildLancamentoForm();
    this.buildRelatorioSinteticoForm();
    this.periodo();
    this.inicializarDados();
    this.loadPessoas();

    this.rangeDates = this.sharedService.rangeMesAtual();
    this.dtinicio = this.sharedService.primeiroDiaMes();
    this.dtfim = this.sharedService.ultimoDiaMes();
    this.filtro.dtinicio = this.sharedService.primeiroDiaMes();
    this.filtro.dtfim = this.sharedService.ultimoDiaMes();

    const data_americana = this.sharedService.formataDataUS(this.dtinicio);
    this.dataDiaAnterior = this.sharedService.dataSubDay(data_americana, 1);

    this.contaForm = new FormGroup({
      selectedContas: new FormControl<ContaDTO[] | null>(null)
    });
    this.formaForm = new FormGroup({
      selectedFormas: new FormControl<FormaDTO[] | null>(null)
    });
    this.categoriaForm = new FormGroup({
      selectedCategorias: new FormControl<CategoriaDTO[] | null>(null)
    });
    this.centroCustoForm = new FormGroup({
      selectedCentroCustos: new FormControl<CentroCustoDTO[] | null>(null)
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  // ════════════════════════════════════════════════════
  // INICIALIZAÇÃO DE DADOS
  // ════════════════════════════════════════════════════

  inicializarDados() {
    forkJoin({
      formas: this.formaService.getListFormaFromIgreja(this.igrejaId),
      categorias: this.categoriaService.getListCategoriaFromIgreja(this.igrejaId),
      contas: this.contaService.getListContaFromIgreja(this.igrejaId),
      centroCustos: this.centroCustoService.getListCentroCustoFromIgreja(this.igrejaId)
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {

        // ── FORMAS ──────────────────────────────────────
        this.formas = res.formas;
        this.formasIds = res.formas.map((f: any) => f.id).join(',');
        this.formaIdsAux = this.formasIds;
        this.filtro.formas = this.formasIds;
        this.loadFormasPermuta();

        // ── CATEGORIAS ──────────────────────────────────
        this.categorias = res.categorias;
        this.categoriaIds = res.categorias.map((c: any) => c.id).join(',');
        this.categoriaIdsAux = this.categoriaIds;
        this.filtro.categorias = this.categoriaIds;

        // Pré-seleciona TODAS no multiselect do relatório analítico
        this.relatorioAnalitico.categoriasIds = res.categorias.map((c: any) => c.id);
        this.relatorioAnalitico.formasIds = res.formas.map((f: any) => f.id);

        // ── CENTRO CUSTOS ────────────────────────────────
        this.centroCustos = res.centroCustos;
        this.centroCustoIds = '';
        this.filtro.centroCustos = '';

        // ── CONTAS ───────────────────────────────────────
        if (res.contas.length === 0) {
          Swal.fire('Atenção !!!', 'Nenhuma conta encontrada. Cadastre uma conta', 'warning');
          return;
        }

        this.contas = res.contas;
        this.contasTransferencia = res.contas;
        this.loadContasTransferencia();

        // Saldo total das contas
        this.saldoFinalContas = res.contas.reduce(
          (total: number, c: any) => total + (c.saldoCalculado || 0), 0
        );

        this.contaIds = res.contas.map((c: any) => c.id).join(',');
        this.contaIdsAux = this.contaIds;
        this.filtro.contas = this.contaIds;

        // Dispara a primeira busca
        this.refreshAll();
      });
  }

  // ════════════════════════════════════════════════════
  // REFRESH CENTRAL
  // ════════════════════════════════════════════════════

  refreshAll() {
    this.loadLancamentos();
    this.getTotalizacoes();
  }

  // ════════════════════════════════════════════════════
  // LOAD DADOS
  // ════════════════════════════════════════════════════

  loadLancamentos() {
    this.lancamentoService.getPageLancamentoFromIgreja(this.filtro)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.lancamentos = response['content'].sort((a: { id: number }, b: { id: number }) => b.id - a.id);
          this.totalRegistros = response.totalElements;
          this.pesquisa = true;
          this.getPrinters();
        },
        error: (error) => {
          this.error = error;
          this.showError(error);
        }
      });
  }

  getTotalizacoes() {
    this.lancamentoService.getTotaisFromIgreja(this.filtro)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: total => {
          this.totalReceitaDizimo = total.totalDizimo || 0;
          this.totalCreditos = total.totalReceitas || 0;
          this.saldoAnterior = total.saldoAnterior || 0;
          this.totalOfertas = total.totalOferta || 0;
          this.total_ofertas_alcadas = total.totalOfertaAlcadas || 0;
          this.totalDebitos = total.totalDespesas || 0;
          this.totalEventos = total.totalEventos || 0;
          this.totalMissoes = total.totalMissoes || 0;
          this.totalDiversos = total.totalDiversos || 0;
        },
        error: err => {
          this.toastr.error('Erro ao obter totalizações.');
          console.error(err);
        }
      });
  }

  loadPessoas() {
    this.pessoaService.getPessoasAtivasFromIgreja(this.igrejaId, 'Ativo')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => { this.pessoas = response; },
        error: () => { }
      });
  }

  loadContasTransferencia() {
    this.contasTransferencia = this.contas.map(c => ({
      contaIdTransferencia: c.id,
      nome: c.nome
    }));
  }

  loadFormasPermuta() {
    this.formasPermuta = this.formas
      .filter(fr => fr.id !== 1)
      .map(f => ({ formaIdTransferencia: f.id, nome: f.nome }));
  }

  loadCentroCustos() {
    this.centroCustoService.getListCentroCustoFromIgreja(this.igrejaId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => { this.centroCustos = response; },
        error: () => { }
      });
  }

  // ════════════════════════════════════════════════════
  // RELATÓRIOS — SINTÉTICO
  // ════════════════════════════════════════════════════

  gerarRelatorioSintetico(): void {
    if (this.formatoSintetico === 'pdf') {
      this.lancamentoService.gerarRelatorioSinteticoPdf(this.filtro)
        .subscribe({ next: (blob) => { window.open(URL.createObjectURL(blob), '_blank'); } });
    } else {
      this.lancamentoService.gerarRelatorioSinteticoExcel(this.filtro)
        .subscribe({
          next: (blob) => {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `sintetico-${this.filtro.dtinicio}-${this.filtro.dtfim}.xlsx`;
            a.click();
          }
        });
    }
  }

  // ════════════════════════════════════════════════════
  // RELATÓRIOS — ANALÍTICO
  // Usa relatorioAnalitico (arrays) — NÃO usa filtro.categorias/formas
  // ════════════════════════════════════════════════════

  gerarRelatorioAnalitico(): void {
    const { categoriasIds, formasIds, tipoLancamento, formato, contaId, centroCustoIds } = this.relatorioAnalitico;

    const obs$ = formato === 'pdf'
      ? this.lancamentoService.gerarRelatorioAnaliticoPdf(
          this.filtro, categoriasIds, formasIds, tipoLancamento, contaId, centroCustoIds)  // ← contaId
      : this.lancamentoService.gerarRelatorioAnaliticoExcel(
          this.filtro, categoriasIds, formasIds, tipoLancamento, contaId, centroCustoIds); // ← contaId

    this.gerandoRelatorio = true;

    obs$.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          if (formato === 'pdf') {
            window.open(url, '_blank');
          } else {
            const a = document.createElement('a');
            a.href = url;
            a.download = `analitico-${this.filtro.dtinicio}-${this.filtro.dtfim}.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
          }
          this.gerandoRelatorio = false;
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao gerar relatório analítico'
          });
          this.gerandoRelatorio = false;
        }
      });
  }

  abrirRelatorioSintetico(): void {
    this.carregarContasESetores();
    this.positionRelatorioSintetico = 'top';
    this.visibleRelatorioSintetico = true;
  }

  fecharRelatorioSintetico(): void {
    this.visibleRelatorioSintetico = false;
    this.formatoSintetico = '';

    // Reseta o filtro analítico e pré-seleciona tudo novamente
    this.relatorioAnalitico = new RelatorioAnaliticoFiltro();
    this.relatorioAnalitico.categoriasIds = this.categorias.map(c => c.id!);
    this.relatorioAnalitico.formasIds = this.formas.map(f => f.id!);
    this.relatorioAnalitico.contaId;
  }

  private carregarContasESetores(): void {
    this.contaService.getContasByIgreja(igrejaIdSignal()).subscribe({
      next: (contas) => { this.contasRelatorio = contas; },
      error: (err) => { console.error('Erro ao carregar contas:', err); }
    });

    // Busca o setor pelo signal e monta a lista só com o nome
    this.setorService.getSetorById(setorIdSignal()).subscribe({
        next: (setor) => { 
            this.setoresRelatorio = [{ id: setor.id, nome: setor.nome }];
            this.lancamentoForm.controls['nomeSetor'].setValue(this.setoresRelatorio[0].nome)
        },
        error: (err) => { console.error('Erro ao carregar setor:', err); }
    });
  }

  

  // ════════════════════════════════════════════════════
  // RELATÓRIOS — OUTROS
  // ════════════════════════════════════════════════════

  imprimirLancamentos(): void {
    if (this.lancamentos.length === 0) {
      this.toastr.warning('Nenhum registro para imprimir.');
      return;
    }
    this.lancamentoService.gerarMovimentacaoFinanceiraPdf(this.filtro, 'movimentacao-financeira')
      .subscribe({
        next: (blob) => { window.open(window.URL.createObjectURL(blob), '_blank'); },
        error: (error) => {
          this.toastr.error('Erro ao gerar o relatório PDF.');
          console.error(error);
        }
      });
  }

  imprimirSintetico(): void {
    if (this.lancamentos.length === 0) {
      this.toastr.warning('Nenhum registro para imprimir.');
      return;
    }
    this.lancamentoService.gerarRelatorioSinteticoPdf(this.filtro)
      .subscribe({
        next: (blob) => { window.open(window.URL.createObjectURL(blob), '_blank'); },
        error: (error) => {
          this.toastr.error('Erro ao gerar o relatório PDF.');
          console.error(error);
        }
      });
  }

  imprimirRecibo(id: any) {
    if (!id) {
      Swal.fire('Exclusão', 'Nenhum registro encontrado', 'info');
    } else {
      window.open(
        `${API_CONFIG.baseUrl}/relatorios/recibos/?nome=recibo-lancamento&igreja=${this.igrejaId}&lancamento_id=${id}`,
        '_blank'
      );
    }
  }

  getPrinters() {
    this.printItems = [
      {
        label: 'Entradas', icon: 'pi pi-dollar', target: '_blank',
        url: `${API_CONFIG.baseUrl}/relatorios/entradas/?nome=entrada-dizimo-oferta&igreja=${this.igrejaId}&dt_inicio=${this.dtinicio}&dt_fim=${this.dtfim}`
      },
      { separator: true },
      {
        label: 'Sintético Financeiro', icon: 'pi pi-chart-bar',
        command: () => this.abrirRelatorioSintetico()
      },
      {
        label: 'Dízimo de obreiros', icon: 'pi pi-dollar', target: '_blank',
        url: `${API_CONFIG.baseUrl}/relatorios/entradas/?nome=entrada-dizimo-obreiros&igreja=${this.igrejaId}&dt_inicio=${this.dtinicio}&dt_fim=${this.dtfim}`
      },
      { separator: true },
      {
        label: 'Livro caixa - Diário', icon: 'pi pi-dollar', target: '_blank',
        url: `${API_CONFIG.baseUrl}/relatorios/entradas/?nome=livro-caixa-diario&igreja=${this.igrejaId}&dt_inicio=${this.dtinicio}&dt_fim=${this.dtfim}`
      },
      { separator: true },
      {
        label: 'Livro caixa - Mensal Simplificado', icon: 'pi pi-calendar',
        command: () => {
          this.lancamentoService.gerarLivroCaixaSimplificado(this.filtro, 'livro-caixa-mensal-simplificado')
            .subscribe({
              next: (blob) => { window.open(window.URL.createObjectURL(blob), '_blank'); },
              error: (err) => { this.toastr.error('Erro ao gerar o relatório Livro Caixa Mensal.'); console.error(err); }
            });
        }
      },
      { separator: true },
      {
        label: 'Livro caixa - Mensal Detalhado', icon: 'pi pi-calendar',
        command: () => {
          this.lancamentoService.gerarLivroCaixaDetalhado(this.filtro, 'livro-caixa-mensal-detalhado')
            .subscribe({
              next: (blob) => { window.open(window.URL.createObjectURL(blob), '_blank'); },
              error: (err) => { this.toastr.error('Erro ao gerar o relatório Livro Caixa Mensal.'); console.error(err); }
            });
        }
      },
      {
        label: 'Ofertas - Alçadas', icon: 'pi pi-dollar',
        command: () => {
          window.open(
            `${API_CONFIG.baseUrl}/relatorios/entradas/?nome=ofertas-alcadas&igreja=${this.igrejaId}&dt_inicio=${this.dtinicio}&dt_fim=${this.dtfim}`,
            '_blank'
          );
        }
      },
      { separator: true },
      {
        label: 'Demostrativo de Receitas e Permutas - CONGREGAÇÃO', icon: 'pi pi-dollar', target: '_blank',
        url: `${API_CONFIG.baseUrl}/relatorios/entradas/?nome=relacao-entradas-dizimo-transferencias-congregacao&igreja=${this.igrejaId}&dt_inicio=${this.dtinicio}&dt_fim=${this.dtfim}`
      },
      { separator: true },
      {
        label: 'Transferências - SETOR', icon: 'pi pi-dollar', target: '_blank',
        url: `${API_CONFIG.baseUrl}/relatorios/entradas/setor/?nome=relacao-entradas-dizimo-transferencias-setor&setor=${this.setorId}&dt_inicio=${this.dtinicio}&dt_fim=${this.dtfim}`
      },
      { separator: true },
      {
        label: 'Resumo - SETOR', icon: 'pi pi-dollar', target: '_blank',
        url: `${API_CONFIG.baseUrl}/relatorios/entradas/setor/resumo/?nome=resumo-entradas-setor&setor=${this.setorId}&dt_inicio=${this.dtinicio}&dt_fim=${this.dtfim}`
      },
      { separator: true },
      {
        label: 'Relatório - SETOR', icon: 'pi pi-dollar', target: '_blank',
        url: `${API_CONFIG.baseUrl}/relatorios/entradas/setor/?nome=relatorio-entradas-setor-quadro&setor=${this.setorId}&dt_inicio=${this.dtinicio}&dt_fim=${this.dtfim}`
      },
      { separator: true },
      {
        label: 'Fechamento - SETOR', icon: 'pi pi-dollar', target: '_blank',
        url: `${API_CONFIG.baseUrl}/relatorios/entradas/setor/?nome=fechamento-setor&setor=${this.setorId}&dt_inicio=${this.dtinicio}&dt_fim=${this.dtfim}`
      },
    ];
  }

  // ════════════════════════════════════════════════════
  // FILTROS E PAGINAÇÃO
  // ════════════════════════════════════════════════════

  onGlobalFilter() {
    if (this.searchTimer) { clearTimeout(this.searchTimer); }
    this.searchTimer = setTimeout(() => {
      this.filtro.page = 0;
      if (this.grid) { this.grid.first = 0; }
      this.refreshAll();
    }, 400);
  }

  aoMudarPagina(event: LazyLoadEvent) {
    this.filtro.page = event!.first! / event!.rows!;
    this.filtro.linesPerPage = event.rows!;
    if (this.pesquisa) { this.refreshAll(); }
  }

  filtraLancamentos() {
    this.pesquisa = true;
    this.filtro.page = 0;

    if (this.grid) {
      this.grid.first = 0;
    } else {
      this.refreshAll();
    }

    if (this.rangeDates == null) {
      this.dtinicio = this.rangeDates[0];
      this.filtro.dtinicio = this.rangeDates[0];
      if (this.dtinicio.length < 10) {
        this.dtinicio = (this.rangeDates as string).substring(0, 10);
        this.filtro.dtinicio = (this.rangeDates as string).substring(0, 10);
      }
    }

    this.crtSaldoFinal = true;
    if (this.dtfim == null) {
      this.dtfim = this.dtinicio;
      this.filtro.dtfim = this.dtinicio;
    }
    this.rangeDates = this.dtinicio + " - " + this.dtfim;

    const data_americana = this.sharedService.formataDataUS(this.dtinicio);
    this.dataDiaAnterior = this.sharedService.dataSubDay(data_americana, 1);

    this.refreshAll();
  }

  filtraCategoriaIds(value: string) {
    value == 'Receita' ? this.crtCategoria = 1 :
      value == 'Despesa' ? this.crtCategoria = 2 :
        value == 'Todas' || value == '' ? this.crtCategoria = 3 :
          value == 'Receita LC' ? this.crtCategoria = 4 : 3;

    if (value !== 'Todas') {
      const cat1 = this.categorias.filter(cat => cat.tipo == value);
      const cat2 = cat1.map(c => c.id?.toString());
      this.categoriaFiltrada = value;
      this.filtro.tipoLancamento = value;
      this.tipoLancamento = value;
      this.categoriaIds = cat2.toString();
      this.filtro.categorias = this.categoriaIds;
    } else {
      this.filtro.tipoLancamento = "";
      this.filtro.categorias = this.categoriaIdsAux;
      this.categoriaIds = this.categoriaIdsAux;
    }
  }

  filtraCategorias(tipo: string) {
    if (tipo === 'Todas' || !tipo) {
      this.categoriasFiltradas = this.categorias;
    } else {
      this.categoriasFiltradas = this.categorias.filter(cat => cat.tipo === tipo);
    }
  }

  atualizarFiltrosStrings(event: any, tipo: 'contas' | 'formas' | 'categorias' | 'centroCustos') {
    if (Array.isArray(event.value)) {
      const ids = event.value.map((item: any) => item.id || item);
      this.filtro[tipo] = ids.join(',');
    }
  }

  periodo() {
    if (this.rangeDates == null) {
      this.dtinicio = this.sharedService.dataAtualFormatada();
      this.rangeDates = this.dtinicio + " - " + this.dtinicio;
      this.filtro.dtinicio = this.dtinicio;
    } else {
      this.dtinicio = this.rangeDates[0];
      this.dtfim = this.rangeDates[1];
      if (this.dtinicio.length < 10 && this.dtfim.length < 10) {
        this.dtinicio = this.rangeDates.substring(0, 10);
        this.dtfim = this.rangeDates.substring(13, 23);
        this.filtro.dtinicio = this.rangeDates.substring(0, 10);
        this.filtro.dtfim = this.rangeDates.substring(13, 23);
      } else {
        this.dtinicio = this.rangeDates[0];
        this.dtfim = this.rangeDates[1];
        this.filtro.dtinicio = this.rangeDates[0];
        this.filtro.dtfim = this.rangeDates[1];
      }
    }
    if (this.dtfim == null) {
      this.dtfim = this.dtinicio;
      this.filtro.dtfim = this.dtinicio;
    }
  }

  // ════════════════════════════════════════════════════
  // EVENTOS DE DROPDOWN
  // ════════════════════════════════════════════════════

  onChangeTipoLancamento(event: any) {
    this.valorTpLancamento = event.value;
    this.filtro.tipoLancamento = (event.value === 'Todas') ? "" : event.value;

    this.filtraCategoriaIds(event.value);
    this.filtraCategorias(event.value);

    if (event.value === 'Todas' || event.value === 'Receita' || event.value === 'Despesa') {
      this.categoriaForm.get('selectedCategorias')?.patchValue([]);
      this.formaForm.get('selectedFormas')?.patchValue([]);
      this.contaForm.get('selectedContas')?.patchValue([]);
      this.centroCustoForm.get('selectedCentroCustos')?.patchValue([]);
      this.filtro.tipoLancamento = '';
      this.filtro.formas = this.formaIdsAux;
      this.filtro.contas = this.contaIdsAux;
      this.pesquisa = true;
      this.filtro.page = 0;
      this.filtro.nome = '';
    }
  }

  onChangeNomeHistorico(value: { value: any }) {
    this.loadPessoa(value.value);
  }

  onChangeTransferenciaCategoria(value: { value: number }) {
    this.transferenciaCategoriaId = value.value;
    this.lancamentoForm.controls['categoriaId'].setValue(value.value);
  }

  onChangeTransferenciaOrigem(event: { value: number }) {
    this.contaId = event.value;
    this.lancamentoIdOrigem = event.value;
  }

  onChangeTransferenciaDestino(event: { value: number }) {
    this.contaIdTransferencia = event.value;
    this.lancamentoIdTransferencia = event.value;
  }

  onChangePermutaOrigem(event: { value: number }) {
    this.formaId = event.value;
    this.lancamentoIdOrigem = event.value;
  }

  onChangePermutaDestino(event: { value: number }) {
    this.lancamentoForm.controls['categoriaId'].setValue(1);
    this.formaIdTransferencia = event.value;
    this.lancamentoIdTransferencia = event.value;
  }

  onChangeTPCategorias(tipo: { value: any }) {
    this.getCategoria(tipo.value);
  }

  onChangeTransferencia(id: { value: any }) {
    this.lancamentoForm.controls['categoriaId'].setValue(id.value);
  }

  onChangeTPConta(event: { value: any }) {
    this.getConta(event.value);
  }

  // ════════════════════════════════════════════════════
  // CRUD LANÇAMENTO
  // ════════════════════════════════════════════════════

  submitFormLancamento() {
    this.submittingForm = true;
    if (this.imodo() === 0) this.createLancamento();
    else this.updateLancamento();
  }

  public createLancamento() {
    this.lancamentoForm.controls['nome'].setValue(
      this.sharedService.formataNome(this.lancamentoForm.controls['nome'].value)
    );

    const value = this.lancamentoForm.controls['tipoLancamento'].value;
    if ((value === 'Receita' || value === 'Receita LC') && this.lancamentoForm.controls['valor'].value < 0) {
      this.lancamentoForm.controls['valor'].setValue(this.lancamentoForm.controls['valor'].value * -1);
    }
    if (value === 'Despesa' && this.lancamentoForm.controls['valor'].value > 0) {
      this.lancamentoForm.controls['valor'].setValue(this.lancamentoForm.controls['valor'].value * -1);
    }

    const lancamento: LancamentoDTO = this.lancamentoForm.value;
    this.lancamentoService.create(lancamento)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          this.lancamento.id = parseInt(this.extractId((response as any).headers.get('location')));
          this.lancamentoForm.controls['nome'].setValue(null);
          this.lancamentoForm.controls['pessoaId'].setValue(0);
          this.lancamentoForm.controls['valor'].setValue(null);
          this.toastr.success('Registro inserido com sucesso!', 'Lançamento');
          this.inicializarDados();
        },
        error: () => { }
      });
  }

  public updateLancamento() {
    this.lancamentoForm.controls['nome'].setValue(
      this.sharedService.formataNome(this.lancamentoForm.controls['nome'].value)
    );

    const value = this.lancamentoForm.controls['tipoLancamento'].value;
    if (value === 'Receita' && this.lancamentoForm.controls['valor'].value < 0) {
      this.lancamentoForm.controls['valor'].setValue(this.lancamentoForm.controls['valor'].value * -1);
    }
    if (value === 'Despesa' && this.lancamentoForm.controls['valor'].value > 0) {
      this.lancamentoForm.controls['valor'].setValue(this.lancamentoForm.controls['valor'].value * -1);
    }

    const lancamento: LancamentoDTO = Object.assign(new LancamentoDTO(), this.lancamentoForm.value);
    this.lancamentoService.update(lancamento)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastr.success('Registro atualizado com sucesso!', 'Atualização');
          this.inicializarDados();
        },
        error: () => { }
      });
  }

  loadLancamento(lancamento: LancamentoDTO) {
    this.lancamentoId = lancamento.id ?? 0;
    this.lancamentoService.findById(this.lancamentoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.lancamento = response;
          this.lancamentoForm.patchValue(this.lancamento);
          this.contaId = (response as any)['conta'].id;
          this.contaIdTransferencia = response.contaIdTransferencia ?? 0;
          this.formaIdTransferencia = response.formaIdTransferencia ?? 0;
          this.lancamentoForm.controls['igrejaId'].setValue(this.igrejaId);
          this.lancamentoForm.controls['pessoaId'].setValue(this.lancamento.pessoaId);
          this.lancamentoForm.controls['categoriaId'].setValue((response as any)['categoria'].id);
          this.lancamentoForm.controls['contaId'].setValue((response as any)['conta'].id);
          this.lancamentoForm.controls['formaId'].setValue((response as any)['forma'].id);
          this.lancamentoForm.controls['valor'].setValue(Math.abs(this.lancamentoForm.controls['valor'].value));

          if (response.valor! > '0' && (response.nome == 'Transferencia' || response.nome == 'Permuta')) {
            this.lancamentoForm.controls['contaId'].setValue(response.contaIdTransferencia);
            this.lancamentoForm.controls['contaIdTransferencia'].setValue((response as any)['conta'].id);
          } else {
            this.lancamentoForm.controls['valor'].setValue(response.valor);
          }

          this.lancamentoForm.controls['centroCustoId'].setValue((response as any)['centroCusto'].id);

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
      });
  }

  resetLancamento() { this.refreshAll(); }

  // ════════════════════════════════════════════════════
  // TRANSFERÊNCIA
  // ════════════════════════════════════════════════════

  submitFormTransferencia() {
    this.submittingForm = true;
    if (this.imodo() === 0) { this.createLancamentoTransferencia(); }
  }

  public createLancamentoTransferencia() {
    this.lancamentoForm.controls['valor'].setValue(this.lancamentoForm.controls['valor'].value * -1);
    const lancamento: LancamentoDTO = this.lancamentoForm.value;

    this.lancamentoService.create(lancamento)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          this.lancamentoIdOrigem = parseInt(this.extractId((response as any).headers.get('location')));

          this.lancamentoForm.controls['contaId'].setValue(this.contaIdTransferencia);
          lancamento.contaIdTransferencia = this.contaId;
          lancamento.categoriaId = this.lancamentoForm.controls['categoriaId'].value;
          lancamento.valor = String(this.lancamentoForm.controls['valor'].value * -1);
          lancamento.contaId = this.contaIdTransferencia;

          this.lancamentoService.create(lancamento)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: response => {
                this.lancamentoIdTransferencia = parseInt(this.extractId((response as any).headers.get('location')));

                lancamento.id = this.lancamentoIdTransferencia;
                lancamento.contaId = this.contaIdTransferencia;
                lancamento.contaIdTransferencia = this.contaId;
                lancamento.lancamentoIdTransferencia = this.lancamentoIdOrigem;

                this.lancamentoService.update(lancamento)
                  .pipe(takeUntilDestroyed(this.destroyRef))
                  .subscribe({
                    next: () => {
                      lancamento.contaId = this.contaId;
                      lancamento.id = this.lancamentoIdOrigem;
                      lancamento.contaIdTransferencia = this.contaIdTransferencia;
                      lancamento.lancamentoIdTransferencia = this.lancamentoIdTransferencia;
                      lancamento.categoriaId = 29;
                      lancamento.tipoLancamento = 'Despesa';

                      this.lancamentoService.update(lancamento)
                        .pipe(takeUntilDestroyed(this.destroyRef))
                        .subscribe({
                          next: () => {
                            this.toastr.success('Operação realizada com sucesso!', 'Transferência');
                            this.inicializarDados();
                            this.resetLancamento();
                          }
                        });
                    }
                  });
              }
            });
        }
      });
  }

  // ════════════════════════════════════════════════════
  // PERMUTA
  // ════════════════════════════════════════════════════

  submitFormPermuta() {
    this.submittingForm = true;
    if (this.imodo() === 0) { this.createLancamentoPermuta(); }
  }

  public createLancamentoPermuta() {
    this.lancamentoForm.controls['valor'].setValue(this.lancamentoForm.controls['valor'].value * -1);
    const lancamento: LancamentoDTO = this.lancamentoForm.value;

    this.lancamentoService.create(lancamento)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          this.lancamentoIdOrigem = parseInt(this.extractId((response as any).headers.get('location')));

          this.lancamentoForm.controls['formaId'].setValue(this.formaIdTransferencia);
          lancamento.formaIdTransferencia = this.formaId;
          lancamento.valor = String(this.lancamentoForm.controls['valor'].value * -1);
          lancamento.categoriaId = 6;
          lancamento.formaId = this.formaIdTransferencia;

          this.lancamentoService.create(lancamento)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: response => {
                this.lancamentoIdTransferencia = parseInt(this.extractId((response as any).headers.get('location')));

                lancamento.id = this.lancamentoIdTransferencia;
                lancamento.formaId = this.formaIdTransferencia;
                lancamento.formaIdTransferencia = this.formaId;
                lancamento.lancamentoIdTransferencia = this.lancamentoIdOrigem;

                this.lancamentoService.update(lancamento)
                  .pipe(takeUntilDestroyed(this.destroyRef))
                  .subscribe({
                    next: () => {
                      lancamento.formaId = this.formaId;
                      lancamento.id = this.lancamentoIdOrigem;
                      lancamento.formaIdTransferencia = this.formaIdTransferencia;
                      lancamento.lancamentoIdTransferencia = this.lancamentoIdTransferencia;
                      lancamento.categoriaId = 28;
                      lancamento.tipoLancamento = 'Despesa';

                      this.lancamentoService.update(lancamento)
                        .pipe(takeUntilDestroyed(this.destroyRef))
                        .subscribe({
                          next: () => {
                            this.toastr.success('Operação realizada com sucesso!', 'Permuta');
                            this.resetLancamento();
                            this.inicializarDados();
                          }
                        });
                    }
                  });
              }
            });
        }
      });
  }

  // ════════════════════════════════════════════════════
  // EXCLUSÃO
  // ════════════════════════════════════════════════════

  linhasSelecionada(event: string | any[]): void {
    this.length.set(event.length);
    if (event.length >= 1) {
      this.indexId = event[0].id;
      this.indexIdTransferencia = event[0].lancamentoIdTransferencia;
    }
  }

  aoDesmarcar(event: any) { this.length.set(0); }

  deleteIndividual() { this.exclusaoLancamento(this.indexId, this.indexIdTransferencia); }
  deleteMultiplos() { this.exclusaoLancamento(this.indexId, this.indexIdTransferencia); }

  limpaCheckbox() {
    this.selectedLancamentos ? this.selectedLancamentos = [] : this.selectedLancamentos = [];
    this.length.set(0);
  }

  exclusaoLancamento(indexId: number, indexIdTransferencia: number | undefined) {
    if (this.selectedLancamentos == null || this.length() == 0 || undefined) {
      Swal.fire('Lançamento | Seleção', 'Nenhum registro selecionado', 'info');
      return;
    }

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
      } else {
        if (this.length() <= 1) {
          if (this.indexId) { this.excluirLancamento(indexId); }
          if (this.indexIdTransferencia) { this.excluirSelectedLancamento(indexIdTransferencia ?? 0); }
          this.toastr.success('Exclusão', 'Registro excluido com sucesso!');
        }
        if (this.length() > 1) {
          for (let index = 0; index < this.length(); index++) {
            indexIdTransferencia = this.selectedLancamentos[index].lancamentoIdTransferencia;
            if (indexIdTransferencia) { this.excluirSelectedLancamento(indexIdTransferencia); }
            this.excluirLancamento(this.selectedLancamentos[index].id);
          }
          this.toastr.success('Exclusão', 'Registros excluidos com sucesso!');
        }
        this.inicializarDados();
        this.grid.first = 0;
      }
    });
  }

  excluirLancamento(indexId: number | undefined) {
    this.lancamentoService.delete(indexId ?? 0)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.inicializarDados();
          this.grid.reset();
          this.selectedLancamentos = null!;
        },
        error: () => { }
      });
  }

  excluirSelectedLancamento(indexIdTransferencia: number) {
    this.lancamentoService.delete(indexIdTransferencia)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.grid.reset();
          this.inicializarDados();
        },
        error: () => { }
      });
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
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.lancamentoService.delete(lancamento.lancamentoIdTransferencia!)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: () => {
                this.toastr.success('Exclusão', 'Registro excluido com sucesso!');
                this.inicializarDados();
              },
              error: () => { }
            });
        }
      });
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
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.lancamentoService.delete(lancamento.lancamentoIdTransferencia!)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: () => {
                this.toastr.success('Exclusão', 'Registro excluido com sucesso!');
                this.inicializarDados();
              },
              error: () => { }
            });
        }
      });
  }

  // ════════════════════════════════════════════════════
  // COMPROVANTES
  // ════════════════════════════════════════════════════

  visualizarComprovante(lancamentoId: number) {
    this.lancamentoService.baixarComprovante(lancamentoId)
      .subscribe({
        next: (blob: Blob) => { window.open(window.URL.createObjectURL(blob), '_blank'); },
        error: () => { this.toastr.error('Erro ao abrir o arquivo ou anexo não encontrado.'); }
      });
  }

  excluirComprovante(lancamentoId: number) {
    Swal.fire({
      title: 'Exclusão',
      text: 'Tem certeza que deseja remover o comprovante?',
      icon: 'error',
      showCloseButton: true,
      showCancelButton: true,
    }).then((willDelete) => {
      if (!willDelete.dismiss) {
        this.lancamentoService.deletarComprovante(lancamentoId).subscribe({
          next: () => {
            this.toastr.success('Comprovante removido com sucesso!');
            this.refreshAll();
          },
          error: () => { this.toastr.error('Erro ao remover o comprovante.'); }
        });
      }
    });
  }

  // ════════════════════════════════════════════════════
  // FORMULÁRIOS — BUILD
  // ════════════════════════════════════════════════════

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
      nomeSetor: [null],
      formaId: [this.formaId, [Validators.required]],
      centroCustoId: [null],
      contaIdTransferencia: [null],
      lancamentoIdTransferencia: [null],
      formaIdTransferencia: [null],
      comprovante: [null],
      tipoConta: [null],
      comprovanteNome: [null],
      lancamentoIdOrigem: [null]
    });
  }

  private buildRelatorioSinteticoForm() {
    this.relatorioSinteticoForm = this.formBuilder.group({
      dtinicio: [null, Validators.required],
      dtfim: [null, Validators.required],
      tipo: [null],
      contaId: [null],
      setorId: [null],
      formato: ['pdf', Validators.required],
    });
  }

  // ════════════════════════════════════════════════════
  // MODAL — CONTROLES
  // ════════════════════════════════════════════════════

  resetModal() {
    this.lancamentoForm.reset();
    this.filtraCategorias("");
    this.crtCategoria = 3;
  }

  setModalEdicao(value: string) {
    if (value == 'Transferencia') { value = 'Receita'; }
    this.filtraCategorias(value);
    this.pageTitle = "Editando Movimento".toUpperCase();
    this.imodo.set(1);
  }

  setModalInclusao(value: any) {
    this.resetModal();
    this.imodo.set(0);

    switch (value) {
      case "Receita":
        this.categoriasFiltradas = this.categorias.filter(cat => cat.tipo !== "Despesa");
        this.pageTitle = "Nova Receita".toUpperCase();
        this.lancamentoForm.patchValue({
          cadastrado: 'sim',
          igrejaId: this.igrejaId,
          tipoLancamento: 'Receita',
          data: this.sharedService.dataAtualFormatada(), // Corrigido o campo 'data'
          competencia: this.sharedService.mesAno(),
          contaId: this.contas[0].id,
          centroCustoId: 1,
          formaId: 1,
          categoriaId: 1,
          documento: this.sharedService.mesAno(),
          historico: 'Dízimo',
          setorId: this.setorId,
          pessoaId: 0,
          nome: ""
        });
        break;

      case "Oferta":
        this.categoriasFiltradas = this.categorias.filter(cat =>
          cat.tipo === 'Receita' || cat.tipo === 'Receita LC' || cat.tipo === 'Oferta'
        );
        this.pageTitle = "Nova Oferta".toUpperCase();
        this.lancamentoForm.patchValue({
          cadastrado: 'sim',
          igrejaId: this.igrejaId,
          tipoLancamento: 'Receita',
          data: this.sharedService.dataAtualFormatada(), // Corrigido o campo 'data'
          competencia: this.sharedService.mesAno(),
          contaId: this.contas[0].id,
          centroCustoId: 1,
          formaId: 1,
          categoriaId: 2,
          documento: this.sharedService.mesAno(),
          historico: 'Oferta',
          setorId: this.setorId,
          pessoaId: 0,
          nome: ""
        });
        break;

      case "Despesa":
        this.categoriasFiltradas = this.categorias.filter(cat => cat.tipo === "Despesa");
        this.pageTitle = "Nova Despesa".toUpperCase();
        this.lancamentoForm.patchValue({
          cadastrado: 'sim',
          igrejaId: this.igrejaId,
          tipoLancamento: 'Despesa',
          data: this.sharedService.dataAtualFormatada(), // Corrigido o campo 'data'
          competencia: this.sharedService.mesAno(),
          contaId: this.contas[0].id,
          centroCustoId: 1,
          formaId: 1,
          categoriaId: 19,
          documento: this.sharedService.mesAno(),
          historico: 'Despesa',
          setorId: this.setorId,
          pessoaId: 0,
          nome: ""
        });
        break;

      case "Transferencia":
        this.categoriasFiltradas = this.categorias.filter(cat => cat.tipo === 'Receita');
        const catTransferenciaDefault = this.categorias.find(cat => cat.id === 8);
        this.pageTitle = "Transferência".toUpperCase();
        this.contaId = this.contas[0].id ?? 0;
        this.lancamentoForm.patchValue({
          cadastrado: 'nao',
          igrejaId: this.igrejaId,
          tipoLancamento: 'Receita',
          data: this.sharedService.dataAtualFormatada(), // Corrigido o campo 'data'
          competencia: this.sharedService.mesAno(),
          contaId: this.contas[0].id,
          centroCustoId: 1,
          formaId: 1,
          categoriaId: catTransferenciaDefault?.id ?? 8,
          documento: this.sharedService.mesAno(),
          historico: 'Transferencia entre contas',
          setorId: this.setorId,
          pessoaId: 0,
          nome: 'Transferencia',
          tituloMin: 'Membro'
        });
        break;

      case "Permuta":
        this.pageTitle = "Permuta | Troca".toUpperCase();
        this.formaId = this.formas[0].id ?? 0;
        this.lancamentoForm.patchValue({
          cadastrado: 'nao',
          igrejaId: this.igrejaId,
          tipoLancamento: 'Receita',
          data: this.sharedService.dataAtualFormatada(), // Corrigido o campo 'data'
          competencia: this.sharedService.mesAno(),
          contaId: this.contas[0].id,
          centroCustoId: 1,
          formaId: 1,
          formaIdTransferencia: 'Selecione ....',
          documento: this.sharedService.mesAno(),
          historico: 'Troca | Permuta',
          setorId: this.setorId,
          pessoaId: 0,
          nome: 'Permuta',
          tituloMin: 'Membro'
        });
        break;
    }
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

  // ════════════════════════════════════════════════════
  // HELPERS PRIVADOS
  // ════════════════════════════════════════════════════

  private loadPessoa(value: number) {
    this.pessoaService.getById(value)
      .pipe(takeUntilDestroyed(this.destroyRef))
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

  private getCategoria(value: number) {
    this.categoriaService.findById(value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.categoria = response;
          this.lancamentoForm.controls['tipoLancamento'].setValue(response.tipo);
        },
        error: () => { }
      });
  }

  private getConta(value: number | undefined) {
    const conta_id = this.contas.filter(tc => tc.id == value);
    const tipo_conta = conta_id.map(tp => tp.tipo?.toString());
    this.lancamentoForm.controls['tipoConta'].setValue(tipo_conta);
  }

  private extractId(location: string): string {
    const position = location.lastIndexOf('/');
    return location.substring(position + 1, location.length);
  }

  private showError(error: { message: any }) {
    this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.message });
  }

  getCorForma(formaId: number): any {
    switch (formaId) {
      case 1: return { 'color': '#009900'};
      case 2: return { 'color': '#0772ffce'};
      case 3: return { 'color': '#FF8C00'};
      // case 3: return { 'color': '#FF8C00', 'font-weight': 'bold' };
      default: return {};
    }
  }
}
