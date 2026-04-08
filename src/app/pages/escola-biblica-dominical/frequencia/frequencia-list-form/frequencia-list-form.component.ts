// angular import
import { Component, computed, DestroyRef, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DecimalPipe, formatDate } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SharedModule } from "src/app/theme/shared/shared.module";
import { igrejaIdSignal, nomeIgrejaSignal, perfilSignal } from 'src/app/theme/shared/_helpers/shared-signals';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { lastValueFrom, Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { PessoaDTO } from 'src/app/theme/shared/models/pessoa.dto';
import { ClasseDTO } from 'src/app/theme/shared/models/classe.dto';
import { ClasseService } from 'src/app/theme/shared/services/classe.service';
import { InputMaskModule } from 'primeng/inputmask';
import { SharedService } from 'src/app/theme/shared/services/shared.service';
import { DatePicker } from 'primeng/datepicker';
import { FloatLabel } from 'primeng/floatlabel';
import { TableModule, Table } from 'primeng/table';
import { SplitButton } from "primeng/splitbutton";
import { MenuItem } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { ProgressBarModule } from 'primeng/progressbar';
import { DiarioClasseDTO } from 'src/app/theme/shared/models/diario-classe.dto';
import { DiarioClasseService } from 'src/app/theme/shared/services/diario-classe.service';
import { ToastrService } from 'ngx-toastr';
import { InputNumberModule } from 'primeng/inputnumber';
import { Fluid } from 'primeng/fluid';
import { UiModalComponent } from 'src/app/theme/shared/components/modal/ui-modal/ui-modal.component';
import { AlunoService } from 'src/app/theme/shared/services/aluno.service';
import { AlunoDTO } from 'src/app/theme/shared/models/aluno.dto';
import { FrequenciaService } from 'src/app/theme/shared/services/frequencia.service';
import { FiltroTrimestral, FrequenciaDTO } from 'src/app/theme/shared/models/frequencia.dto';
import { AulaService } from 'src/app/theme/shared/services/aula.service';
import { AulaNewDTO } from 'src/app/theme/shared/models/aula-new-dto.dto';
import { EscalaItemDTO, EscalaProfessorDTO } from 'src/app/theme/shared/models/escala-professor.dto';
import { ProfessorDTO } from 'src/app/theme/shared/models/professor.dto';
import { ProfessorService } from 'src/app/theme/shared/services/professor.service';
import { EscalaService } from 'src/app/theme/shared/services/escala.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PessoaService } from 'src/app/theme/shared/services/pessoa.service';
import { API_CONFIG } from 'src/app/app-config';
import { DatasService } from 'src/app/theme/shared/services/datas-service.service';
import { DatasDTO } from 'src/app/theme/shared/models/datas.dto';

@Component({
  selector: 'app-frequencia-ebd-list-form',
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
  templateUrl: './frequencia-list-form.component.html',
  styleUrl: './frequencia-list-form.component.scss',
  providers: [
    FrequenciaService,
    DecimalPipe,
    ClasseService,
    AlunoService,
    MessageService,
    DiarioClasseService,
    AulaService,
    ProfessorService,
    EscalaService,
    DatasService
  ]
})
export class FrequenciaListFormComponent implements OnInit, OnDestroy {

  @ViewChild('meuInput') totalMatriculados: ElementRef | undefined;

  // Acionamento da modal no HTML  aqui pelo componente (#modalFrequencia)
  @ViewChild('modalFrequencia') public modalFrequencia: UiModalComponent | undefined;

  // Acionamento da modal no HTML  aqui pelo componente (#modalFrequencia)
  @ViewChild('modalEbd') public modalEbd: UiModalComponent | undefined;

  @ViewChild('dtfrequencia') grid!: Table;

  @ViewChild('dtDiarioClasse') gridDiario!: Table;

  private classeService = inject(ClasseService);
  private router = inject(Router);
  private sharedService = inject(SharedService);
  private formBuilder = inject(FormBuilder);
  private frequenciaService = inject(FrequenciaService);
  private alunoService = inject(AlunoService);
  private diarioClasseService = inject(DiarioClasseService);
  private toastr = inject(ToastrService);
  private aulaService = inject(AulaService);
  private professorService = inject(ProfessorService);
  private escalaService = inject(EscalaService);
  private pessoaService = inject(PessoaService);
  private datasService = inject(DatasService);
  private destroyRef = inject(DestroyRef); // 1. Injete a referência de destruição

  // Controle Dialog Modal
  positionChamadaAluno: 'left' | 'right' | 'top' | 'bottom' | 'center' | 'topleft' | 'topright' | 'bottomleft' | 'bottomright' = 'top';
  positionChamadaProfessor: 'left' | 'right' | 'top' | 'bottom' | 'center' | 'topleft' | 'topright' | 'bottomleft' | 'bottomright' = 'top';
  positionEscala: 'left' | 'right' | 'top' | 'bottom' | 'center' | 'topleft' | 'topright' | 'bottomleft' | 'bottomright' = 'top';
  positionDiario: 'left' | 'right' | 'top' | 'bottom' | 'center' | 'topleft' | 'topright' | 'bottomleft' | 'bottomright' = 'top';
  positionLancamento: 'left' | 'right' | 'top' | 'bottom' | 'center' | 'topleft' | 'topright' | 'bottomleft' | 'bottomright' = 'top';

  visibleLancamento: boolean = false;
  visibleEscala: boolean = false;
  visibleChamadaAluno: boolean = false;
  visibleChamadaProfessor: boolean = false;
  visibleDiario: boolean = false;

  ano = new Date().getFullYear();
  trimestre = this.getTrimestreAtual();
  // classeSelecionada: number | null = null;
  classeSelecionada = signal<number>(null!); // Inicializa explicitamente com null

  dataSelecionada = signal<Date>(new Date());

  controleModal = signal<string>("");

  opcoesTrimestre = [
    { nome: '1º Trimestre', id: 0 },
    { nome: '2º Trimestre', id: 1 },
    { nome: '3º Trimestre', id: 2 },
    { nome: '4º Trimestre', id: 3 }
  ];

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

  dataCheckedAula = signal<boolean>(false);

  // Signal que guarda os professores da classe selecionada no momento
  professoresDaClasse = signal<any[]>([]);

  frequencias = signal<FrequenciaDTO[]>([]);

  // Signal que guarda a escala gerada para esta classe específica
  escalaDaClasseNormalizada = signal<EscalaItemDTO[]>([]);

  linhaSelecionada: number = 0;

  currentAction!: string;

  frequenciaForm!: FormGroup;
  diarioClasseForm!: FormGroup;
  aulaForm!: FormGroup;
  dataForm!: FormGroup;

  submittingForm: boolean = false;
  pageTitle!: string;
  frequencia: FrequenciaDTO[] | undefined;
  id!: number;

  imodo: number = 0;
  length: number = 0;

  aulaId: number = 1;

  frequenciaId!: number;

  subscription!: Subscription;

  total: boolean = false;

  totalFrequenciaSistema!: number;
  totalFrequenciaIgreja!: number;

  diarioClasses: any[] = [];
  diarioClasse: DiarioClasseDTO = new DiarioClasseDTO();

  // pessoas: PessoaDTO[] = [];
  pessoas = signal<PessoaDTO[]>([]);
  pessoa: PessoaDTO = new PessoaDTO();
  pessoaId!: number;

  data!: string;

  dataEscala!: string;

  classes: ClasseDTO[] = [];

  professores: ProfessorDTO[] = [];

  classesModal: ClasseDTO[] = []; //Separado para Modal de Frequencias

  alunos = signal<AlunoDTO[]>([]);

  classesFiltradas: ClasseDTO[] = [];

  classe: ClasseDTO = new ClasseDTO();

  nomeClasse!: string;

  faixaEtaria!: string;

  error = '';

  printItems!: MenuItem[];

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
    this.buildFrequenciaForm();
    this.buildDiarioClasseForm();
    this.buildAulaForm();
    this.buildDataForm();
    this.loadAlunos();
    this.loadPessoas()
    this.printItems = this.getPrintItems;
    this.data = this.sharedService.dataAtualFormatada();
    this.checkDataFromAula();
    this.loadFrequencias();
  };

  // Retorna o trimestre atual 
  getTrimestreAtual(): number {
    return Math.floor(((new Date().getMonth() + 3) / 3) - 1);
  }

  setPageTitleFrequencias() {
    this.positionLancamento = 'top';
    this.pageTitle = "Geração de frequencias";
    this.aulaForm.controls['licao'].setValue(null);
    this.aulaForm.controls['tema'].setValue(null);
    this.aulaForm.controls['data'].setValue(this.sharedService.dataAtualFormatada());
  }


  setPageTitleDiarioClasse() {
    this.pageTitle = "Diario de Classe";
  }

  setPageTitleModalEbd(value: string) {
    this.pageTitle = value;
  }

  public setCurrentAction() {
    if (this.dataCheckedAula() !== true) {
      if (this.imodo === 0) {
        this.currentAction = 'new';
      } else {
        this.currentAction = 'edit';
      }
    }
  }

  submitAulaForm() {
    this.submittingForm = true;
    if (this.imodo === 0) {
      this.povoarArrayDeFrequencias();
    }

  }

  submitFormDiarioClasse() {
    this.submittingForm = true;
    this.updateDiarioClasse();
  }

  ngOnDestroy() {
    // console.log('Limpando recursos do componente de Frequência...');
    // Se você tiver alguma Subscription manual (this.subscription.unsubscribe())
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private buildFrequenciaForm() {
    this.frequenciaForm = this.formBuilder.group({
      aulaId: [null],
      alunoId: [null],
      presente: [true],
      nomeClasse: [null],
      nomeAluno: [null],
      trimestre: [null],
      anoLetivo: [null],
      classeId: [null],
      isHeader: [null],
      data: [this.sharedService.dataAtualFormatada],
      presencas: this.formBuilder.array([]), // Este é o nosso FormArray dinâmico
      igrejaId: [this.igrejaId, [Validators.required]]
    });
  }

  private buildAulaForm() {
    this.aulaForm = this.formBuilder.group({
      aulaId: [null],
      classeId: [null],
      trimestre: [null],
      tema: [null, [Validators.required]],
      licao: [null, [Validators.required]],
      data: [this.sharedService.dataAtualFormatada()],
      dataEscala: [null],
      ano: [null],
      igrejaId: [this.igrejaId, [Validators.required]]
    });
  }

  private buildDataForm() {
    this.dataForm = this.formBuilder.group({
      id: [0],
      primeiro: [null],
      segundo: [null],
      terceiro: [null],
      quarto: [null],
      quinto: [null],
      sexto: [null],
      setimo: [null],
      oitavo: [null],
      nono: [null],
      decimo: [null],
      decimo_primeiro: [null],
      decimo_segundo: [null],
      decimo_terceiro: [null],
      decimo_quarto: [null]
    });
  }

  // Getter para facilitar o acesso ao FormArray no HTML
  get presencasArray() {
    return this.frequenciaForm.get('presencas') as FormArray;
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
      classeId: [Validators.required],
      igrejaId: [this.igrejaId, [Validators.required]]
    });
  }

  // Passa a data selecionada no Datepicker ano para value
  gerarChamadaAlunoTrimestral(value = this.aulaForm.controls['ano'].value) {
    this.controleModal.set('ChamadaAluno')
    const data = new Date().toLocaleDateString();
    const partes = data.split('/');
    partes[2] = value;
    partes[0] = '15';
    const dataMontada = `${partes[2]}-${partes[1]}-${partes[0]}`;

    const valueDate = new Date(dataMontada)

    // Geração de todos os domingos do trimestre
    this.getDomingosDotrimestre(valueDate)

    const filtro: FiltroTrimestral = {
      igrejaId: this.igrejaId,
      classeId: this.classeSelecionada(),
    };

  }

  // Passa a data selecionada no Datepicker ano para value
  gerarChamadaProfessorTrimestral(value = this.aulaForm.controls['ano'].value) {
    this.controleModal.set('ChamadaProfessor')
    const data = new Date().toLocaleDateString();
    const partes = data.split('/');
    partes[2] = value;
    partes[0] = '15';
    const dataMontada = `${partes[2]}-${partes[1]}-${partes[0]}`;

    const valueDate = new Date(dataMontada)

    // Geração de todos os domingos do trimestre
    this.getDomingosDotrimestre(valueDate)

    const filtro: FiltroTrimestral = {
      igrejaId: this.igrejaId,
      classeId: this.classeSelecionada(),
    };

  }

  //////////////////////////////////////////////////

  //  ROTINA PARA CALCULAR DOMINGOS NO TRIMESTRE - USANDO A MESMA TABELA DATA 
  getDomingosDotrimestre(data: Date) { // ano
    const ano = data.getFullYear();

    // Recebe o numero do trimestre (0: Jan-Mar, 1: Abr-Jun, 2: Jul-Set, 3: Out-Dez)
    // Define o mês inicial do trimestre (0, 3, 6 ou 9)
    const mesInicial = this.trimestre * 3;

    const domingos: Date[] = [];

    // Itera pelos 3 meses do trimestre
    for (let m = 0; m < 3; m++) {
      const mes = mesInicial + m;

      // Pega o último dia do mês corrente para o loop
      const ultimoDia = new Date(ano, mes + 1, 0).getDate();

      for (let i = 1; i <= ultimoDia; i++) {
        const d = new Date(ano, mes, i);

        // Verifica se é Domingo (0)
        if (d.getDay() === 0) {
          domingos.push(new Date(d));
        }
      }
    }
    this.dataForm.controls['primeiro'].setValue(domingos[0].toLocaleDateString('pt-BR'));
    this.dataForm.controls['segundo'].setValue(domingos[1].toLocaleDateString('pt-BR'));
    this.dataForm.controls['terceiro'].setValue(domingos[2].toLocaleDateString('pt-BR'));
    this.dataForm.controls['quarto'].setValue(domingos[3].toLocaleDateString('pt-BR'));
    this.dataForm.controls['quinto'].setValue(domingos[4].toLocaleDateString('pt-BR'));
    this.dataForm.controls['sexto'].setValue(domingos[5].toLocaleDateString('pt-BR'));
    this.dataForm.controls['setimo'].setValue(domingos[6].toLocaleDateString('pt-BR'));
    this.dataForm.controls['oitavo'].setValue(domingos[7].toLocaleDateString('pt-BR'));
    this.dataForm.controls['nono'].setValue(domingos[8].toLocaleDateString('pt-BR'));
    this.dataForm.controls['decimo'].setValue(domingos[9].toLocaleDateString('pt-BR'));
    this.dataForm.controls['decimo_primeiro'].setValue(domingos[10].toLocaleDateString('pt-BR'));
    this.dataForm.controls['decimo_segundo'].setValue(domingos[11].toLocaleDateString('pt-BR'));

    if (domingos[12]) {
      this.dataForm.controls['decimo_terceiro'].setValue(domingos[12].toLocaleDateString('pt-BR'));
    } else {
      this.dataForm.controls['decimo_terceiro'].setValue(null);
    }

    if (domingos[13]) {
      this.dataForm.controls['decimo_quarto'].setValue(domingos[13].toLocaleDateString('pt-BR'));
    } else {
      this.dataForm.controls['decimo_quarto'].setValue(null);
    }

    if (this.controleModal() == 'ChamadaAluno') {
      this.updateDatasClamadaAluno();
    }

    if (this.controleModal() == 'ChamadaProfessor') {
      this.updateDatasChamadaProfessor();
    }
  }

  updateDatasClamadaAluno() {
    const data: DatasDTO = Object.assign(new DatasDTO(), this.dataForm.value);
    data.id = 1; //Para atualizar sempre o mesmo arquivo
    this.datasService.update(data)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: () => {
          let url = (`${API_CONFIG.baseUrl}/relatorios/chamada-aluno/?nome=chamada-de-aluno-trimestral&igreja=${this.igrejaId}&classe=${this.classeId()}&trimestre=${this.trimestre + 1}`)
          window.open(url, "_blank");

        },
        error: () => {
        }

      })
  }

  updateDatasChamadaProfessor() {
    const data: DatasDTO = Object.assign(new DatasDTO(), this.dataForm.value);
    data.id = 1; //Para atualizar sempre o mesmo arquivo
    this.datasService.update(data)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: () => {
          // Está sendo enviado o parametro classe mas, nao usa
          let url = (`${API_CONFIG.baseUrl}/relatorios/chamada-professor/?nome=chamada-de-professor-trimestral&igreja=${this.igrejaId}&trimestre=${this.trimestre + 1}`)
          window.open(url, "_blank");

        },
        error: () => {
        }

      })
  }

  // Signal Computada: Ela se recalcula automaticamente sempre que a lista muda
  totaisRelatorios = computed(() => {
    const lista = this.frequencias();

    const presentes = lista.filter(aluno => aluno.presente === true).length;
    const ausentes = lista.filter(aluno => aluno.presente === false).length;
    const total = lista.length;

    return { presentes, ausentes, total };
  });

  async setarTodos(valor: boolean) {
    // 1. Atualiza a Signal localmente para o usuário ver a mudança visual imediata
    this.frequencias.update(lista => {
      lista.forEach(aluno => aluno.presente = valor);
      return [...lista];
    });

    // 2. Salva no banco de dados. 
    try {
      await lastValueFrom(this.frequenciaService.atualizarFrequencias(this.frequencias()));
    } catch (error) {
      this.toastr.error('erro!');
    }
  }

  setarUm(id: number, valor: boolean) {
    this.frequencias.update(lista =>
      lista.map(a => a.id === id ? { ...a, presente: valor } : a));
    if (this.frequencias() && this.frequencias().length > 0) {
      try {
        // Envia para o novo método que salva Frequência + Diário
        lastValueFrom(this.frequenciaService.atualizarFrequencias(this.frequencias()));

      } catch (err) {
        this.toastr.error('Erro!');
      }
    }
  }

  loadFrequencias() {
    if (!this.data) {
      this.data = this.sharedService.dataAtualFormatada(); // Substituir pelo ID da aula selecionada
    }
    this.classeService.getListClasseFromIgreja(this.igrejaId)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: (response) => {
          const registros = response.length;
          if (registros > 0 && !this.classeId()) {
            this.classes = response.filter((ativo: { status: string; }) => ativo.status == 'Ativo');
            this.totalRegistros = this.classes.length;
            
            this.classeId.set(this.classes[0].id!);
            this.nomeClasse = this.classes[0].nome!;
          }
          this.listaFrequencias(this.igrejaId, this.classeId(), this.data);
        }
      });
  }

  // Busca frequencias selecionadas
  listaFrequencias(igrejaId: number, classeId: number, data: string) {
    this.frequenciaService.getByListFrequenciaFromIgreja(igrejaId, classeId, data)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: (response) => {
          this.frequencias.set([...response.sort((a: { id: number; }, b: { id: number; }) => b.id - a.id)]);
          this.totalRegistros = response.length;

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
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: (response) => {
          this.classesModal = response['content'].filter((ativo: { status: string; }) => ativo.status == 'Ativo').sort((a: { id: number; }, b: { id: number; }) => b.id - a.id);
          this.totalRegistrosModalClasse = this.classesModal.length;
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
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
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

  checkDataFromAula() {// Verifica se a data já foi lançada retorna true| false
    this.aulaService.checkDataFromAula(this.igrejaId, this.data)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: (response) => {
          this.dataCheckedAula.set(response);
        },
        error: () => { }
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


  loadProfessores() {
    this.professorService.getListProfessorFromIgreja(this.igrejaId)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: (response) => {
          this.professores = response.sort((a: { id: number; }, b: { id: number; }) => {
            return b.id - a.id;
          });
        },
        error: () => { }
      });
  }

  // Função que chamada ao selecionar uma classe na impressão de Escala
  onClasseSelecionadaEscala(event: any) {
    let classe = this.classes.filter(c => (c.id === event.value))
    this.nomeClasse = classe[0].nome!;
    this.faixaEtaria = classe[0].faixaEtaria!;
    this.frequenciaForm.controls['classeId'].setValue(event.value);
    this.classeId.set(event.value);
    this.first.set(0); // Volta para a página 1 sempre que trocar de classe
    this.loadProfessores();
    const idSelecionado = event.value.id || event.value;
    const filtrados = this.professores.filter(p => p.classeId === idSelecionado);

    // Atualiza o Signal que a escala e a grid utilizam
    this.professoresDaClasse.set(filtrados);

    this.trimestre = this.sharedService.retornaTrimestre(this.dataEscala);
    this.ano = JSON.parse(this.sharedService.anoDataString(this.dataEscala));
  }

  // Função que chamada ao selecionar uma classe na impressão de Chamada de Alunos Trimestral
  onClasseSelecionadaChamada(event: any) {
    let classe = this.classes.filter(c => (c.id === event.value))
    this.nomeClasse = classe[0].nome!;
    this.faixaEtaria = classe[0].faixaEtaria!;
    this.classeId.set(event.value);
    this.classeSelecionada.set(event.value);

  }


  onChangeTrimestre(event: any) {
    this.trimestre = event.value;
  }

  gerarEscalaNormalizada() {
    const ano = parseInt(this.sharedService.anoDataString(this.dataEscala));
    this.ano = JSON.parse(this.sharedService.anoDataString(this.dataEscala));
    const professores = this.professoresDaClasse();
    const pessoas = this.pessoas();

    const escalaNormalizada: any[] = [];
    const meses = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; // Jan a Dez
    let indiceProfessor = 0;

    meses.forEach(mes => {
      // 1. Inserir linha de Cabeçalho do Mês
      const nomeMes = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date(ano, mes));
      escalaNormalizada.push({
        data: nomeMes.toUpperCase(), // O Jasper usará isso como título
        suplente: '  SUPLENTE',
        professor: '  PROFESSOR',
        isHeader: true // Flag para estilização no Jasper
      });

      // 2. Filtrar todos os domingos deste mês
      let data = new Date(ano, mes, 1);
      const domingosDoMes = [];

      while (data.getMonth() === mes) {
        if (data.getDay() === 0) {

          // 1. Obtém os objetos completos dos professores (que contêm pessoaId)
          const profTitularObj = professores[indiceProfessor % professores.length];
          const profSuplenteObj = professores[(indiceProfessor + 1) % professores.length];

          // 2. Busca os dados da Pessoa para obter a abreviaturaMin
          // Supõe-se que você tenha um array 'listaPessoas' disponível no seu componente
          const pessoaTitular = pessoas.find(p => p.id === profTitularObj.pessoaId);
          const pessoaSuplente = pessoas.find(p => p.id === profSuplenteObj.pessoaId);

          // 3. Concatena: "Abrev. Nome" (ou apenas o nome se a pessoa não for encontrada)
          const professorFormatado = pessoaTitular
            ? `${pessoaTitular.abreviaturaMin} ${profTitularObj.nome}`
            : profTitularObj.nome;

          const suplenteFormatado = pessoaSuplente
            ? `${pessoaSuplente.abreviaturaMin} ${profSuplenteObj.nome}`
            : profSuplenteObj.nome;

          domingosDoMes.push({
            data: formatDate(data, 'dd/MM', 'en-US'),
            professor: professorFormatado,
            suplente: suplenteFormatado,
            isHeader: false
          });
          indiceProfessor++;
        }
        data.setDate(data.getDate() + 1);
      }

      // 3. Adicionar os domingos reais à escala
      escalaNormalizada.push(...domingosDoMes);

      // 4. Normalização: Adicionar linhas em branco até completar 5 domingos
      const linhasEmBrancoNecessarias = 5 - domingosDoMes.length;
      for (let i = 0; i < linhasEmBrancoNecessarias; i++) {
        escalaNormalizada.push({
          data: '', // Linha vazia para manter o espaçamento
          professor: '',
          suplente: '',
          isHeader: false
        });
      }
    });

    this.escalaDaClasseNormalizada.set(escalaNormalizada);
    return escalaNormalizada;
  }

  imprimirEscalaPronta() {
    this.gerarEscalaNormalizada();
    const payload: EscalaProfessorDTO = {
      nomeClasse: this.nomeClasse + " - " + this.faixaEtaria,
      trimestre: JSON.stringify(this.trimestre),
      ano: this.ano,
      itens: this.escalaDaClasseNormalizada() // A lista já calculada com data, titular e suplente
    };

    this.escalaService.gerarEscalaProfessorPdf(payload)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: (res: Blob) => {
          // O 'res' aqui é o Blob. Criamos uma URL para o navegador entender.
          const fileURL = URL.createObjectURL(res);
          window.open(fileURL, '_blank'); // Abre o PDF gerado pelo Jasper
        },
        error: (err) => {
          console.error('Erro ao gerar PDF:', err);
        }
      });

  }

  resetModal() {
    this.frequenciaForm.reset();
  }

  resetModalDiario() {
    this.diarioClasseForm.reset()
    this.diarioClasseForm.controls['igrejaId'].setValue(this.igrejaId);
  }

  setData() {
    this.resetModal();
    this.frequenciaForm.controls['data'].setValue(this.sharedService.dataAtualFormatada());
    this.frequenciaForm.controls['igrejaId'].setValue(this.igrejaId);
  }

  setDataModalEbd() {
    this.frequenciaForm.controls['data'].setValue(this.sharedService.dataAtualFormatada());
    this.frequenciaForm.controls['igrejaId'].setValue(this.igrejaId);
  }

  loadDiarioClasses() {
    if (this.totalRegistros) {
      this.positionDiario = 'top';
      this.loadDiarioClassesModal(this.igrejaId, this.data, this.pageModalDiario, this.linesPerPageModalDiario);

    } else {
      this.toastr.warning('Lançamentos inexistentes!');
    }
  }

  async onChangeFrequencia(event: any) {
    this.grid.reset();
    this.classeId.set(event.value);
    this.classeSelecionada.set(event.value);
    this.listaFrequencias(this.igrejaId, this.classeId(), this.data);
  }

  onCloseData(data: string) {
    this.data = data
    this.trimestre = this.sharedService.retornaTrimestre(data);
    this.ano = JSON.parse(this.sharedService.anoDataString(data));
    this.listaFrequencias(this.igrejaId, this.classeId(), this.data);
  }

  onCloseDataModal(data: string) {
    this.data = data;
    this.trimestre = (this.sharedService.retornaTrimestre(data));
    this.ano = JSON.parse(this.sharedService.anoDataString(data));
    this.checkDataFromAula();
  }

  onCloseDataModalEscala(data: number) {
    const ano: number = data;
    const dataBase = new Date(ano, 0, 1);
    const dataMontada = formatDate(dataBase, 'dd/MM/yyyy', 'pt-BR');
    this.dataEscala = dataMontada;

    this.ano = ano;
  }

  onCloseDataModalChamada(data: any) {
    //Está no dataUs do botão imprimir
  }

  onCloseDataModalEbd(data: string) {
    this.data = data;

  }


  onChangeClasse(id: { value: any; }) {
    this.loadClasse(id.value)
  }

  private loadClasse(id: number) {
    this.classeService.findById(id)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: (response) => {
          this.classe = response;
          this.frequenciaForm.controls['nomeClasse'].setValue(this.classe.nome);
          this.frequenciaForm.controls['faixaEtaria'].setValue(this.classe.faixaEtaria);
          this.frequenciaForm.controls['classificacao'].setValue(this.classe.classificacao);
          this.nomeClasse = this.classe.nome!;
        },
        error: () => { }
      });
  }

  linhaClicadaDiario(diarioClasse: any) {
    this.linhaSelecionada = diarioClasse.id;
  }

  loadDiarioClasse(diarioClasse: { id: any; }) {    // Recebendo item do ngFor do Html passado como parametro no evento (click)="loadMinisterio(item)"
    this.diarioClasse = this.diarioClasses.filter(diario =>
      diario.id == diarioClasse.id)[0];
    this.diarioClasseForm.patchValue(this.diarioClasse)


  }

  loadAlunos() {
    this.alunoService.getListAlunoFromIgreja(this.igrejaId)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe({
        next: (response) => {
          this.alunos.set(response);
        }
      });
  }

  povoarArrayDeFrequencias() {
    if (!this.classes || this.classes.length === 0) {
      this.toastr.info('Nenhuma classe cadastrada!');
      return;
    }

    this.aulaService.checkDataFromAula(this.igrejaId, this.data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (existeLancamento) => {
          if (existeLancamento) {
            this.toastr.warning('Já existe Lançamentos para esta data!');
            return;
          }

          // --- INÍCIO DO PROCESSO DE GERAÇÃO ---

          // 1. Limpar arrays temporários para evitar duplicatas na memória do Angular
          const formArray = this.frequenciaForm.get('presencas') as FormArray;
          formArray.clear();
          this.diarioClasses = []; // IMPORTANTE: Limpar o array do diário aqui!

          // 2. Preparar Frequências Individuais
          this.alunos().forEach(aluno => {
            formArray.push(this.formBuilder.group({
              alunoId: [aluno.id],
              classeId: [aluno.classeId],
              data: [this.data],
              igrejaId: [this.igrejaId],
              presente: [false] // Iniciamos com false como planejado
            }));
          });

          // 3. Preparar Totais do Diário
          const contagemPorClasse = this.alunos().reduce((acc, aluno) => {
            acc[aluno.classeId!] = (acc[aluno.classeId!] || 0) + 1;
            return acc;
          }, {} as Record<number, number>);

          const listaDiarioParaSalvar = this.classes.map(classe => ({
            classeId: classe.id,
            igrejaId: this.igrejaId,
            data: this.data,
            nomeClasse: classe.nome,
            classificacao: classe.classificacao,
            licao: this.aulaForm.controls['licao'].value,
            tema: this.aulaForm.controls['tema'].value,
            totalMatriculados: contagemPorClasse[classe.id!] || 0,
            totalOfertas: 0,
            totalPresentes: 0,
            totalAusentes: 0
          }));

          // 4. SALVAMENTO SEQUENCIAL (Garante que um termina antes do outro começar)
          let payload: AulaNewDTO = this.frequenciaForm.getRawValue();
          payload.data = this.data;
          payload.igrejaId = this.igrejaId;
          payload.licao = this.aulaForm.controls['licao'].value;
          payload.tema = this.aulaForm.controls['tema'].value;
          payload.trimestre = this.sharedService.retornaTrimestre(this.data);

          // Primeiro salvamos Aula e Frequências
          this.aulaService.createAulaComFrequencias(payload)
            .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
            .subscribe({
              next: () => {
                // Povoa agrade após a geração de frequencias
                this.classeId.set(this.classes[0].id!);

                this.nomeClasse = this.classes[0].nome!;
                this.listaFrequencias(this.igrejaId, this.classeId(), this.data);

                this.grid.reset();
                this.frequenciaForm.reset(); // Limpa o formulário para a próxima

                this.actionsForSuccess();

                // SÓ DEPOIS que a aula foi criada, salvamos o Diário
                this.diarioClasseService.salvarDiarioClasse(listaDiarioParaSalvar)
                  .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
                  .subscribe({
                    next: () => { }
                  });
              }
            });
        }
      });
  }

  updateDiarioClasse() {
    const a = this.diarioClasseForm.controls['totalMatriculados'].value;
    const b = this.diarioClasseForm.controls['totalAusentes'].value;
    this.diarioClasseForm.controls['totalPresentes'].setValue(this.diarioClasseForm.controls['totalMatriculados'].value - this.diarioClasseForm.controls['totalAusentes'].value);
    const c = this.diarioClasseForm.controls['totalPresentes'].value;
    if (a) {
      this.diarioClasseForm.controls['percentualPresentes'].setValue((+c / a) * 100);
    }

    const diarioClasse: DiarioClasseDTO = Object.assign(new DiarioClasseDTO(), this.diarioClasseForm.value);

    this.diarioClasseService.update(diarioClasse)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Adicione o pipe ANTES do subscribe
      .subscribe(() => {
        this.gridDiario.reset();//atualiza a tabela do primeng
        this.toastr.success('Registro Atualizado com sucesso', 'Escala');
        // Swal.fire('Atualização', 'Registro atualizado com sucesso!', 'success');
      }),
      (error: any) => (error);
  }

  updateDiarioClasseTemaLicao() {
    const diarioClasse: DiarioClasseDTO = Object.assign(new DiarioClasseDTO(), this.diarioClasseForm.value);
    this.diarioClasseService.updateTemaLicao(diarioClasse)
      .subscribe(() => {
        this.gridDiario.reset();//atualiza a tabela do primeng
        this.toastr.success('Tema/Lição Atualizados com sucesso', 'Diario Classe');
      });
  }

  // RELATORIOS ///////////////////////////////////////////

  imprimirDiarioClasse() {
    const url = `${API_CONFIG.baseUrl}/relatorios/diario-classe/?nome=diario-classe&igreja=${this.igrejaId}&data=${this.data}`;
    window.open(url, '_blank');
  }


  getPrintItems = [
    {
      label: 'Chamada de Alunos - Trimestral',
      icon: 'fas fa-users',
      command: () => {
        this.setPageTitleModalEbd('Chamada de Alunos - Trimestral');
        this.trimestre = this.getTrimestreAtual();
        this.aulaForm.controls['classeId'].setValue(null);
        this.aulaForm.controls['ano'].setValue(this.sharedService.anoDataString(this.data));
        this.aulaForm.controls['trimestre'].setValue(this.trimestre);
        this.classeSelecionada.set(null!);
        this.classeId.set(null!);
        this.positionChamadaAluno = 'top';
        this.visibleChamadaAluno = true; // Abre a modal
      }
    },
    {
      separator: true,
    },
    {
      label: 'Chamada de Professores - Trimestral',
      icon: 'fas fa-users',
      command: () => {
        this.aulaForm.controls['ano'].setValue(this.sharedService.anoDataString(this.data));
        this.setPageTitleModalEbd('Chamada de Professores - Trimestral');
        this.trimestre = this.getTrimestreAtual();
        this.aulaForm.controls['trimestre'].setValue(this.trimestre);
        this.positionChamadaProfessor = 'top';
        this.visibleChamadaProfessor = true; // Abre a modal
      }
    },

    {
      separator: true,
    },
    {
      label: 'Escala de professores',
      icon: 'fas fa-book-reader',
      command: () => {
        this.nomeClasse = '';
        this.dataEscala = this.data;
        this.aulaForm.controls['classeId'].setValue(null);
        this.aulaForm.controls['dataEscala'].setValue(this.sharedService.anoDataString(this.data))
        this.loadProfessores();
        this.setPageTitleModalEbd('Escala de Professores');
        this.setDataModalEbd();
        this.classeSelecionada.set(this.classeId());
        this.positionEscala = 'top';
        this.visibleEscala = true; // Abre a modal
      },

    },
    {
      separator: true,
    }
  ];

  // FIM  RELATORIOS ///////////////////////////////////////////

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
      this.visibleLancamento = false;

    } else {
      Swal.fire('Atualização', 'Registro atualizado com sucesso!', 'success');
    }
  }

}

