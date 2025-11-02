import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService, LazyLoadEvent, MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { GLOBALS } from 'src/app/_helpers/globals';
import { CategoriaDTO } from 'src/app/models/categoria.dto';
import { CentroCustoDTO } from 'src/app/models/centro-custo.dto';
import { ContaDTO } from 'src/app/models/conta.dto';
import { FormaDTO } from 'src/app/models/forma.dto';
import { CategoriaService } from 'src/app/services/categoria.service';
import { CentroCustoService } from 'src/app/services/centro-custo.service';
import { ContaService } from 'src/app/services/conta.service';
import { FormaService } from 'src/app/services/forma.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-cadastro-list',
  templateUrl: './cadastro-list.component.html',
  styleUrls: ['./cadastro-list.component.scss'],
  // encapsulation: ViewEncapsulation.None

})
export class CadastroListComponent implements OnInit {
  private destroy$: Subject<void> = new Subject<void>();

  tipoPadraoIgreja = [
    { nome: 'Igreja', id: 0 },
    { nome: 'Padrao', id: 1 }
  ];

  tipoCategoria = [
    { nome: 'Receita' },
    { nome: 'Despesa' }

  ];

  tipoConta = [
    { nome: 'Caixa' },
    { nome: 'Banco' }
  ];

  totalRegistrosCategoria: number;
  totalRegistrosCentroCusto: number;
  totalRegistrosConta: number;
  totalRegistrosForma: number;
  totalCadastrosSistema: number;
  totalCadastrosIgreja: number;

  // totalRegistros: number = 0
  igrejaId: number = GLOBALS.igrejaId;

  perfil: string = GLOBALS.perfil;

  contas: ContaDTO[] = [];
  categorias: CategoriaDTO[] = [];
  centroCustos: CentroCustoDTO[] = [];
  formas: FormaDTO[] = [];

  error = '';

  contaId: number;
  categoriaId: number;
  centroCustoId: number;
  formaId: number;

  public pageConta = 0;
  public pageCategoria = 0;
  public pageCentroCusto = 0;
  public pageForma = 0;

  public linesPerPageConta = 6;
  public linesPerPageCategoria = 6;
  public linesPerPageCentroCusto = 6;
  public linesPerPageForma = 6;

  public nomeConta = '';
  public nomeCategoria = '';
  public nomeCentroCusto = '';
  public nomeForma = '';

  contaForm: FormGroup;
  categoriaForm: FormGroup;
  centroCustoForm: FormGroup;
  formaForm: FormGroup;

  conta: ContaDTO = new ContaDTO();
  categoria: CategoriaDTO = new CategoriaDTO();
  centroCusto: CentroCustoDTO = new CentroCustoDTO();
  forma: FormaDTO = new FormaDTO();

  pageTitle: string;

  imodo: number = 0;

  submittingFormConta: boolean = false;
  submittingFormCategoria: boolean = false;
  submittingFormCentroCusto: boolean = false;
  submittingFormForma: boolean = false;

  constructor(
    private contaService: ContaService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private categoriaService: CategoriaService,
    private centroCustoService: CentroCustoService,
    private formaService: FormaService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService

  ) { }


  ngOnInit() {
    this.buildContaForm();
    this.buildCategoriaForm();
    this.buildCentroCustoForm();
    this.buildFormaForm();

  };

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadContasLazy(event: LazyLoadEvent) {
    const page = event!.first! / event!.rows!; // divisão para encontrar a paginações
    this.loadContas(this.igrejaId, this.nomeConta.toLowerCase(), page, this.linesPerPageConta);
  }

  loadCategoriasLazy(event: LazyLoadEvent) {
    const page = event!.first! / event!.rows!; // divisão para encontrar a paginações
    this.loadCategorias(this.igrejaId, this.nomeCategoria.toLowerCase(), page, this.linesPerPageCategoria);
  }

  loadCentroCustosLazy(event: LazyLoadEvent) {
    const page = event!.first! / event!.rows!; // divisão para encontrar a paginações
    this.loadCentroCustos(this.igrejaId, this.nomeCentroCusto.toLowerCase(), page, this.linesPerPageCentroCusto);
  }


  loadFormasLazy(event: LazyLoadEvent) {
    const page = event!.first! / event!.rows!; // divisão para encontrar a paginações
    this.loadFormas(this.igrejaId, this.nomeForma.toLowerCase(), page, this.linesPerPageCentroCusto);
  }

  submitFormConta() {
    this.submittingFormConta = true;
    if (this.imodo === 0)
      this.createConta();
    else
      this.updateConta();
  }

  submitFormCategoria() {
    this.submittingFormCategoria = true;
    if (this.imodo === 0)
      this.createCategoria();
    else
      this.updateCategoria();
  }

  submitFormCentroCusto() {
    this.submittingFormCentroCusto = true;
    if (this.imodo === 0)
      this.createCentroCusto();
    else
      this.updateCentroCusto();
  }

  submitFormForma() {
    this.submittingFormForma = true;
    if (this.imodo === 0)
      this.createForma();
    else
      this.updateForma();
  }

  private buildContaForm() {
    this.contaForm = this.formBuilder.group({
      id: [null],
      nome: [null, [Validators.required]],
      tipo: [null],
      banco: [null],
      agencia: [null],
      numero: [null],
      saldo: [null],
      saldoInicial: [0.00, [Validators.required]],
      igrejaId: [this.igrejaId]

    });
  }

  private buildCategoriaForm() {
    this.categoriaForm = this.formBuilder.group({
      id: [null],
      nome: [null, [Validators.required]], // As vezes tem que deixar vazio "" ao invés de null p/ não dá BO
      tipo: [null, [Validators.required]],
      tipoPadraoIgreja: [(this.perfil == 'ADMIN') ? 'Padrao' : 'Igreja', [Validators.required]],// Campo inexistente no banco. Utilizados apenas para Admin para setar null em igrejaId
      igrejaId: [null]
    });
  }

  private buildCentroCustoForm() {
    this.centroCustoForm = this.formBuilder.group({
      id: [null],
      nome: [null, [Validators.required]], // As vezes tem que deixar vazio "" ao invés de null p/ não dá BO
      tipoPadraoIgreja: [(this.perfil == 'ADMIN') ? 'Padrao' : 'Igreja', [Validators.required]],// Campo inexistente no banco. Utilizados apenas para Admin para setar null em igrejaId
      igrejaId: [null]
    });
  }

  private buildFormaForm() {
    this.formaForm = this.formBuilder.group({
      id: [null],
      nome: [null, [Validators.required]], // As vezes tem que deixar vazio "" ao invés de null p/ não dá BO
      tipoPadraoIgreja: ['Igreja', [Validators.required]],// Campo inexistente no banco. Utilizados apenas para Admin para setar null em igrejaId
      igrejaId: [null]
    });
  }

  loadContas(igrejaId, nomeConta, pageConta, linesPerPageConta) {
    this.contaService.getByPageContaFromIgreja(igrejaId, nomeConta, pageConta, linesPerPageConta)
     .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.contas = response['content'].sort((a, b) => a.id - b.id);
          this.totalRegistrosConta = response.totalElements
        },
        error: (error) => {
          this.error = error;
          this.showError(error)
        }
      });
  }

  loadCategorias(igrejaId, nomeCategoria, pageCategoria, linesPerPageCategoria) {
    this.categoriaService.getByPageCategoriaFromIgreja(igrejaId, nomeCategoria, pageCategoria, linesPerPageCategoria)
    .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.categorias = response['content'].sort((a, b) => a.id - b.id);
          this.totalRegistrosCategoria = response.totalElements
        },
        error: (error) => {
          this.error = error;
          this.showError(error)
        }
      });
  }

  loadCentroCustos(igrejaId, nomeCentroCusto, pageCentroCusto, linesPerPageCentroCusto) {
    this.centroCustoService.getByPageCentroCustoFromIgreja(igrejaId, nomeCentroCusto, pageCentroCusto, linesPerPageCentroCusto)
    .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.centroCustos = response['content'].sort((a, b) => a.id - b.id);
          this.totalRegistrosCentroCusto = response.totalElements
        },
        error: (error) => {
          this.error = error;
          this.showError(error)
        }
      });
  }

  loadFormas(igrejaId, nomeForma, pageForma, linesPerPageForma) {
    this.formaService.getByPageFormaFromIgreja(igrejaId, nomeForma, pageForma, linesPerPageForma)
    .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.formas = response['content'].sort((a, b) => a.id - b.id);
          this.totalRegistrosForma = response.totalElements
        },
        error: (error) => {
          this.error = error;
          this.showError(error)
        }
      });
  }

  // METODOS CONTA
  public createConta() {
    const conta: ContaDTO = this.contaForm.value;
    this.contaService.create(conta)
    .pipe(takeUntil(this.destroy$))
      .subscribe(
        conta => {
          this.conta.id = parseInt(this.extractId(conta.headers.get('location'))); // Extrai o Id da URI retornada do banco
          // this.conta.id = this.contaId;       
          this.loadContas(this.igrejaId, this.nomeConta, this.pageConta, this.linesPerPageConta)
          Swal.fire('Cadastro', 'Registro inserido com sucesso!', 'success');
          this.resetModalConta();
        },
        error => { }
      )
  }

  public updateConta() {
    const conta: ContaDTO = Object.assign(new ContaDTO(), this.contaForm.value);
    conta.saldoInicial == "" ? this.contaForm.controls['saldoInicial'].setValue(0.00) : this.contaForm.controls['saldoInicial'].setValue(conta.saldoInicial);
    this.contaService.update(conta)
    .pipe(takeUntil(this.destroy$))
      .subscribe(
        () => {
          this.loadContas(this.igrejaId, this.nomeConta, this.pageConta, this.linesPerPageConta)
          Swal.fire('Atualização', 'Registro atualizado com sucesso!', 'success');
          this.resetModalConta();
        },
        error => { }

      )
  }

  loadConta(conta: ContaDTO) {
    this.contaId = conta.id;
    this.contaService.findById(this.contaId)
    .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          this.conta = response;
          this.contaForm.patchValue(this.conta)   // binds loaded category data to CategoryForm
          // this.contaForm.controls['tipoPadraoIgreja'].setValue(this.conta.igrejaId ? 'Igreja' : 'Padrao')
        },
        error => { })
  }

  loadCategoria(categoria: CategoriaDTO) {
    this.categoriaId = categoria.id;
    this.categoriaService.findById(this.categoriaId)
    .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          this.categoria = response;
          this.categoriaForm.patchValue(this.categoria)   // binds loaded category data to CategoryForm
          this.categoriaForm.controls['tipoPadraoIgreja'].setValue(this.categoria.igrejaId ? 'Igreja' : 'Padrao')
        },
        error => { })
  }

  loadCentroCusto(centroCusto: CentroCustoDTO) {
    this.centroCustoId = centroCusto.id;
    this.centroCustoService.findById(this.centroCustoId)
    .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          this.centroCusto = response;
          this.centroCustoForm.patchValue(this.centroCusto)   // binds loaded category data to CategoryForm
          this.centroCustoForm.controls['tipoPadraoIgreja'].setValue(this.centroCusto.igrejaId ? 'Igreja' : 'Padrao')
        },
        error => { })
  }

  loadForma(forma: FormaDTO) {
    this.formaId = forma.id;
    this.formaService.findById(this.formaId)
    .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          this.forma = response;
          this.formaForm.patchValue(this.forma)   // binds loaded category data to CategoryForm
          this.formaForm.controls['tipoPadraoIgreja'].setValue(this.forma.igrejaId ? 'Igreja' : 'Padrao')
        },
        error => { })
  }

  // METODOS CATEGORIA
  public createCategoria() {
    const categoria: CategoriaDTO = this.categoriaForm.value;
    this.categoriaService.create(categoria)
    .pipe(takeUntil(this.destroy$))
      .subscribe(
        categoria => {
          this.categoriaId = parseInt(this.extractId(categoria.headers.get('location'))); // Extrai o Id da URI retornada do banco
          this.categoria.id = this.categoriaId;
          this.loadCategorias(this.igrejaId, this.nomeCategoria, this.pageCategoria, this.linesPerPageCategoria)
          Swal.fire('Cadastro', 'Registro inserido com sucesso!', 'success');
          this.resetModalCategoria();
        },
        error => { }
      )
  }

  public updateCategoria() {
    const categoria: CategoriaDTO = Object.assign(new CategoriaDTO(), this.categoriaForm.value)

    this.categoriaService.update(categoria)
    .pipe(takeUntil(this.destroy$))
      .subscribe(
        () => {
          this.loadCategorias(this.igrejaId, this.nomeCategoria, this.pageCategoria, this.linesPerPageCategoria)
          Swal.fire('Atualização', 'Registro atualizado com sucesso!', 'success');
          this.resetModalCategoria();
        },
        error => { }

      )
  }

  // METODOS CENTROCUSTO
  public createCentroCusto() {
    const centroCusto: CentroCustoDTO = this.centroCustoForm.value;
    this.centroCustoService.create(centroCusto)
    .pipe(takeUntil(this.destroy$))
      .subscribe(
        centroCusto => {
          this.centroCustoId = parseInt(this.extractId(centroCusto.headers.get('location'))); // Extrai o Id da URI retornada do banco
          this.centroCusto.id = this.centroCustoId;
          this.loadCentroCustos(this.igrejaId, this.nomeCentroCusto, this.pageCentroCusto, this.linesPerPageCentroCusto)
          Swal.fire('Cadastro', 'Registro inserido com sucesso!', 'success');
          this.resetModalCentroCusto();
        },
        error => { }
      )
  }

  public updateCentroCusto() {
    const centroCusto: CentroCustoDTO = Object.assign(new CentroCustoDTO(), this.centroCustoForm.value);
    this.centroCustoService.update(centroCusto)
    .pipe(takeUntil(this.destroy$))
      .subscribe(
        () => {
          this.loadCentroCustos(this.igrejaId, this.nomeCentroCusto, this.pageCentroCusto, this.linesPerPageCentroCusto)
          Swal.fire('Atualização', 'Registro atualizado com sucesso!', 'success');
          this.resetModalCentroCusto();
        },
        error => { }

      )
  }

  // METODOS FORMA
  public createForma() {
    const forma: FormaDTO = this.formaForm.value;
    this.formaService.create(forma)
    .pipe(takeUntil(this.destroy$))
      .subscribe(
        forma => {
          this.formaId = parseInt(this.extractId(forma.headers.get('location'))); // Extrai o Id da URI retornada do banco
          this.forma.id = this.formaId;

          this.loadFormas(this.igrejaId, this.nomeForma, this.pageForma, this.linesPerPageForma)
          Swal.fire('Cadastro', 'Registro inserido com sucesso!', 'success');
          this.resetModalForma();
        },
        error => { }
      )
  }

  public updateForma() {
    const forma: FormaDTO = Object.assign(new FormaDTO(), this.formaForm.value);
    this.formaService.update(forma)
    .pipe(takeUntil(this.destroy$))
      .subscribe(
        () => {
          this.loadFormas(this.igrejaId, this.nomeForma, this.pageForma, this.linesPerPageForma)
          Swal.fire('Atualização', 'Registro atualizado com sucesso!', 'success');
          this.resetModalForma();
        },
        error => { }

      )
  }



  ///////////////////////////// Tipo   ///////////////////////////
  onChangeTipoConta(value) {
    this.contaForm.controls['igrejaId'].setValue(GLOBALS.igrejaId)
  }

  onChangeTipoCategoria(value) {
    if (value.value === 'Padrao') {
      this.categoriaForm.controls['igrejaId'].setValue(null);
    } else {
      this.categoriaForm.controls['igrejaId'].setValue(GLOBALS.igrejaId);
    }
  }

  onChangeTipoCentroCusto(value) {
    if (value.value === 'Padrao') {
      this.centroCustoForm.controls['igrejaId'].setValue(null);
    } else {
      this.centroCustoForm.controls['igrejaId'].setValue(GLOBALS.igrejaId);
    }

  }

  onChangeTipoForma(value) {
    if (value.value === 'Padrao') {
      this.formaForm.controls['igrejaId'].setValue(null);
    } else {
      this.formaForm.controls['igrejaId'].setValue(GLOBALS.igrejaId);
    }

  }


  //EXCLUIR CONTA 
  confirmarExclusaoConta(conta: ContaDTO): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir este registro?',
      accept: () => {
        this.excluirConta(conta);
      }
    });
  }

  excluirConta(conta: ContaDTO) {
    this.contaService.delete(conta.id)
    .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadContas(this.igrejaId, this.nomeConta, this.pageConta, this.linesPerPageConta)
        // Swal.fire('Exclusão', 'Registro excluido com sucesso!', 'success');
        this.toastr.success('Exclusão', 'Registro excluido com sucesso!');
        this.messageService.add({ severity: 'success', summary: 'Successo', detail: 'Registro excluido com sucesso!' });
      },
        (error) => this.showError(error))
  }

  // EXCLUIR CATEGORIA
  confirmarExclusaoCategoria(categoria: CategoriaDTO): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir este registro?',
      accept: () => {
        this.excluirCategoria(categoria);
      }
    });
  }

  excluirCategoria(categoria: CategoriaDTO) {
    this.categoriaService.delete(categoria.id)
    .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadCategorias(this.igrejaId, this.nomeCategoria, this.pageCategoria, this.linesPerPageCategoria)
        // Swal.fire('Exclusão', 'Registro excluido com sucesso!', 'success');
        this.toastr.success('Exclusão', 'Registro excluido com sucesso!');
        this.messageService.add({ severity: 'success', summary: 'Successo', detail: 'Registro excluido com sucesso!' });
      },
        (error) => this.showError(error))
  }

  // EXCLUIR CENTROCUSTO
  confirmarExclusaoCentroCusto(centroCusto: CentroCustoDTO): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir este registro?',
      accept: () => {
        this.excluirCentroCusto(centroCusto);
      }
    });
  }

  excluirCentroCusto(centroCusto: CentroCustoDTO) {
    this.centroCustoService.delete(centroCusto.id)
    .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadCentroCustos(this.igrejaId, this.nomeCentroCusto, this.pageCentroCusto, this.linesPerPageCentroCusto)
        // Swal.fire('Exclusão', 'Registro excluido com sucesso!', 'success');
        this.toastr.success('Exclusão', 'Registro excluido com sucesso!');
        this.messageService.add({ severity: 'success', summary: 'Successo', detail: 'Registro excluido com sucesso!' });
      },
        (error) => this.showError(error))
  }

  // EXCLUIR FORMA
  confirmarExclusaoForma(forma: FormaDTO): void { 
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir este registro?',
      accept: () => {
        this.excluirForma(forma);
      }
    });
  }

  excluirForma(forma: FormaDTO) {
    this.formaService.delete(forma.id)
    .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadFormas(this.igrejaId, this.nomeForma, this.pageForma, this.linesPerPageForma)
        // Swal.fire('Exclusão', 'Registro excluido com sucesso!', 'success');
        this.toastr.success('Exclusão', 'Registro excluido com sucesso!');
        this.messageService.add({ severity: 'success', summary: 'Successo', detail: 'Registro excluido com sucesso!' });
      },
        (error) => this.showError(error))
  }


  resetModalConta() {
    this.contaForm.reset();
  }

  resetModalCategoria() {
    this.categoriaForm.reset();
  }

  resetModalCentroCusto() {
    this.centroCustoForm.reset();
  }

  resetModalForma() {
    this.formaForm.reset();
  }

  setModalEdicao() {
    this.pageTitle = "Editando"
  }

  setModalInclusaoCategoria() {
    this.categoriaForm.controls['igrejaId'].setValue(this.igrejaId)
    this.pageTitle = "Nova Categoria"
    if (this.perfil == 'ADMIN') {
      this.categoriaForm.controls['tipoPadraoIgreja'].setValue('Padrao')
      this.formaForm.controls['igrejaId'].setValue(null)
    } else {
      this.categoriaForm.controls['tipoPadraoIgreja'].setValue('Igreja')
      this.categoriaForm.controls['igrejaId'].setValue(this.igrejaId)
    }
    // this.PageTitle = "Inclusao"
  }

  setModalInclusaoConta() {
    this.resetModalConta();
    this.contaForm.controls['igrejaId'].setValue(this.igrejaId)
    this.contaForm.controls['saldoInicial'].setValue("0.00");
    this.contaForm.controls['saldo'].setValue(null)
    this.pageTitle = "Nova Conta"
  }

  setModalInclusaoCentroCusto() {
    this.centroCustoForm.controls['igrejaId'].setValue(this.igrejaId)
    this.pageTitle = "Nova Centro de Custo"
    if (this.perfil == 'ADMIN') {
      this.centroCustoForm.controls['tipoPadraoIgreja'].setValue('Padrao')
      this.formaForm.controls['igrejaId'].setValue(null)
    } else {
      this.centroCustoForm.controls['tipoPadraoIgreja'].setValue('Igreja')
      this.centroCustoForm.controls['igrejaId'].setValue(this.igrejaId)
    }
    // this.PageTitle = "Inclusao"
  }

  setModalInclusaoForma() {
    this.formaForm.controls['igrejaId'].setValue(this.igrejaId)
    this.pageTitle = "Nova Forma"
    if (this.perfil == 'ADMIN') {
      this.formaForm.controls['tipoPadraoIgreja'].setValue('Padrao')
      this.formaForm.controls['igrejaId'].setValue(null)
    } else {
      this.formaForm.controls['tipoPadraoIgreja'].setValue('Igreja')
      this.formaForm.controls['igrejaId'].setValue(this.igrejaId)
    }
  }



  private extractId(location: string): string { // Extrai o Id da URL
    let position = location.lastIndexOf('/');
    return location.substring(position + 1, location.length);
  }


  private showError(error) {
    this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.message });
  }


}
