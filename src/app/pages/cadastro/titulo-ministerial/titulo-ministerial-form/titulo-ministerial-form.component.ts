import { AfterContentChecked, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

import Swal from 'sweetalert2';

import { ConfirmationService, MessageService, PrimeNGConfig } from 'primeng/api';
import { TituloMinisterialDTO } from 'src/app/models/titulo-ministerial.dto';
import { GLOBALS } from 'src/app/_helpers/globals';
import { TituloMinisterialService } from 'src/app/services/titulo-ministerial-service';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { NgxSelectModule } from 'ngx-select-ex';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { ButtonModule } from 'primeng/button';
import { NgIf } from '@angular/common';

//declare const $: any;

@Component({
    selector: 'app-titulo-ministerial-form',
    templateUrl: './titulo-ministerial-form.component.html',
    styleUrls: ['./titulo-ministerial-form.component.scss'],
    encapsulation: ViewEncapsulation.None //as vezes não deixa aparecer o input da foto
    ,
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, NgIf, ButtonModule, RouterLink, CardComponent, NgxSelectModule, NgbTooltip]
})

export class TituloMinisterialFormComponent implements OnInit, AfterContentChecked {

  tipos = ['Padrao', 'Igreja']; // Tipo padrão é o tipo que grava null no igrejaId do Banco, tadas a Igreja podem ver. Igreja grava o id da igreja do usuario, outras igreja não pode ver.

  currentAction: string;
  tituloMinisterialForm: FormGroup;
  serverErrorMessages: string[] = null;
  submittingForm: boolean = false;
  pageTitle: string;
  tituloMinisterial: TituloMinisterialDTO = new TituloMinisterialDTO();
  id: number;

  nomeIgreja: string = GLOBALS.nomeIgreja;

  tituloMinisterialId: number;

  perfil: string = GLOBALS.perfil;

  igrejaId: number = GLOBALS.igrejaId;

  subscription: Subscription;

  constructor(
    public tituloMinisterialService: TituloMinisterialService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService


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
  public doSelectTipo = (value: any) => {
    if (value === 'Padrao') {
      this.tituloMinisterialForm.controls['igrejaId'].setValue(null);
    } else {
      this.tituloMinisterialForm.controls['igrejaId'].setValue(GLOBALS.igrejaId);
    }
  }


  confirmarExclusaoTituloMinisterial(tituloMinisterial: TituloMinisterialDTO): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir este registro?',
      accept: () => {
        this.excluir(tituloMinisterial);
      }
    });
  }

  excluir(tituloMinisterial: TituloMinisterialDTO) {
    this.tituloMinisterialService.delete(tituloMinisterial.id)
      .subscribe(() => {
        this.router.navigate(['/titulos'])
        Swal.fire('Exclusão', 'Registro excluido com sucesso!', 'success');
        this.messageService.add({ severity: 'success', summary: 'Successo', detail: 'Registro excluido com sucesso!' });
      },
      (error) => this.showError())
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
      const tituloMinisterialName = "Editando: "+ this.tituloMinisterial.nome || ""
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
          this.actionsForSuccess(this.tituloMinisterial);
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
          this.actionsForSuccess(tituloMinisterial)
          Swal.fire('Atualização', 'Registro atualizado com sucesso!', 'success');
        },
        error => this.actionsForError(error)

      )
  }


  showError() {
    this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro no servidor tente mais tarde' });
  }

  // METODOS PRIVADOS


  private actionsForSuccess(tituloMinisterial: TituloMinisterialDTO) {
    const path: string = this.route.snapshot.parent.url[0].path;

    this.messageService.add({ severity: 'success', summary: 'Successo', detail: 'Operacão realizada com sucesso!' });

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