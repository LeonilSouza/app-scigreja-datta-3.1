import { TipoFaltaDTO } from './../../../models/tipo-falta.dto';
import { GLOBALS } from 'src/app/_helpers/globals';
import { IgrejaService } from './../../../services/igreja.service';
import { AfterContentChecked, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { JwtHelperService } from '@auth0/angular-jwt';
import { StorageService } from '../../../services/storage.service';
import { PessoaDTO } from 'src/app/models/pessoa.dto';
import { DisciplinaDTO } from 'src/app/models/disciplina.dto';
import { DisciplinaService } from 'src/app/services/disciplina.service';
import { CasoDTO } from 'src/app/models/caso.dto ';
import { CasoService } from 'src/app/services/caso.service';
import { INgxSelectOption } from 'ngx-select-ex';
import { PessoaService } from 'src/app/services/pessoa.service';
import { TipoFaltaService } from 'src/app/services/tipo-falta.service';
import { CargoDTO } from 'src/app/models/cargo.dto';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService, PrimeNGConfig } from 'primeng/api';

import moment from 'moment';

import Swal from 'sweetalert2';
import { IgrejaDTO } from 'src/app/models/igreja.dto';

//declare const $: any;

@Component({
  selector: 'app-caso-form',
  templateUrl: './caso-form.component.html',
  styleUrls: ['./caso-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class CasoFormComponent implements OnInit, AfterContentChecked {

  public ngxControl = new FormControl();

  dataAtual = moment();

  controle: boolean = false;

  subscription: Subscription;

  nomeIgreja: string = GLOBALS.nomeIgreja;

  disciplinaCaso: string;

  activeTab: string;

  foto: any;

  qtdMes: any;

  inicioProva = moment();
  finalProva: any;

  active = 1;
  activePills = 4;
  activeVetical = 'top';

  sexo = ['Masculino', 'Feminino'];
  tipoMembro = ['Membro', 'Obreiro', 'Congregado', 'InfantoJuvenil'];
  estadoCivil = ['Casado', 'Solteiro', 'Viúvo', 'Divorciado', 'União Estável'];
  situacao = ['Ativo', 'Inativo'];
  tipoAdemissao = ['Batismo', 'Conversão', 'Reconciliação', 'Transferência', 'União Estável'];
  resultado = ['Aguardando', 'Passou pela prova', 'Arquivado', 'Desligado'];
  escolaridade = ['Ensino Básico', 'Ensino Médio', 'Ensino Superior', 'Pós-Graduação', 'Mestrado', 'Doutorado'];
  igrejaBatismo = ['Assembléia de Deus', 'Presbiteriana', 'Casa da benção', 'Brasil para Cristo', 'Universal', 'Congragação cristã ', 'Igraja da graça', 'Batista', 'Adventista do sétimo dia', 'Outras'];

  /*  Referente a CasoDTO */
  currentAction: string;
  casoForm: FormGroup;
  pageTitle: string;
  pageTitleAcao: string;
  serverErrorMessages: string[] = null;
  submittingForm: boolean = false;
  submittingFormParticipante: boolean = false;

  igreja: IgrejaDTO;
  pessoa: PessoaDTO[];
  pessoas: PessoaDTO[];

  obreiros: PessoaDTO[];
  disciplina: DisciplinaDTO[];
  tipoFalta: TipoFaltaDTO[] = [];
  cargo: CargoDTO[];
  tipoFaltas: TipoFaltaDTO;
  disciplinas: DisciplinaDTO;

  caso: CasoDTO = new CasoDTO();
  id: number;

  igrejaId: number = GLOBALS.igrejaId;

  PageTitleModal: string

  controleAlteracao: string;

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
    public translate: TranslateService,
    public primeNGConfig: PrimeNGConfig,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,

  ) {

    this.activeTab = 'home';

    //Calendar PrimeNG
    translate.setDefaultLang('pt-br');

    this.subscription = this.translate.stream('primeng').subscribe(data => {
      this.primeNGConfig.setTranslation(data);
    });
  }

  ngOnInit(): void {
    this.igrejaId = GLOBALS.igrejaId;
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

  public doSelectOptionsResultado = (options: INgxSelectOption[]) => { // PEGA O NOME DO SELECT
    let resultado = options[0].value;

    if (this.caso.resultado === 'Aguardando' || resultado === 'Aguardando') {
      this.casoForm.controls['dataArquivamento'].setValue(null);
      this.casoForm.controls['situacao'].setValue('Prova');
      this.casoForm.controls['motivoEncerramento'].setValue(null);
    }
    if (resultado !== 'Aguardando') {
      this.resultadoProva(resultado);
    }
  }

  public doSelectOptionsPessoa = (options: INgxSelectOption[]) => { // PEGA O NOME DO SELECT
    this.casoForm.controls['pessoaId'].setValue(options[0].data.id)
    this.casoForm.controls['nome'].setValue(options[0].data.nome)
    this.casoForm.controls['tituloMin'].setValue(options[0].data.tituloMin)
  }

  public doSelectOptionsDisciplina = (options: INgxSelectOption[]) => { // PEGA O NOME DO SELECT
    this.casoForm.controls['disciplinaId'].setValue(options[0].data.id)
    this.casoForm.controls['disciplinaAplicada'].setValue(options[0].data.nome)

    if (this.controle) { /* jogada para evitar essas execuções durante o builForm
                         Tive que colocar este controle por que todo esses comando nesta seleção são executados no carregamento loadCaso. Assim as datas apresentavam  diferentes.*/
      this.disciplinaCaso = options[0].data.nome;
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

  public doSelectOptionsTipoFalta = (options: INgxSelectOption[]) => { // PEGA O NOME DO SELECT
    this.casoForm.controls['tipoFaltaId'].setValue(options[0].data.id)
    this.casoForm.controls['tipoFaltaCaso'].setValue(options[0].data.nome)
  }

  public doSelectOptionsPresidente = (options: INgxSelectOption[]) => { // PEGA O NOME DO SELECT
    this.casoForm.controls['presidenteId'].setValue(options[0].data.id)
    this.casoForm.controls['nomePresidente'].setValue(options[0].data.nome)
    this.casoForm.controls['cargoPresidente'].setValue(options[0].data.cargoAssinatura)
    this.casoForm.controls['siglaTituloMinPresidente'].setValue(options[0].data.abreviaturaMin)
  }

  public doSelectOptionsSecretario = (options: INgxSelectOption[]) => { // PEGA O NOME DO SELECT
    this.casoForm.controls['escrivaoId'].setValue(options[0].data.id)
    this.casoForm.controls['nomeEscrivao'].setValue(options[0].data.nome)
    this.casoForm.controls['cargoEscrivao'].setValue(options[0].data.cargoAssinatura)
    this.casoForm.controls['siglaTituloMinEscrivao'].setValue(options[0].data.abreviaturaMin)
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
              this.casoForm.controls['tipoMembro'].setValue(this.caso['pessoa'].tipoMembro); //Esta campo o build não carrega.  

              this.foto = this.caso['pessoa'].foto; 

              this.pessoa = (this.caso['pessoa']); // binds loaded pais
              this.casoForm.controls['pessoaId'].setValue(this.caso['pessoa'].id)

              this.disciplina = (this.caso['disciplina']); // binds loaded disciplina
              this.casoForm.controls['disciplinaId'].setValue(this.caso['disciplina'].id)

              this.tipoFalta = (this.caso['tipoFalta']); // binds loaded tipoFalta
              this.casoForm.controls['tipoFaltaId'].setValue(this.caso['tipoFalta'].id)

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
      this.pageTitle = "Editando: " + casoName;
      this.pageTitleAcao = 'Alteração'
    }
  }

  public createCaso() {
    const caso: CasoDTO = this.casoForm.value;
    this.casoService.create(caso)
      .subscribe(
        caso => {
          this.id = parseInt(this.extractId(caso.headers.get('location'))); // Extrai o Id da URI retornada do banco
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

  confirmarExclusaoCaso(Caso: CasoDTO): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir este registro?',
      accept: () => {
        this.excluir(Caso);
      }
    });
  }

  excluir(Caso: CasoDTO) {
    this.casoService.delete(Caso.id)
      .subscribe(() => {
        this.router.navigate(['/casos'])
        this.messageService.add({ severity: 'success', summary: 'Successo', detail: 'Registro excluido com sucesso!' });
      },
        error => { });
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

  resultadoProva(resultado) {
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
    console.log(this.casoForm.controls['situacao'].value)
  }


  dataAddMes(inicioProva, qtdMes) { //Salvou minha vida// Adiciona mes em qualquer data.// Ate Formatada
    var dia;
    var mes
    var data = inicioProva.split("/");
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

  private dataAddMesDataAtual(mes) { // Retorna a data Atual "Apenas" mais meses// Outras datas não funciona
    return this.dataAtual.add(mes, 'month').format('L');
  }

  private dataAddDia(dias) { // Retorna a data Atual mais dias
    return this.dataAtual.add(dias, 'days').format('DD/MM/YYYY');
  }

  private dataAddAno(ano) { // Retorna a data Atual mais anos
    return this.dataAtual.add(ano, 'years').format('DD/MM/YYYY');
  }

  private actionsForSuccess(caso: CasoDTO) {
    const path: string = this.route.snapshot.parent.url[0].path;

    // redirect/reload component page
    this.router.navigateByUrl(path, { skipLocationChange: true }).then(
      () => this.router.navigate([path, caso.id, 'edit']))
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

  // Biblioteca Terceiros

}
