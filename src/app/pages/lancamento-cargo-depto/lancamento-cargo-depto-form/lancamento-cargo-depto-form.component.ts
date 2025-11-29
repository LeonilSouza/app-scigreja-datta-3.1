import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, Params, RouterModule, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';

import Swal from 'sweetalert2';
import { DepartamentoDTO } from 'src/app/theme/shared/models/departamento.dto';
import { PessoaDTO } from 'src/app/theme/shared/models/pessoa.dto';
import { CargoDTO } from 'src/app/theme/shared/models/cargo.dto';
import { DepartamentoService } from 'src/app/theme/shared/services/departamento.service';
import { PessoaService } from 'src/app/theme/shared/services/pessoa.service';
import { CargoService } from 'src/app/theme/shared/services/cargo.service';
import { nomeIgrejaSignal, igrejaIdSignal, nomeUsuarioSignal, perfilSignal, setorIdSignal } from 'src/app/theme/shared/_helpers/shared-signals';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { LancamentoCargoDeptoService } from 'src/app/theme/shared/services/lancamento-cargo-depto.service';
import { LancamentoCargoDeptoDTO } from 'src/app/theme/shared/models/lancamento-cargo-depto.dto';

@Component({
  selector: 'app-lancamento-cargo-depto-form',
  templateUrl: './lancamento-cargo-depto-form.component.html',
  styleUrls: ['./lancamento-cargo-depto-form.component.scss'],
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
    LancamentoCargoDeptoService,
    DepartamentoService,
    CargoService
  ]
})

export class LancamentoCargoDeptoFormComponent implements OnInit {

  nomeIgrejaSignal = nomeIgrejaSignal; //Signal 
  igrejaIdSignal = igrejaIdSignal;
  nomeUsuarioSignal = nomeUsuarioSignal;
  perfilSignal = perfilSignal;
  setorIdSignal = setorIdSignal;

  nomeIgreja = nomeIgrejaSignal();
  igrejaId = igrejaIdSignal();
  nomeUsuario = nomeUsuarioSignal();
  perfil = perfilSignal();

  lancamentoCargoDeptos: LancamentoCargoDeptoDTO[] = [];

  currentAction: string;
  lancamentoCargoDeptoForm: FormGroup;
  serverErrorMessages: string[] = null;
  pageTitle: string;
  submittingForm: boolean = false;
  lancamentoCargoDepto: LancamentoCargoDeptoDTO = new LancamentoCargoDeptoDTO();
  id: number;
  lancamentoCargoDeptoId: number;
  lancamentoCargoDepto_id: number;
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
    private router: Router,
    private formBuilder: FormBuilder,
    private toast: ToastrService,
    public lancamentoCargoDeptoService: LancamentoCargoDeptoService,
    public departamentoService: DepartamentoService,
    public pessoaService: PessoaService,
    public cargoService: CargoService,


  ) {

  }
  ngOnInit(): void {
    this.igrejaId = this.igrejaId;
    this.setCurrentAction();
    this.buildLancamentoCargoDeptoForm();
    this.loadLancamentoCargoDepto();
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
      this.createLancamentoCargoDepto();
    else // currentAction == "edit"
      this.updateLancamentoCargoDepto();
  }

  private buildLancamentoCargoDeptoForm() {
    this.lancamentoCargoDeptoForm = this.formBuilder.group({
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
    this.lancamentoCargoDeptoForm.controls['nomeDepartamento'].setValue(event.value)
    this.lancamentoCargoDeptoForm.controls['nomeConjunto'].setValue(event.value)
  }

  public selectNomePessoa(event: { value: string }) {
    this.lancamentoCargoDeptoForm.controls['nomePessoa'].setValue(event.value)
    console.log(event.value)
  }

  public selectNomeCargo(event: { value: string }) {
    this.lancamentoCargoDeptoForm.controls['nomeCargo'].setValue(event.value)
    console.log(event.value)

  }

  private loadLancamentoCargoDepto() {
    if (this.currentAction == "edit") {
      let params: Observable<Params> = this.route.params
      params.subscribe(urlParams => {
        this.id = urlParams['id'];
        this.lancamentoCargoDeptoId = urlParams['id'];
        this.lancamentoCargoDeptoService.findById(this.id)

          .subscribe(
            (response) => {
              this.lancamentoCargoDepto = response;

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
              this.lancamentoCargoDeptoForm.patchValue(this.lancamentoCargoDepto)   // binds loaded lancamentoCargoDepto data to lancamentoCargoDeptoForm
              this.lancamentoCargoDeptoForm.controls['cargoId'].setValue(this.cargoId);
              this.lancamentoCargoDeptoForm.controls['departamentoId'].setValue(this.departamentoId);
              this.lancamentoCargoDeptoForm.controls['pessoaId'].setValue(this.pessoaId);

              // Seta os Nomes
              // Seta os Nomes
              this.lancamentoCargoDeptoForm.controls['nomeCargo'].setValue(this.nomeCargo);
              this.lancamentoCargoDeptoForm.controls['nomeDepartamento'].setValue(this.nomeDepartamento);
              this.lancamentoCargoDeptoForm.controls['nomeConjunto'].setValue(this.nomeConjunto);
              this.lancamentoCargoDeptoForm.controls['nomePessoa'].setValue(this.nomePessoa);

            },
            (error) => this.showError())
      })
    }
  }

  loadDepartamentos() {
    this.departamentoService.getListDepartamentoFromIgreja(this.igrejaId)
      .subscribe(response => {
        this.departamentos = response;
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
      const lancamentoCargoDeptoName = this.lancamentoCargoDepto.nomePessoa || ""
      this.pageTitle = "Editando : " + lancamentoCargoDeptoName;
      // this.pageTitleAcao = 'Alteração'
    }
  }

  public createLancamentoCargoDepto() {
    const lancamentoCargoDepto: LancamentoCargoDeptoDTO = this.lancamentoCargoDeptoForm.value;
    this.lancamentoCargoDeptoService.create(lancamentoCargoDepto)
      .subscribe(
        lancamentoCargoDepto => {
          this.id = parseInt(this.extractId(lancamentoCargoDepto.headers.get('location'))); // Extrai o Id da URI retornada do banco
          this.lancamentoCargoDepto.id = this.id;
          this.toast.success('lancamentoCargoDepto cadastrado com sucesso');
          Swal.fire('Cadastro', 'Registro inserido com sucesso!', 'success');
          this.actionsForSuccess(this.lancamentoCargoDepto)
        },
        error => this.actionsForError(error)
      )
  }

  public updateLancamentoCargoDepto() {
    const lancamentoCargoDepto: LancamentoCargoDeptoDTO = Object.assign(new LancamentoCargoDeptoDTO(), this.lancamentoCargoDeptoForm.value);
    this.lancamentoCargoDeptoService.update(lancamentoCargoDepto)
      .subscribe(
        lancamentoCargoDepto => {
          this.toast.success('Registro atualizado com sucesso');
          Swal.fire('Cadastro', 'Registro atualizado com sucesso!', 'success');
          this.actionsForSuccess(lancamentoCargoDepto)

        },
        error => this.actionsForError(error)

      )
  }


  exclusaoLancamentoCargoDepto(lancamentoCargoDepto: LancamentoCargoDeptoDTO) {
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
                  this.excluir(lancamentoCargoDepto);
                  Swal.fire('Exclusão', 'Registro excluido com sucesso!', 'success');
              }
          });
      }
  
      excluir(lancamentoCargoDepto: any) {
          this.lancamentoCargoDeptoService.delete(lancamentoCargoDepto.id)
              .subscribe({
                  next: () => {
                      this.router.navigate(['/lancamentocargodeptos']);
                  },
                  error: () => {},
              });
      }
  


  showError() {
    this.toast.error('Ocorreu um erro, tente mais tarde.');
  }

  // METODOS PRIVADOS


  private actionsForSuccess(lancamentoCargoDepto: LancamentoCargoDeptoDTO) {
    const path: string = this.route.snapshot.data['path'];

    // redirect/reload component page
    this.router.navigateByUrl(path, { skipLocationChange: true }).then(
      () => this.router.navigate([path, lancamentoCargoDepto.id, 'edit'])
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
