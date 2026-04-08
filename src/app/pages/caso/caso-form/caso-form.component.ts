import { AfterContentChecked, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ConfirmationService, MessageService } from 'primeng/api';

import moment from 'moment';

import Swal from 'sweetalert2';
import { igrejaIdSignal, nomeIgrejaSignal, nomeUsuarioSignal, perfilSignal, setorIdSignal } from 'src/app/theme/shared/_helpers/shared-signals';
import { CasoDTO } from 'src/app/theme/shared/models/caso.dto ';
import { DisciplinaDTO } from 'src/app/theme/shared/models/disciplina.dto';
import { TipoFaltaDTO } from 'src/app/theme/shared/models/tipo-falta.dto';
import { CargoDTO } from 'src/app/theme/shared/models/cargo.dto';
import { PessoaDTO } from 'src/app/theme/shared/models/pessoa.dto';
import { IgrejaDTO } from 'src/app/theme/shared/models/igreja.dto';
import { CasoService } from 'src/app/theme/shared/services/caso.service';
import { StorageService } from 'src/app/theme/shared/services/storage.service';
import { IgrejaService } from 'src/app/theme/shared/services/igreja.service';
import { DisciplinaService } from 'src/app/theme/shared/services/disciplina.service';
import { PessoaService } from 'src/app/theme/shared/services/pessoa.service';
import { TipoFaltaService } from 'src/app/theme/shared/services/tipo-falta.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { CommonModule } from '@angular/common';
import { DatePicker } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';

//declare const $: any;

@Component({
  selector: 'app-caso-form',
  templateUrl: './caso-form.component.html',
  styleUrls: ['./caso-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SplitButtonModule,
    SharedModule,
    SelectModule,
    DatePicker,
    TableModule,
    RouterLink,
    ButtonModule
  ],

  providers: [
    CasoService,
    IgrejaService,
    DisciplinaService,
    PessoaService,
    TipoFaltaService

  ]
})

export class CasoFormComponent implements OnInit, AfterContentChecked {

  nomeIgrejaSignal = nomeIgrejaSignal; //Signal 
  igrejaIdSignal = igrejaIdSignal;
  nomeUsuarioSignal = nomeUsuarioSignal;
  perfilSignal = perfilSignal;
  setorIdSignal = setorIdSignal;

  nomeIgreja = nomeIgrejaSignal();
  igrejaId = igrejaIdSignal();
  nomeUsuario = nomeUsuarioSignal();
  perfil = perfilSignal();

  public ngxControl = new FormControl();

  dataAtual = moment();

  controle: boolean = false;

  subscription: Subscription = new Subscription;

  disciplinaCaso!: string;

  activeTab: string;

  foto: any;

  qtdMes: any;

  inicioProva = moment();
  finalProva: any;

  active = 1;
  activePills = 4;
  activeVetical = 'top';

  resultado = [
    { nome: 'Aguardando', value: 0 },
    { nome: 'Passou pela prova', value: 1 },
    { nome: 'Arquivado', value: 2 },
    { nome: 'Desligado', value: 3 }
  ];

  /*  Referente a CasoDTO */
  currentAction!: string;
  casoForm!: FormGroup;
  pageTitle!: string;
  pageTitleAcao!: string;
  serverErrorMessages: string[] = [];
  submittingForm: boolean = false;
  submittingFormParticipante: boolean = false;

  igreja!: IgrejaDTO;
  pessoa!: PessoaDTO[];
  pessoas!: PessoaDTO[];

  obreiros!: PessoaDTO[];
  disciplina!: DisciplinaDTO[];
  tipoFalta: TipoFaltaDTO[] = [];
  cargo!: CargoDTO[];
  tipoFaltas: TipoFaltaDTO[] = [];
  disciplinas: DisciplinaDTO[] = [];

  caso: CasoDTO = new CasoDTO();
  id!: number;

  PageTitleModal!: string;

  controleAlteracao!: string;

  valorSN: any = 's';
  jwtHelperService: JwtHelperService = new JwtHelperService();


  constructor(
    private casoService: CasoService,
    private route: ActivatedRoute,

    private toast: ToastrService,
    private router: Router,
    private formBuilder: FormBuilder,
    public storage: StorageService,
    public igrejaService: IgrejaService,
    public disciplinaService: DisciplinaService,
    public pessoaService: PessoaService,
    public tipoFaltaService: TipoFaltaService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,

  ) {

    this.activeTab = 'home';
  }

  ngOnInit(): void {
    this.igrejaId = this.igrejaId;
    this.setCurrentAction();
    this.buildCasoForm();
    this.loadPessoas();
    this.loadCaso();
    this.loadDisciplinas();
    this.loadTipoFaltas();
    this.loadObreiros();

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

  submitForm(): void {
    this.submittingForm = true;

    if (this.currentAction == "new")
      this.createCaso();
    else // currentAction == "edit"
      this.updateCaso();
  }

  private buildCasoForm() {
    this.casoForm = this.formBuilder.group({
      id: [null],
      nome: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(120)]],
      dataCadastro: [this.dataAtualFormatada(), [Validators.required]],
      dataCaso: [this.dataAtualFormatada(), [Validators.required]],
      dataArquivamento: [null],
      inicioProva: [this.dataAtualFormatada()],
      finalProva: [this.dataAtualFormatada()],
      disciplinaAplicada: [null, [Validators.required]],
      relato: [null, [Validators.required, Validators.minLength(5)]],
      tituloMin: ['Membro'],
      situacao: ['Prova'],
      numeroAta: [],
      local: ['Cuiabá/MT'],
      pauta: ['Tratamento de caso', Validators.required],
      horaInicio: ['20:00', [Validators.required, Validators.minLength(5)]],
      horaTermino: ['21:00', [Validators.required, Validators.minLength(5)]],
      anoLetivo: [this.anoLetivo()],
      resultado: ['Aguardando'],
      motivoEncerramento: [null],
      nomeEscrivao: [null],
      cargoEscrivao: [null],
      nomePresidente: [null],
      cargoPresidente: [null],
      siglaTituloMinPresidente: [null],
      siglaTituloMinEscrivao: [null],
      tipoMembro: [null],
      sequenciaAta: [null],
      observacao: [null],
      tipoFaltaCaso: ['Pecado contra a sã doutrina'],// Pauta da ata do caso

      igrejaId: [null, [Validators.required]],

      pessoaId: [null, [Validators.required]],


      presidenteId: [null, [Validators.required]],

      escrivaoId: [null, [Validators.required]],

      disciplinaId: [null, [Validators.required]],

      tipoFaltaId: [null, [Validators.required]],

      pessoa: this.casoForm = this.formBuilder.group({
        id: [null],
        nome: [null]
      }),

      disciplina: this.casoForm = this.formBuilder.group({

        nome: [null],
      }),

      tipoFalta: this.casoForm = this.formBuilder.group({
        id: [null],
        nome: [null],
      })
    });

  }

  // EVENTOS DO NGX-SELECT-EX

  public selectResultado(event: any) {
    let resultado = event.value;

    if (this.caso.resultado === 'Aguardando' || resultado === 'Aguardando') {
      this.casoForm.controls['dataArquivamento'].setValue(null);
      this.casoForm.controls['situacao'].setValue('Prova');
      this.casoForm.controls['motivoEncerramento'].setValue(null);
    }
    if (resultado !== 'Aguardando') {
      this.resultadoProva(resultado);
    }
  }

  public selectPessoa(event: any) {
    this.pessoa = this.pessoas.filter(pessoa => pessoa.id == event.value);
    this.casoForm.controls['pessoaId'].setValue(this.pessoa[0].id)
    this.casoForm.controls['nome'].setValue(this.pessoa[0].nome)
    this.casoForm.controls['tituloMin'].setValue(this.pessoa[0].tituloMin)
  }

  public selectDisciplina(event: any) {
    this.disciplina = this.disciplinas.filter(disciplina => disciplina.id == event.value);
    this.casoForm.controls['disciplinaId'].setValue(this.disciplina[0].id)
    this.casoForm.controls['disciplinaAplicada'].setValue(this.disciplina[0].nome)

    if (this.controle) { /* jogada para evitar essas execuções durante o builForm
                           Tive que colocar este controle por que todo esses comando nesta seleção 
                           são executados no carregamento loadCaso. Assim as datas apresentavam  diferentes.*/
      this.disciplinaCaso = this.disciplina[0].nome;
      this.inicioProva = this.casoForm.controls['inicioProva'].value;
      if (this.disciplinaCaso == "Prova de 60 dias" || "Observação de 60 dias") {
        this.casoForm.controls['finalProva'].setValue(this.dataAddMes(this.inicioProva, 2));
      }
      if (this.disciplinaCaso == "Desligamento e prova de 90 dias") {
        this.casoForm.controls['finalProva'].setValue(this.dataAddMes(this.inicioProva, 3));
      }
      if (this.disciplinaCaso == "Desligamento e prova indeterminada") {
        this.casoForm.controls['finalProva'].setValue('31/12/9999');
      }
      if (this.disciplinaCaso == "Desligamento") {
        this.casoForm.controls['finalProva'].setValue(null);
      }
    }
    this.controle = false; //jogada para evitar essas execuções durante o builForm.
  }

  valor(s: any) {//Alternativa para não usar o [(ngModel)] 
    this.valorSN = s;
  }


  crtDisciplina() {//  Tive que colocar este controle e evento  no dataPiker para deixar faser e gravar alterações de data no finalProva 
    this.controle = true;
  }

  public selectTipoFalta(event: any) {
    this.tipoFalta = this.tipoFaltas.filter(tipo => tipo.id == event.value);
    this.casoForm.controls['tipoFaltaId'].setValue(this.tipoFalta[0].id)
    this.casoForm.controls['tipoFaltaCaso'].setValue(this.tipoFalta[0].nome)
  }

  public selectPresidente(event: any) {
    this.pessoa = this.pessoas.filter(pessoa => pessoa.id == event.value);
    this.casoForm.controls['presidenteId'].setValue(this.pessoa[0].id)
    this.casoForm.controls['nomePresidente'].setValue(this.pessoa[0].nome)
    this.casoForm.controls['cargoPresidente'].setValue(this.pessoa[0].cargoPrincipal)
    this.casoForm.controls['siglaTituloMinPresidente'].setValue(this.pessoa[0].abreviaturaMin)
  }


  public selectSecretario(event: any) {
    this.pessoa = this.pessoas.filter(pessoa => pessoa.id == event.value);
    this.casoForm.controls['escrivaoId'].setValue(this.pessoa[0].id)
    this.casoForm.controls['nomeEscrivao'].setValue(this.pessoa[0].nome)
    this.casoForm.controls['cargoEscrivao'].setValue(this.pessoa[0].cargoPrincipal)
    this.casoForm.controls['siglaTituloMinEscrivao'].setValue(this.pessoa[0].abreviaturaMin)
  }


  private loadCaso() { // Obs->> Aqui é que deve ser ser carregado os dados para o buildForm pegando classes individualizadas
    if (this.currentAction == "edit") {
      let params: Observable<Params> = this.route.params
      params.subscribe(urlParams => {
        this.id = urlParams['id'];
        this.casoService.getById(this.id)
          .subscribe(
            (response) => {
              this.caso = response; // binds loaded caso
              this.casoForm.patchValue(this.caso)   // binds loaded caso data to CasoForm
              this.casoForm.controls['igrejaId'].setValue(this.igrejaId);
              this.casoForm.controls['tipoMembro'].setValue((this.caso as any)['pessoa'].tipoMembro); //Esta campo o build não carrega.  

              this.foto = (this.caso as any)['pessoa'].foto;

              this.pessoa = ((this.caso as any)['pessoa']); // binds loaded pais
              this.casoForm.controls['pessoaId'].setValue((this.caso as any)['pessoa'].id)

              this.disciplina = ((this.caso as any)['disciplina']); // binds loaded disciplina
              this.casoForm.controls['disciplinaId'].setValue((this.caso as any)['disciplina'].id)

              this.tipoFalta = ((this.caso as any)['tipoFalta']); // binds loaded tipoFalta
              this.casoForm.controls['tipoFaltaId'].setValue((this.caso as any)['tipoFalta'].id)

            },
            (error) => this.showError())
      })
    } else {
      if (this.currentAction == "new") {
        this.casoForm.controls['igrejaId'].setValue(this.igrejaId);
        this.casoForm.controls['tipoFaltaId'].setValue(1);
      }
    }
  }


  loadPessoas() {
    let situacaoCadastral = 'Ativo'
    this.pessoaService.getPessoasAtivasFromIgreja(this.igrejaId, situacaoCadastral)
      .subscribe(
        response => {
          this.pessoas = response;
        },
        error => { });
  }

  loadObreiros() {
    this.pessoaService.getByListaObreirosAtivosFromIgreja(this.igrejaId)
      .subscribe(
        response => {
          this.obreiros = response;
        },
        error => { });
  }


  loadDisciplinas() {
    this.disciplinaService.getListDisciplinaFromIgreja(this.igrejaId)
      .subscribe(
        response => {
          this.disciplinas = response;

        },
        (error) => this.showError())

  }

  loadTipoFaltas() {
    this.tipoFaltaService.getListTipoFaltaFromIgreja(this.igrejaId)
      .subscribe(
        response => {
          this.tipoFaltas = response;

        },
        (error) => this.showError())

  }

  private setPageTitle() {
    if (this.currentAction == 'new')
      this.pageTitle = "Novo Caso",
        this.pageTitleAcao = 'Cadastro'
    else {
      const casoName = this.caso.nome || ""
      this.pageTitle = "Editando Caso: " + casoName;
      this.pageTitleAcao = 'Alteração'
    }
  }

  public createCaso() {
    const caso: CasoDTO = this.casoForm.value;
    this.casoService.create(caso)
      .subscribe(
        caso => {
          this.id = parseInt(this.extractId(caso.headers.get('location')!)); // Extrai o Id da URI retornada do banco
          this.caso.id = this.id;
          this.actionsForSuccess(this.caso)

          Swal.fire('Registro', 'Cadastro realizado com sucesso!', 'success');
          // this.messageService.add({ severity: 'success', summary: 'Successo', detail: 'Registro salvo com sucesso!' });
        },
        error => this.actionsForError(error)
      )
  }

  public updateCaso() {
    const caso: CasoDTO = Object.assign(new CasoDTO(), this.casoForm.value);
    this.casoService.update(caso)
      .subscribe(
        caso => {
          this.actionsForSuccess(caso)

          Swal.fire('Atualização', 'Registro atualizado com sucesso!', 'success');
          // this.messageService.add({ severity: 'success', summary: 'Successo', detail: 'Registro atualizado com sucesso!' });
        },
        error => this.actionsForError(error)

      )
  }


  // Metodos privados

  exclusaoCaso(caso: CasoDTO) {
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
        this.excluir(caso);
        Swal.fire('Exclusão', 'Registro excluido com sucesso!', 'success');
      }
    });
  }

  excluir(caso: any) {
    this.casoService.delete(caso.id)
      .subscribe({
        next: () => {
          this.router.navigate(['/casos']);
        },
        error: () => { },
      });
  }


  showError() {
    this.toast.error('Ocorreu um erro, tente mais tarde.');
  }

  // METODOS PRIVADOS

  // Metodos para data moment
  dataAtualFormatada() {
    let data = new Date(),
      dia = data.getDate().toString().padStart(2, '0'),
      mes = (data.getMonth() + 1).toString().padStart(2, '0'),
      ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }

  anoLetivo() {
    let data = new Date(),
      ano = data.getFullYear();
    return `${ano}`;
  }
  //Fim moment

  resultadoProva(resultado: string) {
    if (resultado === "Passou pela prova") {
      this.casoForm.controls['dataArquivamento'].setValue(this.dataAtualFormatada());
      this.casoForm.controls['situacao'].setValue('Comunhão');
      this.casoForm.controls['motivoEncerramento'].setValue('Passou pela prova');

    }

    if (resultado == "Arquivado") {
      this.casoForm.controls['dataArquivamento'].setValue(this.dataAtualFormatada());
      this.casoForm.controls['situacao'].setValue('Arquivado');
    }

    if (resultado == "Desligado") {
      this.casoForm.controls['dataArquivamento'].setValue(this.dataAtualFormatada());
      this.casoForm.controls['situacao'].setValue('Desligado');
    }
  }


  dataAddMes(inicioProva: string | moment.Moment, qtdMes: number) { //Salvou minha vida// Adiciona mes em qualquer data.// Ate Formatada
    var dia;
    var mes
    var data = (inicioProva as any).split("/");
    var hj1 = data[2] + "-" + data[1] + "-" + data[0];
    var dtat = new Date(hj1);
    dtat.setDate(dtat.getDate());
    var myDate = new Date(hj1);
    myDate.setMonth(myDate.getMonth() + (qtdMes));
    var ano = myDate.getFullYear();
    dia = myDate.getDate(); if (dia < 10) { dia = '0' + dia };
    mes = (myDate.getMonth() + 1); if (mes < 10) { mes = '0' + mes }
    return (dia + "/" + mes + "/" + ano);
  }

  private dataAddMesDataAtual(mes: moment.DurationInputArg1) { // Retorna a data Atual "Apenas" mais meses// Outras datas não funciona
    return this.dataAtual.add(mes, 'month').format('L');
  }

  private dataAddDia(dias: moment.DurationInputArg1) { // Retorna a data Atual mais dias
    return this.dataAtual.add(dias, 'days').format('DD/MM/YYYY');
  }

  private dataAddAno(ano: moment.DurationInputArg1) { // Retorna a data Atual mais anos
    return this.dataAtual.add(ano, 'years').format('DD/MM/YYYY');
  }

  private actionsForSuccess(caso: CasoDTO) {
    const path: string = this.route.snapshot.data['path'];

    // redirect/reload component page
    this.router.navigateByUrl(path, { skipLocationChange: true }).then(
      () => this.router.navigate([path, caso.id, 'edit']))
  }



  private actionsForError(error: { status: number; _body: string; }) {
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

  // Biblioteca Terceiros

}
