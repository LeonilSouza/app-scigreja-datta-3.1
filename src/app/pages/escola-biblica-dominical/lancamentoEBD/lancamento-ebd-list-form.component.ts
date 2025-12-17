// angular import
import { AfterContentChecked, AfterViewInit, Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SharedModule } from "src/app/theme/shared/shared.module";
import { igrejaIdSignal, nomeIgrejaSignal, perfilSignal } from 'src/app/theme/shared/_helpers/shared-signals';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { Subject, Subscription, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';
import { PessoaDTO } from 'src/app/theme/shared/models/pessoa.dto';
import { ClasseDTO } from 'src/app/theme/shared/models/classe.dto';
import { ClasseService } from 'src/app/theme/shared/services/classe.service';
import { InputMaskModule } from 'primeng/inputmask';
import { SharedService } from 'src/app/theme/shared/services/shared.service';
import { LancamentoEbdDTO } from 'src/app/theme/shared/models/lancamento-ebd.dto';
import { LancamentoEbdService } from 'src/app/theme/shared/services/lancamentoEbd.service';
import { DatePicker } from 'primeng/datepicker';
import { FloatLabel } from 'primeng/floatlabel';
import { TableModule, Table } from 'primeng/table';
import { SplitButton } from "primeng/splitbutton";
import { API_CONFIG } from 'src/app/app-config';
import { MenuItem } from 'primeng/api';
import { MatriculaAlunoDTO } from 'src/app/theme/shared/models/matricula-aluno.dto';
import { MatriculaAlunoService } from 'src/app/theme/shared/services/matricula-aluno.service';
import { MessageService } from 'primeng/api';
import { ProgressBarModule } from 'primeng/progressbar';
import { DiarioClasseDTO } from 'src/app/theme/shared/models/diario-classe.dto';
import { DiarioClasseService } from 'src/app/theme/shared/services/diario-classe.service';
import { ToastrService } from 'ngx-toastr';
import { InputNumberModule } from 'primeng/inputnumber';
import { Fluid } from 'primeng/fluid';
import { UiModalComponent } from 'src/app/theme/shared/components/modal/ui-modal/ui-modal.component';

// project import

@Component({
  selector: 'app-lancamento-ebd-list-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    ProgressBarModule,
    TableModule,
    // InputGroup,
    ButtonModule,
    InputNumberModule,
    Fluid,
    // RouterLink,
    SharedModule,
    SelectModule,
    InputMaskModule,
    DatePicker,
    FloatLabel
    // JsonPipe
    ,
    SplitButton
  ],
  templateUrl: './lancamento-ebd-list-form.component.html',
  styleUrl: './lancamento-ebd-list-form.component.scss',
  providers: [
    LancamentoEbdService,
    DecimalPipe,
    ClasseService,
    MatriculaAlunoService,
    MessageService,
    DiarioClasseService
  ]
})
export class LancamentoEbdListFormComponent implements OnInit, AfterContentChecked, AfterViewInit {

  @ViewChild('meuInput') totalMatriculados: ElementRef;

   // Fechamento da modal no HTML  aqui pelo componente (#modalLancamento)
  @ViewChild('modalLancamento') public modalLancamento: UiModalComponent;

  ngAfterViewInit() {

  }

  nomeIgrejaSignal = nomeIgrejaSignal;
  igrejaIdSignal = igrejaIdSignal;
  perfilSignal = perfilSignal;

  nomeIgreja = nomeIgrejaSignal();
  igrejaId = igrejaIdSignal();
  perfil = perfilSignal();

  linhaSelecionada: number;

  lancamentoSignal = signal(0);
  lancamentos = this.lancamentoSignal();

  private destroy$: Subject<void> = new Subject<void>();

  private classeService = inject(ClasseService);
  private router = inject(Router);
  private sharedService = inject(SharedService);
  private formBuilder = inject(FormBuilder);
  private lancamentoEbdService = inject(LancamentoEbdService);
  private matriculaAlunoService = inject(MatriculaAlunoService);
  private diarioClasseService = inject(DiarioClasseService);
  private toastr = inject(ToastrService);


  currentAction!: string;
  lancamentoEbdForm!: FormGroup;
  diarioClasseForm!: FormGroup;
  submittingForm: boolean = false;
  pageTitle!: string;
  lancamentoEbd: LancamentoEbdDTO = new LancamentoEbdDTO();
  id!: number;

  imodo: number = 0;

  length: number = 0;

  lancamentoId!: number;

  subscription!: Subscription;

  total: boolean = false;


  @ViewChild('dtlancamentoEbd') grid!: Table;

  @ViewChild('dtDiarioClasse') gridDiario!: Table;

  totalLancamentoEbdSistema!: number;
  totalLancamentoEbdIgreja!: number;

  lancamentoEbds: any[] = [];

  diarioClasses: any[] = [];
  diarioClasse: DiarioClasseDTO = new DiarioClasseDTO();

  pessoas: PessoaDTO[] = [];
  pessoa: PessoaDTO = new PessoaDTO();
  pessoaId: number;

  data!: string;

  classes: ClasseDTO[] = [];
  classesModal: ClasseDTO[] = []; //Separado para Modal de Lancamentos

  alunos: MatriculaAlunoDTO[] = [];

  classe: ClasseDTO = new ClasseDTO();
  classeId: number = 0;
  nomeClasse: string;

  frequencia: string = 'Aguardando-1';

  error = '';

  selectedClasse: number;

  printItems: MenuItem[];

  public page = 0;
  public pageModal = 0;
  public pageModalDiario = 0;

  public linesPerPage = 10;
  public linesPerPageModal = 12;
  public linesPerPageModalDiario = 12;

  totalRegistros: number = 0;
  totalRegistrosModalClasse: number = 0;
  totalRegistrosModalDiario: number = 0;

  public nome = '';

  constructor(
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.setCurrentAction();
    this.buildLancamentoEbdForm();
    this.buildDiarioClasseForm();
    this.loadAlunos();
    this.printItems = this.getPrintItems;
    // this.grid.reset();//atualiza a tabela do primeng
    this.data = this.sharedService.dataAtualFormatada();
    this.lancamentoEbdForm.controls['data'].setValue(this.data);
  };

  ngAfterContentChecked() {
    //  this.setPageTitle();
  }

  setPageTitleLancamentos() {
    this.pageTitle = "Geração de lançamentos";
  }

  setPageTitleDiarioClasse() {
    this.pageTitle = "Diario de Classe";
  }

  public setCurrentAction() {
    if (this.imodo == 0) {
      this.currentAction = 'new';
    } else this.currentAction = 'edit';
  }

  submitForm() {
    this.submittingForm = true;
    if (this.imodo === 0)
      this.createLancamentoEbd();
  }

  submitFormDiarioClasse() {
    this.submittingForm = true;
    this.updateDiarioClasse();
  }


  private buildLancamentoEbdForm() {
    this.lancamentoEbdForm = this.formBuilder.group({
      id: [null],
      nomeAluno: [null],
      nomeClasse: [null],
      anoLetivo: [null],
      licao: [null, [Validators.required]],
      tema: [null, [Validators.required]],
      classificacao: [null],
      trimestre: [null],
      frequencia: [null],
      data: [this.sharedService.dataAtualFormatada()],
      p: [null],
      f: [null],
      classeId: [null],
      pessoaId: [null],
      matriculaAlunoId: [null],
      igrejaId: [this.igrejaId, [Validators.required]]
    });
  }

  private buildDiarioClasseForm() {
    this.diarioClasseForm = this.formBuilder.group({
      id: [null],
      nomeProfessor: [null],
      nomeClasse: [null],
      classificacao: [null],
      licao: [null, [Validators.required]],
      tema: [null, [Validators.required]],
      data: [this.sharedService.dataAtualFormatada()],
      totalOfertas: [null, [Validators.required]],
      totalMatriculados: [null, [Validators.required]],
      totalPresentes: [null],
      totalAusentes: [null, [Validators.required]],
      totalVisitantes: [null, [Validators.required]],
      totalRevistas: [null, [Validators.required]],
      totalBiblias: [null, [Validators.required]],
      percentualPresentes: [null],
      igrejaId: [this.igrejaId, [Validators.required]]
    });
  }


  loadLancamentoEbdLazy(event: any) {
    const page = event!.first! / event!.rows!; // divisão para encontrar a paginações
    this.page = page;
    this.linesPerPage = event.rows;
    this.classeService.getListClasseFromIgreja(this.igrejaId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.classes = response;
          this.totalRegistros = response.totalRegistros;
          if (response.length > 0 && this.linhaSelecionada !== null) {
            this.classeId = this.classes[0].id;
            this.nomeClasse = this.classes[0].nome;
          }
          // Define o primeiro item da lista como o valor inicial

          if (this.classes && this.classes.length > 0 && this.linhaSelecionada !== null) {
            this.selectedClasse = this.classes[0].id;
          }

          if (this.frequencia == 'Aguardando-1') {
            this.loadTodosLancamentoEbds(this.igrejaId, this.classeId, this.data, page, this.linesPerPage)
          } else {
            this.loadLancamentoEbds(this.igrejaId, this.classeId, this.data, this.frequencia, page, this.linesPerPage)
          }
        }
      });
  }

  // Busca frequencias selecionadas
  loadLancamentoEbds(igrejaId, classeId, data, frequencia, page, linesPerPage) {
    this.lancamentoEbdService.getByPageLancamentoEbdFromIgreja(igrejaId, classeId, data, frequencia, page, linesPerPage)
      .subscribe({
        next: (response) => {
          this.lancamentoEbds = response['content'].sort((a: { id: number; }, b: { id: number; }) => b.id - a.id);
          this.totalRegistros = response.totalElements;

        },
        error: (error) => {
          this.error = error;
        }
      });
  }

  // Busca todas as frequequencias 
  loadTodosLancamentoEbds(igrejaId, classeId, data, page, linesPerPage) {
    this.lancamentoEbdService.getByPageTodosLancamentoEbdFromIgreja(igrejaId, classeId, data, page, linesPerPage)
      .subscribe({
        next: (response) => {
          this.lancamentoEbds = response['content'].sort((a: { id: number; }, b: { id: number; }) => b.id - a.id);
          this.totalRegistros = response.totalElements;

        },
        error: (error) => {
          this.error = error;
        }
      });
  }


  // Carrega classes na grade da modal
  loadClassesLazy(event: any) {
    const pageModal = event!.first! / event!.rows!; // divisão para encontrar a paginações 
    this.linesPerPageModal = event.rows;
    this.loadClassesModal(this.igrejaId, this.nome.toLowerCase(), pageModal, this.linesPerPageModal);
  }

  // Carrega classes na grade da modal
  loadClassesModal(igrejaId: number, nome: string, pageModal: number, linesPerPageModal: number) {
    this.classeService.getByPageClasseFromIgreja(igrejaId, nome, pageModal, linesPerPageModal)
      .subscribe({
        next: (response) => {
          this.classesModal = response['content'].sort((a: { id: number; }, b: { id: number; }) => b.id - a.id);
          this.totalRegistrosModalClasse = response.totalElements
        },
        error: (error) => {
          this.error = error;
        }
      });
  }

  // Carrega diarioClasses na grade da modal
  loadDiarioClassesLazy(event: any) {
    const pageModalDiario = event!.first! / event!.rows!; // divisão para encontrar a paginações 
    this.linesPerPageModalDiario = event.rows;
    this.loadDiarioClassesModal(this.igrejaId, this.data, pageModalDiario, this.linesPerPageModalDiario);
  }

  // Carrega diarioClasses na grade da modal
  loadDiarioClassesModal(igrejaId: number, data: string, pageModalDiario: number, linesPerPageModalDiario: number) {
    this.diarioClasseService.getByPageDiarioClasseFromIgreja(igrejaId, data, pageModalDiario, linesPerPageModalDiario)
      .subscribe({
        next: (response) => {
          this.diarioClasses = response['content'].sort((a: { id: number; }, b: { id: number; }) => a.id - b.id);
          this.totalRegistrosModalDiario = response.totalElements
        },
        error: (error) => {
          this.error = error;
        }
      });
  }

  loadDiarioClasse(diarioClasse) {    // Recebendo item do ngFor do Html passado como parametro no evento (click)="loadMinisterio(item)"
    this.diarioClasse = this.diarioClasses.filter(diario => diario.id == diarioClasse.id)[0];
    this.diarioClasseForm.patchValue(this.diarioClasse)

  }

  linhaClicadaDiario(diarioClasse: any) {
    this.linhaSelecionada = diarioClasse.id;
  }

  linhaClicadaLancamento(lancamentoEbd: any) {
    this.lancamentoEbdForm.controls['nomeClasse'].setValue(lancamentoEbd.nome);
    this.linhaSelecionada = lancamentoEbd.id;
    this.classeId = lancamentoEbd.classeId;
    this.lancamentoEbd = lancamentoEbd;
  }

  marcaPresenteAusente(frequencia: any) {
    switch (frequencia) {
      case "Presente":
        this.frequencia = frequencia;
        if (this.linhaSelecionada) {
          this.lancamentoEbd.frequencia = "Presente";
          this.lancamentoEbd.p = 1;
          this.lancamentoEbd.f = 0;
          this.updateLancamentoEbd();
          this.linhaSelecionada = null;
          this.frequencia = "Aguardando"
        }
        break;

      case "Ausente":
        this.frequencia = frequencia;
        if (this.linhaSelecionada) {
          this.lancamentoEbd.frequencia = "Ausente";
          this.lancamentoEbd.p = 0;
          this.lancamentoEbd.f = 1;
          this.updateLancamentoEbd();
          this.linhaSelecionada = null;
          this.frequencia = "Aguardando"
        }
        break;

      case "Aguardando":
        this.frequencia = frequencia;
        this.loadLancamentoEbds(this.igrejaId, this.classeId, this.data, this.frequencia, this.page, this.linesPerPage)

        break;

      case "Presentes":
        this.frequencia = 'Presente';
        this.loadLancamentoEbds(this.igrejaId, this.classeId, this.data, this.frequencia, this.page, this.linesPerPage)

        break;

      case "Ausentes":
        this.frequencia = "Ausente"
        this.loadLancamentoEbds(this.igrejaId, this.classeId, this.data, this.frequencia, this.page, this.linesPerPage)
        break;

      default:
    }
  }

  resetModal() {
    this.lancamentoEbdForm.reset();
  }

  resetModalDiario() {
    this.diarioClasseForm.reset();
    this.diarioClasseForm.controls['igrejaId'].setValue(this.igrejaId);
  }

  loadLancamento(lancamento: LancamentoEbdDTO) {
    if (this.imodo === 1) {
      this.lancamentoId = lancamento.id;
      this.lancamentoEbdService.getById(this.lancamentoId).subscribe(
        (response) => {
          this.lancamentoEbd = response;
          this.lancamentoEbdForm.patchValue(this.lancamentoEbd); // binds loaded classe data 
        },
        (_error) => { }
      );
    } else {
      this.resetModal()
    }
  }

  loadLancamentoEbd(lancamentoEbd: LancamentoEbdDTO) {
    if (this.imodo === 1) {
      this.lancamentoEbd = lancamentoEbd;
      this.lancamentoEbdForm.patchValue(lancamentoEbd);
    } else {
      this.resetModal()
      this.lancamentoEbdForm.controls['igrejaId'].setValue(this.igrejaId);
      this.lancamentoEbdForm.controls['status'].setValue('Ativo');

    }
  }

  setData() {
    this.resetModal();
    this.lancamentoEbdForm.controls['data'].setValue(this.sharedService.dataAtualFormatada());
    this.lancamentoEbdForm.controls['igrejaId'].setValue(this.igrejaId);
  }

  loadDiarioClasses() {
    if (this.totalRegistros) {
      this.loadDiarioClassesModal(this.igrejaId, this.data, this.pageModalDiario, this.linesPerPageModalDiario);

    } else {
      Swal.fire({
        title: 'Informação',
        text: 'Não existe Lançamentos para esta data !!!',
        icon: 'info',
        showCloseButton: true,
        showCancelButton: false
      });
    }
  }

  onChangeLancamentoEbd(id) {
    this.classeId = id.value;
    this.loadTodosLancamentoEbds(this.igrejaId, this.classeId, this.data, this.page, this.linesPerPage);
  }

  onCloseData(data) {
    this.data = data
    this.lancamentoEbdForm.controls['data'].setValue(data);
    this.loadTodosLancamentoEbds(this.igrejaId, this.classeId, this.data, this.page, this.linesPerPage);
  }

  onCloseDataModal(data) {
    this.data = data
  }

  onChangeClasse(id) {
    this.loadClasse(id.value)
  }

  private loadClasse(id) {
    this.classeService.findById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.classe = response;
          this.lancamentoEbdForm.controls['nomeClasse'].setValue(this.classe.nome);
          this.lancamentoEbdForm.controls['faixaEtaria'].setValue(this.classe.faixaEtaria);
          this.lancamentoEbdForm.controls['classificacao'].setValue(this.classe.classificacao);
          this.nomeClasse = this.classe.nome;
        },
        error: () => { }
      });
  }

  loadAlunos() {
    this.matriculaAlunoService.getListMatriculaAlunoFromIgreja(this.igrejaId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.alunos = response;
        },
        error: () => { }
      });
  }

  updateDiarioClasse() {
    const diarioClasse: DiarioClasseDTO = Object.assign(new DiarioClasseDTO(),
      this.diarioClasseForm.value);
    diarioClasse.totalPresentes = (diarioClasse.totalMatriculados - diarioClasse.totalAusentes)
    this.diarioClasseService.update(diarioClasse)
      .subscribe(() => {
        this.gridDiario.reset();//atualiza a tabela do primeng
        this.toastr.success('Registro Atualizado com sucesso');
        // Swal.fire('Atualização', 'Registro atualizado com sucesso!', 'success');
      }),
      (error: any) => (error);
  }

  updateLancamentoEbd() {
    const lancamentoEbd: LancamentoEbdDTO = Object.assign(new LancamentoEbdDTO(), this.lancamentoEbd);
    this.lancamentoEbdService.update(lancamentoEbd)
      .subscribe(() => {
        this.grid.reset();//atualiza a tabela do primeng
        this.frequencia = "Aguardando"
        this.toastr.success('Lançamento Atualizado com sucesso');
      }),
      (error: any) => (error);
  }

  // INICIO ROTINA DE LANÇAMENTOS de ALUNOS e DIARIO  de CLASSE
  public createLancamentoEbd() {
    if (this.classes && this.classes.length > 0) {
      this.lancamentoEbdService.verificarDataLancamento(this.igrejaId, this.data)
        .subscribe({
          next: (response) => {
            this.lancamentos = response.length;

            if (this.lancamentos === 0) {

              // O resultado final será um array "flat" (plano) de alunos para lançamentos
              const alunosNaRaizDoArray = this.classes.flatMap(classe => {

                // 1. Encontra todos os alunos para esta classe específica
                const alunosDestaClasse = this.alunos.filter(aluno => {
                  return (aluno.classeId === classe.id && classe.status === 'Ativo');
                });

                // 2. Transforma CADA aluno encontrado, adicionando a informação da classe
                const alunosComInfoClasse = alunosDestaClasse.map(aluno => {
                  return {
                    ...aluno, // Copia todas as propriedades do aluno (spread syntax)
                    nomeClasse: aluno.nomeClasse, // Adiciona o nome da classe diretamente
                    data: this.lancamentoEbdForm.controls['data'].value, // Adiciona o data  diretamente ...
                    licao: this.lancamentoEbdForm.controls['licao'].value,
                    tema: this.lancamentoEbdForm.controls['tema'].value.toUpperCase(),
                    frequencia: 'Aguardando',
                    matriculaAlunoId: aluno.id,
                    anoLetivo: this.sharedService.retornaAno(this.data),
                    trimestre: this.sharedService.retornaTrimestre(this.data)
                  };
                });

                // O flatMap automaticamente achata os arrays retornados aqui
                return alunosComInfoClasse;
              });

              // O array 'alunosNaRaizDoArray' é o que contém os alunos processados:
              const novosRegistrosDeAlunos = alunosNaRaizDoArray;

              const contagemMap = novosRegistrosDeAlunos.reduce((acc, lancamento) => {
                const id = lancamento.classeId;
                acc[id] = (acc[id] || 0) + 1;
                return acc;
              }, {});

              // --- PASSO 2: Percorrer as classes de origem e buscar o total no mapa ---
              const resultadoComTotais = this.classes.map(classe => {
                return {
                  ...classe,
                  // Busca o total no mapa usando o ID da classe; se não existir, retorna 0
                  totalAlunos: contagemMap[classe.id] || 0
                };
              });

              // Adiciona todos os elementos do novo array ao final do array existente
              this.lancamentoEbds.push(...novosRegistrosDeAlunos);


              // GRAVAÇAO DE LANCAMENTOS NO BANCO

              this.lancamentoEbdService.salvarLancamentos(this.lancamentoEbds)
                .subscribe({
                  next: () => {
                    this.grid.reset();//atualiza a tabela do primeng
                    this.actionsForSuccess();
                  },
                  error: () => { }
                });


              // LANÇAMENTO NA TABELA DIARIO ////////////////////////////////////////////

              // 4. Percorrendo o registro de Classe com total de alunos e lançando na Tabela DiarioClasse

              resultadoComTotais.forEach(classe => {
                // Para cada instância, extraímos os dados e adicionamos à tabela de destino DiarioClasse
                this.diarioClasses.push({
                  classeId: classe.id,
                  igrejaId: this.igrejaId,
                  data: this.lancamentoEbdForm.controls['data'].value,
                  nomeClasse: classe.nome,
                  nomeProfessor: null,
                  classificacao: classe.classificacao,
                  licao: this.lancamentoEbdForm.controls['licao'].value,
                  tema: this.lancamentoEbdForm.controls['tema'].value.toUpperCase(),
                  totalMatriculados: contagemMap[classe.id] || 0, //Pulo do gato
                  totalAusentes: null,
                  totalPresentes: null,
                  totalVisitantes: null,
                  totalBiblias: null,
                  totalRevistas: null,
                  percentualPresentes: null,
                  totalOfertas: 0
                });
              });

              // GRAVAÇAO DO DIARIO DE CLASSE NO BANCO
              this.diarioClasseService.salvarDiarioClasse(this.diarioClasses)
                .subscribe({
                  next: () => {
                  },
                  error: () => { }
                });

            } else {
              Swal.fire({
                title: 'Informação',
                text: 'Já existe Lançamentos para esta data !!!',
                icon: 'warning',
                showCloseButton: true,
                showCancelButton: false
              });
            }
          },
          error: () => {
          }
        });

    } else {
      Swal.fire({
        title: 'Informação',
        text: 'Nenhuma classe cadastrada! !!!',
        icon: 'warning',
        showCloseButton: true,
        showCancelButton: false
      });
    }
  }

  // FIM ROTINA DE LANÇAMENTOS


  getPrintItems = [
    {
      label: 'Lista de obreiros',
      icon: 'fas fa-users',
      target: '_blank',
      url: `${API_CONFIG.baseUrl}/relatorios/list/?nome=lista-de-obreiros&igreja=${this.igrejaId}`

    },
    {
      separator: true,
    },
    {
      label: 'Lista de Membros',
      icon: 'fas fa-users',
      command: () => {
        // alert('')
      },
      // target: '_blank',
      // url: `${API_CONFIG.baseUrl}/relatorios/list/?nome=chamada-de-obreiros&igreja=${this.igrejaId}`

    },
    {
      separator: true,
    },
    {
      label: 'Ficha de membros',
      icon: 'fas fa-clipboard-list',
      // target: '_blank',
      // url: `${API_CONFIG.baseUrl}/relatorios/list/?nome=ficha-de-membros&igreja=${this.igrejaId}`

    },
    {
      label: 'Ficha em branco',
      icon: 'fas fa-book-reader',
      // target: '_blank',
      // url: `${API_CONFIG.baseUrl}/relatorios/list/?nome=ficha-branco&igreja=${this.igrejaId}`

    }
  ];

  // METODOS PRIVADOS

  private actionsForSuccess() {
    const path: string = this.route.snapshot.data['path'];

    // redirect/reload component page
    this.router.navigateByUrl(path, { skipLocationChange: true })
      .then(
        () => this.router.navigate([path]));
    if (this.imodo === 0) {

      // Parsonalizado
      Swal.fire({
        // title: 'Informação',
        text: 'Lançamentos concluido com sucesso !!!',
        icon: 'success',
        showCloseButton: true,
        showCancelButton: false
      });
      this.modalLancamento.hide();

    } else {
      Swal.fire('Atualização', 'Registro atualizado com sucesso!', 'success');
    }
  }

}

