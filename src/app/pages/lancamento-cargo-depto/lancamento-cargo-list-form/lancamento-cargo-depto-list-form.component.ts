import { Component, DestroyRef, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SharedModule } from "src/app/theme/shared/shared.module";
import { igrejaIdSignal, nomeIgrejaSignal, perfilSignal, setorIdSignal } from 'src/app/theme/shared/_helpers/shared-signals';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { Subscription } from 'rxjs';
import { PessoaDTO } from 'src/app/theme/shared/models/pessoa.dto';
import { InputMaskModule } from 'primeng/inputmask';
import { SharedService } from 'src/app/theme/shared/services/shared.service';
import { TableModule, Table } from 'primeng/table';
import { SplitButton } from "primeng/splitbutton";
import { MenuItem } from 'primeng/api';
import { ProgressBarModule } from 'primeng/progressbar';
import { DiarioClasseDTO } from 'src/app/theme/shared/models/diario-classe.dto';
import { ToastrService } from 'ngx-toastr';
import { InputNumberModule } from 'primeng/inputnumber';
import { ProfessorDTO } from 'src/app/theme/shared/models/professor.dto';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PessoaService } from 'src/app/theme/shared/services/pessoa.service';
import { DepartamentoService } from 'src/app/theme/shared/services/departamento.service';
import { DepartamentoDTO } from 'src/app/theme/shared/models/departamento.dto';
import { CargoService } from 'src/app/theme/shared/services/cargo.service';
import { CargoDTO } from 'src/app/theme/shared/models/cargo.dto';
import { LancamentoCargoDeptoService } from 'src/app/theme/shared/services/lancamento-cargo-depto.service';
import { LancamentoCargoDeptoDTO } from 'src/app/theme/shared/models/lancamento-cargo-depto.dto';
import { DatePicker } from 'primeng/datepicker';
import Swal from 'sweetalert2';

export class LancamentoCargoFiltro {
  igrejaId: number = igrejaIdSignal();
  setorId: number = setorIdSignal();
  departamentoId!: number;
  cargoId!: number;
  page: number = 0;
  linesPerPage: number = 10;
}

@Component({
  selector: 'app-lancamentoCargo-ebd-list-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    ProgressBarModule,
    TableModule,
    DatePicker,
    // InputGroup,
    ButtonModule,
    InputNumberModule,
    // RouterLink,
    SharedModule,
    SelectModule,
    InputMaskModule,
    // FloatLabel,
    // JsonPipe
    SplitButton
  ],
  templateUrl: './lancamento-cargo-depto-list-form.component.html',
  styleUrl: './lancamento-cargo-depto-list-form.component.scss',
  providers: [
    LancamentoCargoDeptoService,
    DecimalPipe,
    PessoaService,
    DepartamentoService,
    CargoService
  ]
})
export class LancamentoCargoListFormComponent implements OnInit, OnDestroy {

  @ViewChild('dtLancamentoCargo') dtLancamentoCargo!: any; 
  @ViewChild('dtLancamentoCargo') grid!: Table;


  filtro = new LancamentoCargoFiltro();

  private sharedService = inject(SharedService);
  private formBuilder = inject(FormBuilder);
  private toastr = inject(ToastrService);
  private pessoaService = inject(PessoaService);
  private departamentoService = inject(DepartamentoService);
  private cargoService = inject(CargoService);
  private destroyRef = inject(DestroyRef); // 1. Injete a referência de destruição
  private lancamentoCargoService = inject(LancamentoCargoDeptoService);
  private router = inject(Router);

  // Controle Dialog Modal
  positionLancamentoCargo: 'left' | 'right' | 'top' | 'bottom' | 'center' | 'topleft' | 'topright' | 'bottomleft' | 'bottomright' = 'top';
  visibleLancamentoCargo: boolean = false;

  status = [{ nome: "ATIVO" }, { nome: "INATIVO" }]; //PrimeNG

  nomeIgrejaSignal = nomeIgrejaSignal;
  igrejaIdSignal = igrejaIdSignal;
  perfilSignal = perfilSignal;

  nomeIgreja = nomeIgrejaSignal();
  igrejaId = igrejaIdSignal();
  perfil = perfilSignal();

  loading = signal(false);

  // Índice do primeiro registro da página atual
  first = signal(0);
  rows = 10; // Quantidade de domingos por página

  classeId = signal<number>(0);

  lancamentoCargos = signal<LancamentoCargoDeptoDTO[]>([]);

  currentAction!: string;

  lancamentoCargoForm!: FormGroup;
  diarioClasseForm!: FormGroup;
  aulaForm!: FormGroup;
  dataForm!: FormGroup;
  lancamentoCargoFor!: FormGroup;

  submittingForm: boolean = false;
  pageTitle!: string;
  lancamentoCargo: LancamentoCargoDeptoDTO = new LancamentoCargoDeptoDTO();
  id!: number;

  imodo = signal<number>(0);
  length: number = 0;

  aulaId: number = 1;

  lancamentoCargoId!: number;

  subscription!: Subscription;

  total: boolean = false;

  totalLancamentoCargoSistema!: number;
  totalLancamentoCargoIgreja!: number;

  diarioClasses: any[] = [];
  diarioClasse: DiarioClasseDTO = new DiarioClasseDTO();

  pessoas = signal<PessoaDTO[]>([]);
  departamentos = signal<DepartamentoDTO[]>([]);

  pessoa: PessoaDTO = new PessoaDTO();
  pessoaId: number | undefined;

  professores: ProfessorDTO[] = [];

  cargos = signal<CargoDTO[]>([]);

  error = '';

  printItems: MenuItem[] = [];

  public page = 0;
  public pageModal = 0;

  public linesPerPage = 10;
  public linesPerPageModal = 12;

  totalRegistros: number = 0;

  public nome = '';

  constructor() { }

  ngOnInit(): void {
    this.setCurrentAction();
    this.buildLancamentoCargoForm();
    this.loadPessoas();
    this.loadDepartamentos();
    this.loadCargos();
    this.printItems = this.getPrintItems;
  };

  // Retorna o trimestre atual 
  getTrimestreAtual(): number {
    return Math.floor(((new Date().getMonth() + 3) / 3) - 1);
  }

  setPageTitleLancamentoCargos() {
    this.positionLancamentoCargo = 'top';
    this.pageTitle = "Geração de lancamentoCargos";
    this.aulaForm.controls['licao'].setValue(null);
    this.aulaForm.controls['tema'].setValue(null);
    this.aulaForm.controls['data'].setValue(this.sharedService.dataAtualFormatada());
  }


  public setCurrentAction() {
    if (this.imodo() === 0) {
      this.currentAction = 'new';
    } else {
      this.currentAction = 'edit';
    }
  }

  submitForm() {
    this.submittingForm = true;
    if (this.imodo() === 0) {
      this.createLancamentosCargos();
    }
    else {
      this.updateLancamentosCargos();
    }
  }


  ngOnDestroy() {
    // console.log('Limpando recursos do componente de Frequência...');
    // Se você tiver alguma Subscription manual (this.subscription.unsubscribe())
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private buildLancamentoCargoForm() {
    this.lancamentoCargoForm = this.formBuilder.group({
      id: [null],
      nomePessoa: [null, [Validators.required]],
      nomeConjunto: [null],
      nomeIgreja: [null],
      nomeDepartamento: [null],
      nomeCargo: [null],
      dataPosse: [null],
      dataDesligamento: [null],
      status: ['ATIVO'],
      pessoaId: [null, [Validators.required]],
      cargoId: [null, [Validators.required]],
      departamentoId: [null, [Validators.required]],
      igrejaId: [this.igrejaId, [Validators.required]]
    });
  }


  // Carrega classes na grade da modal
  loadLancamentoCargoLazy(event: any) {
    this.filtro.page = event!.first! / event!.rows!;
    this.filtro.linesPerPage = event.rows!;
    // this.linesPerPageModal = event.rows;
    this.loadLancamentosCargos();
  }

  imprimirCargoDepto() {
    // this.carregando = true;
    this.toastr.info('Preparando o documento PDF...', 'Relatório');

    this.lancamentoCargoService.imprimirCargosDepto(this.filtro).subscribe({
      next: (blob: Blob) => {
        // Cria um link temporário seguro na memória do navegador para o arquivo PDF
        const urlFile = window.URL.createObjectURL(blob);

        // Abre o PDF diretamente em uma nova aba com o visualizador nativo
        window.open(urlFile, '_blank');

        // this.carregando = false;
      },
      error: (err) => {
        // this.carregando = false;
        this.toastr.error('Não foi possível gerar a impressão do relatório.');
        console.error(err);
      }
    });
  }

  loadLancamentosCargos() {
    this.lancamentoCargoService.getPageLancamentoCargoFromIgreja(this.filtro)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: (response: any) => {
          this.lancamentoCargos.set((response as any).content.sort((a: any, b: any) => b.id - a.id));
           this.totalRegistros = response.totalElements;
          //  this.grid.reset();
          // this.pesquisa = true; // Para permitir a paginação na primeira carga
          // this.getPrinters();
        },
        error: (error) => {
          this.error = error;
        }
      });
  }

  loadLancamentoCargo(lancamentoCargo: LancamentoCargoDeptoDTO) {
    this.lancamentoCargoId = lancamentoCargo.id ?? 0;
    this.lancamentoCargoService.findById(this.lancamentoCargoId)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: (response) => {
          this.lancamentoCargo = response;
          this.lancamentoCargoForm.patchValue(this.lancamentoCargo)   // binds loaded  
          this.lancamentoCargoForm.controls['igrejaId'].setValue(this.igrejaId);
          // this.contaId = (response as any)['conta'].id;
          // this.contaId = (response as any)['forma'].id;
          // this.contaIdTransferencia = response.contaIdTransferencia ?? 0;
          // this.formaIdTransferencia = response.formaIdTransferencia ?? 0;
          // this.contaId = (response as any)['categoria'].id;
          this.lancamentoCargoForm.controls['nomePessoa'].setValue(this.lancamentoCargo.nomePessoa);
          // this.lancamentoForm.controls['categoriaId'].setValue((response as any)['categoria'].id);
          // this.lancamentoForm.controls['contaId'].setValue((response as any)['conta'].id);
          // this.lancamentoForm.controls['formaId'].setValue((response as any)['forma'].id)
          // this.lancamentoForm.controls['valor'].setValue(Math.abs(this.lancamentoForm.controls['valor'].value));

        },
        error: () => { }
      })
  }

  public createLancamentosCargos() {
    this.lancamentoCargoForm.controls['nomePessoa'].setValue(this.sharedService.formataNome(this.lancamentoCargoForm.controls['nomePessoa'].value));
    
    // 1. Captura os dados numéricos do formulário
    const lancamentoCargo: LancamentoCargoDeptoDTO = this.lancamentoCargoForm.value;
    
    // 🔥 O PULO DO GATO DA INTERFACE: 
    // Localiza os nomes textuais nas listas da memória para preencher o DTO do Signal
    const pes = this.pessoas().find(p => p.id === lancamentoCargo.pessoaId);
    const car = this.cargos().find(c => c.id === lancamentoCargo.cargoId);
    const dep = this.departamentos().find(d => d.id === lancamentoCargo.departamentoId);

    // Injeta os nomes no objeto local que vai para a Grid visível
    if (pes) lancamentoCargo.nomePessoa = pes.nome;
    if (car) lancamentoCargo.nomeCargo = car.nome;
    if (dep) lancamentoCargo.nomeDepartamento = dep.nome;
    
    // Força o status ativo visual se vier em branco
    if (!lancamentoCargo.status) lancamentoCargo.status = 'ATIVO';

    // 2. Dispacha para o servidor Heroku salvar no banco de dados (O Java só lê os IDs)
    this.lancamentoCargoService.create(lancamentoCargo)
      .subscribe({
         next: (response: any): void => {
          if (response && response.headers && response.headers.get('location')) {
            this.id = parseInt(this.extractId(response.headers.get('location'))); 
            lancamentoCargo.id = this.id;
            
            // 1. Mensagem de Sucesso na tela
            this.toastr.success('Registro Inserido com sucesso!', 'Lançamento Cargo');
            
            // 2. Fecha o modal de cadastro
            this.visibleLancamentoCargo = false; 

            // 3. 🔥 O PULO DO GATO: Reseta a grid e recarrega os dados do Heroku do zero!
            // Isso atualiza o totalRegistros e reconstrói as páginas do PrimeNG perfeitamente.
            if (this.dtLancamentoCargo) {
              this.dtLancamentoCargo.reset(); // Zera o paginador voltando para a página 1
            } else {
              this.loadLancamentosCargos(); // Fallback caso a referência da tabela não esteja em escopo
            }
          }
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Erro ao salvar nova cargo.');
        }
      });
  }

  public updateLancamentosCargos() {
    const lancamentoCargo: LancamentoCargoDeptoDTO = Object.assign(
      new LancamentoCargoDeptoDTO(),
      this.lancamentoCargoForm.value
    );
    this.lancamentoCargoService.update(lancamentoCargo)
      .subscribe(() => {
        this.actionsForSuccess();
        this.toastr.success('Registro Atualizado com sucesso!', 'Lançamento Cargo');
        // Swal.fire('Atualização', 'Registro atualizado com sucesso!', 'success');
        this.grid.reset();
        // this.lancamentoCargos();
      }),
      (error: any) => {
        this.error = error;
      }
  }

  exclusaoLancamentoCargo(lancamentoCargo: LancamentoCargoDeptoDTO) {
      Swal.fire({
        title: 'Exclusão',
        text: 'Tem certeza que deseja excluir este registro?',
        position: 'top',
        showCloseButton: true,
        showCancelButton: true,
      }).then((willDelete) => {
        if (willDelete.dismiss) {
          // Swal.fire('Exclusão Cancelada', 'Seu registro está seguro', 'success');
        } else {
          this.lancamentoCargoService.excluir(lancamentoCargo.id ?? 0)
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
      });
    }

  loadPessoas() {
    const situacaoCadastral = 'Ativo'
    this.pessoaService.getPessoasAtivasFromIgreja(this.igrejaId, situacaoCadastral)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: (response) => {
          this.pessoas.set(response);
        },
        error: () => { }
      });
  }

  loadDepartamentos() {
    this.departamentoService.getListDepartamentoFromIgreja(this.igrejaId)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: (response) => {
          this.departamentos.set(response);
        },
        error: () => { }
      });
  }
  // Chame este método sempre que o usuário mudar uma seleção na tela
   onChangeDepartamento(event: any) {
    const id = event.value;

    // 1. Seta o ID do departamento estritamente no formulário de cadastro
    this.lancamentoCargoForm.controls['departamentoId'].setValue(id);

    if (id) {
      // Busca o objeto do Departamento de dentro do Signal já em memória
      const departamento = this.departamentos().find(d => d.id === id);
      
      if (departamento) {
        // Se estiver no modo de inserção (imodo === 0), puxa o nome do conjunto padrão cadastrado no depto
        if (this.imodo() === 0) {
          this.lancamentoCargoForm.controls['nomeConjunto'].setValue(departamento.nomeConjunto);
        }
      }
    }
  }

  loadCargos() {
    this.cargoService.getListCargoFromIgreja(this.igrejaId)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: (response) => {
          this.cargos.set(response);
        },
        error: () => { }
      });
  }

  onChangePessoas(event: { value: any; }) {
    // pega o id e nome 
    const id = event.value;
    if (id) {
      //Busca o objeto da pessoa de dentro do Signal já em memória.
      const pessoa = this.pessoas().find(p => p.id === id);

      if (pessoa) {
        this.lancamentoCargoForm.controls['pessoaId'].setValue(pessoa.id);

        //Usar a string do nome formatada pelo sharedService:
        const nomeFormatado = this.sharedService.formataNome(pessoa.nome);
        this.lancamentoCargoForm.controls['nomePessoa'].setValue(nomeFormatado);
      }
    }
  }

  onChangeCargos(event: { value: any; }) {
    this.lancamentoCargoForm.controls['cargoId'].setValue(event.value);;

  }

  // RELATORIOS ///////////////////////////////////////////

  getPrintItems = [
    {
      label: 'Cargos departamentos',
      icon: 'fas fa-users',
      command: () => {
        this.imprimirCargoDepto();
      }
    },
    {
      separator: true,
    },
    {
      separator: true,
    }
  ];

  private extractId(location: string): string { // Extrai o Id da URL
    let position = location.lastIndexOf('/');
    return location.substring(position + 1, location.length);
  }

  showError() {
    // this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro no servidor tente mais tarde' });
  }

  // resetModal() {
  //   this.lancamentoForm.reset();
  //   this.filtraCategorias(""); // Para deixar o combo de Categorias de Receitas de despesas vazia quando retorna da edição de lançamentos
  //   this.crtCategoria = 3;
  // }

  resetModal() {
    this.lancamentoCargoForm.reset();
  }

  setModalEdicao() {
    this.pageTitle = "Editando Movimento".toUpperCase();
    this.imodo.set(1);
  }

  setModalInclusao() {
    this.resetModal();
    this.imodo.set(0);
    
    this.pageTitle = "Novo Cargo".toUpperCase();
    this.lancamentoCargoForm.controls['nomePessoa'].setValue(this.pessoa.nome);
    this.lancamentoCargoForm.controls['igrejaId'].setValue(this.igrejaId);
    this.lancamentoCargoForm.controls['status'].setValue('ATIVO');
    this.lancamentoCargoForm.controls['dataPosse'].setValue(this.sharedService.dataAtualFormatada());
  }

  // METODOS PRIVADOS

  private actionsForSuccess() {
    const path: string = 'cargos-deptos';
    this.router.navigateByUrl(path);
    // Swal.fire('Cadastro', 'Registro inserido com sucesso!', 'success');
    this.visibleLancamentoCargo = false;
  }

  private actionsForError(error: { status: number; _body: string }) {
    this.showError();

    this.submittingForm = false;
  }
}
