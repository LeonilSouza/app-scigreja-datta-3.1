import { AfterContentChecked, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

import Swal from 'sweetalert2';

import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { nomeIgrejaSignal, igrejaIdSignal, nomeUsuarioSignal, perfilSignal, setorIdSignal } from 'src/app/theme/shared/_helpers/shared-signals';
import { TituloMinisterialDTO } from 'src/app/theme/shared/models/titulo-ministerial.dto';
import { TituloMinisterialService } from 'src/app/theme/shared/services/titulo-ministerial-service';
import { SelectModule } from 'primeng/select';

//declare const $: any;

@Component({
  selector: 'app-titulo-ministerial-form',
  templateUrl: './titulo-ministerial-form.component.html',
  styleUrls: ['./titulo-ministerial-form.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    RouterLink,
    SelectModule
  ],
  providers: [
    TituloMinisterialService
  ]
})

export class TituloMinisterialFormComponent implements OnInit, AfterContentChecked {

  nomeIgrejaSignal = nomeIgrejaSignal; //Signal 
  igrejaIdSignal = igrejaIdSignal;
  nomeUsuarioSignal = nomeUsuarioSignal;
  perfilSignal = perfilSignal;
  setorIdSignal = setorIdSignal;

  nomeIgreja = nomeIgrejaSignal();
  igrejaId = igrejaIdSignal();
  nomeUsuario = nomeUsuarioSignal();
  perfil = perfilSignal();
  setorId = setorIdSignal();

  tipos = [{ nome: 'Padrao' }, { nome: 'Igreja' }]; // Tipo padrão é o tipo que grava null no igrejaId do Banco, tadas a Igreja podem ver. Igreja grava o id da igreja do usuario, outras igreja não pode ver.
  currentAction: string;
  tituloMinisterialForm: FormGroup;
  serverErrorMessages: string[] = null;
  submittingForm: boolean = false;
  pageTitle: string;
  tituloMinisterial: TituloMinisterialDTO = new TituloMinisterialDTO();
  id: number;

  tituloMinisterialId: number;

  subscription: Subscription;

  constructor(
    public tituloMinisterialService: TituloMinisterialService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: MessageService

  ) { }

  ngOnInit(): void {
    this.setCurrentAction();
    this.buildTituloMinisterialForm();
    this.loadTituloMinisterial();

  }

  ngAfterContentChecked() {
    this.setPageTitle();
  }

  private setCurrentAction() {
    if (this.route.snapshot.url[0].path == "new")
      this.currentAction = "new"
    else
      this.currentAction = "edit"

  }

  submitForm() {
    this.submittingForm = true;

    if (this.currentAction == "new")
      this.createTituloMinisterial();
    else // currentAction == "edit"
      this.updateTituloMinisterial();
  }

  private buildTituloMinisterialForm() {
    this.tituloMinisterialForm = this.formBuilder.group({
      id: [null],
      nome: [null, [Validators.required]], // As vezes tem que deixar vazio "" ao invés de null p/ não dá BO
      tipo: ['Padrao'], // Campo inexistente no banco. Utilizados apenas para Admin para setar null em igrejaId
      abreviacao: [null],
      igrejaId: [(this.perfil == 'ADMIN') ? null : this.igrejaId]
    });
  }

  ///////////////////////////// Tipo   ///////////////////////////
  onChangeTipoPadraoIgreja(event: { value: string }) {
    if (event.value === 'Padrao') {
      this.tituloMinisterialForm.controls['igrejaId'].setValue(null);
    } else {
      this.tituloMinisterialForm.controls['igrejaId'].setValue(this.igrejaId);
    }
  }

  exclusaoTitulo(tituloMinisterial: TituloMinisterialDTO) {
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
        this.excluir(tituloMinisterial);
        Swal.fire('Exclusão', 'Registro excluido com sucesso!', 'success');
      }
    });
  }

  excluir(tituloMinisterial: any) {
    this.tituloMinisterialService.delete(tituloMinisterial.id)
      .subscribe({
        next: () => {
          this.router.navigate(['/titulos']);
        },
        error: () => { },
      });
  }


  private loadTituloMinisterial() {
    if (this.currentAction == "edit") {
      let params: Observable<Params> = this.route.params
      params.subscribe(urlParams => {
        this.id = urlParams['id'];
        this.tituloMinisterialId = urlParams['id'];

        this.tituloMinisterialService.findById(this.id)
          .subscribe(
            (response) => {
              this.tituloMinisterial = response;
              this.tituloMinisterialForm.patchValue(this.tituloMinisterial)   // binds loaded tituloMinisterial data to tituloMinisterialForm
              this.tituloMinisterialForm.controls['tipo'].setValue(this.tituloMinisterial.igrejaId ? 'Igreja' : 'Padrao')
            },
            (error) => this.showError())
      })
    }
  }

  private setPageTitle() {
    if (this.currentAction == 'new')
      this.pageTitle = "Inserindo: Nova tituloMinisterial"
    else {
      const tituloMinisterialName = "Editando: " + this.tituloMinisterial.nome || ""
      this.pageTitle = tituloMinisterialName;
    }
  }

  public createTituloMinisterial() {
    const tituloMinisterial: TituloMinisterialDTO = this.tituloMinisterialForm.value;
    this.tituloMinisterialService.create(tituloMinisterial)
      .subscribe(
        tituloMinisterial => {
          this.id = parseInt(this.extractId(tituloMinisterial.headers.get('location'))); // Extrai o Id da URI retornada do banco
          this.tituloMinisterial.id = this.id;
          this.actionsForSuccess();
          Swal.fire('Cadastro', 'Registro inserido com sucesso!', 'success');
        },
        error => this.actionsForError(error)
      )
  }

  public updateTituloMinisterial() {
    const tituloMinisterial: TituloMinisterialDTO = Object.assign(new TituloMinisterialDTO(), this.tituloMinisterialForm.value);
    this.tituloMinisterialService.update(tituloMinisterial)
      .subscribe(
        tituloMinisterial => {
          this.actionsForSuccess()
          Swal.fire('Atualização', 'Registro atualizado com sucesso!', 'success');
        },
        error => this.actionsForError(error)

      )
  }


  showError() {
    this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro no servidor tente mais tarde' });
  }

  // METODOS PRIVADOS


  private actionsForSuccess() {
    const path: string = this.route.snapshot.data['path'];
    this.router.navigateByUrl(path)
  }

  private actionsForError(error) {
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