import { Component, computed, DestroyRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService, LazyLoadEvent, MenuItem, MessageService } from 'primeng/api';
import { finalize, forkJoin, switchMap } from 'rxjs';
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
import { HttpClient } from '@angular/common/http';
import { C } from '@angular/cdk/scrolling-module.d-C_w4tIrZ';

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
  contas: string = '';   // string para grid/totais
  categorias: string = '';
  formas: string = '';
  centroCustos: string = '';
  tipoLancamento: string = '';
  nomeRelatorio: string = '';
  // ── Para relatórios (arrays/id único) ──
  contaId: number | null = null;
  categoriasIds: number[] = [];
  formasIds: number[] = [];
  centroCustoIds: number[] = [];
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
    FormaService
  ]
})
export class LancamentoListFormComponent implements OnInit {

  // ════════════════════════════════════════════════════
  // INJEÇÕES
  // ════════════════════════════════════════════════════

  private destroyRef = inject(DestroyRef);
  private searchTimer: any;

  // ════════════════════════════════════════════════════
  // SIGNALS
  // ════════════════════════════════════════════════════

  nomeIgrejaSignal = nomeIgrejaSignal;
  igrejaIdSignal = igrejaIdSignal;
  nomeUsuarioSignal = nomeUsuarioSignal;
  setorIdSignal = setorIdSignal;

  igrejaId = igrejaIdSignal();
  setorId = setorIdSignal();
  nomeIgreja = nomeIgrejaSignal();
  nomeUsuario = nomeUsuarioSignal();

  imodo = signal<number>(0);
  length = signal<number>(0);

  // ════════════════════════════════════════════════════
  // FILTRO UNIFICADO
  // ════════════════════════════════════════════════════

  filtro = new LancamentoFiltro();

  // ════════════════════════════════════════════════════
  // PERÍODO
  // ════════════════════════════════════════════════════

  rangeDates!: string;
  dtinicio: string = '';
  dtfim: string = '';
  dataDiaAnterior = '';

  // ════════════════════════════════════════════════════
  // LISTAS DE DADOS
  // ════════════════════════════════════════════════════

  lancamentos!: LancamentoDTO[];
  selectedLancamentos!: LancamentoDTO[];
  contas: ContaDTO[] = [];
  contasTransferencia: ContaDTO[] = [];
  formas: FormaDTO[] = [];
  formasPermuta: FormaDTO[] = [];
  categorias: CategoriaDTO[] = [];
  categoriasFiltradas: CategoriaDTO[] = [];
  centroCustos: CentroCustoDTO[] = [];
  pessoas: PessoaDTO[] = [];
  // ════════════════════════════════════════════════════
  // TOTAIS
  // ════════════════════════════════════════════════════

  totalCreditos: number = 0;
  totalDebitos: number = 0;
  totalOfertas: number = 0;
  totalReceitaDizimo: number = 0;
  totalMissoes: number = 0;
  totalEventos: number = 0;
  totalDiversos: number = 0;
  total_ofertas_alcadas: number = 0;
  saldoAnterior: number = 0;
  saldoFinalContas: number = 0;
  totalRegistros: number = 0;

  // ════════════════════════════════════════════════════
  // IDs AUXILIARES — strings para o backend (grid/totais)
  // ════════════════════════════════════════════════════

  contaIds: string = '';
  contaIdsAux: string = '';
  formasIds: string = '';
  formaIdsAux: string = '';
  categoriaIds: string = '';
  categoriaIdsAux: string = '';
  categoriaFiltrada: string = '';
  centroCustoIds: string = '';

  // ════════════════════════════════════════════════════
  // IDs INDIVIDUAIS — transferência / permuta / pessoa
  // ════════════════════════════════════════════════════

  contaId: number = 0;
  contaIdTransferencia: number = 0;
  formaId: number = 0;
  formaIdTransferencia: number = 0;
  categoriaId: number = 0;
  pessoaId: number = 0;
  transferenciaCategoriaId: number = 1;

  lancamentoId: number = 0;
  lancamentoIdOrigem: number = 0;
  lancamentoIdTransferencia: number = 0;
  indexId: number = 0;
  indexIdTransferencia: number = 0;

  contaIdSelecionada: number | null = null;
  formaIdSelecionada: number | null = null;
  tipoLancamentoSelecionado: string = 'R';

  // ════════════════════════════════════════════════════
  // CONTROLES DE UI
  // ════════════════════════════════════════════════════

  pesquisa: boolean = false;
  crtCategoria: number = 3;
  crtSaldoFinal: boolean = false;
  valorTpLancamento: any = 'Todas';
  tipoLancamento: string = '';
  pageTitle: string = '';
  lancamentoNome: string = '';
  error: string = '';
  submittingForm: boolean = false;
  gerandoRelatorio: boolean = false;
  dataAtual: any = moment();

  // ════════════════════════════════════════════════════
  // MODELOS
  // ════════════════════════════════════════════════════

  lancamento: LancamentoDTO = new LancamentoDTO();
  pessoa: PessoaDTO = new PessoaDTO();
  categoria: CategoriaDTO = new CategoriaDTO();

  // ════════════════════════════════════════════════════
  // FORMULÁRIOS
  // ════════════════════════════════════════════════════

  lancamentoForm!: FormGroup;
  contaForm!: FormGroup;
  formaForm!: FormGroup;
  categoriaForm!: FormGroup;
  centroCustoForm!: FormGroup;

  // ════════════════════════════════════════════════════
  // POSIÇÕES DE MODAL
  // ════════════════════════════════════════════════════

  positionLancamento: 'left' | 'right' | 'top' | 'bottom' | 'center' |
    'topleft' | 'topright' | 'bottomleft' | 'bottomright' = 'top';
  positionModalTransferencia: 'left' | 'right' | 'top' | 'bottom' | 'center' |
    'topleft' | 'topright' | 'bottomleft' | 'bottomright' = 'top';
  positionModalPermuta: 'left' | 'right' | 'top' | 'bottom' | 'center' |
    'topleft' | 'topright' | 'bottomleft' | 'bottomright' = 'top';

  // ════════════════════════════════════════════════════
  // VISIBILIDADE DE MODAIS
  // ════════════════════════════════════════════════════

  visibleLancamento: boolean = false;
  visibleModalTransferencia: boolean = false;
  visibleModalPermuta: boolean = false;

  // ════════════════════════════════════════════════════
  // MENUS E OPÇÕES
  // ════════════════════════════════════════════════════

  printItems!: MenuItem[];
  selecaoItemsIndividual!: MenuItem[];
  selecaoItemsMultiplos!: MenuItem[];

  // Dropdown do botão Analítico (PDF ou Excel)
  analiticoItems: MenuItem[] = [
    { label: 'Exportar PDF', icon: 'pi pi-file-pdf', command: () => this.gerarRelatorioAnalitico('pdf') },
    { label: 'Exportar Excel', icon: 'pi pi-file-excel', command: () => this.gerarRelatorioAnalitico('excel') }
  ];

  tpLancamento = [
    { nome: 'Todas' },
    { nome: 'Receita' },
    { nome: 'Despesa' }
  ];

  imaskConfig = {
    mask: Number,
    scale: 2,
    thousandsSeparator: '.',
    padFractionalZeros: true,
    normalizeZeros: true,
    radix: ','
  };

  @ViewChild('dtlancamento') grid!: Table;

  // ════════════════════════════════════════════════════
  // CONSTRUCTOR
  // ════════════════════════════════════════════════════

  constructor(
    private lancamentoService: LancamentoService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private sharedService: SharedService,
    private categoriaService: CategoriaService,
    private contaService: ContaService,
    private centroCustoService: CentroCustoService,
    private formaService: FormaService,
    public pessoaService: PessoaService,
    public translate: TranslateService,
    public http: HttpClient
  ) { }

  // ════════════════════════════════════════════════════
  // LIFECYCLE
  // ════════════════════════════════════════════════════

  ngOnInit(): void {
    this.buildLancamentoForm();
    this.buildFiltroForms();
    this.inicializarDados();
    this.loadPessoas();

    // ── Período inicial = mês atual ──
    this.dtinicio = this.sharedService.primeiroDiaMes();
    this.dtfim = this.sharedService.ultimoDiaMes();
    this.filtro.dtinicio = this.dtinicio;
    this.filtro.dtfim = this.dtfim;

    const dataUS = this.sharedService.formataDataUS(this.dtinicio);
    this.dataDiaAnterior = this.sharedService.dataSubDay(dataUS, 1);
  }


  ngOnDestroy(): void { }

  // ════════════════════════════════════════════════════
  // INICIALIZAÇÃO DE DADOS
  // ════════════════════════════════════════════════════

  inicializarDados(): void {
    // ── Salva a seleção atual dos multiselectes ──
    const selecaoAtual = {
      contas: this.contaForm?.get('selectedContas')?.value,
      formas: this.formaForm?.get('selectedFormas')?.value,
      categorias: this.categoriaForm?.get('selectedCategorias')?.value,
      centroCustos: this.centroCustoForm?.get('selectedCentroCustos')?.value,
      tipoLancamento: this.filtro.tipoLancamento
    };

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

        this.loadFormasPermuta();

        // ── CATEGORIAS ──────────────────────────────────
        this.categorias = res.categorias;
        this.categoriaIds = res.categorias.map((c: any) => c.id).join(',');
        this.categoriaIdsAux = this.categoriaIds;

        // ── CENTRO CUSTOS ────────────────────────────────
        this.centroCustos = res.centroCustos;

        // ── CONTAS ───────────────────────────────────────
        if (res.contas.length === 0) {
          Swal.fire('Atenção !!!', 'Nenhuma conta encontrada. Cadastre uma conta', 'warning');
          return;
        }
        this.contas = res.contas;
        this.saldoFinalContas = res.contas.reduce(
          (total: number, c: any) => total + (c.saldoCalculado || 0), 0
        );
        this.contaIds = res.contas.map((c: any) => c.id).join(',');
        this.contaIdsAux = this.contaIds;
        this.loadContasTransferencia();

        // ── Restaura seleção ou usa todos ────────────────
        this.restaurarSelecao(selecaoAtual);
        this.refreshAll();
      });
  }

  private restaurarSelecao(selecao: any): void {
    const temContas = selecao.contas?.length > 0;
    const temFormas = selecao.formas?.length > 0;
    const temCategorias = selecao.categorias?.length > 0;
    const temCentroCustos = selecao.centroCustos?.length > 0;

    // ── Contas ──────────────────────────────────────────
    if (temContas) {
      this.contaForm.get('selectedContas')?.setValue(selecao.contas);
      const ids = selecao.contas.map((c: any) => c.id || c);
      this.filtro.contas = ids.join(',');
      this.filtro.contaId = ids.length === 1 ? ids[0] : null;
    } else {
      this.filtro.contas = this.contaIds;
      this.filtro.contaId = null;
    }

    // ── Formas ──────────────────────────────────────────
    if (temFormas) {
      this.formaForm.get('selectedFormas')?.setValue(selecao.formas);
      const ids = selecao.formas.map((f: any) => f.id || f);
      this.filtro.formas = ids.join(',');
      this.filtro.formasIds = ids;
    } else {
      this.filtro.formas = this.formasIds;
      this.filtro.formasIds = [];
    }

    // ── Categorias ──────────────────────────────────────
    if (temCategorias) {
      this.categoriaForm.get('selectedCategorias')?.setValue(selecao.categorias);
      const ids = selecao.categorias.map((c: any) => c.id || c);
      this.filtro.categorias = ids.join(',');
      this.filtro.categoriasIds = ids;
    } else {
      this.filtro.categorias = this.categoriaIds;
      this.filtro.categoriasIds = [];
    }

    // ── Centro Custos ────────────────────────────────────
    if (temCentroCustos) {
      this.centroCustoForm.get('selectedCentroCustos')?.setValue(selecao.centroCustos);
      const ids = selecao.centroCustos.map((c: any) => c.id || c);
      this.filtro.centroCustos = ids.join(',');
      this.filtro.centroCustoIds = ids;
    } else {
      this.filtro.centroCustos = '';
      this.filtro.centroCustoIds = [];
    }

    // ── Tipo Lançamento ──────────────────────────────────
    this.filtro.tipoLancamento = selecao.tipoLancamento || '';
  }

  // ════════════════════════════════════════════════════
  // REFRESH CENTRAL
  // ════════════════════════════════════════════════════

  refreshAll(): void {
    this.loadLancamentos();
    this.getTotalizacoes();
  }

  // ════════════════════════════════════════════════════
  // LOAD DADOS
  // ════════════════════════════════════════════════════

  loadLancamentos(): void {
    this.lancamentoService.getPageLancamentoFromIgreja(this.filtro)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.lancamentos = response['content'].sort((a: { id: number }, b: { id: number }) => b.id - a.id);
          this.totalRegistros = response.totalElements;
          this.pesquisa = true;
          this.getPrinters();
        },
        error: (error) => this.showError(error)
      });
  }

  getTotalizacoes(): void {
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

  loadPessoas(): void {
    this.pessoaService.getPessoasAtivasFromIgreja(this.igrejaId, 'Ativo')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (res) => { this.pessoas = res; } });
  }

  loadContasTransferencia(): void {
    this.contasTransferencia = this.contas.map(c => ({
      contaIdTransferencia: c.id,
      nome: c.nome
    }));
  }

  loadFormasPermuta(): void {
    this.formasPermuta = this.formas
      .filter(fr => fr.id !== 1)
      .map(f => ({ formaIdTransferencia: f.id, nome: f.nome }));
  }

  loadLancamento(lancamento: LancamentoDTO): void {
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
          this.lancamentoForm.controls['centroCustoId'].setValue((response as any)['centroCusto'].id);
          this.lancamentoForm.controls['valor'].setValue(Math.abs(this.lancamentoForm.controls['valor'].value));

          if (response.valor! > '0' && (response.nome == 'Transferencia' || response.nome == 'Permuta')) {
            this.lancamentoForm.controls['contaId'].setValue(response.contaIdTransferencia);
            this.lancamentoForm.controls['contaIdTransferencia'].setValue((response as any)['conta'].id);
          } else {
            this.lancamentoForm.controls['valor'].setValue(response.valor);
          }

          if (response.valor! < '0') {
            this.lancamentoForm.controls['valor'].setValue(
              this.lancamentoForm.controls['valor'].value * -1
            );
          }

          this.lancamentoNome = lancamento.nome!;

          if (response.pessoaId! > 0) {
            this.lancamentoForm.controls['cadastrado'].setValue('sim');
            this.lancamentoForm.controls['pessoaId'].setValue(response.pessoaId);
            this.pessoaId = response.pessoaId ?? 0;
          } else {
            this.lancamentoForm.controls['cadastrado'].setValue('nao');
            this.lancamentoForm.controls['pessoaId'].setValue(0);
            this.pessoaId = 0;
          }
        }
      });
  }

  // ════════════════════════════════════════════════════
  // RELATÓRIOS
  // ════════════════════════════════════════════════════

  gerarRelatorioSintetico(): void {
    if (!this.filtro.dtinicio || !this.filtro.dtfim) {
      this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Informe o período antes de gerar o relatório.' });
      return;
    }
    this.gerandoRelatorio = true;
    this.lancamentoService.gerarRelatorioSintetico(this.filtro)
      .pipe(finalize(() => this.gerandoRelatorio = false))
      .subscribe({
        next: (blob) => this.abrirArquivo(blob, 'relatorio-sintetico.pdf'),
        error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao gerar relatório sintético.' })
      });
  }

  gerarRelatorioAnalitico(formato: 'pdf' | 'excel'): void {
    if (!this.filtro.dtinicio || !this.filtro.dtfim) {
      this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Informe o período antes de gerar o relatório.' });
      return;
    }
    this.gerandoRelatorio = true;

    const obs$ = formato === 'pdf'
      ? this.lancamentoService.gerarRelatorioAnaliticoPdf(this.filtro)
      : this.lancamentoService.gerarRelatorioAnaliticoExcel(this.filtro);

    const nomeArquivo = formato === 'pdf'
      ? 'relatorio-analitico.pdf'
      : `relatorio-analitico-${this.filtro.dtinicio}-${this.filtro.dtfim}.xlsx`;

    obs$.pipe(finalize(() => this.gerandoRelatorio = false))
      .subscribe({
        next: (blob) => this.abrirArquivo(blob, nomeArquivo),
        error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao gerar relatório analítico.' })
      });
  }

  imprimirRecibo(id: any): void {
    if (!id) {
      Swal.fire('Exclusão', 'Nenhum registro encontrado', 'info');
      return;
    }
    window.open(
      `${API_CONFIG.baseUrl}/relatorios/recibos/?nome=recibo-lancamento&igreja=${this.igrejaId}&lancamento_id=${id}`,
      '_blank'
    );
  }

  getPrinters(): void {
    this.printItems = [
      {
        label: 'Entradas', icon: 'pi pi-dollar', target: '_blank',
        url: `${API_CONFIG.baseUrl}/relatorios/entradas/?nome=entrada-dizimo-oferta&igreja=${this.igrejaId}&dt_inicio=${this.dtinicio}&dt_fim=${this.dtfim}`
      },
      { separator: true },
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
        command: () => this.lancamentoService.gerarLivroCaixaSimplificado(this.filtro, 'livro-caixa-mensal-simplificado')
          .subscribe({
            next: (blob) => this.abrirArquivo(blob, 'livro-caixa-simplificado.pdf'),
            error: () => this.toastr.error('Erro ao gerar Livro Caixa Mensal Simplificado.')
          })
      },
      { separator: true },
      {
        label: 'Livro caixa - Mensal Detalhado', icon: 'pi pi-calendar',
        command: () => this.lancamentoService.gerarLivroCaixaDetalhado(this.filtro, 'livro-caixa-mensal-detalhado')
          .subscribe({
            next: (blob) => this.abrirArquivo(blob, 'livro-caixa-detalhado.pdf'),
            error: () => this.toastr.error('Erro ao gerar Livro Caixa Mensal Detalhado.')
          })
      },
      { separator: true },
      {
        label: 'Ofertas - Alçadas', icon: 'pi pi-dollar',
        command: () => window.open(
          `${API_CONFIG.baseUrl}/relatorios/entradas/?nome=ofertas-alcadas&igreja=${this.igrejaId}&dt_inicio=${this.dtinicio}&dt_fim=${this.dtfim}`,
          '_blank'
        )
      },
      { separator: true },
      {
        label: 'Demostrativo de Receitas e Permutas - CONGREGAÇÃO', icon: 'pi pi-dollar', target: '_blank',
        url: `${API_CONFIG.baseUrl}/relatorios/entradas/?nome=relacao-entradas-dizimo-transferencias-congregacao&igreja=${this.igrejaId}&dt_inicio=${this.dtinicio}&dt_fim=${this.dtfim}`
      },
      { separator: true },
      {
        label: 'Relação de Entradas por FORMA - SETOR', icon: 'pi pi-dollar', target: '_blank',
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
      }
    ];
  }

  // ════════════════════════════════════════════════════
  // FILTROS E PAGINAÇÃO
  // ════════════════════════════════════════════════════

  onGlobalFilter(): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.filtro.page = 0;
      if (this.grid) this.grid.first = 0;
      this.refreshAll();
    }, 400);
  }

  aoMudarPagina(event: LazyLoadEvent): void {
    this.filtro.page = event!.first! / event!.rows!;
    this.filtro.linesPerPage = event.rows!;
    if (this.pesquisa) this.refreshAll();
  }

  filtraLancamentos(): void {
    this.pesquisa = true;
    this.filtro.page = 0;

    if (!this.dtinicio) {
      this.toastr.warning('Informe a data de início.');
      return;
    }

    this.filtro.dtinicio = this.dtinicio;
    this.filtro.dtfim = this.dtfim || this.dtinicio;

    const dataUS = this.sharedService.formataDataUS(this.dtinicio);
    this.dataDiaAnterior = this.sharedService.dataSubDay(dataUS, 1);

    if (this.grid) this.grid.first = 0;
    this.refreshAll();
  }


  onSelecionarData(): void {
    // dtinicio e dtfim já são strings "dd/mm/yyyy" vindas do dataType="string"
    if (this.dtinicio) {
      this.filtro.dtinicio = this.dtinicio;
      const dataUS = this.sharedService.formataDataUS(this.dtinicio);
      this.dataDiaAnterior = this.sharedService.dataSubDay(dataUS, 1);
    }
    if (this.dtfim) {
      this.filtro.dtfim = this.dtfim;
    } else {
      // Se não selecionou fim, usa o início
      this.dtfim = this.dtinicio;
      this.filtro.dtfim = this.dtinicio;
    }
  }


  atualizarFiltrosStrings(event: any, tipo: 'contas' | 'formas' | 'categorias' | 'centroCustos'): void {
    if (!Array.isArray(event.value)) return;

    const ids = event.value.map((item: any) => item.id || item);
    this.filtro[tipo] = ids.join(',');

    switch (tipo) {
      case 'contas':
        // contaId único apenas quando exatamente 1 conta selecionada (para relatório sintético)
        this.filtro.contaId = ids.length === 1 ? ids[0] : null;
        break;
      case 'categorias':
        this.filtro.categoriasIds = ids;
        break;
      case 'formas':
        this.filtro.formasIds = ids;
        break;
      case 'centroCustos':
        this.filtro.centroCustoIds = ids;
        break;
    }
  }

  filtraCategoriaIds(value: string): void {
    this.crtCategoria = value === 'Receita' ? 1
      : value === 'Despesa' ? 2
        : value === 'Receita LC' ? 4 : 3;

    if (value !== 'Todas') {
      const ids = this.categorias.filter(cat => cat.tipo === value).map(c => c.id?.toString());
      this.categoriaFiltrada = value;
      this.filtro.tipoLancamento = value;
      this.tipoLancamento = value;
      this.categoriaIds = ids.toString();
      this.filtro.categorias = this.categoriaIds;
    } else {
      this.filtro.tipoLancamento = '';
      this.filtro.categorias = this.categoriaIdsAux;
      this.categoriaIds = this.categoriaIdsAux;
    }
  }

  filtraCategorias(tipo: string): void {
    this.categoriasFiltradas = (!tipo || tipo === 'Todas')
      ? this.categorias
      : this.categorias.filter(cat => cat.tipo === tipo);
  }

  // ════════════════════════════════════════════════════
  // EVENTOS DE DROPDOWN
  // ════════════════════════════════════════════════════

  onChangeTipoLancamento(event: any): void {
    const tipo = event.value === 'Todas' ? '' : event.value;
    this.valorTpLancamento = event.value;
    this.filtro.tipoLancamento = tipo;  // ← seta e mantém

    this.filtraCategoriaIds(event.value);
    this.filtraCategorias(event.value);

    // Limpa apenas os multiselectes, sem resetar o tipoLancamento
    this.categoriaForm.get('selectedCategorias')?.patchValue([]);
    this.formaForm.get('selectedFormas')?.patchValue([]);
    this.contaForm.get('selectedContas')?.patchValue([]);
    this.centroCustoForm.get('selectedCentroCustos')?.patchValue([]);
    this.filtro.formas = this.formaIdsAux;
    this.filtro.contas = this.contaIdsAux;
    this.filtro.nome = '';
    this.filtro.page = 0;
  }


  onChangeNomeHistorico(value: { value: any }): void { this.loadPessoa(value.value); }
  onChangeTPCategorias(tipo: { value: any }): void { this.getCategoria(tipo.value); }
  onChangeTPConta(event: { value: any }): void { this.getConta(event.value); }

  onChangeTransferenciaOrigem(event: { value: number }): void {
    this.contaId = event.value;
    this.lancamentoIdOrigem = event.value;
  }

  onChangeTransferenciaDestino(event: { value: number }): void {
    this.contaIdTransferencia = event.value;
    this.lancamentoIdTransferencia = event.value;
  }

  onChangePermutaOrigem(event: { value: number }): void {
    this.formaId = event.value;
    this.lancamentoIdOrigem = event.value;
  }

  onChangePermutaDestino(event: { value: number }): void {
    this.lancamentoForm.controls['categoriaId'].setValue(1);
    this.formaIdTransferencia = event.value;
    this.lancamentoIdTransferencia = event.value;
  }

  onChangeTransferenciaCategoria(value: { value: number }): void {
    this.transferenciaCategoriaId = value.value;
    this.lancamentoForm.controls['categoriaId'].setValue(value.value);
  }

  onChangeTransferencia(id: { value: any }): void {
    this.lancamentoForm.controls['categoriaId'].setValue(id.value);
  }

  // ════════════════════════════════════════════════════
  // CRUD LANÇAMENTO
  // ════════════════════════════════════════════════════

  submitFormLancamento(): void {
    this.submittingForm = true;
    if (this.imodo() === 0) this.createLancamento();
    else this.updateLancamento();
  }

  createLancamento(): void {
    this.lancamentoForm.controls['nome'].setValue(
      this.sharedService.formataNome(this.lancamentoForm.controls['nome'].value)
    );

    const tipo = this.lancamentoForm.controls['tipoLancamento'].value;
    const valor = this.lancamentoForm.controls['valor'].value;

    if ((tipo === 'Receita' || tipo === 'Receita LC') && valor < 0)
      this.lancamentoForm.controls['valor'].setValue(valor * -1);
    if (tipo === 'Despesa' && valor > 0)
      this.lancamentoForm.controls['valor'].setValue(valor * -1);

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
        }
      });
  }

  updateLancamento(): void {
    this.lancamentoForm.controls['nome'].setValue(
      this.sharedService.formataNome(this.lancamentoForm.controls['nome'].value)
    );

    const tipo = this.lancamentoForm.controls['tipoLancamento'].value;
    const valor = this.lancamentoForm.controls['valor'].value;

    if (tipo === 'Receita' && valor < 0)
      this.lancamentoForm.controls['valor'].setValue(valor * -1);
    if (tipo === 'Despesa' && valor > 0)
      this.lancamentoForm.controls['valor'].setValue(valor * -1);

    const lancamento: LancamentoDTO = Object.assign(new LancamentoDTO(), this.lancamentoForm.value);
    this.lancamentoService.update(lancamento)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastr.success('Registro atualizado com sucesso!', 'Atualização');
          this.inicializarDados();
        }
      });
  }

  updateLancamentoTransferencia(): void {
    const lancamento: LancamentoDTO = Object.assign(new LancamentoDTO(), this.lancamentoForm.value);
    lancamento.contaId = 1;
    this.lancamentoService.update(lancamento)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastr.success('Registro atualizado com sucesso!', 'Atualização');
          this.inicializarDados();
        }
      });
  }

  resetLancamento(): void { this.refreshAll(); }

  // ════════════════════════════════════════════════════
  // TRANSFERÊNCIA
  // ════════════════════════════════════════════════════

  submitFormTransferencia(): void {
    this.submittingForm = true;
    if (this.imodo() === 0) this.createLancamentoTransferencia();
    else
      this.updateLancamentoTransferencia();
  }

  //═══════════════════════════════════════════════════
  // CRIA TRANFERENCIA
  //═══════════════════════════════════════════════════

createLancamentoTransferencia(): void {
  const valorOriginal: number = Math.abs(this.lancamentoForm.controls['valor'].value);

  const contaOrigem = this.contas.find(c => c.id === this.contaId);
  const contaDestino = this.contas.find(c => c.id === this.contaIdTransferencia);

  const historicoDespesa = `Transferência do  ${contaOrigem?.nome ?? ''}`;
  const historicoCredito = `Transferência para o ${contaDestino?.nome ?? ''}`;

  const lancamentoDespesa: LancamentoDTO = {
    ...this.lancamentoForm.value,
    valor: String(-valorOriginal),
    categoriaId: 29,
    tipoLancamento: 'Despesa',
    contaId: this.contaId,
    contaIdTransferencia: this.contaIdTransferencia,
    historico: historicoDespesa, // 👈 perspectiva da Origem
  };

  const lancamentoCredito: LancamentoDTO = {
    ...this.lancamentoForm.value,
    valor: String(valorOriginal),
    categoriaId: this.lancamentoForm.controls['categoriaId'].value,
    tipoLancamento: 'Receita',
    contaId: this.contaIdTransferencia,
    contaIdTransferencia: this.contaId,
    historico: historicoCredito, // 👈 perspectiva do Destino
  };

  // 1️⃣ Cria a Despesa
  this.lancamentoService.create(lancamentoDespesa)
    .pipe(
      takeUntilDestroyed(this.destroyRef),
      switchMap(responseDespesa => {
        this.lancamentoIdOrigem = parseInt(
          this.extractId((responseDespesa as any).headers.get('location'))
        );

        // 2️⃣ Cria o Crédito
        return this.lancamentoService.create(lancamentoCredito);
      }),
      switchMap(responseCredito => {
        this.lancamentoIdTransferencia = parseInt(
          this.extractId((responseCredito as any).headers.get('location'))
        );

        // 3️⃣ Atualiza o Crédito com o vínculo da Despesa
        const creditoAtualizado: LancamentoDTO = {
          ...lancamentoCredito,
          id: this.lancamentoIdTransferencia,
          lancamentoIdTransferencia: this.lancamentoIdOrigem,
        };

        return this.lancamentoService.update(creditoAtualizado);
      }),
      switchMap(() => {
        // 4️⃣ Atualiza a Despesa com o vínculo do Crédito
        const despesaAtualizada: LancamentoDTO = {
          ...lancamentoDespesa,
          id: this.lancamentoIdOrigem,
          lancamentoIdTransferencia: this.lancamentoIdTransferencia,
        };

        return this.lancamentoService.update(despesaAtualizada);
      })
    )
    .subscribe({
      next: () => {
        this.toastr.success('Operação realizada com sucesso!', 'Transferência');
        this.inicializarDados();
        this.resetLancamento();
      },
      error: err => {
        console.error('Erro ao criar transferência:', err);
        this.toastr.error('Erro ao realizar a transferência. Tente novamente.', 'Transferência');
      }
    });
}




  // ════════════════════════════════════════════════════
  // PERMUTA
  // ════════════════════════════════════════════════════

  submitFormPermuta(): void {
    this.submittingForm = true;
    if (this.imodo() === 0) this.createLancamentoPermuta();
  }

  // ════════════════════════════════════════════════════
  // CRIA LANÇAMENTO 
  // ════════════════════════════════════════════════════

  createLancamentoPermuta(): void {
    const valorOriginal: number = Math.abs(this.lancamentoForm.controls['valor'].value);

    const lancamentoDespesa: LancamentoDTO = {
      ...this.lancamentoForm.value,
      valor: String(-valorOriginal),
      categoriaId: 28,
      tipoLancamento: 'Despesa',
    };

    const lancamentoCredito: LancamentoDTO = {
      ...this.lancamentoForm.value,
      valor: String(valorOriginal),
      categoriaId: 6,
      formaId: this.formaIdTransferencia,
      formaIdTransferencia: this.formaId,
    };

    // 1️⃣ Cria a Despesa
    this.lancamentoService.create(lancamentoDespesa)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(responseDespesa => {
          this.lancamentoIdOrigem = parseInt(
            this.extractId((responseDespesa as any).headers.get('location'))
          );

          // 2️⃣ Cria o Crédito
          return this.lancamentoService.create(lancamentoCredito);
        }),
        switchMap(responseCredito => {
          this.lancamentoIdTransferencia = parseInt(
            this.extractId((responseCredito as any).headers.get('location'))
          );

          // 3️⃣ Atualiza o Crédito com o vínculo da Despesa
          const creditoAtualizado: LancamentoDTO = {
            ...lancamentoCredito,
            id: this.lancamentoIdTransferencia,
            lancamentoIdTransferencia: this.lancamentoIdOrigem,
          };

          return this.lancamentoService.update(creditoAtualizado);
        }),
        switchMap(() => {
          // 4️⃣ Atualiza a Despesa com o vínculo do Crédito
          const despesaAtualizada: LancamentoDTO = {
            ...lancamentoDespesa,
            id: this.lancamentoIdOrigem,
            lancamentoIdTransferencia: this.lancamentoIdTransferencia,
          };

          return this.lancamentoService.update(despesaAtualizada);
        })
      )
      .subscribe({
        next: () => {
          this.toastr.success('Operação realizada com sucesso!', 'Permuta');
          this.resetLancamento();
          this.inicializarDados();
        },
        error: err => {
          console.error('Erro ao criar permuta:', err);
          this.toastr.error('Erro ao realizar a permuta. Tente novamente.', 'Permuta');
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

  aoDesmarcar(_event: any): void { this.length.set(0); }

  deleteIndividual(): void { this.exclusaoLancamento(this.indexId, this.indexIdTransferencia); }
  deleteMultiplos(): void { this.exclusaoLancamento(this.indexId, this.indexIdTransferencia); }

  limpaCheckbox(): void {
    this.selectedLancamentos = [];
    this.length.set(0);
  }

  exclusaoLancamento(indexId: number, indexIdTransferencia: number | undefined): void {
    if (!this.selectedLancamentos || this.length() === 0) {
      Swal.fire('Lançamento | Seleção', 'Nenhum registro selecionado', 'info');
      return;
    }

    Swal.fire({
      title: 'Exclusão',
      text: `Tem certeza que deseja excluir ${this.length()} registro?`,
      showCloseButton: true,
      showCancelButton: true,
      position: 'top'
    }).then((result) => {
      if (result.dismiss) {
        this.selectedLancamentos = [];
        this.length.set(0);
        return;
      }

      if (this.length() <= 1) {
        if (indexId) this.excluirLancamento(indexId);
        if (indexIdTransferencia) this.excluirSelectedLancamento(indexIdTransferencia);
        this.toastr.success('Registro excluído com sucesso!', 'Exclusão');
      } else {
        for (let i = 0; i < this.length(); i++) {
          const idTransf = this.selectedLancamentos[i].lancamentoIdTransferencia;
          if (idTransf) this.excluirSelectedLancamento(idTransf);
          this.excluirLancamento(this.selectedLancamentos[i].id);
        }
        this.toastr.success('Registros excluídos com sucesso!', 'Exclusão');
      }

      this.inicializarDados();
      this.grid.first = 0;
    });
  }

  excluirLancamento(indexId: number | undefined): void {
    this.lancamentoService.delete(indexId ?? 0)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.inicializarDados();
          this.grid.reset();
          this.selectedLancamentos = null!;
        }
      });
  }

  excluirSelectedLancamento(indexIdTransferencia: number): void {
    this.lancamentoService.delete(indexIdTransferencia)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.grid.reset();
          this.inicializarDados();
        }
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

  excluirLancamentoTransferencia(lancamento: LancamentoDTO): void {
    this.lancamentoService.delete(lancamento.id ?? 0)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.lancamentoService.delete(lancamento.lancamentoIdTransferencia!)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: () => {
                this.toastr.success('Registro excluído com sucesso!', 'Exclusão');
                this.inicializarDados();
              }
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

  excluirLancamentoPermuta(lancamento: LancamentoDTO): void {
    this.lancamentoService.delete(lancamento.id ?? 0)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.lancamentoService.delete(lancamento.lancamentoIdTransferencia!)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: () => {
                this.toastr.success('Registro excluído com sucesso!', 'Exclusão');
                this.inicializarDados();
              }
            });
        }
      });
  }

  // ════════════════════════════════════════════════════
  // COMPROVANTES
  // ════════════════════════════════════════════════════

  visualizarComprovante(lancamentoId: number): void {
    this.lancamentoService.baixarComprovante(lancamentoId)
      .subscribe({
        next: (blob) => this.abrirArquivo(blob, 'comprovante.pdf'),
        error: () => this.toastr.error('Erro ao abrir o arquivo ou anexo não encontrado.')
      });
  }

  excluirComprovante(lancamentoId: number): void {
    Swal.fire({
      title: 'Exclusão',
      text: 'Tem certeza que deseja remover o comprovante?',
      icon: 'error',
      showCloseButton: true,
      showCancelButton: true
    }).then((result) => {
      if (!result.dismiss) {
        this.lancamentoService.deletarComprovante(lancamentoId).subscribe({
          next: () => {
            this.toastr.success('Comprovante removido com sucesso!');
            this.refreshAll();
          },
          error: () => this.toastr.error('Erro ao remover o comprovante.')
        });
      }
    });
  }

  // ════════════════════════════════════════════════════
  // FORMULÁRIOS — BUILD
  // ════════════════════════════════════════════════════

  private buildLancamentoForm(): void {
    this.lancamentoForm = this.formBuilder.group({
      id: [null],
      nome: ['', Validators.required],
      documento: [null],
      historico: [null, Validators.required],
      data: [null],
      competencia: [null, Validators.required],
      tipoLancamento: [null],
      valor: [null, Validators.required],
      totalConta: [null],
      igrejaId: [this.igrejaId, Validators.required],
      tituloMin: [null],
      categoriaId: [null, Validators.required],
      pessoaId: [0, Validators.required],
      cadastrado: ['sim'],
      contaId: [null, Validators.required],
      setorId: [this.setorId],
      nomeSetor: [null],
      formaId: [this.formaId, Validators.required],
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

  private buildFiltroForms(): void {
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

  // ════════════════════════════════════════════════════
  // MODAL — CONTROLES
  // ════════════════════════════════════════════════════

  resetModal(): void {
    this.lancamentoForm.reset();
    this.filtraCategorias('');
    this.crtCategoria = 3;
  }

  setModalEdicao(value: string): void {
    if (value === 'Transferencia') value = 'Receita';
    this.filtraCategorias(value);
    this.pageTitle = 'EDITANDO MOVIMENTO';
    this.imodo.set(1);
  }

  setModalInclusao(value: string): void {
    this.resetModal();
    this.imodo.set(0);

    const base = {
      cadastrado: 'sim',
      igrejaId: this.igrejaId,
      data: this.sharedService.dataAtualFormatada(),
      competencia: this.sharedService.mesAno(),
      contaId: this.contas[0]?.id,
      centroCustoId: 1,
      formaId: 1,
      documento: this.sharedService.mesAno(),
      setorId: this.setorId,
      pessoaId: 0,
      nome: ''
    };

    switch (value) {
      case 'Receita':
        this.categoriasFiltradas = this.categorias.filter(c => c.tipo !== 'Despesa');
        this.pageTitle = 'NOVA RECEITA';
        this.lancamentoForm.patchValue({ ...base, tipoLancamento: 'Receita', categoriaId: 1, historico: 'Dízimo' });
        break;

      case 'Oferta':
        this.categoriasFiltradas = this.categorias.filter(c =>
          c.tipo === 'Receita' || c.tipo === 'Receita LC' || c.tipo === 'Oferta'
        );
        this.pageTitle = 'NOVA OFERTA';
        this.lancamentoForm.patchValue({ ...base, tipoLancamento: 'Receita', categoriaId: 2, historico: 'Oferta' });
        break;

      case 'Despesa':
        this.categoriasFiltradas = this.categorias.filter(c => c.tipo === 'Despesa');
        this.pageTitle = 'NOVA DESPESA';
        this.lancamentoForm.patchValue({ ...base, tipoLancamento: 'Despesa', categoriaId: 19, historico: 'Despesa' });
        break;

      case 'Transferencia':
        this.categoriasFiltradas = this.categorias.filter(c => c.tipo === 'Receita');
        const catTransf = this.categorias.find(c => c.id === 8);
        this.pageTitle = 'TRANSFERÊNCIA';
        this.contaId = this.contas[0]?.id ?? 0;

        const contaDestino = this.contas[0]; // 👈 pega direto, igual ao base

        this.lancamentoForm.patchValue({
          ...base, cadastrado: 'nao', tipoLancamento: 'Receita',
          categoriaId: catTransf?.id ?? 8,
          historico: `Transferência ${contaDestino?.nome ?? ''}`,
          nome: 'Transferencia', tituloMin: 'Membro'
        });
        break;


      case 'Permuta':
        this.pageTitle = 'PERMUTA | TROCA';
        this.formaId = this.formas[0]?.id ?? 0;
        this.lancamentoForm.patchValue({
          ...base, cadastrado: 'nao', tipoLancamento: 'Receita',
          formaIdTransferencia: null,
          historico: 'Troca | Permuta',
          nome: 'Permuta', tituloMin: 'Membro'
        });
        break;
    }
  }

  cadastradoC(): void {
    this.lancamentoForm.controls['cadastrado'].setValue('sim');
    this.lancamentoForm.controls['nome'].setValue('');
  }

  cadastradoNC(): void {
    this.lancamentoForm.controls['cadastrado'].setValue('nao');
    this.lancamentoForm.controls['pessoaId'].setValue(0);
    this.lancamentoForm.controls['nome'].setValue('');
    this.lancamentoForm.controls['tituloMin'].setValue('Membro');
    this.pessoaId = 0;
  }

  // ════════════════════════════════════════════════════
  // HELPERS PRIVADOS
  // ════════════════════════════════════════════════════

  private loadPessoa(value: number): void {
    this.pessoaService.getById(value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.pessoa = response;
          this.pessoaId = this.pessoa.id ?? 0;
          this.lancamentoForm.controls['pessoaId'].setValue(this.pessoa.id);
          this.lancamentoForm.controls['nome'].setValue(this.pessoa.nome);
          this.lancamentoForm.controls['tituloMin'].setValue(this.pessoa.tituloMin?.trim());
        }
      });
  }

  private getCategoria(value: number): void {
    this.categoriaService.findById(value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.categoria = response;
          this.lancamentoForm.controls['tipoLancamento'].setValue(response.tipo);
        }
      });
  }

  private getConta(value: number | undefined): void {
    const conta = this.contas.find(c => c.id === value);
    const tipoConta = conta?.tipo?.toString() ?? null;
    this.lancamentoForm.controls['tipoConta'].setValue(tipoConta);
  }

  private abrirArquivo(blob: Blob, nomeArquivo: string): void {
    const url = URL.createObjectURL(blob);
    if (nomeArquivo.endsWith('.xlsx')) {
      const a = document.createElement('a');
      a.href = url;
      a.download = nomeArquivo;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      window.open(url, '_blank');
    }
  }

  private extractId(location: string): string {
    return location.substring(location.lastIndexOf('/') + 1);
  }

  private showError(error: { message: any }): void {
    this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.message });
  }

  getCorForma(formaId: number): any {
    const cores: Record<number, object> = {
      1: { color: '#009900' },
      2: { color: '#0772ffce' },
      3: { color: '#FF8C00' }
    };
    return cores[formaId] ?? {};
  }
}
