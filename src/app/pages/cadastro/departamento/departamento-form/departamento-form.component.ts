// Angular import
import { AfterContentChecked, Component, inject, OnInit } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, Params, RouterLink } from '@angular/router';
import { Subscription, Observable } from 'rxjs';

// project import

import Swal from 'sweetalert2';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { DepartamentoService } from 'src/app/theme/shared/services/departamento.service';
import { DepartamentoDTO } from 'src/app/theme/shared/models/departamento.dto';
import { igrejaIdSignal, nomeIgrejaSignal, perfilSignal } from 'src/app/theme/shared/_helpers/shared-signals';

@Component({
  selector: 'app-departamento-form',
  standalone: true,
  imports: [
    ButtonModule,
    SelectModule,
    RouterLink,
    ReactiveFormsModule,
  ],
  templateUrl: './departamento-form.component.html',
  styleUrl: './departamento-form.component.scss',
  providers: [
    MessageService,
    DepartamentoService
  ],
})
export class DepartamentoFormComponent implements OnInit, AfterContentChecked {

  nomeIgrejaSignal = nomeIgrejaSignal;
  igrejaIdSignal = igrejaIdSignal;
  perfilSignal = perfilSignal;

  nomeIgreja = nomeIgrejaSignal();
  igrejaId = igrejaIdSignal();
  perfil = perfilSignal();

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private departamentoService = inject(DepartamentoService);

  tipos = [{ nome: 'Padrao' }, { nome: 'Igreja' }]; // Tipo padrão é o tipo que grava null no igrejaId do Banco, tadas a Igreja podem ver. Igreja grava o id da igreja do usuario, outras igreja não pode ver.

  currentAction!: string;
  departamentoForm!: FormGroup;
  serverErrorMessages: string[] = [];
  submittingForm: boolean = false;
  pageTitle!: string;
  departamento: DepartamentoDTO = new DepartamentoDTO();
  id!: number;

  departamentoId!: number;

  subscription!: Subscription;

  constructor() { }

  ngOnInit(): void {
    this.setCurrentAction();
    this.buildDepartamentoForm();
    this.loadDepartamento();
  }

  ngAfterContentChecked() {
    this.setPageTitle();
  }

  private setCurrentAction() {
    if (this.route.snapshot.url[0].path == 'new') {
      this.currentAction = 'new';
    } else this.currentAction = 'edit';
  }

  submitForm() {
    this.submittingForm = true;

    if (this.currentAction == 'new')
      this.createDepartamento(); // currentAction == "edit"
    else this.updateDepartamento();
  }

  private buildDepartamentoForm() {
    this.departamentoForm = this.formBuilder.group({
      id: [null],
      nome: [null, [Validators.required]], // As vezes tem que deixar vazio "" ao invés de null p/ não dá BO
      tipo: ['Padrao'], // Campo inexistente no banco. Utilizados apenas para Admin para setar null em igrejaId
      igrejaId: [this.perfil == 'ADMIN' ? null : this.igrejaId],
    });
  }

  ///////////////////////////// Tipo   ///////////////////////////
  onChangeTipoPadraoIgreja(event: { value: string }) {
    if (event.value === 'Padrao') {
      this.departamentoForm.controls['igrejaId'].setValue(null);
    } else {
      this.departamentoForm.controls['igrejaId'].setValue(this.igrejaId);
    }
  }

  exclusaoDepartamento(departamento: DepartamentoDTO) {
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
        this.excluir(departamento);
        Swal.fire('Exclusão', 'Registro excluido com sucesso!', 'success');
      }
    });
  }

  excluir(departamento: any) {
    this.departamentoService.delete(departamento.id)
      .subscribe({
        next: () => {
          this.router.navigate(['/departamentos']);
        },
        error: () => { },
      });
  }

  private loadDepartamento() {
    if (this.currentAction == 'edit') {
      let params: Observable<Params> = this.route.params;
      params.subscribe((urlParams) => {
        this.id = urlParams['id'];
        this.departamentoId = urlParams['id'];

        this.departamentoService.findById(this.id).subscribe(
          (response) => {
            this.departamento = response;
            this.departamentoForm.patchValue(this.departamento); // binds loaded departamento data to departamentoForm
            this.departamentoForm.controls['tipo'].setValue(
              this.departamento.igrejaId ? 'Igreja' : 'Padrao'
            );
          },
          (_error) => this.showError()
        );
      });
    }
  }

  private setPageTitle() {
    if (this.currentAction == 'new')
      this.pageTitle = 'Inserindo: Nova departamento';
    else {
      const departamentoName = 'Editando: ' + this.departamento.nome || '';
      this.pageTitle = departamentoName;
    }
  }

  public createDepartamento() {
    const departamento: DepartamentoDTO = this.departamentoForm.value;
    this.departamentoService.create(departamento).subscribe(
      (response: any): void => {
        this.id = parseInt(this.extractId(response.headers.get('location'))); // Extrai o Id da URI retornada do banco
        this.departamento.id = this.id;
        this.actionsForSuccess();
        Swal.fire('Cadastro', 'Registro inserido com sucesso!', 'success');
      },
      (_error) => { }
    );
  }

  public updateDepartamento() {
    const departamento: DepartamentoDTO = Object.assign(
      new DepartamentoDTO(),
      this.departamentoForm.value
    );
    this.departamentoService.update(departamento)
      .subscribe(() => {
        this.actionsForSuccess();
        Swal.fire('Atualização', 'Registro atualizado com sucesso!', 'success');
      }),
      (error: any) => this.actionsForError(error);
  }

  showError() {
    // this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro no servidor tente mais tarde' });
  }

  // METODOS PRIVADOS

  private actionsForSuccess() {
    const path: string = 'departamentos';
    this.router.navigateByUrl(path);
  }

  private actionsForError(error: { status: number; _body: string }) {
    this.showError();

    this.submittingForm = false;

    if (error.status === 422)
      this.serverErrorMessages = JSON.parse(error._body).errors;
    else
      this.serverErrorMessages = [
        'Falha na comunicação com o servidor. Por favor, teste mais tarde.',
      ];
  }

  private extractId(location: string): string {
    // Extrai o Id da URL
    let position = location.lastIndexOf('/');
    return location.substring(position + 1, location.length);
  }
}
