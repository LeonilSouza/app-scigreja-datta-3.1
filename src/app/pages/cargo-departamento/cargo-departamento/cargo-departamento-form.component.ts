import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, Params, RouterModule, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { ConfirmationService } from 'primeng/api';

import Swal from 'sweetalert2';
import { CargoDeptoDTO } from 'src/app/theme/shared/models/cargo-depto.dto';
import { DepartamentoDTO } from 'src/app/theme/shared/models/departamento.dto';
import { PessoaDTO } from 'src/app/theme/shared/models/pessoa.dto';
import { CargoDTO } from 'src/app/theme/shared/models/cargo.dto';
import { CargoDepartamentoService } from 'src/app/theme/shared/services/cargo-departamento.service';
import { DepartamentoService } from 'src/app/theme/shared/services/departamento.service';
import { PessoaService } from 'src/app/theme/shared/services/pessoa.service';
import { CargoService } from 'src/app/theme/shared/services/cargo.service';
import { nomeIgrejaSignal, igrejaIdSignal, nomeUsuarioSignal, perfilSignal, setorIdSignal } from 'src/app/theme/shared/_helpers/shared-signals';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-cargo-departamento-form',
  templateUrl: './cargo-departamento-form.component.html',
  styleUrls: ['./cargo-departamento-form.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    // InputGroup,
    ButtonModule,
    RouterLink,
    CommonModule,
    SharedModule,
  ],
  providers: [
    CargoDepartamentoService,
    DepartamentoService,
    CargoService
  ]
})

export class CargoDepartamentoFormComponent implements OnInit {

  nomeIgrejaSignal = nomeIgrejaSignal; //Signal 
  igrejaIdSignal = igrejaIdSignal;
  nomeUsuarioSignal = nomeUsuarioSignal;
  perfilSignal = perfilSignal;
  setorIdSignal = setorIdSignal;

  nomeIgreja = nomeIgrejaSignal();
  igrejaId = igrejaIdSignal();
  nomeUsuario = nomeUsuarioSignal();
  perfil = perfilSignal();

  cargoDeptos: CargoDeptoDTO[] = [];

  currentAction: string;
  cargoDeptoForm: FormGroup;
  serverErrorMessages: string[] = null;
  pageTitle: string;
  submittingForm: boolean = false;
  cargoDepto: CargoDeptoDTO = new CargoDeptoDTO();
  id: number;
  cargoDeptoId: number;
  cargoDepto_id: number;
  departamentos: DepartamentoDTO[] = [];
  pessoas: PessoaDTO[] = [];
  cargos: CargoDTO[] = [];

  cargoId: number;
  departamentoId: number;
  pessoaId: number;

  nomeCargo: string;
  nomeDepartamento: string;
  nomePessoa: string;
  nomeConjunto: string;


  PageTitleModal: string;

  constructor(
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private router: Router,
    private formBuilder: FormBuilder,
    private toast: ToastrService,
    public cargoDeptoService: CargoDepartamentoService,
    public departamentoService: DepartamentoService,
    public pessoaService: PessoaService,
    public cargoService: CargoService,


  ) {

  }
  ngOnInit(): void {
    this.igrejaId = this.igrejaId;
    this.setCurrentAction();
    this.buildCargoDeptoForm();
    this.loadCargoDepto();
    this.loadDepartamentos();
    this.loadPessoas();
    this.loadCargosFuncao();
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
      this.createCargoDepto();
    else // currentAction == "edit"
      this.updateCargoDepto();
  }

  private buildCargoDeptoForm() {
    this.cargoDeptoForm = this.formBuilder.group({
      id: [null],
      nomePessoa: [null], // Qdo se usa o nome apenas para apresentação, tem que deixar vazio,  se deixar null dá BO
      nomeConjunto: [null],
      nomeDepartamento: [null],// Qdo se usa o nome apenas para apresentação, tem que deixar vazio,  se deixar null dá BO
      nomeCargo: [null],// Qdo se usa o nome apenas para apresentação, tem que deixar vazio,  se deixar null dá BO
      data: [null],
      departamentoId: [null, [Validators.required]],
      pessoaId: [null, [Validators.required]],
      cargoId: [null, [Validators.required]],
      igrejaId: [this.igrejaId]
    });
  }

  selectNomeDepartamento(event: { value: string }) {
     console.log(event.value)
    this.cargoDeptoForm.controls['nomeDepartamento'].setValue(event.value)
    this.cargoDeptoForm.controls['nomeConjunto'].setValue(event.value)
  }

  public selectNomePessoa(event: { value: string }) {
    this.cargoDeptoForm.controls['nomePessoa'].setValue(event.value)
    console.log(event.value)
  }

  public selectNomeCargo(event: { value: string }) {
    this.cargoDeptoForm.controls['nomeCargo'].setValue(event.value)
    console.log(event.value)

  }

  private loadCargoDepto() {
    if (this.currentAction == "edit") {
      let params: Observable<Params> = this.route.params
      params.subscribe(urlParams => {
        this.id = urlParams['id'];
        this.cargoDeptoId = urlParams['id'];
        this.cargoDeptoService.findById(this.id)

          .subscribe(
            (response) => {
              this.cargoDepto = response;

              // Preenche os respectivod Ids
              this.cargoId = response['cargo'].id;
              this.departamentoId = response['departamento'].id;
              this.pessoaId = response['pessoa'].id;
              // Preenche os nomes da listagem
              this.nomeCargo = response['cargo'].nome;
              this.nomeDepartamento = response['departamento'].nome;
              this.nomeConjunto = response['departamento'].nomeConjunto;
              this.nomePessoa = response['pessoa'].nome;

              //Seta os Ids
              this.cargoDeptoForm.patchValue(this.cargoDepto)   // binds loaded cargoDepto data to cargoDeptoForm
              this.cargoDeptoForm.controls['cargoId'].setValue(this.cargoId);
              this.cargoDeptoForm.controls['departamentoId'].setValue(this.departamentoId);
              this.cargoDeptoForm.controls['pessoaId'].setValue(this.pessoaId);

              // Seta os Nomes
              // Seta os Nomes
              this.cargoDeptoForm.controls['nomeCargo'].setValue(this.nomeCargo);
              this.cargoDeptoForm.controls['nomeDepartamento'].setValue(this.nomeDepartamento);
              this.cargoDeptoForm.controls['nomeConjunto'].setValue(this.nomeConjunto);
              this.cargoDeptoForm.controls['nomePessoa'].setValue(this.nomePessoa);

            },
            (error) => this.showError())
      })
    }
  }

  loadDepartamentos() {
    this.departamentoService.findAll()
      .subscribe(response => {
        this.departamentos = response['content'];
      },
        error => { });

  }

  loadPessoas() {
    let situacaoCadastral = 'Ativo'
    this.pessoaService.getPessoasAtivasFromIgreja(this.igrejaId, situacaoCadastral)
      .subscribe(
        response => {
          this.pessoas = response
        },
        error => { });
  }

  private loadCargosFuncao() {
    this.cargoService.getListCargoFromIgreja(this.igrejaId)
      .subscribe(
        response => {
          this.cargos = response;

        },
        (error) => this.showError())

  }

  private setPageTitle() {
    if (this.currentAction == 'new')
      this.pageTitle = "Inserindo: Novo Cargo Departamento"
    // this.pageTitleAcao = 'Cadastro'
    else {
      const cargoDeptoName = this.cargoDepto.nomePessoa || ""
      this.pageTitle = "Editando : " + cargoDeptoName;
      // this.pageTitleAcao = 'Alteração'
    }
  }

  public createCargoDepto() {
    const cargoDepto: CargoDeptoDTO = this.cargoDeptoForm.value;
    this.cargoDeptoService.create(cargoDepto)
      .subscribe(
        cargoDepto => {
          this.id = parseInt(this.extractId(cargoDepto.headers.get('location'))); // Extrai o Id da URI retornada do banco
          this.cargoDepto.id = this.id;
          this.toast.success('cargoDepto cadastrado com sucesso');
          Swal.fire('Cadastro', 'Registro inserido com sucesso!', 'success');
          this.actionsForSuccess(this.cargoDepto)
        },
        error => this.actionsForError(error)
      )
  }

  public updateCargoDepto() {
    const cargoDepto: CargoDeptoDTO = Object.assign(new CargoDeptoDTO(), this.cargoDeptoForm.value);
    this.cargoDeptoService.update(cargoDepto)
      .subscribe(
        cargoDepto => {
          this.toast.success('Registro atualizado com sucesso');
          Swal.fire('Cadastro', 'Registro atualizado com sucesso!', 'success');
          this.actionsForSuccess(cargoDepto)

        },
        error => this.actionsForError(error)

      )
  }


  exclusaoCargoDpto(cargoDepto: CargoDeptoDTO) {
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
                  this.excluir(cargoDepto);
                  Swal.fire('Exclusão', 'Registro excluido com sucesso!', 'success');
              }
          });
      }
  
      excluir(cargoDepto: any) {
          this.cargoDeptoService.delete(cargoDepto.id)
              .subscribe({
                  next: () => {
                      this.router.navigate(['/cargodeptos']);
                  },
                  error: () => {},
              });
      }
  


  showError() {
    this.toast.error('Ocorreu um erro, tente mais tarde.');
  }

  // METODOS PRIVADOS


  private actionsForSuccess(cargoDepto: CargoDeptoDTO) {
    const path: string = this.route.snapshot.data['path'];

    // redirect/reload component page
    this.router.navigateByUrl(path, { skipLocationChange: true }).then(
      () => this.router.navigate([path, cargoDepto.id, 'edit'])
    )
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
