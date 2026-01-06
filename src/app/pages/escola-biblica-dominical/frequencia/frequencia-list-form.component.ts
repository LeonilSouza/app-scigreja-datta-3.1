// angular import
import { AfterContentChecked, AfterViewInit, Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DecimalPipe, formatDate } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SharedModule } from "src/app/theme/shared/shared.module";
import { igrejaIdSignal, nomeIgrejaSignal, perfilSignal } from 'src/app/theme/shared/_helpers/shared-signals';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { Subject, Subscription, takeUntil } from 'rxjs';
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
import { FrequenciaDTO, FrequenciaResponse } from 'src/app/theme/shared/models/frequencia.dto';
import { AulaService } from 'src/app/theme/shared/services/aula.service';
import { AulaNewDTO } from 'src/app/theme/shared/models/aula-new-dto.dto';
import { EscalaItemDTO, EscalaProfessorDTO } from 'src/app/theme/shared/models/escala-professor.dto';
import { ProfessorDTO } from 'src/app/theme/shared/models/professor.dto';
import { ProfessorService } from 'src/app/theme/shared/services/professor.service';
import { EscalaService } from 'src/app/theme/shared/services/escala.service';
import { DialogModule } from 'primeng/dialog';

// project import

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
    DialogModule,
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
    EscalaService
  ]
})
export class FrequenciaListFormComponent implements OnInit, AfterContentChecked, AfterViewInit {

  position: 'left' | 'right' | 'top' | 'bottom' | 'center' | 'topleft' | 'topright' | 'bottomleft' | 'bottomright' = 'center';

  @ViewChild('meuInput') totalMatriculados: ElementRef;

  // Acionamento da modal no HTML  aqui pelo componente (#modalFrequencia)
  @ViewChild('modalFrequencia') public modalFrequencia: UiModalComponent;

  // Acionamento da modal no HTML  aqui pelo componente (#modalFrequencia)
  @ViewChild('modalEbd') public modalEbd: UiModalComponent;

  @ViewChild('dtfrequencia') grid!: Table;

  @ViewChild('dtDiarioClasse') gridDiario!: Table;

  ngAfterViewInit() {

  }

  nomeIgrejaSignal = nomeIgrejaSignal;
  igrejaIdSignal = igrejaIdSignal;
  perfilSignal = perfilSignal;

  nomeIgreja = nomeIgrejaSignal();
  igrejaId = igrejaIdSignal();
  perfil = perfilSignal();

  presencas = signal<FrequenciaResponse[]>([]);

  loading = signal(false);

  // Escala de Professores
  // Índice do primeiro registro da página atual
  first = signal(0);
  rows = 10; // Quantidade de domingos por página

  classeId = signal<number>(0);

  dataCheckedAula = signal<boolean>(false);

  // Signal que guarda os professores da classe selecionada no momento
  professoresDaClasse = signal<any[]>([]);

  // Signal que guarda a escala gerada para esta classe específica
  escalaDaClasseNormalizada = signal<EscalaItemDTO[]>([]);
  // escala = signal<EscalaProfessorDTO[]>([]);


  linhaSelecionada: number = 0;

  controleCheckData = signal<boolean>(false);
  // frequencias = this.frequenciaSignal();

  private destroy$: Subject<void> = new Subject<void>();

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


  currentAction!: string;

  frequenciaForm!: FormGroup;
  diarioClasseForm!: FormGroup;
  aulaForm!: FormGroup;


  submittingForm: boolean = false;
  pageTitle!: string;
  frequencia: FrequenciaDTO[];
  id!: number;

  imodo: number = 0;
  visibleLancamento: boolean = false;
  visibleEscala: boolean = false;
  visibleDiario: boolean = false;
  length: number = 0;

  aulaId: number = 1;

  frequenciaId!: number;

  subscription!: Subscription;

  total: boolean = false;

  totalFrequenciaSistema!: number;
  totalFrequenciaIgreja!: number;

  frequencias: any[] = [];

  diarioClasses: any[] = [];
  diarioClasse: DiarioClasseDTO = new DiarioClasseDTO();

  pessoas: PessoaDTO[] = [];
  pessoa: PessoaDTO = new PessoaDTO();
  pessoaId: number;

  data!: string;

  dataEscala!: string;

  classes: ClasseDTO[] = [];

  professores: ProfessorDTO[] = [];

  classesModal: ClasseDTO[] = []; //Separado para Modal de Frequencias

  alunos = signal<AlunoDTO[]>([]);

  classesFiltradas: ClasseDTO[] = [];

  classe: ClasseDTO = new ClasseDTO();

  nomeClasse: string;
  trimestre: string;
  ano: string;
  faixaEtaria: string;

  // frequencia: string = 'Aguardando-1';

  error = '';

  classeSelecionada = signal<any>(null); // Inicializa explicitamente com null

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
    this.buildFrequenciaForm();
    this.buildDiarioClasseForm();
    this.buildAulaForm();
    this.loadAlunos();
    this.printItems = this.getPrintItems;
    this.data = this.sharedService.dataAtualFormatada();
    // this.dataEscala = this.sharedService.dataAtualFormatada();
    this.checkDataFromAula();
  };

  // showDialog(position: 'top') {
  //   this.position = position;
  //   this.visible = true;
  // }


  ngAfterContentChecked() {
    //  this.setPageTitle();
  }

  setPageTitleFrequencias() {
    this.pageTitle = "Geração de frequencias";
    this.aulaForm.controls['licao'].setValue(null);
    this.aulaForm.controls['tema'].setValue(null);
    this.aulaForm.controls['data'].setValue(this.sharedService.dataAtualFormatada());
  }

  setPageTitleDiarioClasse() {
    this.pageTitle = "Diario de Classe";
  }

  setPageTitleModalEbd(value) {
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


  private buildFrequenciaForm() {
    this.frequenciaForm = this.formBuilder.group({
      aulaId: [null],
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
      trimestre: [null],
      tema: [null, [Validators.required]],
      licao: [null, [Validators.required]],
      data: [this.sharedService.dataAtualFormatada()],
      dataEscala: [null],
      igrejaId: [this.igrejaId, [Validators.required]]
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
      igrejaId: [this.igrejaId, [Validators.required]]
    });
  }


  loadFrequenciaLazy(event: any) {
    // this.loading.set(true);
    const page = event!.first! / event!.rows!; // divisão para encontrar a paginações
    this.page = page;
    this.linesPerPage = event.rows;
    if (!this.data) {
      this.data = this.sharedService.dataAtualFormatada(); // Substituir pelo ID da aula selecionada
    }
    this.classeService.getListClasseFromIgreja(this.igrejaId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.totalRegistros = response.totalRegistros;
          if (response.length > 0 && !this.classeId()) {
            this.classes = response;
            this.classeId.set(this.classes[0].id);
            this.nomeClasse = this.classes[0].nome;
          }
          this.loadTodosFrequencias(this.igrejaId, this.classeId(), this.data, page, this.linesPerPage)
        }
      });
  }

  // Busca frequencias selecionadas
  loadTodosFrequencias(igrejaId, classeId, data, page, linesPerPage) {
    this.frequenciaService.getByPageTodosFrequenciaFromIgreja(igrejaId, classeId, data, page, linesPerPage)
      .subscribe({
        next: (response) => {
          this.frequencias = response['content'].sort((a: { id: number; }, b: { id: number; }) => b.id - a.id);
          this.totalRegistros = response.totalElements;
          this.loading.set(false);

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

  checkDataFromAula() {// Verifica se a data já foi lançada retorna true| false
    this.aulaService.checkDataFromAula(this.igrejaId, this.data)
      .subscribe({
        next: (response) => {
          this.dataCheckedAula.set(response);
        },
        error: () => { }
      });
  }

  loadProfessores() {
    this.professorService.getListProfessorFromIgreja(this.igrejaId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.professores = response.sort((a: { id: number; }, b: { id: number; }) => {
            return b.id - a.id;
          });
        },
        error: () => { }
      });
  }

  // Função que chama ao selecionar uma classe no PrimeNG
  onClasseSelecionada(event: any) {
    let classe = this.classes.filter(c => (c.id === event.value))
    this.nomeClasse = classe[0].nome;
    this.faixaEtaria = classe[0].faixaEtaria;
    this.frequenciaForm.controls['classeId'].setValue(event.value);
    this.classeId.set(event.value);
    this.first.set(0); // Volta para a página 1 sempre que trocar de classe
    this.loadProfessores();
    const idSelecionado = event.value.id || event.value;
    const filtrados = this.professores.filter(p => p.classeId === idSelecionado);

    // Atualiza o Signal que a escala e a grid utilizam
    this.professoresDaClasse.set(filtrados);

    this.trimestre = JSON.stringify(this.sharedService.retornaTrimestre(this.dataEscala));
    this.ano = this.sharedService.anoDataString(this.dataEscala);
  }

  // }
  gerarEscalaNormalizada() {
    const ano = parseInt(this.sharedService.anoDataString(this.dataEscala));
    this.ano = (this.sharedService.anoDataString(this.dataEscala));
    const professores = this.professoresDaClasse();

    const escalaNormalizada: any[] = [];
    const meses = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; // Jan a Dez
    let indiceProfessor = 0;

    meses.forEach(mes => {
      // 1. Inserir linha de Cabeçalho do Mês
      const nomeMes = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date(ano, mes));
      escalaNormalizada.push({
        data: nomeMes.toUpperCase(), // O Jasper usará isso como título
        suplente: 'SUPLENTE',
        professor: 'TITULAR',
        isHeader: true // Flag para estilização no Jasper
      });

      // 2. Filtrar todos os domingos deste mês
      let data = new Date(ano, mes, 1);
      const domingosDoMes = [];

      while (data.getMonth() === mes) {
        if (data.getDay() === 0) {
          const professor = professores[indiceProfessor % professores.length].nome;
          const suplente = professores[(indiceProfessor + 1) % professores.length].nome;

          domingosDoMes.push({
            // data: formatDate(data, 'EEE-dd', 'pt-BR').toUpperCase(), // Resultado: DOM-04 
            // data: formatDate(data, 'EEE-dd', 'pt-BR').replace(/^\w/, (c) => c.toUpperCase()), // Resultado: Dom-04
            data: formatDate(data, 'dd/MM', 'en-US'),
            professor: professor,
            suplente: suplente,
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
    // this.imprimirEscalaPronta();
    return escalaNormalizada;
  }

  // Estrategia para a modal impressão de escala
  limparModal() {
    // redirect/reload component page 
    this.router.navigateByUrl('alunos', { skipLocationChange: true })
      .then(() => this.router.navigate(['frequencias']));
  }

  imprimirEscalaPronta() {
    this.gerarEscalaNormalizada();
    const payload: EscalaProfessorDTO = {
      nomeClasse: this.nomeClasse + " - " + this.faixaEtaria,
      trimestre: this.trimestre,
      ano: parseInt(this.ano),
      itens: this.escalaDaClasseNormalizada() // A lista já calculada com data, titular e suplente
    };

    this.escalaService.gerarEscalaProfessorPdf(payload)
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


  loadDiarioClasse(diarioClasse) {    // Recebendo item do ngFor do Html passado como parametro no evento (click)="loadMinisterio(item)"
    this.diarioClasse = this.diarioClasses.filter(diario => diario.id == diarioClasse.id)[0];
    this.diarioClasseForm.patchValue(this.diarioClasse)

  }

  linhaClicadaDiario(diarioClasse: any) {
    this.linhaSelecionada = diarioClasse.id;
  }

  linhaClicadaFrequencia(frequencia: any) {
    this.frequenciaForm.controls['nomeClasse'].setValue(frequencia.nome);
    this.linhaSelecionada = frequencia.id;
    this.classeId.set(frequencia.classeId);
    this.frequencia = frequencia;
  }

  resetModal() {
    this.frequenciaForm.reset();
  }

  resetModalDiario() {
    // this.diarioClasseForm.reset();
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

  // Passa a data selecionada no Datepicker para value
  dataUS(value = this.frequenciaForm.controls['data'].value) {
    let data_brasileira = value; //Postgres usa este formato no Jasper 
    let data_americana = data_brasileira.split('/').reverse().join('-'); // CONVERTE DATA BRASILEIRA EM AMERICANA. Preciso da data no formato americano p/ jsaper com MySQL.
    let [ano, mes, dia] = data_americana.split('-').map(Number);
    mes = mes - 1; // Meses em javascript vai de 0 a 11
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

  onChangeFrequencia(id) {
    this.grid.reset();
    this.classeId.set(id.value);
    this.classeSelecionada.set(id.value);
    this.loadTodosFrequencias(this.igrejaId, this.classeId(), this.data, this.page, this.linesPerPage);

  }

  onCloseData(data) {
    this.data = data
    this.trimestre = JSON.stringify(this.sharedService.retornaTrimestre(data));
    this.ano = this.sharedService.anoDataString(data)
    this.loadTodosFrequencias(this.igrejaId, this.classeId(), this.data, this.page, this.linesPerPage);
  }

  onCloseDataModal(data) {
    this.data = data;
    this.trimestre = JSON.stringify(this.sharedService.retornaTrimestre(data));
    this.ano = this.sharedService.anoDataString(data)
    this.checkDataFromAula();
  }

  onCloseDataModalEscala(data) {
    const ano: number = data;
    const dataBase = new Date(ano, 0, 1);
    const dataMontada = formatDate(dataBase, 'dd/MM/yyyy', 'pt-BR');
    this.dataEscala = dataMontada;

    this.ano = JSON.stringify(ano);
    // this.checkDataFromAula();
  }

  onCloseDataModalEbd(data) {
    this.data = data;

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
          this.frequenciaForm.controls['nomeClasse'].setValue(this.classe.nome);
          this.frequenciaForm.controls['faixaEtaria'].setValue(this.classe.faixaEtaria);
          this.frequenciaForm.controls['classificacao'].setValue(this.classe.classificacao);
          this.nomeClasse = this.classe.nome;
        },
        error: () => { }
      });
  }

  loadAlunos() {
    this.alunoService.getListAlunoFromIgreja(this.igrejaId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.alunos.set(response);
        }
      });
  }

  povoarArrayDeFrequencias() {
    if (this.classes && this.classes.length > 0) {
      this.aulaService.checkDataFromAula(this.igrejaId, this.data)
        .subscribe({
          next: (response) => {
            const dataCheckdAula = response;

            if (dataCheckdAula === false) {
              // Povoar o array
              const formArray = this.frequenciaForm.get('presencas') as FormArray;

              // Limpa o array antes de popular (evita duplicados se mudar de aula)
              formArray.clear();

              this.alunos().forEach(aluno => {
                formArray.push(
                  this.formBuilder.group({
                    alunoId: [aluno.id], // ID que o Spring precisa
                    classeId: [aluno.classeId], // ID que o Spring precisa
                    data: [this.data], // ID que o Spring precisa
                    igrejaId: [this.igrejaId],   // Apenas para mostrar na tela (o Spring ignora)
                    presente: [false]    // Valor inicial do checkbox
                  })
                );
              });

              const contagemPorClasse = this.alunos().reduce((acc, aluno) => {
                const id = aluno.classeId;
                acc[id] = (acc[id] || 0) + 1;
                return acc;
              }, {} as Record<number, number>);


              const resultadoComTotais = this.classes.map(classe => {
                return {
                  ...classe,
                  // Busca o total no mapa usando o ID da classe; se não existir, retorna 0
                  totalAlunos: contagemPorClasse[classe.id] || 0
                };
              });

              // SALVAR LANÇAMENTOS NO BANCO
              // O getRawValue() retorna: { titulo: '...', data: '...', presencas: [...] }
              let payload: AulaNewDTO = this.frequenciaForm.getRawValue();
              payload.data = this.data;
              payload.igrejaId = this.igrejaId;
              payload.licao = this.aulaForm.controls['licao'].value;
              payload.tema = this.aulaForm.controls['tema'].value;
              payload.trimestre = this.sharedService.retornaTrimestre(this.data);
              // 3. (Opcional) Ajuste fino: Se o seu Spring espera alunoId e presente,
              // mas o seu FormArray tem campos extras como 'nome', o Spring irá ignorar o 'nome',
              // o que é ótimo. Mas se quiser limpar, você pode mapear:
              // payload.presencas = payload.presencas.map(p => ({ alunoId: p.alunoId, presente: p.presente }));

              // 4. Envia para o serviço
              this.aulaService.createAulaComFrequencias(payload).subscribe({
                next: () => {
                  this.actionsForSuccess()
                  this.frequenciaForm.reset(); // Limpa o formulário para a próxima
                  this.grid.reset();
                },
                error: (error) => {
                  this.error = error;
                }
              });


              // LANÇAMENTO NA TABELA DIARIO ////////////////////////////////////////////

              // 4. Percorrendo o registro de Classe com total de alunos e lançando na Tabela DiarioClasse

              resultadoComTotais.forEach(classe => {
                // Para cada instância, extraímos os dados e adicionamos à tabela de destino DiarioClasse
                this.diarioClasses.push({
                  classeId: classe.id,
                  igrejaId: this.igrejaId,
                  data: this.data,
                  nomeClasse: classe.nome,
                  nomeProfessor: null,
                  classificacao: classe.classificacao,
                  licao: this.aulaForm.controls['licao'].value,
                  tema: this.aulaForm.controls['tema'].value,
                  totalMatriculados: contagemPorClasse[classe.id] || 0, //Pulo do gato
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

  updateDiarioClasse() {
    const diarioClasse: DiarioClasseDTO = Object.assign(new DiarioClasseDTO(),
      this.diarioClasseForm.value);
    diarioClasse.tema.toUpperCase();
    diarioClasse.totalPresentes = (diarioClasse.totalMatriculados - diarioClasse.totalAusentes)
    this.diarioClasseService.update(diarioClasse)
      .subscribe(() => {
        this.gridDiario.reset();//atualiza a tabela do primeng
        this.toastr.success('Registro Atualizado com sucesso', 'Escala');
        // Swal.fire('Atualização', 'Registro atualizado com sucesso!', 'success');
      }),
      (error: any) => (error);
  }


  getPrintItems = [
    {
      label: 'Chameda de Alunos - Trimestral',
      icon: 'fas fa-users',
      command: () => {
        // this.setPageTitleModalEbd('Chamada de Alunos por classe - Trimestral')
        // this.modalEbd.show();
      }
    },
    {
      label: 'Escala de professores',
      icon: 'fas fa-book-reader',
      command: () => {
        this.nomeClasse = '';
        this.dataEscala = this.data;
        this.aulaForm.controls['dataEscala'].setValue(this.sharedService.anoDataString(this.data))
        this.loadProfessores();
        this.setPageTitleModalEbd('Escala de Professores');
        this.setDataModalEbd();
        this.classeSelecionada.set(this.classeId());
        this.position = 'top';
        this.visibleEscala = true; // Abre a modal
      },

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
      this.visibleLancamento=false;

    } else {
      Swal.fire('Atualização', 'Registro atualizado com sucesso!', 'success');
    }
  }

}

