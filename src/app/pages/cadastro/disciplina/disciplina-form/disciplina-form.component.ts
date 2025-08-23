// Angular import
import { AfterContentChecked, Component, inject, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router, Params, RouterLink } from '@angular/router';
import { Subscription, Observable } from 'rxjs';


// project import

import Swal from 'sweetalert2';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { DisciplinaService } from 'src/app/theme/shared/services/disciplina.service';
import { DisciplinaDTO } from 'src/app/theme/shared/models/disciplina.dto';
import { GLOBALS } from 'src/app/app-config';

@Component({
  selector: 'app-disciplina-form',
  standalone: true,
  imports: [
    ButtonModule,
    SelectModule,
    ButtonModule,
    RouterLink,
    ReactiveFormsModule
  ],
  templateUrl: './disciplina-form.component.html',
  styleUrl: './disciplina-form.component.scss',
  providers: [
    MessageService,
    DisciplinaService
  ]
})

export class DisciplinaFormComponent implements OnInit, AfterContentChecked {
  
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private disciplinaService = inject(DisciplinaService);
  private messageService = inject(MessageService);
  
  tipos = [{ nome: 'Padrao' }, { nome: 'Igreja' }]; // Tipo padrão é o tipo que grava null no igrejaId do Banco, tadas a Igreja podem ver. Igreja grava o id da igreja do usuario, outras igreja não pode ver.

  currentAction!: string;
  disciplinaForm!: FormGroup;
  serverErrorMessages: string[] = [];
  submittingForm: boolean = false;
  pageTitle!: string;
  disciplina: DisciplinaDTO = new DisciplinaDTO();
  id!: number;

  register!: UntypedFormGroup;

  nomeIgreja: string = GLOBALS.nomeIgreja;

  disciplinaId!: number;

  perfil: string = GLOBALS.perfil;

  igrejaId: number = GLOBALS.igrejaId;

  subscription!: Subscription;

  constructor() { }

  ngOnInit(): void {
    this.setCurrentAction();
    this.buildDisciplinaForm();
    this.loadDisciplina();

    // Depois que passou para standalone component, o codigo abaixo parou de funcionar

     if (this.route.parent) {
      console.log('A rota é uma rota filha');
      console.log(this.route.parent);
      // console.log(this.route.parent.snapshot.routeConfig.children[0].data['path'])
    } else {
      console.log('A rota não é uma rota filha');
    }

    const path: any = this.route.snapshot.parent;
    console.log(path)
    // console.log(this.route.snapshot.parent.url[0]?.path)

  }

  ngAfterContentChecked() {
    this.setPageTitle();
  }

  private setCurrentAction() {
    if (this.route.snapshot.url[0].path == "new"){
      console.log(this.route.snapshot.url[0].path)
      this.currentAction = "new"
    }else
      this.currentAction = "edit"
  }

  submitForm() {
    this.submittingForm = true;

    if (this.currentAction == "new")
      this.createDisciplina();
    else // currentAction == "edit"
      this.updateDisciplina();
  }

  private buildDisciplinaForm() {
    this.disciplinaForm = this.formBuilder.group({
      id: [null],
      nome: [null, [Validators.required]], // As vezes tem que deixar vazio "" ao invés de null p/ não dá BO
      tipo: ['Padrao'], // Campo inexistente no banco. Utilizados apenas para Admin para setar null em igrejaId
      igrejaId: [(this.perfil == 'ADMIN') ? null : this.igrejaId]
    });
  }

  ///////////////////////////// Tipo   ///////////////////////////
  onChangeTipoPadraoIgreja(event: { value: string; }) {
    if (event.value === 'Padrao') {
      this.disciplinaForm.controls['igrejaId'].setValue(null);
    } else {
      this.disciplinaForm.controls['igrejaId'].setValue(GLOBALS.igrejaId);
    }
  }


  exclusaoDisciplina(disciplina: DisciplinaDTO) {
    Swal.fire({
      title: 'Exclusão',
      text: 'Tem certeza que deseja excluir este registro?',
      icon: 'error',
      showCloseButton: true,
      showCancelButton: true
    }).then((willDelete) => {
      if (willDelete.dismiss) {
        Swal.fire('Exclusão Cancelada', 'Seu registro está seguro', 'success');
      } else {
        this.excluir(disciplina);
        Swal.fire('Exclusão', 'Registro excluido com sucesso!', 'success');
      }
    });
  }



  excluir(disciplina: any) {
    this.disciplinaService.delete(disciplina.id)
      .subscribe(() => {
        this.router.navigate(['/disciplinas'])
      },
        (_error) => this.showError())
  }

  private loadDisciplina() {
    if (this.currentAction == "edit") {
      let params: Observable<Params> = this.route.params
      params.subscribe(urlParams => {
        this.id = urlParams['id'];
        this.disciplinaId = urlParams['id'];

        this.disciplinaService.findById(this.id)
          .subscribe(
            (response) => {
              this.disciplina = response;
              this.disciplinaForm.patchValue(this.disciplina)   // binds loaded disciplina data to disciplinaForm
              this.disciplinaForm.controls['tipo'].setValue(this.disciplina.igrejaId ? 'Igreja' : 'Padrao')
            },
            (_error) => this.showError())
      })
    }
  }

  private setPageTitle() {
    if (this.currentAction == 'new')
      this.pageTitle = "Inserindo: Nova disciplina"
    else {
      const disciplinaName = "Editando: " + this.disciplina.nome || ""
      this.pageTitle = disciplinaName;
    }
  }

  public createDisciplina() {
    const disciplina: DisciplinaDTO = this.disciplinaForm.value;
    this.disciplinaService.create(disciplina)
      .subscribe(
        (response: any): void => {
          this.id = parseInt(this.extractId(response.headers.get('location'))); // Extrai o Id da URI retornada do banco
          this.disciplina.id = this.id;
          this.actionsForSuccess();
          Swal.fire('Cadastro', 'Registro inserido com sucesso!', 'success');
        },
        _error => { }
      );
  }

  public updateDisciplina() {
    const disciplina: DisciplinaDTO = Object.assign(new DisciplinaDTO(), this.disciplinaForm.value);
    this.disciplinaService.update(disciplina)
      .subscribe(
        () => {
          this.actionsForSuccess()
          Swal.fire('Atualização', 'Registro atualizado com sucesso!', 'success');
        }
      ),
      (error: any) => this.actionsForError(error)
  }


  showError() {
    // this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro no servidor tente mais tarde' });
  }

  // METODOS PRIVADOS


  private actionsForSuccess() {
     const path: string = 'disciplinas';
      this.router.navigateByUrl(path  )
  }

  private actionsForError(error: { status: number; _body: string; }) {
    this.showError();


    this.submittingForm = false;

    if (error.status === 422)
      this.serverErrorMessages = JSON.parse(error._body).errors;
    else
      this.serverErrorMessages = ["Falha na comunicação com o servidor. Por favor, teste mais tarde."]
  }

  private extractId(location: string): string { // Extrai o Id da URL
    let position = location.lastIndexOf('/');
    return location.substring(position + 1, location.length);
  }


}