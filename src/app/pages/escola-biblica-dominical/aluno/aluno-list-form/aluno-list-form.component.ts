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
import { PessoaService } from 'src/app/theme/shared/services/pessoa.service';
import { PessoaDTO } from 'src/app/theme/shared/models/pessoa.dto';
import { ClasseDTO } from 'src/app/theme/shared/models/classe.dto';
import { ClasseService } from 'src/app/theme/shared/services/classe.service';
import { InputMaskModule } from 'primeng/inputmask';
import { SharedService } from 'src/app/theme/shared/services/shared.service';
import { FloatLabel } from "primeng/floatlabel"
import { AlunoService } from 'src/app/theme/shared/services/aluno.service';
import { ToastrService } from 'ngx-toastr';
import { AlunoDTO } from 'src/app/theme/shared/models/aluno.dto';
import { ToggleSwitchModule } from 'primeng/toggleswitch';


// project import

@Component({
  selector: 'app-matricula-aluno-list-form',
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
    // DatePicker,
    FloatLabel,
    ToggleSwitchModule
    // JsonPipe
  ],
  templateUrl: './aluno-list-form.component.html',
  styleUrl: './aluno-list-form.component.scss',
  providers: [
    AlunoService,
    DecimalPipe,
    ClasseService
  ]
})
export class AlunoListComponent implements OnInit, AfterContentChecked {

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
  private alunoService = inject(AlunoService);
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
  alunoForm!: FormGroup;
  submittingForm: boolean = false;
  pageTitle!: string;
  aluno: AlunoDTO = new AlunoDTO();
  id!: number;

  imodo: number = 0;

  alunoId!: number;

  subscription!: Subscription;


  @ViewChild('dtaluno') grid!: Table;

  totalAlunoSistema!: number;
  totalAlunoIgreja!: number;

  totalRegistros: number = 0

  alunos: AlunoDTO[] = [];
  pessoas: PessoaDTO[] = [];
  pessoa: PessoaDTO = new PessoaDTO();
  pessoaId!: number;

  classes: ClasseDTO[] = [];
  classe: ClasseDTO = new ClasseDTO();
  classeId: number = 0;
  nomeClasse!: string;
  error = '';

  public page = 0;
  public linesPerPage = 8;
  public nome = '';

  constructor(
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.setCurrentAction();
    this.buildAlunoForm();
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
      this.createAluno();
    else
      this.updateAluno();
  }

  private buildAlunoForm() {
    this.alunoForm = this.formBuilder.group({
      id: [null],
      nome: [null, [Validators.required]],
      classe: [null, [Validators.required]],
      anoLetivo: [null],
      status: ['Ativo'],
      classificacao: [null],
      telefone: [null],
      faixaEtaria: [null],
      dtNascimento: [null],
      classeId: [null, [Validators.required]],
      pessoaId: [null],
      igrejaId: [this.igrejaId, [Validators.required]]
    });
  }

  loadAlunosLazy(event: any) {
    const page = event!.first! / event!.rows!; // divisão para encontrar a paginações
    this.loadAlunos(this.igrejaId, this.classeId, this.nome.toLowerCase(), page, this.linesPerPage);
  }


  loadAlunos(igrejaId: number, classeId: number, nome: string, page: number, linesPerPage: number) {
    this.alunoService.getByPageAlunoFromIgreja(igrejaId, classeId, nome, page, linesPerPage)
      .subscribe({
        next: (response) => {
          this.alunos = response['content'];
          this.totalRegistros = response.totalElements;

        },
        error: (error) => {
          this.error = error;
        }
      });
  }

  resetModal() {
    this.alunoForm.reset();
  }


  exclusaoAluno(aluno: AlunoDTO) {
    Swal.fire({
      // title: 'Exclusão',
      text: 'Tem certeza que deseja excluir este registro?',
      position: 'top',
      showCloseButton: true,
      showCancelButton: true,
    }).then((willDelete) => {
      if (willDelete.dismiss) {
        // Swal.fire('Exclusão Cancelada', 'Seu registro está seguro', 'success');
      } else {
        this.alunoService.delete(aluno.id ?? 0)
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


  loadAluno(aluno: AlunoDTO) {
    if (this.imodo === 1) {
      this.aluno = aluno;
      this.alunoForm.patchValue(aluno);
    } else {
      this.resetModal()
      this.alunoForm.controls['igrejaId'].setValue(this.igrejaId);
      this.alunoForm.controls['status'].setValue('Ativo');

    }
  }


  private setPageTitle() {
    if (this.imodo === 0)
      this.pageTitle = 'Matriculando: Novo Aluno';
    else {
      if (this.imodo === 1) {
        const alunoName = 'Transferindo: ' + this.aluno.nome || '';
        this.pageTitle = alunoName;
      }
    }
  }

  onChangeSelecaoClasses(id: { value: number; }) {
    this.classeId = id.value;
    this.loadAlunos(this.igrejaId, this.classeId, this.nome, this.page, this.linesPerPage);
    this.loadClasse(id.value)
  }

  onChangeAluno(id: { value: any; }) {
    this.loadPessoa(id.value)
  }

  onChangeClasse(id: { value: any; }) {
    this.loadClasse(id.value)
  }

  private loadPessoa(id: number) {
    this.pessoaService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.pessoa = response;
          this.alunoForm.controls['nome'].setValue(this.sharedService.formataNome(this.pessoa.nome!)); // Aqui formata o nome em Camel Case completo 
          this.alunoForm.controls['dtNascimento'].setValue(this.pessoa.dataNascimento);
          this.alunoForm.controls['telefone'].setValue(this.pessoa.celular1);
        },
        error: () => { }
      });
  }

  private loadClasse(id: number) {
    this.classeService.findById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.classe = response;
          this.alunoForm.controls['classe'].setValue(this.classe.nome);
          this.alunoForm.controls['faixaEtaria'].setValue(this.classe.faixaEtaria);
          this.alunoForm.controls['classificacao'].setValue(this.classe.classificacao);
          this.nomeClasse = this.classe.nome!;
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
          this.classes = response.filter((ativo: { status: string; }) => ativo.status == 'Ativo');
          this.classeId = this.classes[0].id ?? 0;
          this.nomeClasse = this.classes[0].nome!;
          this.loadAlunos(this.igrejaId, this.classeId, this.nome, this.page, this.linesPerPage);
        },
        error: () => { }
      });
  }

  public createAluno() {
    const aluno: AlunoDTO = this.alunoForm.value;
    this.alunoService
      .create(aluno)
      .subscribe({
        next: (response) => {
          this.id = parseInt(this.extractId(response.headers.get('location')!)); // Extrai o Id da URI retornada do banco
          this.aluno.id = this.id;
          this.grid.reset();//atualiza a tabela do primeng
          this.actionsForSuccess();
        },
        error: (err) => { }
      });
  }


  public updateAluno() {
    const aluno: AlunoDTO = Object.assign(
      new AlunoDTO(),
      this.alunoForm.value
    );
    this.alunoService.update(aluno)
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

