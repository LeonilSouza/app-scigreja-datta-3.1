import { AfterContentChecked, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import Swal from 'sweetalert2';

import { ConfirmationService, MessageService, PrimeNGConfig } from 'primeng/api';;
import { CargoDTO } from 'src/app/models/cargo.dto';
import { CargoService } from 'src/app/services/cargo.service';
import { GLOBALS } from 'src/app/_helpers/globals';
import { NgxSelectModule } from 'ngx-select-ex';
import { ButtonModule } from 'primeng/button';
import { NgIf } from '@angular/common';

//declare const $: any;

@Component({
    selector: 'app-cargo-form',
    templateUrl: './cargo-form.component.html',
    styleUrls: ['./cargo-form.component.scss'],
    encapsulation: ViewEncapsulation.None //as vezes não deixa aparecer o input da foto
    ,
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, NgIf, ButtonModule, RouterLink, NgxSelectModule]
})

export class CargoFormComponent implements OnInit, AfterContentChecked {

  tipos = ['Padrao', 'Igreja']; // Tipo padrão é o tipo que grava null no igrejaId do Banco, tadas a Igreja podem ver. Igreja grava o id da igreja do usuario, outras igreja não pode ver.

  currentAction: string;
  cargoForm: FormGroup;
  serverErrorMessages: string[] = null;
  submittingForm: boolean = false;
  pageTitle: string;
  cargo: CargoDTO = new CargoDTO();
  id: number;

  nomeIgreja: string = GLOBALS.nomeIgreja;

  separacaoId: number;

  tipoCargo: number = null;
  cargoId: number;

  perfil: string = GLOBALS.perfil;

  igrejaId: number = GLOBALS.igrejaId;

  subscription: Subscription;

  constructor(
    public cargoService: CargoService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    public primeNGConfig: PrimeNGConfig

  ) {}

  ngOnInit(): void {
    this.setCurrentAction();
     this.buildCargoForm();
     this.loadCargo();

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
      this.createCargo();
    else // currentAction == "edit"
      this.updateCargo();
  }

  private buildCargoForm() {
    this.cargoForm = this.formBuilder.group({
                  id: [null],
                nome: [null, [Validators.required]], // As vezes tem que deixar vazio "" ao invés de null p/ não dá BO
                tipo: ['Padrao'], // Campo inexistente no banco. Utilizados apenas para Admin para setar null em igrejaId. Seta null quando o tipo escolhido é = "Padrao"
                igrejaId: [(this.perfil == 'ADMIN') ? null : this.igrejaId]
       });
      //  this.cargoForm.controls['id'].disable(); // Desabilita o campo id 
  }

    ///////////////////////////// Tipo   ///////////////////////////
    public doSelectTipo = (value: any) => {    
      if(value === 'Padrao') {
        this.cargoForm.controls['igrejaId'].setValue(null);
      }else {
        this.cargoForm.controls['igrejaId'].setValue(GLOBALS.igrejaId);
      }
    }


  confirmarExclusaoCargo(cargo: CargoDTO): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir este registro?',
      accept: () => {
        this.excluir(cargo);
      }
    });
  }

  excluir(cargo: CargoDTO) {
    this.cargoService.delete(cargo.id)
      .subscribe(() => {
        this.router.navigate(['/cargos'])
        Swal.fire('Exclusão', 'Registro excluido com sucesso!', 'success');
        this.messageService.add({ severity: 'success', summary: 'Successo', detail: 'Registro excluido com sucesso!' });
      },
        error => { });
  }

  private loadCargo()  {
    if (this.currentAction == "edit") {
      let params : Observable<Params> = this.route.params
          params.subscribe( urlParams => {
            this.id = urlParams['id'];
            this.cargoId = urlParams['id'];
            this.cargoService.findById(this.id)
             .subscribe(
                (response) => {
                  this.cargo = response;
                  this.cargoForm.patchValue(this.cargo)   // binds loaded cargo data to cargoForm
                  this.cargoForm.controls['tipo'].setValue(this.cargo.igrejaId ? 'Igreja' : 'Padrao')
                },
                 (error) => this.showError())
              })
     }
   }
  
    private setPageTitle() {
      if (this.currentAction == 'new')
        this.pageTitle = "Novo Cargo"
      else{
        const cargoName = 'Editando: ' + this.cargo.nome || ""
        this.pageTitle = cargoName;
      }
    }
  
    public createCargo(){
      const cargo: CargoDTO =  this.cargoForm.value;
      this.cargoService.create(cargo)
        .subscribe(
           cargo => {
            this.id = parseInt(this.extractId(cargo.headers.get('location'))); // Extrai o Id da URI retornada do banco
            this.cargo.id = this.id;
            this.actionsForSuccess(this.cargo)
            Swal.fire('Cadastro', 'Registro inserido com sucesso!', 'success');
           },
           error => this.actionsForError(error)
         )
    }
  
    public updateCargo(){
      let cargo: CargoDTO = Object.assign(new CargoDTO(), this.cargoForm.value);
       this.cargoService.update(cargo)
         .subscribe(
          cargo =>  {
             this.actionsForSuccess(cargo)
             Swal.fire('Atualização', 'Registro atualizado com sucesso!', 'success');
  
           },
           error => this.actionsForError(error)
  
         )
     }
  
 
     showError() {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro no servidor tente mais tarde' });
      }
  
  // METODOS PRIVADOS
  
  
  private actionsForSuccess(cargo: CargoDTO){
      const path: string = this.route.snapshot.parent.url[0].path;

      this.messageService.add({ severity: 'success', summary: 'Successo', detail: 'Operacão realizada com sucesso!' });

      this.router.navigateByUrl(path)
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