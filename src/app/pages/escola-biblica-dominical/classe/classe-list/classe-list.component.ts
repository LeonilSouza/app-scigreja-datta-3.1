// angular import
import { AfterContentChecked, Component, inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { InputGroup } from 'primeng/inputgroup';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { SharedModule } from "src/app/theme/shared/shared.module";
import { igrejaIdSignal, nomeIgrejaSignal, perfilSignal } from 'src/app/theme/shared/_helpers/shared-signals';
import { ClasseService } from 'src/app/theme/shared/services/classe.service';
import { ClasseDTO } from 'src/app/theme/shared/models/classe.dto';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';


// project import

@Component({
  selector: 'app-classe-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    TableModule,
    InputGroup,
    ButtonModule,
    RouterLink,
    SharedModule,
    SelectModule
    // JsonPipe
  ],
  templateUrl: './classe-list.component.html',
  styleUrl: './classe-list.component.scss',
  providers: [
    ClasseService,
    DecimalPipe,
    MessageService
  ]
})
export class ClasseListComponent implements OnInit, AfterContentChecked {

  tipos = [{ nome: 'Padrao' }, { nome: 'Igreja' }]; // Tipo padrão é o tipo que grava null no igrejaId do Banco, tadas a Igreja podem ver. Igreja grava o id da igreja do usuario, outras igreja não pode ver.

  classificacao = [
    { nome: 'Adulto' },
    { nome: 'Infanto Juvenil' }
  ];

  nomeIgrejaSignal = nomeIgrejaSignal;
  igrejaIdSignal = igrejaIdSignal;
  perfilSignal = perfilSignal;

  nomeIgreja = nomeIgrejaSignal();
  igrejaId = igrejaIdSignal();
  perfil = perfilSignal();

  // private route = inject(ActivatedRoute);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private classeService = inject(ClasseService);

  status = [
    { nome: 'Ativo' },
    { nome: 'Inativo' }
  ];

  currentAction!: string;
  classeForm!: FormGroup;
  submittingForm: boolean = false;
  pageTitle!: string;
  classe: ClasseDTO = new ClasseDTO();
  id!: number;

  imodo: number = 0;

  classeId!: number;

  subscription!: Subscription;


  @ViewChild('dtclasse') grid!: Table;

  totalClassesSistema!: number;
  totalClassesIgreja!: number;

  totalRegistros: number = 0

  classes: ClasseDTO[] = [];

  error = '';

  public page = 0;
  public linesPerPage = 10;
  public nome = '';

  constructor(
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.setCurrentAction();
    this.buildClasseForm();
    // this.loadClasse(cl);
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
      this.createClasse();
    else this.updateClasse();
  }

  private buildClasseForm() {
    this.classeForm = this.formBuilder.group({
      id: [null],
      status: ['Ativo', [Validators.required]],
      classificacao: [null, [Validators.required]],
      faixaEtaria: [null, [Validators.required]],
      nome: [null, [Validators.required]], // As vezes tem que deixar vazio "" ao invés de null p/ não dá BO
      tipo: ['Padrao'], // Campo inexistente no banco. Utilizados apenas para Admin para setar null em igrejaId
      igrejaId: [this.perfil == 'ADMIN' ? null : this.igrejaId],

    });
  }

  ///////////////////////////// Tipo   ///////////////////////////
  onChangeTipoPadraoIgreja(event: { value: string }) {
    if (event.value === 'Padrao') {
      this.classeForm.controls['igrejaId'].setValue(null);
    } else {
      this.classeForm.controls['igrejaId'].setValue(this.igrejaId);
    }
  }

  loadClassesLazy(event: any) {
    const page = event!.first! / event!.rows!; // divisão para encontrar a paginações
    this.linesPerPage = event.rows;
    this.loadClasses(this.igrejaId, this.nome.toLowerCase(), page, this.linesPerPage);
  }


  loadClasses(igrejaId: number, nome: string, page: number, linesPerPage: number) {
    this.classeService.getByPageClasseFromIgreja(igrejaId, nome, page, linesPerPage)
      .subscribe({
        next: (response) => {
          this.classes = response['content'].sort((a: { id: number; }, b: { id: number; }) => b.id - a.id);
          this.totalRegistros = response.totalElements
        },
        error: (error) => {
          this.error = error;
        }
      });
  }

  resetModal() {
    this.classeForm.reset();
    this.classeForm.controls['igrejaId'].setValue(this.igrejaId)
    this.classeForm.controls['status'].setValue("Ativo")
  }

  exclusaoClasse(classe: ClasseDTO) {
    Swal.fire({
      title: 'Exclusão',
      text: 'Tem certeza que deseja excluir este registro?',
      icon: 'error',
      showCloseButton: true,
      showCancelButton: true,
    }).then((willDelete) => {
      if (willDelete.dismiss) {
        Swal.fire('Exclusão Cancelada', 'Seu registro está seguro', 'success');
      } else {
        this.excluir(classe);
        Swal.fire('Exclusão', 'Registro excluido com sucesso!', 'success');
      }
    });
  }

  excluir(classe: any) {
    this.classeService.delete(classe.id)
      .subscribe({
        next: () => {
          this.classes = this.classes.filter(element => element != this.classe.id)
          this.grid.reset();//atualiza a tabela do primeng
        },
        error: () => { },
      });
  }


  loadClasse(classe: ClasseDTO) {
    if (this.imodo == 1) {
      this.classeId = classe.id ?? 0;
      this.classeService.findById(this.classeId).subscribe(
        (response) => {
          this.classe = response;
          this.classeForm.patchValue(this.classe); // binds loaded classe data to classeForm
          this.classeForm.controls['tipo'].setValue(
            this.classe.igrejaId ? 'Igreja' : 'Padrao'
          );
        },
        (_error) => { }
      );
    } else {
      this.resetModal()
    }
  }

  private setPageTitle() {
    if (this.imodo === 0)
      this.pageTitle = 'Inserindo: Nova classe';
    else {
      const classeName = 'Editando: ' + this.classe.nome || '';
      this.pageTitle = classeName;
    }
  }

  public createClasse() {
    const classe: ClasseDTO = this.classeForm.value;
    this.classeService.create(classe).subscribe(
      (response: any): void => {
        this.id = parseInt(this.extractId(response.headers.get('location'))); // Extrai o Id da URI retornada do banco
        this.classe.id = this.id;
        this.grid.reset();//atualiza a tabela do primeng
        this.actionsForSuccess();
      },
      (_error) => { }
    );
  }

  public updateClasse() {
    const classe: ClasseDTO = Object.assign(
      new ClasseDTO(),
      this.classeForm.value
    );
    this.classeService.update(classe)
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

