import { GLOBALS } from './../../../../shared/global/globals';
import { DepartamentoDTO } from 'src/app/models/departamento.dto';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { DepartamentoService } from 'src/app/services/departamento.service';




@Component({
  selector: 'app-departamento-form',
  templateUrl: './departamento-form.component.html',
  styleUrls: ['./departamento-form.component.css']
})

export class DepartamentoFormComponent implements OnInit {

  departamentos: DepartamentoDTO[]  = [];

  perfil = GLOBALS.perfil;

  currentAction: string;
  departamentoForm: FormGroup;
  serverErrorMessages: string[] = null;
  pageTitle: string;
  submittingForm: boolean = false;
  departamento: DepartamentoDTO = new DepartamentoDTO();
  id: number;
  departamentoId: number;
  departamento_id: number;

  PageTitleModal: string;
  tipo = ['Padrao', 'Normal'];



    constructor(
    private route : ActivatedRoute,
    public http: HttpClient,
    private router: Router,
    private formBuilder: FormBuilder,
    private toast: ToastrService,
    public departamentoService: DepartamentoService


       ) {

    }
     ngOnInit(): void {
     this.setCurrentAction();
     this.buildDepartamentoForm();
     this.loadDepartamento();

    }

    ngAfterContentChecked(){
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
                  nome: [null, [Validators.required]],
                  nomeConjunto: [null],
                  tipo: ['Normal'], //, [Validators.required]]
                  igrejaId: [GLOBALS.igrejaId, [Validators.required]],
         });
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
              },
               (error) => this.showError())
            })
   }
 }


  private setPageTitle() {
    if (this.currentAction == 'new')
      this.pageTitle = "Inserindo Novo Departamento"
      // this.pageTitleAcao = 'Cadastro'
    else{
      const departamentoName = this.departamento.nome || ""
      this.pageTitle = "Editando : " + departamentoName;
      // this.pageTitleAcao = 'Alteração'
    }
  }

  public createDepartamento(){
    const departamento: DepartamentoDTO =  this.departamentoForm.value;
    this.departamentoService.create(departamento)
      .subscribe(
         departamento => {
          this.id = parseInt(this.extractId(departamento.headers.get('location'))); // Extrai o Id da URI retornada do banco
          this.departamento.id = this.id;
          this.toast.success('departamento cadastrado com sucesso');
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
           this.toast.success('Departamento atualizado com sucesso');
           this.actionsForSuccess(departamento)

         },
         error => this.actionsForError(error)

       )
   }

  showError() {
    this.toast.error('Ocorreu um erro, tente mais tarde.');
  }

// METODOS PRIVADOS


private actionsForSuccess(departamento: DepartamentoDTO){
    const path: string = this.route.snapshot.parent.url[0].path;

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
