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
import { MatriculaProfessorService } from 'src/app/theme/shared/services/matricula-professor.service';
import { MatriculaProfessorDTO } from 'src/app/theme/shared/models/matricula-professor.dto';
import { PessoaService } from 'src/app/theme/shared/services/pessoa.service';
import { PessoaDTO } from 'src/app/theme/shared/models/pessoa.dto';
import { ClasseDTO } from 'src/app/theme/shared/models/classe.dto';
import { ClasseService } from 'src/app/theme/shared/services/classe.service';
import { InputMaskModule } from 'primeng/inputmask';
import { DatePicker } from 'primeng/datepicker';
import { SharedService } from 'src/app/theme/shared/services/shared.service';
import { FloatLabel } from "primeng/floatlabel"


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
  templateUrl: './matricula-professor-list-form.component.html',
  styleUrl: './matricula-professor-list-form.component.scss',
  providers: [
    MatriculaProfessorService,
    DecimalPipe,
    ClasseService
  ]
})
export class MatriculaProfessorListComponent implements OnInit, AfterContentChecked {

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
  private matriculaProfessorService = inject(MatriculaProfessorService);

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
  matriculaProfessorForm!: FormGroup;
  submittingForm: boolean = false;
  pageTitle!: string;
  matriculaProfessor: MatriculaProfessorDTO = new MatriculaProfessorDTO();
  id!: number;

  imodo: number = 0;

  matriculaProfessorId!: number;

  subscription!: Subscription;


  @ViewChild('dtmatriculaProfessor') grid!: Table;

  totalMatriculaProfessorSistema!: number;
  totalMatriculaProfessorIgreja!: number;

  totalRegistros: number = 0

  matriculaProfessores: MatriculaProfessorDTO[] = [];
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
    this.buildMatriculaProfessorForm();
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
      this.createMatriculaProfessor();
    else this.updateMatriculaProfessor();
  }

  private buildMatriculaProfessorForm() {
    this.matriculaProfessorForm = this.formBuilder.group({
      id: [null],
      nomeProfessor: [null, [Validators.required]],
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

  loadMatriculaProfessorsLazy(event: any) {
    const page = event!.first! / event!.rows!; // divisão para encontrar a paginações
    this.loadMatriculaProfessores(this.igrejaId, this.classeId, this.nome.toLowerCase(), page, this.linesPerPage);
  }


  loadMatriculaProfessores(igrejaId: number, classeId: number, nome: string, page: number, linesPerPage: number) {
    this.matriculaProfessorService.getByPageMatriculaProfessorFromIgreja(igrejaId, classeId, nome, page, linesPerPage)
      .subscribe({
        next: (response) => {
          this.matriculaProfessores = response['content'].sort((a: { id: number; }, b: { id: number; }) => b.id - a.id);
          this.totalRegistros = response.totalElements;

        },
        error: (error) => {
          this.error = error;
        }
      });
  }

  resetModal() {
    this.matriculaProfessorForm.reset();
  }

  exclusaoMatriculaProfessor(matriculaProfessor: MatriculaProfessorDTO) {
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
        this.excluir(matriculaProfessor);
        Swal.fire('Exclusão', 'Registro excluido com sucesso!', 'success');
      }
    });
  }

  excluir(matriculaProfessor: any) {
    this.matriculaProfessorService.delete(matriculaProfessor.id)
      .subscribe({
        next: () => {
          this.matriculaProfessores = this.matriculaProfessores.filter(element => element != this.matriculaProfessor.id)
          this.grid.reset();//atualiza a tabela do primeng
        },
        error: () => { },
      });
  }


  loadMatriculaProfessor(matriculaProfessor: MatriculaProfessorDTO) {
    if (this.imodo === 1) {
      this.matriculaProfessor = matriculaProfessor;
      this.matriculaProfessorForm.patchValue(matriculaProfessor);
    } else {
      this.resetModal()
      this.matriculaProfessorForm.controls['igrejaId'].setValue(this.igrejaId);
      this.matriculaProfessorForm.controls['status'].setValue('Ativo');

    }
  }


  private setPageTitle() {
    if (this.imodo === 0)
      this.pageTitle = 'Matriculando: Novo Professor';
    else {
      const matriculaProfessorName = 'Alterando: ' + this.matriculaProfessor.nomeProfessor || '';
      this.pageTitle = matriculaProfessorName;
    }
  }

  onChangeSelecaoClasses(id) {
    this.classeId = id.value;
    this.loadMatriculaProfessores(this.igrejaId, this.classeId, this.nome, this.page, this.linesPerPage);
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
          this.matriculaProfessorForm.controls['nomeProfessor'].setValue(this.sharedService.formataNome(this.pessoa.nome)); // Aqui formata o nome em Camel Case completo 
          this.matriculaProfessorForm.controls['dtNascimento'].setValue(this.pessoa.dataNascimento);
          this.matriculaProfessorForm.controls['telefone'].setValue(this.pessoa.celular1);
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
          this.matriculaProfessorForm.controls['nomeClasse'].setValue(this.classe.nome);
          this.matriculaProfessorForm.controls['faixaEtaria'].setValue(this.classe.faixaEtaria);
           this.matriculaProfessorForm.controls['classificacao'].setValue(this.classe.classificacao);
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
          this.loadMatriculaProfessores(this.igrejaId, this.classeId, this.nome, this.page, this.linesPerPage);
        },
        error: () => { }
      });
  }


  public createMatriculaProfessor() {
    const matriculaProfessor: MatriculaProfessorDTO = this.matriculaProfessorForm.value;
    this.matriculaProfessorService.create(matriculaProfessor).subscribe(
      (response: any): void => {
        this.id = parseInt(this.extractId(response.headers.get('location'))); // Extrai o Id da URI retornada do banco
        this.matriculaProfessor.id = this.id;
        this.grid.reset();//atualiza a tabela do primeng
        this.actionsForSuccess();
      },
      (_error) => { }
    );
  }

  public updateMatriculaProfessor() {
    const matriculaProfessor: MatriculaProfessorDTO = Object.assign(
      new MatriculaProfessorDTO(),
      this.matriculaProfessorForm.value
    );
    this.matriculaProfessorService.update(matriculaProfessor)
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
      Swal.fire('Cadastro', 'Registro inserido com sucesso!', 'success');
    } else {
      Swal.fire('Atualização', 'Registro atualizado com sucesso!', 'success');
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

