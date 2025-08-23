import { AfterContentChecked, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';


import { ConfirmationService, MessageService, PrimeNGConfig } from 'primeng/api';
import { DepartamentoDTO } from 'src/app/models/departamento.dto';
import { DepartamentoService } from 'src/app/services/departamento.service';
import { GLOBALS } from 'src/app/_helpers/globals';

//declare const $: any;

@Component({
    selector: 'app-departamento-form',
    templateUrl: './departamento-form.component.html',
    styleUrls: ['./departamento-form.component.scss'],
    encapsulation: ViewEncapsulation.None //as vezes não deixa aparecer o input da foto
})

export class DepartamentoFormComponent implements OnInit, AfterContentChecked {

  tipos = ['Padrao', 'Igreja']; // Tipo padrão é o tipo que grava null no igrejaId do Banco, tadas a Igreja podem ver. Igreja grava o id da igreja do usuario, outras igreja não pode ver.

  departamentos: DepartamentoDTO[]  = [];
  
  currentAction: string;
  departamentoForm: FormGroup;
  serverErrorMessages: string[] = null;
  pageTitle: string;
  submittingForm: boolean = false;
  departamento: DepartamentoDTO = new DepartamentoDTO();
  id: number;
  departamentoId: number;
  departamento_id: number;

  nomeIgreja: string = GLOBALS.nomeIgreja;

  perfil: string = GLOBALS.perfil;

  igrejaId: number = GLOBALS.igrejaId;

  subscription: Subscription;

  constructor(
    public departamentoService: DepartamentoService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    public primeNGConfig: PrimeNGConfig

  ) {}

  ngOnInit(): void {
    this.setCurrentAction();
     this.buildDepartamentoForm();
     this.loadDepartamento();

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
      this.createDepartamento();
    else // currentAction == "edit"
      this.updateDepartamento();
  }

  private buildDepartamentoForm() {
    this.departamentoForm = this.formBuilder.group({
                        id: [null],
                      nome: [null, [Validators.required]], // As vezes tem que deixar vazio "" ao invés de null p/ não dá BO
                      tipo: ['Padrao'], // Campo inexistente no banco. Utilizados apenas para Admin para setar null em igrejaId
              nomeConjunto: [null],
                  igrejaId: [(this.perfil == 'ADMIN') ? null : this.igrejaId]
       });
      //  this.departamentoForm.controls['id'].disable(); // Desabilita o campo id 
  }

    ///////////////////////////// Tipo   ///////////////////////////
    public doSelectTipo = (value: any) => {
      if(value === 'Padrao') {
        this.departamentoForm.controls['igrejaId'].setValue(null);
      }else {
        this.departamentoForm.controls['igrejaId'].setValue(GLOBALS.igrejaId);
      }
    }


  confirmarExclusaoDepartamento(departamento: DepartamentoDTO): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir este registro?',
      accept: () => {
        this.excluir(departamento);
      }
    });
  }

  excluir(departamento: DepartamentoDTO) {
    this.departamentoService.delete(departamento.id)
      .subscribe(() => {
        this.router.navigate(['/departamentos'])
        this.messageService.add({ severity: 'success', summary: 'Successo', detail: 'Registro excluido com sucesso!' });
      },
        error => { });
  }

  private loadDepartamento()  {
    if (this.currentAction == "edit") {
      let params : Observable<Params> = this.route.params
          params.subscribe( urlParams => {
            this.id = urlParams['id'];
            this.departamentoId = urlParams['id'];
            this.departamentoService.findById(this.id)
             .subscribe(
                (response) => {
                  this.departamento = response;
                  this.departamentoForm.patchValue(this.departamento)   // binds loaded departamento data to departamentoForm
                  this.departamentoForm.controls['tipo'].setValue(this.departamento.igrejaId ? 'Igreja' : 'Padrao')
                },
                 (error) => this.showError())
              })
     }
   }
  
    private setPageTitle() {
      if (this.currentAction == 'new')
        this.pageTitle = "Novo Departamento"
      else{
        const departamentoName = this.departamento.nome || ""
        this.pageTitle = departamentoName;
      }
    }
  
    public createDepartamento(){
      const departamento: DepartamentoDTO =  this.departamentoForm.value;
      this.departamentoService.create(departamento)
        .subscribe(
           departamento => {
            this.id = parseInt(this.extractId(departamento.headers.get('location'))); // Extrai o Id da URI retornada do banco
            this.departamento.id = this.id;
            this.actionsForSuccess(this.departamento)
           },
           error => this.actionsForError(error)
         )
    }
  
    public updateDepartamento(){
      const departamento: DepartamentoDTO = Object.assign(new DepartamentoDTO(), this.departamentoForm.value);
       this.departamentoService.update(departamento)
         .subscribe(
          departamento =>  {
             this.actionsForSuccess(departamento)
  
           },
           error => this.actionsForError(error)
  
         )
     }
  
 
     showError() {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro no servidor tente mais tarde' });
      }
  
  // METODOS PRIVADOS
  
  
  private actionsForSuccess(departamento: DepartamentoDTO){
      const path: string = this.route.snapshot.parent.url[0].path;

      this.messageService.add({ severity: 'success', summary: 'Successo', detail: 'Operacão realizada com sucesso!' });

      this.router.navigateByUrl(path);
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