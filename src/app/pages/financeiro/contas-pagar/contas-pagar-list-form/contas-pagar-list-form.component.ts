import { Component, DestroyRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { merge, Subscription } from 'rxjs';
import moment from 'moment';
import Swal from 'sweetalert2';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { API_CONFIG } from 'src/app/app-config';
import { ContaDTO } from 'src/app/theme/shared/models/conta.dto';
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
import { Fluid } from 'primeng/fluid';
import { FormaDTO } from 'src/app/theme/shared/models/forma.dto';
import { ContasPagarDTO, ContasPagarResumoDTO } from 'src/app/theme/shared/models/contas-pagar.dto';
import { ConfirmDialog } from "primeng/confirmdialog";
import { LancamentoService } from 'src/app/theme/shared/services/lancamento.service';
import { FileUploadModule } from 'primeng/fileupload';

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
    InputNumberModule,
    ConfirmDialog,
    FileUploadModule
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

  salvando = false;
  arquivoSelecionado: File | null = null;

  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  positionContasPagar: 'left' | 'right' | 'top' | 'bottom' | 'center' | 'topleft' | 'topright' | 'bottomleft' | 'bottomright' = 'top';
  visibleContasPagar: boolean = false;
  positionPagamento: 'left' | 'right' | 'top' | 'bottom' | 'center' | 'topleft' | 'topright' | 'bottomleft' | 'bottomright' = 'top';
  visiblePagamento: boolean = false;

  private destroyRef = inject(DestroyRef); // 1. Injete a referência de destruição

  nomeIgrejaSignal = nomeIgrejaSignal; //Signal 
  igrejaIdSignal = igrejaIdSignal;
  nomeUsuarioSignal = nomeUsuarioSignal;
  setorIdSignal = setorIdSignal;

  isParcelamento: boolean = false;

  resumo: ContasPagarResumoDTO = new ContasPagarResumoDTO();

  nomeIgreja = nomeIgrejaSignal();
  igrejaId = igrejaIdSignal();
  nomeUsuario = nomeUsuarioSignal();
  setorId = setorIdSignal();

  imodo = signal<number>(0);
  nome?: string = ''.toLowerCase();

  // Adicione junto às outras propriedades
  private searchTimer: any;
  busca: string = ''; // campo de busca unificado

  descricao!: string;

  contaPagarId!: number;

  mes!: string;
  mesNovo!: string;

  length = signal(0);

  @ViewChild('dtcontaspagar') grid!: Table;

  // Mes atual
  rangeDates!: String;
  dtInicio: string = "";
  dtFim: string = "";
  hoje: string = "";

  pessoaId: number = 0;

  dataAtual: any = moment();

  frequenciaCP = [
    { nome: 'AVISTA' },
    { nome: 'SEMANAL' },
    { nome: 'QUINZENAL' },
    { nome: 'MENSAL' },
    { nome: 'TRIMESTRAL' },
    { nome: 'ANUAL' }
  ]

  opcoesFiltroDatas = [
    { label: 'Todas', value: 'Todas' },
    { label: 'Vencidos', value: 'Vencidos' },
    { label: 'Vencendo Hoje', value: 'Hoje' },
    { label: 'Mês Atual', value: 'Mês Atual' },
    { label: 'Personalizado', value: 'Personalizado' }
  ];

  filtroSelecionado = 'Todas';

  totalRegistros: number = 0;

  contasPagarId!: number;
  cadastrado: string = 'sim';
  categoriaFiltrada!: string;

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

  subscription!: Subscription;
  contasPagarForm!: FormGroup;
  pessoa: PessoaDTO = new PessoaDTO();
  categoria: CategoriaDTO = new CategoriaDTO();
  contaPagar: ContasPagarDTO = new ContasPagarDTO;
  pageTitle!: string;
  submittingForm: boolean = false;

  printItems!: MenuItem[];

  constructor(
    private contasPagarService: ContasPagarService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    public pessoaService: PessoaService,
    public translate: TranslateService,
    private sharedService: SharedService,
    private categoriaService: CategoriaService,
    private contaService: ContaService,
    private centroCustoService: CentroCustoService,
    private formaService: FormaService,
    private lancamentoService: LancamentoService

  ) { }

  ngOnInit() {
    this.buildContasPagarForm();
    this.loadContasBanco();
    this.loadCategorias();
    this.loadCentroCustos();
    this.loadPessoas();
    this.loadFormasPagamento();
    this.periodo();
    this.rangeDates = this.sharedService.rangeMesAtual(); //Mes tual
    this.hoje = this.sharedService.dataAtualFormatada();
    this.dtInicio = '01/01/2000';
    this.dtFim = '01/01/9999';
    // Observa mudanças no Formulario e ja seta o valor automaticamente
    merge(
      this.contasPagarForm.get('dataVencimento')!.valueChanges,
      this.contasPagarForm.get('quantidadeParcelas')!.valueChanges
    ).subscribe(() => {
      const dataBRString = this.contaPagar.dataVencimento;
      const dataBRStringNovo = this.contasPagarForm.get('dataVencimento')?.value;
      const partes = dataBRString?.split('/');
      const partesNovo = dataBRStringNovo.split('/');

      // Pega apenas o mes 
      this.mes = `${partes![1]}`
      this.mesNovo = `${partesNovo[1]}`
    });
  };

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }


  loadContasPagarLazy(event: any): void {
  this.page = event!.first! / event!.rows!;
  this.linesPerPage = event.rows;
  this.loadContasPagar(
    this.igrejaId,
    this.busca.toLowerCase(),
    this.dtInicio,
    this.dtFim,
    this.page,
    this.linesPerPage
  );
}



  aplicarFiltroDatas() {
    this.hoje = this.sharedService.dataAtualFormatada();

    switch (this.filtroSelecionado) {
      case 'Hoje':
        this.dtInicio = this.sharedService.dataAtualFormatada();
        this.dtFim = this.sharedService.dataAtualFormatada();
        break;

      case 'Vencidos':
        const dataLimite = new Date();
        dataLimite.setDate(dataLimite.getDate() - 1); // Define como ontem

        // Formata para string dd/MM/yyyy para enviar ao Spring
        const dtInicio = '01/01/2000'; // Uma data bem antiga de início
        const dtFim = dataLimite.toLocaleDateString('pt-BR');
        this.dtInicio = dtInicio;
        this.dtFim = dtFim;
        this.loadContasPagar(this.igrejaId, (this.nome as any), this.dtInicio, this.dtFim, this.page, this.linesPerPage);
        break;

      case 'Mês Atual':
        this.dtInicio = this.sharedService.primeiroDiaMes();
        this.dtFim = this.sharedService.ultimoDiaMes();
        this.loadContasPagar(this.igrejaId, (this.nome as any), this.dtInicio, this.dtFim, this.page, this.linesPerPage);
        break;

      case 'Todas':
        this.dtInicio = '01/01/2000';
        this.dtFim = '01/01/2999';
        this.loadContasPagar(this.igrejaId, (this.nome as any), this.dtInicio, this.dtFim, this.page, this.linesPerPage);
        return;

      case 'Personalizado':
        this.filtroSelecionado = 'Personalizado';
        this.dtInicio = this.sharedService.primeiroDiaMes();
        this.dtFim = this.sharedService.ultimoDiaMes();
        this.loadContasPagar(this.igrejaId, (this.nome as any), this.dtInicio, this.dtFim, this.page, this.linesPerPage);
        return; // Abre os campos de data (Calendar) na tela
    }

    if (this.rangeDates == null) {
      this.dtInicio = this.rangeDates[0];
      if (this.dtInicio.length < 10) {
        this.dtInicio = (this.rangeDates as any).substring(0, 10);
      } else {
        this.dtInicio = this.rangeDates[0];;
      }
    }

    if (this.dtFim == null) {
      this.dtFim = this.dtInicio
    }
    this.rangeDates = this.dtInicio + " - " + this.dtFim;

    this.loadContasPagar(this.igrejaId, (this.nome as any), this.dtInicio, this.dtFim, this.page, this.linesPerPage);
  }

  //Upload de comprovantes 
  onUpload(event: any, lancamentoId: number) {
    // 1. PRIMEIRA LINHA: Teste de vida do método

    // No evento onSelect do PrimeNG, os arquivos vêm em event.files
    const arquivo: File = event.files && event.files.length > 0 ? event.files[0] : null;

    if (arquivo) {

      this.lancamentoService.uploadComprovante(lancamentoId, arquivo).subscribe({
        next: () => {
          this.toastr.success('Comprovante anexado com sucesso!');
          // this.refreshAll(); // Atualiza a lista/grid
        },
        error: (err) => {
          this.toastr.error('Erro ao enviar o comprovante.');
          console.error(err);
        }
      });
    }
  }

  loadCategorias() {
    this.categoriaService.getListCategoriaFromIgreja(this.igrejaId)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: response => {
          this.categoriasFiltradas = response.filter((cat: { tipo: string; }) => cat.tipo == 'Despesa'); // Armazena todas as categorias de Despesa
          this.contasPagarForm.controls['categoriaId'].setValue(this.categoriasFiltradas[0].id)
        }
      }),
      this.error; () => { }
  }

  loadFormasPagamento() {
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

  isAtrasado(dataVencimento: string): boolean {
    if (!dataVencimento) return false;

    // Converte "dd/MM/yyyy" para um objeto Date comparável
    const partes = dataVencimento.split('/');
    const dataVenc = new Date(+partes[2], +partes[1] - 1, +partes[0]);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Zera as horas para comparar apenas os dias

    return dataVenc < hoje;
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
      uuidGrupo: [null],
      descricao: ['', Validators.required],
      nome: ['', Validators.required],
      saldoResidual: [null],
      frequenciaCP: [false, [Validators.required]],
      valor: [null, [Validators.required, Validators.min(0.01)]],
      dataVencimento: ['', Validators.required],
      dataPagamento: [''],
      igrejaId: [this.igrejaId], // Aqui você pegaria do seu serviço de auth
      cadastrado: ['sim'],
      status: ['PENDENTE'],
      contaBancoId: [null, [Validators.required]],
      setorId: [this.setorId],
      formaId: [null, [Validators.required]],
      centroCustoId: [null, [Validators.required]],
      categoriaId: [null, [Validators.required]],
      pessoaId: [null, [Validators.required]],
      quantidadeParcelas: [1, [Validators.required, Validators.min(1)]],
    });

  }

  parcelar() {
    this.contasPagarForm.controls['frequenciaCP'].setValue('AVISTA');
    this.contasPagarForm.controls['quantidadeParcelas'].setValue(2);
  }

  cadastradoC() {
    this.cadastrado = 'sim'
    this.contasPagarForm.controls['cadastrado'].setValue('sim');
  }
  cadastradoNC() {
    this.cadastrado = 'nao'
    this.contasPagarForm.controls['cadastrado'].setValue('nao');
    this.contasPagarForm.controls['pessoaId'].setValue(0);
    this.pessoaId = 0;

  }

  loadContasPagar(igrejaId: number, busca: string, dtInicio: string, dtFim: string, page: number, linesPerPage: number) {
    this.contasPagarService
      .getByPageContasPagarFromIgreja(igrejaId, busca.toLowerCase(), dtInicio, dtFim, page, linesPerPage)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: (response) => {
          this.contasPagar = response['content']
          this.totalRegistros = response.totalElements;
          this.loadResumo();
        },
        error: (error) => {
          this.error = error;
          this.showError(error)
        }
      });

  }

loadResumo(): void {
  this.contasPagarService
    .getResumoContasPagarFromIgreja(
      this.igrejaId,
      this.busca,
      this.dtInicio,
      this.dtFim
    )
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (response) => { this.resumo = response; },
      error: (error) => { this.showError(error); }
    });
}



  loadContaPagar(contaPagar: ContasPagarDTO) {
    this.contaPagarId = contaPagar.id!;
    this.contasPagarService.findById(this.contaPagarId)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: response => {
          this.contaPagar = response;
          this.contasPagarForm.patchValue(this.contaPagar)   // binds loaded  
          this.pessoaId = (response as any)['pessoa'].id;
          this.contasPagarForm.controls['pessoaId'].setValue(this.pessoaId);
          this.contasPagarForm.controls['dataPagamento'].setValue(this.sharedService.dataAtualFormatada());
          if (this.pessoaId == 0) {
            this.cadastradoNC();
          } else {
            this.cadastradoC();
          }
        },
        error: () => { }
      })
  }

  loadContasBanco() {
    this.contaService.getListContaFromIgreja(this.igrejaId)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: (response) => {
          this.contasBanco = response;
        },
        error: (error) => {
          this.error = error;
          this.showError(error)
        }
      });
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
      // this.dtInicio = this.sharedService.dataAtualFormatada();
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
    }

  }

  resetContasPagar() {
    window.location.reload()

  }

  // METODOS CONTA
  public createContasPagar() {
    this.contasPagarForm.controls['descricao'].setValue(this.sharedService.formataNome(this.contasPagarForm.controls['descricao'].value));
    this.contasPagarForm.controls['nome'].setValue(this.sharedService.formataNome(this.contasPagarForm.controls['nome'].value));
    if (this.contasPagarForm.valid) {
      // Objeto direto, sem "embrulho"
      const dados = {
        ...this.contasPagarForm.value,
        descricao: this.sharedService.formataNome(this.contasPagarForm.value.descricao),
        dataVencimento: this.contasPagarForm.value.dataVencimento, // Formato dd/MM/yyyy
        pessoa: {
          id: this.contasPagarForm.value.pessoaId // Garante o vínculo do ID
        }
      };
      this.contasPagarService.create(dados)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            const qtd = dados.quantidadeParcelas || 1;
            if (qtd > 1) {
              const valorParcela = (dados.valor / qtd).toFixed(2);
              this.toastr.success(`Geradas ${qtd} parcelas de R$ ${valorParcela}!`, 'Sucesso');
            } else {
              this.toastr.success('Salvo com sucesso!', 'Sucesso');
            }
            this.grid.reset();
          }
        });
    }
  }

  // public confirmarPagamento() {
  //   const payload: ContasPagarDTO = Object.assign(this.contasPagarForm.value);
  //   payload.dataVencimento = this.sharedService?.formataDataBR(this.contasPagarForm.controls['dataVencimento'].value)!;
  //   const data = this.sharedService.formataDataBR(this.contasPagarForm.controls['dataPagamento'].value);
  //   this.contasPagarService.baixarPagamento(payload.id!, payload.dataPagamento, payload.valor?.toString())
  //     .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
  //     .subscribe({
  //       next: () => {
  //         this.toastr.success('Conta paga com sucesso!', 'Pagamento');
  //         this.grid.reset();
  //       },
  //       error: () => { }
  //     })
  // }

  public confirmarPagamento() {
    this.salvando = true; // Bloqueia novos cliques no botão

    const payload: ContasPagarDTO = Object.assign(this.contasPagarForm.value);
    payload.dataVencimento = this.sharedService?.formataDataBR(this.contasPagarForm.controls['dataVencimento'].value)!;
    const data = this.sharedService.formataDataBR(this.contasPagarForm.controls['dataPagamento'].value);

    this.contasPagarService.baixarPagamento(payload.id!, payload.dataPagamento, payload.valor?.toString())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (contaPaga: any) => {
          // Captura o ID injetado pela propriedade transiente do Java
          const idDoLancamento = contaPaga?.lancamentoId;

          if (this.arquivoSelecionado && idDoLancamento) {
            this.executarUploadComprovante(idDoLancamento);
          } else {
            this.toastr.success('Conta paga com sucesso!', 'Pagamento');
            this.finalizarFluxoTelas();
          }
        },
        error: () => {
          this.salvando = false;
        }
      });
  }


  private executarUploadComprovante(id: number) {
    this.lancamentoService.uploadComprovante(id, this.arquivoSelecionado!).subscribe({
      next: () => {
        this.toastr.success('Conta paga e comprovante anexado com sucesso!', 'Pagamento');
        this.finalizarFluxoTelas();
      },
      error: (err) => {
        this.toastr.error('Conta paga, mas houve uma falha ao anexar o comprovante.', 'Aviso');
        console.error(err);
        this.finalizarFluxoTelas(); // Fecha as modais mesmo se o arquivo falhar para não travar o usuário
      }
    });
  }

  private finalizarFluxoTelas() {
    this.salvando = false;
    this.arquivoSelecionado = null;

    // Fecha as modais de forma segura via código
    this.visiblePagamento = false;
    this.visibleContasPagar = false;

    // Reseta a grid visual
    this.grid.reset();
  }

  // 1. Método disparado quando o usuário escolhe um arquivo na janela local
  onSelecionarArquivo(event: any) {
    // No modo basic/onSelect, os arquivos vêm dentro de event.files ou event.currentFiles
    if (event.files && event.files.length > 0) {
      this.arquivoSelecionado = event.files[0];
    } else if (event.currentFiles && event.currentFiles.length > 0) {
      this.arquivoSelecionado = event.currentFiles[0];
    }
  }

  // 2. Método disparado quando o usuário clica no 'X' para remover o anexo da tela
  onRemoverArquivo() {
    this.arquivoSelecionado = null;
  }

 // Substitui o buscaContasPagar() existente
buscaContasPagar(): void {
  this.page = 0;
  if (this.grid) this.grid.first = 0;
  this.loadContasPagar(
    this.igrejaId,
    this.busca.toLowerCase(),
    this.dtInicio,
    this.dtFim,
    this.page,
    this.linesPerPage
  );
}

// Novo método com debounce — igual ao financeiro
onGlobalFilter(): void {
  clearTimeout(this.searchTimer);
  this.searchTimer = setTimeout(() => {
    this.page = 0;
    if (this.grid) this.grid.first = 0;
    this.loadContasPagar(
      this.igrejaId,
      this.busca.toLowerCase(),
      this.dtInicio,
      this.dtFim,
      this.page,
      this.linesPerPage
    );
  }, 400);
}



  public updateContasPagar() {
    if ((this.mes !== this.mesNovo) && this.contaPagar.uuidGrupo) {
      Swal.fire({
        // title: 'Exclusão',
        text: 'Deseja alterar a data? Todos as parcelas seguirão esta data.',
        position: 'top',
        showCloseButton: true,
        showCancelButton: true,
      }).then((willDelete) => {
        if (willDelete.dismiss) {
        } else {
          this.contasPagarForm.controls['nome'].setValue(this.sharedService.formataNome(this.contasPagarForm.controls['nome'].value));
          const contasPagar: ContasPagarDTO = Object.assign(this.contasPagarForm.value);
          this.contasPagarService.update(contasPagar)
            .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
            .subscribe({
              next: () => {
                this.grid.reset();
                this.toastr.success('Registro atualizado com sucesso!', 'Atualização');
              },
              error: () => { }
            })

        }
      });

    } else {
      this.contasPagarForm.controls['nome'].setValue(this.sharedService.formataNome(this.contasPagarForm.controls['nome'].value));
      const contasPagar: ContasPagarDTO = Object.assign(this.contasPagarForm.value);
      this.contasPagarService.update(contasPagar)
        .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
        .subscribe({
          next: () => {
            this.grid.reset();
            this.toastr.success('Registro atualizado com sucesso!', 'Atualização');
          },
          error: () => { }
        })

    }
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

  private loadPessoa(value: number) {
    this.pessoaService.getById(value)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: (response) => {
          this.pessoa = response;
          this.pessoaId = this.pessoa.id!;
          this.contasPagarForm.controls['pessoaId'].setValue(this.pessoa.id);
          this.contasPagarForm.controls['nome'].setValue(this.pessoa.nome);
          if (this.pessoaId == null) {
            this.contasPagarForm.controls['cadastrado'].setValue('nao');
            this.cadastrado = 'nao';
          } else {
            this.contasPagarForm.controls['cadastrado'].setValue('sim');
            this.cadastrado = 'sim';
          }
        },
        error: () => { }
      });
  }

  ///////////////////////////// Eventos  ///////////////////////////


  onChangeFrequenciaCP(event: { value: any; }) {
    this.contasPagarForm.controls['frequenciaCP'].setValue(String(event.value));
  }

  onChangeContaBanco(event: { value: any; }) {
    this.contasPagarForm.controls['contaBancoId'].setValue(event.value);
  }

  onChangeCategorias(event: any) {

  }

  onChangeNomeHistorico(value: { value: any; }) {
    this.loadPessoa(value.value);
  }

  onChangePessoa(event: { value: any; }) {
    this.loadPessoa(event.value);
  }

  onChangeFormaPagamento(event: { value: any; }) {
    this.contasPagarForm.controls['formaId'].setValue(event.value)
  }

  exclusaoContasPagar(contaPagar: ContasPagarDTO) {
    if (contaPagar.uuidGrupo) {
      Swal.fire({
        title: 'Excluir Parcelamento',
        text: "Esta conta faz parte de um parcelamento. O que deseja fazer?",
        width: 580,
        position: 'top',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Apagar APENAS esta?',
        denyButtonText: `Apagar TODO o grupo?`,
        cancelButtonText: 'Cancelar!',

      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          // Chama o delete com apagarGrupo = false
          this.contasPagarService.delete(contaPagar.id!, false)
            .subscribe({
              next: () => {
                this.grid.reset();//atualiza a tabela do primeng
              },
              error: () => {
                this.toastr.error(`Erro ao excluir registro!`)
              },

            });
        } else if (result.isDenied) {
          // Chama o delete com apagarGrupo = true
          this.contasPagarService.delete(contaPagar.id!, true)
            .subscribe({
              next: () => {
                this.grid.reset();//atualiza a tabela do primeng
                this.toastr.success(`Registros excluido com sucesso!`);
              },
              error: () => {
                this.toastr.error(`Erro ao excluir registro!`)
              },

            });
        }
      });
    } else {
      // Exclusão normal para contas avulsas
      Swal.fire({
        // title: 'Exclusão',
        text: 'Tem certeza que deseja excluir esta conta?',
        position: 'top',
        showCloseButton: true,
        showCancelButton: true,
      }).then((willDelete) => {
        if (willDelete.dismiss) {
        } else {
          this.contasPagarService.delete(contaPagar.id!, false)
            .subscribe({
              next: () => {
                this.grid.reset();//atualiza a tabela do primeng
                this.toastr.success(`Registro excluido com sucesso!`);
              },
              error: () => {
                this.toastr.error(`Erro ao excluir registro!`)
              },

            })
        }
      });

    }
  }

  resetModal() {
    // this.contasPagarForm.reset();
    this.contasPagarForm.controls['pessoaId'].setValue(null);
    this.isParcelamento = false;
  }

  setModalEdicao() {
    this.pageTitle = "Editando Contas a Pagar".toUpperCase();
  }

  setModaPagar() {
    this.pageTitle = "Pagando Contas".toUpperCase();
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
    this.contasPagarForm.controls['descricao'].setValue('Despesa');
    this.contasPagarForm.controls['setorId'].setValue(this.setorId);
    this.contasPagarForm.controls['valor'].setValue(0.00);
    this.contasPagarForm.controls['frequenciaCP'].setValue('AVISTA');
    this.contasPagarForm.controls['status'].setValue('PENDENTE');
    this.contasPagarForm.controls['quantidadeParcelas'].setValue(1);
    this.contasPagarForm.controls['pessoaId'].setValue(null);
    this.contasPagarForm.controls['contaBancoId'].setValue(this.contasBanco[0].id);
  }

  filtraCategorias(value: string) {
    let cat1 = this.categorias.filter(cat => cat.tipo == value); //Armazema todas as categorias de um tipo passado por parametro
    this.categoriasFiltradas = cat1;
  }


  private showError(error: { message: any; }) {
    this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.message });
  }

}

