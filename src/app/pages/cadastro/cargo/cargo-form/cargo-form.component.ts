import {
  AfterContentChecked,
  Component,
  inject,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import Swal from 'sweetalert2';

import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CargoDTO } from 'src/app/theme/shared/models/cargo.dto';
import { GLOBALS } from 'src/app/app-config';
import { CargoService } from 'src/app/theme/shared/services/cargo.service';
import { SelectModule } from 'primeng/select';

//declare const $: any;

@Component({
  selector: 'app-cargo-form',
  standalone: true,
  templateUrl: './cargo-form.component.html',
  styleUrls: ['./cargo-form.component.scss'],
  encapsulation: ViewEncapsulation.None, //as vezes não deixa aparecer o input da foto
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    RouterLink,
    SelectModule,
  ],
  providers: [CargoService, MessageService],
})
export class CargoFormComponent implements OnInit, AfterContentChecked {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private cargoService = inject(CargoService);
   private messageService = inject(MessageService);

  tipos = [{ nome: 'Padrao' }, { nome: 'Igreja' }]; // Tipo padrão é o tipo que grava null no igrejaId do Banco, tadas a Igreja podem ver. Igreja grava o id da igreja do usuario, outras igreja não pode ver.

  currentAction!: string;
  cargoForm!: FormGroup;
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

  constructor() {}

  ngOnInit(): void {
    this.setCurrentAction();
    this.buildCargoForm();
    this.loadCargo();
  }

  ngAfterContentChecked() {
    this.setPageTitle();
  }

  private setCurrentAction() {
    if (this.route.snapshot.url[0].path == 'new') 
      this.currentAction = 'new';
    else this.currentAction = 'edit';
  }

  submitForm() {
    this.submittingForm = true;

    if (this.currentAction == 'new')
      this.createCargo(); // currentAction == "edit"
    else this.updateCargo();
  }

  private buildCargoForm() {
    this.cargoForm = this.formBuilder.group({
      id: [null],
      nome: [null, [Validators.required]], // As vezes tem que deixar vazio "" ao invés de null p/ não dá BO
      tipo: ['Padrao'], // Campo inexistente no banco. Utilizados apenas para Admin para setar null em igrejaId
      igrejaId: [this.perfil == 'ADMIN' ? null : this.igrejaId],
    });
    //  this.cargoForm.controls['id'].disable(); // Desabilita o campo id
  }

  ///////////////////////////// Tipo   ///////////////////////////
  onChangeTipoPadraoIgreja(event: { value: string }) {
    if (event.value === 'Padrao') {
      this.cargoForm.controls['igrejaId'].setValue(null);
    } else {
      this.cargoForm.controls['igrejaId'].setValue(GLOBALS.igrejaId);
    }
  }

  exclusaoCargo(cargo: CargoDTO) {
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
        this.excluir(cargo);
        Swal.fire('Exclusão', 'Registro excluido com sucesso!', 'success');
      }
    });
  }

  excluir(cargo: CargoDTO) {
    this.cargoService.delete(cargo.id).subscribe(
      () => {
        this.router.navigate(['/cargos']);
      },
      (error) => {}
    );
  }

  private loadCargo() {
    if (this.currentAction == 'edit') {
      let params: Observable<Params> = this.route.params;
      params.subscribe((urlParams) => {
        this.id = urlParams['id'];
        this.cargoId = urlParams['id'];
        this.cargoService.findById(this.id).subscribe(
          (response) => {
            this.cargo = response;
            this.cargoForm.patchValue(this.cargo); // binds loaded cargo data to cargoForm
            this.cargoForm.controls['tipo'].setValue(
              this.cargo.igrejaId ? 'Igreja' : 'Padrao'
            );
          },
          (error) => this.showError()
        );
      });
    }
  }

  private setPageTitle() {
    if (this.currentAction == 'new') this.pageTitle = 'Novo Cargo';
    else {
      const cargoName = 'Editando: ' + this.cargo.nome || '';
      this.pageTitle = cargoName;
    }
  }

  public createCargo() {
    const cargo: CargoDTO = this.cargoForm.value;
    this.cargoService.create(cargo).subscribe(
      (cargo) => {
        this.id = parseInt(this.extractId(cargo.headers.get('location'))); // Extrai o Id da URI retornada do banco
        this.cargo.id = this.id;
        this.actionsForSuccess();
        Swal.fire('Cadastro', 'Registro inserido com sucesso!', 'success');
      },
      (error) => this.actionsForError(error)
    );
  }

  public updateCargo() {
    let cargo: CargoDTO = Object.assign(new CargoDTO(), this.cargoForm.value);
    this.cargoService.update(cargo).subscribe(
      (cargo) => {
        this.actionsForSuccess();
        Swal.fire('Atualização', 'Registro atualizado com sucesso!', 'success');
      },
      (error) => this.actionsForError(error)
    );
  }

  showError() {
    this.messageService.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Erro no servidor tente mais tarde',
    });
  }

  // METODOS PRIVADOS

  private actionsForSuccess() {
     const path: string = 'cargos';

    this.messageService.add({
      severity: 'success',
      summary: 'Successo',
      detail: 'Operacão realizada com sucesso!',
    });

    this.router.navigateByUrl(path);
  }

  private actionsForError(error) {
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
