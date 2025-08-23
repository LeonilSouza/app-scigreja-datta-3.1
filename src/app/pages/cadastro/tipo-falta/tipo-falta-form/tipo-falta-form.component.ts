import { AfterContentChecked, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

import { ConfirmationService, MessageService, PrimeNGConfig } from 'primeng/api';
import { GLOBALS } from 'src/app/_helpers/globals';
import { TipoFaltaDTO } from 'src/app/models/tipo-falta.dto';
import { TipoFaltaService } from 'src/app/services/tipo-falta.service';

//declare const $: any;

@Component({
  selector: 'app-tipo-falta-form',
  templateUrl: './tipo-falta-form.component.html',
  styleUrls: ['./tipo-falta-form.component.scss']
})

export class TipoFaltaFormComponent implements OnInit, AfterContentChecked {

  tipos = ['Padrao', 'Igreja']; // Tipo padrão é o tipo que grava null no igrejaId do Banco, tadas a Igreja podem ver. Igreja grava o id da igreja do usuario, outras igreja não pode ver.

  currentAction: string;
  tipoFaltaForm: FormGroup;
  serverErrorMessages: string[] = null;
  submittingForm: boolean = false;
  pageTitle: string;
  tipoFalta: TipoFaltaDTO = new TipoFaltaDTO();
  id: number;

  separacaoId: number;

  tipoFaltaId: number;

  nomeIgreja: string = GLOBALS.nomeIgreja;

  perfil: string = GLOBALS.perfil;

  igrejaId: number = GLOBALS.igrejaId;

  subscription: Subscription;

  constructor(
    public tipoFaltaService: TipoFaltaService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    public primeNGConfig: PrimeNGConfig

  ) {}

  ngOnInit(): void {
    this.setCurrentAction();
    this.buildTipoFaltaForm();
     this.loadTipoFalta();

  }

  ngAfterContentChecked() {
    this.setPageTitle();
  }

  private setCurrentAction() {
    if(this.route.snapshot.url[0].path == "new")
      this.currentAction = "new"
    else
      this.currentAction = "edit"

  }

  submitForm() {
    this.submittingForm = true;

    if(this.currentAction == "new")
      this.createTipoFalta();
    else // currentAction == "edit"
      this.updateTipoFalta();
  }

  private buildTipoFaltaForm() {
    this.tipoFaltaForm = this.formBuilder.group({
                  id: [null],
                nome: [null, [Validators.required]], // As vezes tem que deixar vazio "" ao invés de null p/ não dá BO
                tipo: ['Padrao'], // Campo inexistente no banco. Utilizados apenas para Admin para setar null em igrejaId
                igrejaId: [(this.perfil == 'ADMIN') ? null : this.igrejaId]
       });
      //  this.tipoFaltaForm.controls['id'].disable(); // Desabilita o campo id 
  }


      ///////////////////////////// Tipo   ///////////////////////////
      public doSelectTipo = (value: any) => {
        if(value === 'Padrao') {
          this.tipoFaltaForm.controls['igrejaId'].setValue(null);
        }else {
          this.tipoFaltaForm.controls['igrejaId'].setValue(GLOBALS.igrejaId);
        }
      }

  confirmarExclusaoTipoFalta(tipoFalta: TipoFaltaDTO): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir este registro?',
      accept: () => {
        this.excluir(tipoFalta);
      }
    });
  }

  excluir(tipoFalta: TipoFaltaDTO) {
    this.tipoFaltaService.delete(tipoFalta.id)
      .subscribe(() => {
        this.router.navigate(['/tipoFaltas'])
        this.messageService.add({ severity: 'success', summary: 'Successo', detail: 'Registro excluido com sucesso!' });
      },
        error => { });
  }

  private loadTipoFalta()  {
    if (this.currentAction == "edit") {
      let params : Observable<Params> = this.route.params
          params.subscribe( urlParams => {
            this.id = urlParams['id'];
            this.tipoFaltaId = urlParams['id'];
            this.tipoFaltaService.findById(this.id)
             .subscribe(
                (response) => {
                  this.tipoFalta = response;
                  this.tipoFaltaForm.patchValue(this.tipoFalta)   // binds loaded tipoFalta data to tipoFaltaForm
                  this.tipoFaltaForm.controls['tipo'].setValue(this.tipoFalta.igrejaId ? 'Igreja' : 'Padrao')
                },
                 (error) => this.showError())
              })
     }
   }
  
    private setPageTitle() {
      if (this.currentAction == 'new')
        this.pageTitle = "Nova descrição"
      else{
        const tipoFaltaName = this.tipoFalta.nome || ""
        this.pageTitle = tipoFaltaName;
      }
    }
  
    public createTipoFalta(){
      const tipoFalta: TipoFaltaDTO =  this.tipoFaltaForm.value;
      this.tipoFaltaService.create(tipoFalta)
        .subscribe(
          tipoFalta => {
            this.id = parseInt(this.extractId(tipoFalta.headers.get('location'))); // Extrai o Id da URI retornada do banco
            this.tipoFalta.id = this.id;
            this.actionsForSuccess(this.tipoFalta)
           },
           error => this.actionsForError(error)
         )
    }
  
    public updateTipoFalta(){
      const tipoFalta: TipoFaltaDTO = Object.assign(new TipoFaltaDTO(), this.tipoFaltaForm.value);
       this.tipoFaltaService.update(tipoFalta)
         .subscribe(
          tipoFalta =>  {
             this.actionsForSuccess(tipoFalta)
           },
           error => this.actionsForError(error)
  
         )
     }
  
 
     showError() {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro no servidor tente mais tarde' });
      }
  
  // METODOS PRIVADOS
  
  
  private actionsForSuccess(tipoFalta: TipoFaltaDTO){
      const path: string = this.route.snapshot.parent.url[0].path;

      this.messageService.add({ severity: 'success', summary: 'Successo', detail: 'Operacão realizada com sucesso!' });

      this.router.navigateByUrl(path)
      // this.router.navigateByUrl(path)
      // this.router.navigateByUrl(path, { skipLocationChange: true }).then(
      //   () => this.router.navigate([path, tipoFalta.id, 'edit'])
      // )
  }
  
  private actionsForError(error){
    this.showError();
    
  
    this.submittingForm = false;
  
    if(error.status === 422)
      this.serverErrorMessages = JSON.parse(error._body).errors;
    else
      this.serverErrorMessages = ["Falha na comunicação com o servidor. Por favor, teste mais tarde."]
  }
  
  private extractId(location : string) : string { // Extrai o Id da URL
    let position = location.lastIndexOf('/');
    return location.substring(position + 1, location.length);
  }
  
  
  }