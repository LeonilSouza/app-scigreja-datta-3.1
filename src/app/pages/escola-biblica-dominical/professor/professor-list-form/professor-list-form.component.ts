// angular import
import { AfterContentChecked, Component, inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { InputGroup } from 'primeng/inputgroup';
import { ButtonModule } from 'primeng/button';
import { SharedModule } from "src/app/theme/shared/shared.module";
import { igrejaIdSignal, nomeIgrejaSignal, perfilSignal } from 'src/app/theme/shared/_helpers/shared-signals';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { Subject, Subscription, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';
import { ProfessorService } from 'src/app/theme/shared/services/professor.service';
import { ProfessorDTO } from 'src/app/theme/shared/models/professor.dto';
import { PessoaService } from 'src/app/theme/shared/services/pessoa.service';
import { PessoaDTO } from 'src/app/theme/shared/models/pessoa.dto';
import { ClasseDTO } from 'src/app/theme/shared/models/classe.dto';
import { ClasseService } from 'src/app/theme/shared/services/classe.service';
import { InputMaskModule } from 'primeng/inputmask';
import { DatePicker } from 'primeng/datepicker';
import { SharedService } from 'src/app/theme/shared/services/shared.service';
import { FloatLabel } from "primeng/floatlabel"
import { ToastrService } from 'ngx-toastr';


// project import

@Component({
  selector: 'app-matricula-professor-list-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    TableModule,
    InputGroup,
    ButtonModule,
    RouterLink,
    SharedModule,
    SelectModule,
    InputMaskModule,
    DatePicker,
    FloatLabel
    // JsonPipe
  ],
  templateUrl: './professor-list-form.component.html',
  styleUrl: './professor-list-form.component.scss',
  providers: [
    ProfessorService,
    DecimalPipe,
    ClasseService
  ]
})
export class ProfessorListComponent implements OnInit, AfterContentChecked {

  nomeIgrejaSignal = nomeIgrejaSignal;
  igrejaIdSignal = igrejaIdSignal;
  perfilSignal = perfilSignal;

  nomeIgreja = nomeIgrejaSignal();
  igrejaId = igrejaIdSignal();
  perfil = perfilSignal();

  private destroy$: Subject<void> = new Subject<void>();

  private classeService = inject(ClasseService);
  private pessoaService = inject(PessoaService);
  private router = inject(Router);
  private sharedService = inject(SharedService);
  private formBuilder = inject(FormBuilder);
  private professorService = inject(ProfessorService);
  private toastr = inject(ToastrService);

  tipos = [{ nome: 'Padrao' }, { nome: 'Igreja' }]; // Tipo padrão é o tipo que grava null no igrejaId do Banco, tadas a Igreja podem ver. Igreja grava o id da igreja do usuario, outras igreja não pode ver.

  classificacao = [
    { nome: 'Criança' },
    { nome: 'Adolescente' },
    { nome: 'Jovem' },
    { nome: 'Adulto' }
  ];

  status = [
    { nome: 'Ativo' },
    { nome: 'Inativo' }
  ];

  currentAction!: string;
  professorForm!: FormGroup;
  submittingForm: boolean = false;
  pageTitle!: string;
  professor: ProfessorDTO = new ProfessorDTO();
  id!: number;

  imodo: number = 0;

  professorId!: number;

  subscription!: Subscription;


  @ViewChild('dtprofessor') grid!: Table;

  totalProfessorSistema!: number;
  totalProfessorIgreja!: number;

  totalRegistros: number = 0

  professores: ProfessorDTO[] = [];
  pessoas: PessoaDTO[] = [];
  pessoa: PessoaDTO = new PessoaDTO();
  pessoaId: number;

  classes: ClasseDTO[] = [];
  classe: ClasseDTO = new ClasseDTO();
  classeId: number = 0;
  nomeClasse: string;
  error = '';

  public page = 0;
  public linesPerPage = 8;
  public nome = '';

  constructor(
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.setCurrentAction();
    this.buildProfessorForm();
    this.loadPessoas();
    this.loadClasses();
    // this.grid.reset();//atualiza a tabela do primeng
  };

  ngAfterContentChecked() {
    this.setPageTitle();
  }

  public setCurrentAction() {
    if (this.imodo == 0) {
      this.currentAction = 'new';
    } else this.currentAction = 'edit';
  }

  submitForm() {
    this.submittingForm = true;

    if (this.imodo === 0)
      this.createProfessor();
    else this.updateProfessor();
  }

  private buildProfessorForm() {
    this.professorForm = this.formBuilder.group({
      id: [null],
      nome: [null, [Validators.required]],
      nomeClasse: [null, [Validators.required]],
      status: ['Ativo'],
      telefone: [null],
      faixaEtaria: [null],
      dtNascimento: [null],
      classificacao: [null],
      classeId: [null, [Validators.required]],
      pessoaId: [null],
      igrejaId: [this.igrejaId, [Validators.required]]
    });
  }

  loadProfessorLazy(event: any) {
    const page = event!.first! / event!.rows!; // divisão para encontrar a paginações
    this.loadProfessores(this.igrejaId, this.classeId, this.nome.toLowerCase(), page, this.linesPerPage);
  }


  loadProfessores(igrejaId: number, classeId: number, nome: string, page: number, linesPerPage: number) {
    this.professorService.getByPageProfessorFromIgreja(igrejaId, classeId, nome, page, linesPerPage)
      .subscribe({
        next: (response) => {
          this.professores = response['content'];
          this.totalRegistros = response.totalElements;

        },
        error: (error) => {
          this.error = error;
        }
      });
  }

  resetModal() {
    this.professorForm.reset();
  }

  exclusaoProfessor(professor: ProfessorDTO) {
    Swal.fire({
      title: 'Exclusão',
      text: 'Tem certeza que deseja excluir este registro?',
      icon: 'error',
      showCloseButton: true,
      showCancelButton: true,
    }).then((willDelete) => {
      if (willDelete.dismiss) {
        // Swal.fire('Exclusão Cancelada', 'Seu registro está seguro', 'success');
      } else {
        this.excluir(professor);
        Swal.fire('Exclusão', 'Registro excluido com sucesso!', 'success');
      }
    });
  }

  excluir(professor: any) {
    this.professorService.delete(professor.id)
      .subscribe({
        next: () => {
          this.professores = this.professores.filter(element => element != this.professor.id)
          this.grid.reset();//atualiza a tabela do primeng
        },
        error: () => { },
      });
  }


  loadProfessor(professor: ProfessorDTO) {
    if (this.imodo === 1) {
      this.professor = professor;
      this.professorForm.patchValue(professor);
    } else {
      this.resetModal()
      this.professorForm.controls['igrejaId'].setValue(this.igrejaId);
      this.professorForm.controls['status'].setValue('Ativo');

    }
  }


  private setPageTitle() {
    if (this.imodo === 0)
      this.pageTitle = 'Matriculando: Novo Professor';
    else {
      const professorName = 'Alterando: ' + this.professor.nome || '';
      this.pageTitle = professorName;
    }
  }

  onChangeSelecaoClasses(id) {
    this.classeId = id.value;
    this.loadProfessores(this.igrejaId, this.classeId, this.nome, this.page, this.linesPerPage);
    this.loadClasse(id.value)
  }

  onChangeProfessor(id) {
    this.loadPessoa(id.value)
  }

  onChangeClasse(id) {
    this.loadClasse(id.value)
  }

  private loadPessoa(id) {
    this.pessoaService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.pessoa = response;
          this.professorForm.controls['nome'].setValue(this.sharedService.formataNome(this.pessoa.nome)); // Aqui formata o nome em Camel Case completo 
          this.professorForm.controls['dtNascimento'].setValue(this.pessoa.dataNascimento);
          this.professorForm.controls['telefone'].setValue(this.pessoa.celular1);
        },
        error: () => { }
      });
  }

  private loadClasse(id) {
    this.classeService.findById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.classe = response;
          this.professorForm.controls['nomeClasse'].setValue(this.classe.nome);
          this.professorForm.controls['faixaEtaria'].setValue(this.classe.faixaEtaria);
           this.professorForm.controls['classificacao'].setValue(this.classe.classificacao);
          this.nomeClasse = this.classe.nome;
        },
        error: () => { }
      });
  }

  loadPessoas() {
    const situacaoCadastral = 'Ativo'
    this.pessoaService.getPessoasAtivasFromIgreja(this.igrejaId, situacaoCadastral)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.pessoas = response;
        },
        error: () => { }
      });
  }

  loadClasses() {
    this.classeService.getListClasseFromIgreja(this.igrejaId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.classes = response;
          this.classeId = this.classes[0].id;
          this.nomeClasse = this.classes[0].nome;
          this.loadProfessores(this.igrejaId, this.classeId, this.nome, this.page, this.linesPerPage);
        },
        error: () => { }
      });
  }


  public createProfessor() {
    const professor: ProfessorDTO = this.professorForm.value;
    this.professorService.create(professor).subscribe(
      (response: any): void => {
        this.id = parseInt(this.extractId(response.headers.get('location'))); // Extrai o Id da URI retornada do banco
        this.professor.id = this.id;
        this.grid.reset();//atualiza a tabela do primeng
        this.actionsForSuccess();
      },
      (_error) => { }
    );
  }

  public updateProfessor() {
    const professor: ProfessorDTO = Object.assign(
      new ProfessorDTO(),
      this.professorForm.value
    );
    this.professorService.update(professor)
      .subscribe(() => {
        this.resetModal();
        this.actionsForSuccess();
        this.grid.reset();
      }),
      (error: any) => this.actionsForError(error);
  }

  // METODOS PRIVADOS

  private actionsForSuccess() {
    const path: string = this.route.snapshot.data['path'];

    // redirect/reload component page
    this.router.navigateByUrl(path, { skipLocationChange: true })
      .then(
        () => this.router.navigate([path]));
    if (this.imodo === 0) {
      // Swal.fire('Cadastro', 'Registro inserido com sucesso!', 'success');
       this.toastr.success('Registro Inserido com sucesso');
    } else {
      // Swal.fire('Atualização', 'Registro atualizado com sucesso!', 'success');
       this.toastr.success('Registro Atualizado com sucesso');
    }
  }

  private actionsForError(error: { status: number; _body: string }) {

    this.submittingForm = false;


  }

  private extractId(location: string): string {
    // Extrai o Id da URL
    let position = location.lastIndexOf('/');
    return location.substring(position + 1, location.length);
  }


}

