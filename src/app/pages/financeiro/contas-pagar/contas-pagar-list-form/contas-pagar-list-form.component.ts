import { Component, DestroyRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { MenuItem, MessageService } from 'primeng/api';
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
  // private destroy$: Subject<void> = new Subject<void>();

  nome?: string = ''.toLowerCase();

  pesquisa?: boolean = false;

  descricao: string;

  contaPagarId: number;

  length = signal(0);

  @ViewChild('dtcontaspagar') grid!: Table;

  // Mes atual
  rangeDates: String;
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

  // contasPagarNome: string = "";
  subscription: Subscription;
  contasPagarForm: FormGroup;
  pessoa: PessoaDTO = new PessoaDTO();
  categoria: CategoriaDTO = new CategoriaDTO();
  contaPagar: ContasPagarDTO = new ContasPagarDTO;
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

  // selecaoItemsIndividual: MenuItem[];
  // selecaoItemsMultiplos: MenuItem[];

  constructor(
    private contasPagarService: ContasPagarService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
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
    this.loadFormasPagamento();
    this.periodo();
    // this.aplicarFiltroDatas();
    this.rangeDates = this.sharedService.rangeMesAtual(); //Mes tual
    this.hoje = this.sharedService.dataAtualFormatada();
    this.dtInicio = this.sharedService.primeiroDiaMes();
    this.dtFim = this.sharedService.ultimoDiaMes();
    // Observa mudanças no Formulario e ja seta o valor automaticamente
    merge(
      this.contasPagarForm.get('dataVencimento')!.valueChanges,
      this.contasPagarForm.get('quantidadeParcelas')!.valueChanges
    ).subscribe(() => {
      //  console.log(this.contasPagarForm.get('dataVencimento')?.value);
      // const valor = this.contasPagarForm.get('valor')?.value;
    });
  };

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }


  loadContasPagarLazy(event: any) {
    this.page = event!.first! / event!.rows!;
    this.linesPerPage = event.rows;
    this.loadContasPagar(this.igrejaId, this.nome.toLowerCase(), this.dtInicio, this.dtFim, this.page, this.linesPerPage);
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
        this.loadContasPagar(this.igrejaId, this.nome, this.dtInicio, this.dtFim, this.page, this.linesPerPage);
        break;

      case 'Mês Atual':
        this.dtInicio = this.sharedService.primeiroDiaMes();
        this.dtFim = this.sharedService.ultimoDiaMes();
        this.loadContasPagar(this.igrejaId, this.nome, this.dtInicio, this.dtFim, this.page, this.linesPerPage);
        break;

      case 'Todas':
        this.dtInicio = '01/01/2000';
        this.dtFim = '01/01/2999';
        this.loadContasPagar(this.igrejaId, this.nome, this.dtInicio, this.dtFim, this.page, this.linesPerPage);
        return;

      case 'Personalizado':
        this.filtroSelecionado = 'Personalizado';
        this.dtInicio = this.sharedService.primeiroDiaMes();
        this.dtFim = this.sharedService.ultimoDiaMes();
        this.loadContasPagar(this.igrejaId, this.nome, this.dtInicio, this.dtFim, this.page, this.linesPerPage);
        return; // Abre os campos de data (Calendar) na tela
    }

    if (this.rangeDates == null) {
      this.dtInicio = this.rangeDates[0];
      if (this.dtInicio.length < 10) {
        this.dtInicio = this.rangeDates.substring(0, 10);
      } else {
        this.dtInicio = this.rangeDates[0];;
      }
    }

    if (this.dtFim == null) {
      this.dtFim = this.dtInicio
    }
    this.rangeDates = this.dtInicio + " - " + this.dtFim;


    // Chama seu método de busca passando as datas calculadas
    this.loadContasPagar(this.igrejaId, this.nome, this.dtInicio, this.dtFim, this.page, this.linesPerPage);
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

  loadContasPagar(igrejaId: number, nome: string, dtInicio: string, dtFim: string, page: number, linesPerPage: number) {
    this.contasPagarService
      .getByPageContasPagarFromIgreja(igrejaId, nome.toLowerCase(), dtInicio, dtFim, page, linesPerPage)
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

  loadResumo() {
    this.contasPagarService
      .getResumoContasPagarFromIgreja(this.igrejaId, this.dtInicio, this.dtFim)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: (response) => {
          this.resumo = response;
        },
        error: (error) => {
          this.error = error;
          this.showError(error)
        }
      });

  }

  loadContaPagar(contaPagar: ContasPagarDTO) {
    this.contaPagarId = contaPagar.id;
    this.contasPagarService.findById(this.contaPagarId)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: response => {
          this.contaPagar = response;
          this.contasPagarForm.patchValue(this.contaPagar)   // binds loaded  
          this.pessoaId = response['pessoa'].id;
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
    }
  }



  resetContasPagar() {
    window.location.reload()

  }

  // METODOS CONTA
  public createContasPagar() {
    this.contasPagarForm.controls['descricao'].setValue(this.sharedService.formataNome(this.contasPagarForm.controls['descricao'].value));
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

  public confirmarPagamento() {
    const payload: ContasPagarDTO = Object.assign(this.contasPagarForm.value);
    payload.dataVencimento = this.sharedService.formataDataBR(this.contasPagarForm.controls['dataVencimento'].value);
    const data = this.sharedService.formataDataBR(this.contasPagarForm.controls['dataPagamento'].value);
    this.contasPagarService.baixarPagamento(payload.id, payload.dataPagamento, payload.valor.toString())
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: () => {
          this.toastr.success('Conta paga com sucesso!', 'Pagamento');
          this.grid.reset();
        },
        error: () => { }
      })
  }

  confirmarEstorno(conta: ContasPagarDTO) {
    Swal.fire({
      text: `Deseja desfazer o pagamento de ${conta.descricao}? O lançamento de caixa também será excluído.`,
      icon: 'error',
      showCloseButton: true,
      showCancelButton: true,
    }).then((willDelete) => {
      if (willDelete.dismiss) {
      } else {
        this.contasPagarService.estornarPagamento(conta.id)
          .subscribe({
            next: () => {
              this.toastr.success('Pagamento estornado com sucesso!', 'Sucesso');
              this.grid.reset(); // Recarrega a lista
            }
          });
      }
    });
  }


  public updateContasPagar() {
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

  private loadPessoa(value) {
    this.pessoaService.getById(value)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: (response) => {
          this.pessoa = response;
          this.pessoaId = this.pessoa.id;
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


  onChangeFrequenciaCP(event) {
    this.contasPagarForm.controls['frequenciaCP'].setValue(String(event.value));
  }

  onChangeContaBanco(event) {
    this.contasPagarForm.controls['contaBancoId'].setValue(event.value);
  }

  onChangeCategorias(event) {

  }

  onChangeNomeHistorico(value) {
    this.loadPessoa(value.value);
  }

  onChangeTransferenciaCategoria(value) {

    this.contasPagarForm.controls['categoriaId'].setValue(value.value);
  }

  onChangePessoa(event) {
    this.loadPessoa(event.value);
  }

  onChangeFormaPagamento(event) {
    this.contasPagarForm.controls['formaId'].setValue(event.value)
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


  //EXCLUIR  
  exclusaoContasPagar(contaPagar: ContasPagarDTO) {
    Swal.fire({
      text: 'Tem certeza que deseja excluir este registro?',
      icon: 'error',
      showCloseButton: true,
      showCancelButton: true,
    }).then((willDelete) => {
      if (willDelete.dismiss) {
        // Swal.fire('Exclusão Cancelada', 'Seu registro está seguro', 'success');
      } else {
        console.log(contaPagar.id)
        this.contasPagarService.delete(contaPagar.id)
          .subscribe({
            next: () => {
              this.grid.reset();//atualiza a tabela do primeng
              this.toastr.success(`Registro excluido com sucesso!`)
            },
            error: () => {
              this.toastr.error(`Erro ao excluir registro!`)
            },

          });
      }
    })
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
        },
        error: () => { }
      })
  }

  resetModal() {
    this.contasPagarForm.reset();
    this.contasPagarForm.controls['pessoaId'].setValue(null);
    this.isParcelamento = false;
  }

  setModalEdicao() {
    this.pageTitle = "Editando Contas a Pagar".toUpperCase();
    console.log(this.isParcelamento)
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


  private showError(error) {
    this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.message });
  }

}

