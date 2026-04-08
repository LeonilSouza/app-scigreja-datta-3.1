// angular import
import { Component, DestroyRef, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SharedModule } from "src/app/theme/shared/shared.module";
import { igrejaIdSignal, nomeIgrejaSignal, perfilSignal } from 'src/app/theme/shared/_helpers/shared-signals';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { Subscription } from 'rxjs';
import { PessoaDTO } from 'src/app/theme/shared/models/pessoa.dto';
import { ClasseDTO } from 'src/app/theme/shared/models/classe.dto';
import { InputMaskModule } from 'primeng/inputmask';
import { SharedService } from 'src/app/theme/shared/services/shared.service';
import { TableModule, Table } from 'primeng/table';
import { SplitButton } from "primeng/splitbutton";
import { MenuItem } from 'primeng/api';
import { ProgressBarModule } from 'primeng/progressbar';
import { DiarioClasseDTO } from 'src/app/theme/shared/models/diario-classe.dto';
import { ToastrService } from 'ngx-toastr';
import { InputNumberModule } from 'primeng/inputnumber';
import { AlunoDTO } from 'src/app/theme/shared/models/aluno.dto';
import { ProfessorDTO } from 'src/app/theme/shared/models/professor.dto';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PessoaService } from 'src/app/theme/shared/services/pessoa.service';
import { LancamentoCargoService } from 'src/app/theme/shared/services/lancamento-cargo.service';
import { LancamentoCargoDTO } from 'src/app/theme/shared/models/lancamento-cargo.dto';
import { DepartamentoService } from 'src/app/theme/shared/services/departamento.service';
import { DepartamentoDTO } from 'src/app/theme/shared/models/departamento.dto';
import { CargoService } from 'src/app/theme/shared/services/cargo.service';
import { CargoDTO } from 'src/app/theme/shared/models/cargo.dto';

@Component({
  selector: 'app-lancamentoCargo-ebd-list-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    ProgressBarModule,
    TableModule,
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
  templateUrl: './lancamento-cargo-list-form.component.html',
  styleUrl: './lancamento-cargo-list-form.component.scss',
  providers: [
    LancamentoCargoService,
    DecimalPipe,
    PessoaService,
    DepartamentoService,
    CargoService
  ]
})
export class LancamentoCargoListFormComponent implements OnInit, OnDestroy {

  @ViewChild('dtLancamentoCargo') grid!: Table;

  private sharedService = inject(SharedService);
  private formBuilder = inject(FormBuilder);
  private toastr = inject(ToastrService);
  private pessoaService = inject(PessoaService);
  private departamentoService = inject(DepartamentoService);
  private cargoService = inject(CargoService);
  private destroyRef = inject(DestroyRef); // 1. Injete a referência de destruição

  // Controle Dialog Modal
  positionLancamentoCargo: 'left' | 'right' | 'top' | 'bottom' | 'center' | 'topleft' | 'topright' | 'bottomleft' | 'bottomright' = 'top';
  visibleLancamentoCargo: boolean = false;

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

  lancamentoCargos = signal<LancamentoCargoDTO[]>([]);

  currentAction!: string;

  lancamentoCargoForm!: FormGroup;
  diarioClasseForm!: FormGroup;
  aulaForm!: FormGroup;
  dataForm!: FormGroup;

  submittingForm: boolean = false;
  pageTitle!: string;
  lancamentoCargo: LancamentoCargoDTO[] = [];
  id!: number;

  imodo: number = 0;
  length: number = 0;

  aulaId: number = 1;

  lancamentoCargoId!: number;

  subscription!: Subscription;

  total: boolean = false;

  totalLancamentoCargoSistema!: number;
  totalLancamentoCargoIgreja!: number;

  diarioClasses: any[] = [];
  diarioClasse: DiarioClasseDTO = new DiarioClasseDTO();

  // pessoas: PessoaDTO[] = [];
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
    if (this.imodo === 0) {
      this.currentAction = 'new';
    } else {
      this.currentAction = 'edit';
    }
  }

  submitForm() {
    this.submittingForm = true;
    if (this.imodo === 0) {
      // this.createLancamentoCargo();
    }
    else {
      // this.updateLancamentoCargo();
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
      nomeDepartamento: [null],
      nomeCargo: [null],
      departamentoId: [null],
      pessoaId: [null, [Validators.required]],
      cargoId: [null, [Validators.required]],
      igrejaId: [this.igrejaId, [Validators.required]]
    });
  }

  // Busca lancamentoCargos selecionadas
  listaLancamentoCargos(igrejaId: any, classeId: any, data: any) {
  }

  // Carrega classes na grade da modal
  loadClassesLazy(event: any) {
    this.linesPerPageModal = event.rows;
    // this.loadClassesModal(this.igrejaId, this.nome.toLowerCase(), pageModal, this.linesPerPageModal);
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

  resetModal() {
    this.lancamentoCargoForm.reset();
  }


  onChangePessoas() {
    this.loadPessoas()
  }

  // private loadClasse(id) {
  //   this.classeService.findById(id)
  //     .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
  //     .subscribe({
  //       next: (response) => {
  //         this.classe = response;
  //         // this.lancamentoCargoForm.controls['nomeClasse'].setValue(this.classe.nome);
  //         // this.lancamentoCargoForm.controls['faixaEtaria'].setValue(this.classe.faixaEtaria);
  //         // this.lancamentoCargoForm.controls['classificacao'].setValue(this.classe.classificacao);
  //         // this.nomeClasse = this.classe.nome;
  //       },
  //       error: () => { }
  //     });
  // }


  // RELATORIOS ///////////////////////////////////////////

  imprimirDiarioClasse() {
    // const url = `${API_CONFIG.baseUrl}/relatorios/diario-classe/?nome=diario-classe&igreja=${this.igrejaId}&data=${this.data}`;
    // window.open(url, '_blank');
  }


  getPrintItems = [
    {
      label: 'Chamada de Alunos - Trimestral',
      icon: 'fas fa-users',
      command: () => {
        // this.setPageTitleModalEbd('Chamada de Alunos - Trimestral');
        this.aulaForm.controls['classeId'].setValue(null);
        // this.aulaForm.controls['ano'].setValue(this.sharedService.anoDataString(this.data));
        // this.classeId.set(null);
      }
    },
    {
      separator: true,
    },
    {
      label: 'Lançamento de cargos dos departamentos',
      icon: 'fas fa-users',
      command: () => {
        // this.aulaForm.controls['ano'].setValue(this.sharedService.anoDataString(this.data));
        // this.setPageTitleModalEbd('Lançamento de cargos');
        this.positionLancamentoCargo = 'top';
      }
    },

    {
      separator: true,
    },
    {
      label: 'Escala de professores',
      icon: 'fas fa-book-reader',
      command: () => {
        // this.dataEscala = this.data;
        this.aulaForm.controls['classeId'].setValue(null);
        // this.aulaForm.controls['dataEscala'].setValue(this.sharedService.anoDataString(this.data))
      },

    },
    {
      separator: true,
    },
    // {
    //   label: 'Lista de Membros',
    //   icon: 'fas fa-users',
    //   command: () => {
    //     // alert('')
    //   },
    //   // target: '_blank',
    //   // url: `${API_CONFIG.baseUrl}/relatorios/list/?nome=chamada-de-obreiros&igreja=${this.igrejaId}`

    // },
    // {
    //   separator: true,
    // },
    // {
    //   label: 'Ficha de membros',
    //   icon: 'fas fa-clipboard-list',
    //   // target: '_blank',
    //   // url: `${API_CONFIG.baseUrl}/relatorios/list/?nome=ficha-de-membros&igreja=${this.igrejaId}`

    // },
    // {
    //   label: 'Ficha em branco',
    //   icon: 'fas fa-book-reader',
    //   // target: '_blank',
    //   // url: `${API_CONFIG.baseUrl}/relatorios/list/?nome=ficha-branco&igreja=${this.igrejaId}`

    // }
  ];


}

