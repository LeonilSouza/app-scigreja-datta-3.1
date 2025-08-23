import { Component, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Observable, Subject, Subscription, takeUntil } from 'rxjs';

import { ToastrService } from 'ngx-toastr';
import { JwtHelperService } from '@auth0/angular-jwt';

import { ConfirmationService, MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

import Swal from 'sweetalert2';

import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { NgbCollapse, NgbNavChangeEvent, NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { Dimensions, ImageCroppedEvent, ImageCropperModule, ImageTransform } from 'ngx-image-cropper';
import { InputMaskModule } from 'primeng/inputmask';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { NgClass } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { PaginatorModule } from 'primeng/paginator'
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { UiModalComponent } from 'src/app/theme/shared/components/modal/ui-modal/ui-modal.component';
import { TituloMinisterialService } from 'src/app/theme/shared/services/titulo-ministerial-service';
import { SharedService } from 'src/app/theme/shared/services/shared.service';
import { DocumentoService } from 'src/app/theme/shared/services/documento.service';
import { CargoService } from 'src/app/theme/shared/services/cargo.service';
import { CidadeService } from 'src/app/theme/shared/services/cidade.service';
import { PaisDTO } from 'src/app/theme/shared/models/pais.dto';
import { GLOBALS } from 'src/app/app-config';
import { PessoaDTO, PessoaListDTO } from 'src/app/theme/shared/models/pessoa.dto';
import { DocumentoDTO } from 'src/app/theme/shared/models/documento.dto';
import { IgrejaDTO } from 'src/app/theme/shared/models/igreja.dto';
import { TituloMinisterialDTO } from 'src/app/theme/shared/models/titulo-ministerial.dto';
import { CargoDTO } from 'src/app/theme/shared/models/cargo.dto';
import { CidadeDTO } from 'src/app/theme/shared/models/cidade.dto';
import { SeparacaoDTO } from 'src/app/theme/shared/models/separacao.dto';
import { FilhoDTO } from 'src/app/theme/shared/models/filho.dto';
import { HistoricoDTO } from 'src/app/theme/shared/models/historico.dto';
import { PessoaService } from 'src/app/theme/shared/services/pessoa.service';
import { SeparacaoService } from 'src/app/theme/shared/services/separacao.service';
import { StorageService } from 'src/app/theme/shared/services/storage.service';
import { IgrejaService } from 'src/app/theme/shared/services/igreja.service';
import { FilhoService } from 'src/app/theme/shared/services/filho.service';
import { HistoricoService } from 'src/app/theme/shared/services/historico.service';


//declare const $: any;

@Component({
  selector: 'app-pessoa-form',
  templateUrl: './pessoa-form.component.html',
  styleUrls: ['./pessoa-form.component.scss'],
  standalone: true,
  imports: [
    ButtonModule,
    RouterLink,
    NgClass,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    InputMaskModule,
    RouterLinkActive,
    NgbTooltip,
    InputTextModule,
    CalendarModule,
    ImageCropperModule,
    TableModule,
    SelectModule,
    DatePicker,
    InputGroupModule,
    InputGroupAddonModule,
    PaginatorModule,
    UiModalComponent,
    // JsonPipe,
    NgbCollapse,
    NgSelectModule,
    NgSelectComponent,
    // NgxMaskDirective
    InputIcon, IconField, InputTextModule
  ],
  providers: [
    MessageService,
    SharedService,
    TituloMinisterialService,
    ConfirmationService, DocumentoService,
    CargoService,
    CidadeService,
    // provideNgxMask()
  ]
})

export class PessoaFormComponent implements OnInit, AfterViewInit, OnDestroy {

  public isCollapsed = false;
  public isCollapsed1 = false;
  public isCollapsed2 = false;
  public isCollapsed3 = false;
  public isCollapsed4 = false;
  public isCollapsed5 = false;

  private destroy$: Subject<void> = new Subject<void>();


  active!: number;
  disabled = true;
  active3!: number;

  onNavChange(changeEvent: NgbNavChangeEvent) {
    if (changeEvent.nextId === 3) {
      changeEvent.preventDefault();
    }
  }

  toggleDisabled() {
    this.disabled = !this.disabled;
    if (this.disabled) {
      this.active3 = 1;
    }
  }

  igrejaBatismo = [
    { nome: 'Assembleia de Deus' }, { nome: 'Nova Aliança' }, { nome: 'Batista' }, { nome: 'Adventista' }, { nome: 'Adventista do Sétimo dia' },
    { nome: 'Presbiteriana' }, { nome: 'Congregação Cristã' }, { nome: 'Brasil para Cristo' }, { nome: 'Outras' }
  ];

  escolaridade = [
    { nome: 'Ensino Básico' }, { nome: 'Ensino Médio' }, { nome: 'Ensino Superior' },
    { nome: 'Pós-Graduação' }, { nome: 'Mestrado' }, { nome: 'Doutorado' }
  ];

  tipoAdemissao = [
    { nome: 'Batismo' }, { nome: 'Transferência' }, { nome: 'Conversão' },
    { nome: 'Apresentação' }, { nome: 'Reconciliação' }, { nome: 'Aclamação' }
  ];

  situacaoCadastral = [
    { nome: 'Ativo' }, { nome: 'Inativo' }, { nome: 'Transferido' }, { nome: 'Falecido' },
  ];

  situacaoEspiritual = [
    { nome: 'Comunhão' }, { nome: 'Prova' }, { nome: 'Arquivado' }, { nome: 'Desligado' }, { nome: 'Observação' }
  ];

  situacaoMinisterial = [
    { nome: 'Ativo' }, { nome: 'Inativo' }, { nome: 'Suspenso' }, { nome: 'Aguardando' }
  ];

  sexo = [
    { nome: 'Masculino' },
    { nome: 'Feminino' }
  ];

  tipoMembro = [
    { nome: 'Membro' }, { nome: 'Obreiro' }, { nome: 'Congregado' } // Congregado usado tambem para cadastro de crianças ate chegar aos 12 anos
  ];

  estadoCivil = [
    { nome: 'Casado' }, { nome: 'Casada' }, { nome: 'Solteiro' }, { nome: 'Solteira' }, { nome: 'Viúvo' },
    { nome: 'Viúva' }, { nome: 'Divorciado' }, { nome: 'Divorciada' }, { nome: 'União Estável' }
  ];

  public nomeCidade = '';

  // Consulta CEP ViaCep
  dataCep!: any[];

  // Consulta Paises API IBGE
  paises: PaisDTO[] = [];

  // Consulta Cidades API IBGE
  cidades: any[] = [];

  files!: Set<File>;

  controleTituloMin: boolean = false;

  ctr_situacao: number = 0;

  error = '';

  subscription!: Subscription;

  nomeIgreja: string = GLOBALS.nomeIgreja;

  iModo: number = 1;

  tipo_membro!: any;

  ctr_tipo_membro: boolean = false;

  perfil: string = GLOBALS.perfil;

  limpar_cargo: boolean = false;

  size!: number;

  public activeTab: string;

  // Upload Imagem
  imgBase64: any = '';  // cropper
  cpf!: boolean;
  imageChangedEvent: any = '';
  croppedImage: any = '';
  pessoaFoto!: PessoaDTO;
  documentoArquivo!: DocumentoDTO;
  canvasRotation = 0;
  rotation = 0;
  scale = 1;
  showCropper = false;
  containWithinAspectRatio = false;
  transform: ImageTransform = {};
  //cropper

  /*  Referente a PessoaDTO */
  currentAction!: string;
  pessoaForm!: FormGroup;
  separacaoForm!: FormGroup;
  documentoForm!: FormGroup;
  cargoForm!: FormGroup;
  filhoForm!: FormGroup;
  historicoForm!: FormGroup;

  pageTitle!: string;
  pageTitleAcao!: string;
  pageTitleSituacao!: string;
  serverErrorMessages: string[] = [];
  submittingForm: boolean = false;
  submittingFormSeparacao: boolean = false;
  submittingFormDocumento: boolean = false;
  submittingFormFilho: boolean = false;
  igrejas: IgrejaDTO[] = [];

  tituloMinisteriais: TituloMinisterialDTO[] = [];
  tituloMinisteriaisAux: TituloMinisterialDTO[] = [];

  cargos: CargoDTO[] = [];
  igreja: IgrejaDTO[] = [];
  id!: number;
  separacaoId!: number;
  imodo: number = 0;
  cargoId!: number;
  estadoId!: number;
  pessoas: PessoaListDTO[] = [];

  pessoa: PessoaDTO = new PessoaDTO();

  tituloMinisterial: TituloMinisterialDTO = new TituloMinisterialDTO();
  cidade: CidadeDTO = new CidadeDTO();


  public name = '';

  valorSN: any = 's';

  /*  Referente a ABA Separação */
  separacoes: SeparacaoDTO[] = [];
  separacao: SeparacaoDTO = new SeparacaoDTO();
  PageTitleModal!: string

  /*  Referente a ABA Documento */
  documentos: any[] = [];
  documento: DocumentoDTO = new DocumentoDTO();

  filhos: FilhoDTO[] = [];
  filho: FilhoDTO = new FilhoDTO();

  historicos: HistoricoDTO[] = [];
  historico: HistoricoDTO = new HistoricoDTO();

  igrejaId: any = GLOBALS.igrejaId;
  pessoaId!: any;
  nomeHieraquia!: string;

  idConjugeDropDown: boolean = false;

  jwtHelperService: JwtHelperService = new JwtHelperService();

  cidadesFiltradas!: any[];
  valoresSelecionados!: any[];


  constructor(
    private pessoaService: PessoaService,
    private route: ActivatedRoute,
    private router: Router,
    private sharedService: SharedService,
    private formBuilder: FormBuilder,
    private separacaoService: SeparacaoService,
    private documentoService: DocumentoService,
    private toastr: ToastrService,
    public storage: StorageService,
    public igrejaService: IgrejaService,
    public tituloMinisterialService: TituloMinisterialService,
    private messageService: MessageService,
    private filhoService: FilhoService,
    public translate: TranslateService,
    public cargoService: CargoService,
    public historicoService: HistoricoService,
    private cidadeService: CidadeService

  ) {
    this.activeTab = 'home';
  }

  ngOnInit(): void {
    this.igrejaId = GLOBALS.igrejaId;
    this.setCurrentAction();
    this.buildPessoaForm();
    this.buildHistoricoForm();
    this.buildSeparacaoForm();
    this.buildFilhoForm();
    this.loadIgreja();
    this.loadCidades(this.nomeCidade);
    this.loadPaises();
    this.loadPessoas();
    this.loadPessoa();
    this.buildDocumentoForm();
    this.loadCargos();
    this.loadTitulosMinisteriais();
  }

  onSearch(term: any) {
    let value1 = (term.target as HTMLInputElement).value; //Evento do input adicionado no template
    //Função para remover acentos caso usuário digite palavras com acento no input adicionado
    var acentoRemovido = value1.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    this.cidadesFiltradas = this.cidades.filter(item =>
      item.nomeSemAcento.toLowerCase().includes(acentoRemovido.toLowerCase())
    );
  }

  onFocus() { // Remove o foco do input original do ng select e passa o foco para o input adicionado.
    const focusinput = document.getElementById('focus-input');
    focusinput?.focus();
  }

  filtrarCidades() {
    this.cidadesFiltradas = this.cidades
  }


  valor(s: any) {//Alternativa para não usar o [(ngModel)] no cadastro de filhos
    this.valorSN = s;
  }

  ngAfterViewInit(): void {
    this.setPageTitle();
  }

  // novo
  ativaTab(value: string) { // Recurso para forçar activeTab a entrar na Aba novo
    if (value == 'novo') {
      this.activeTab == value;
      this.currentAction = 'new';
      this.iModo = 0;
    } else {
      this.currentAction = 'new';
      this.iModo = 1;
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  public setCurrentAction() {
    if (this.route.snapshot.url[0].path == "new") {
      this.currentAction = "new",
        this.activeTab = 'novo';
    } else
      this.currentAction = "edit"
  }

  submitForm() {
    this.submittingForm = true;
    if (this.currentAction == "new") {
      this.createPessoa();
    } else { // currentAction == "edit"
      this.updatePessoa();
      this.submittingForm = true;
      // this.router.navigate(["/pessoas"])
    }
  }


  submitFormSeparacao() {
    this.submittingFormSeparacao = true;
    if (this.imodo === 1)
      this.updateSeparacao();
    else
      this.createSeparacao();
  }


  submitFormFilho() {

    this.submittingFormFilho = true;
    this.createFilho();
  }

  private buildPessoaForm() {
    this.pessoaForm = this.formBuilder.group({
      id: [null],
      nome: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(120)]],
      nomeSemAcento: [null],
      email: [''], //[Validators.required, Validators.email]],
      cpfOuCnpj: [null],//['', [Validators.required, Validators.minLength(11), Validators.maxLength(14)]],
      nacionalidade: ["Brasil", [Validators.required]],
      naturalidade: [null],
      ufNatal: [null, [Validators.maxLength(2)]],
      rg: [null],
      dataNascimento: [null],//['', [Validators.required, Validators.minLength(11), Validators.maxLength(14)]],
      aniversario: [null],
      situacaoCadastral: ["Ativo"],
      situacaoEspiritual: ["Comunhão"],
      situacaoMinisterial: ["Não se Aplica"],
      tempoFe: [null],
      cartaoMembro: [null],
      idade: [null],
      escolaridade: [null],
      profissao: [null],
      membroDesde: [this.dataMesAno(), [Validators.required, Validators.minLength(6), Validators.maxLength(7)]],
      estadoCivil: [null],
      dataConversao: [null],
      dataBatismoES: [null],
      dataBatismoAguas: [null],
      cidadeBatismoAguas: [null],
      denominacaoBatismo: [null],
      membroRecebidoPor: [null, [Validators.required]],
      nomePai: [null],
      conjuge: [null],
      dataCasamento: [null],
      nomeMae: [null],
      setor: [null],
      nomeIgreja: [GLOBALS.nomeIgreja],
      foto: [null],
      sexo: [null, [Validators.required]],
      dataCadastro: [null],
      fotoURL: [null],
      telefone1: [null],
      telefone2: [null],
      celular1: [null],
      celular2: [null],
      tipoPessoa: ['Pessoa Fisica'],
      tipoMembro: ['', [Validators.required]],
      tituloMin: [null],
      abreviaturaMin: [null], //Pessoa
      logradouro: [null],
      numero: [null],
      complemento: [null],
      cidadeEndereco: [null],
      bairro: [null],
      cep: ['', [Validators.minLength(8), Validators.maxLength(9)]],
      ufEndereco: [null],
      conjugeId: [null],
      estadoId: [null],
      igrejaId: [GLOBALS.igrejaId, [Validators.required]],
      cargoPrincipal: [null],
      tituloMinisterialId: [10, [Validators.required]],
      dataHistorico: [null],
      idCidade: [null],

      situacaoCadastralAnterior: [null], //Apenas para mostrar na modal
      situacaoMinisterialAnterior: [null], //Apenas para mostrar na modal
      situacaoEspiritualAnterior: [null], //Apenas para mostrar na modal
      tituloMinisterialAnterior: [null], //Apenas para mostrar na modal
      tipoMembroAnterior: [null], //Apenas para mostrar na modal
    });
  }

  //FORMGROUP separacaoForm

  private buildSeparacaoForm() {
    this.separacaoForm = this.formBuilder.group({
      id: [null],
      credencial: [null, [Validators.required]],
      apresentadoPor: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(120)]],
      dataSeparacao: [null, [Validators.required]],
      localSeparacao: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(120)]],
      observacao: [null],
      pessoaId: [null, [Validators.required]]
    });
  }

  //FORMGROUP documentoForm

  private buildDocumentoForm() {
    this.documentoForm = this.formBuilder.group({
      id: [null],
      nomeArquivo: [null],
      arquivo: [null, [Validators.required]],
      data: [null],
      igrejaId: [this.igrejaId, [Validators.required]],
      pessoaId: [null]
    });
  }

  private buildHistoricoForm() {
    this.historicoForm = this.formBuilder.group({
      id: [null],
      data: [this.sharedService.dataAtualFormatada().toString()],
      usuario: [null],
      acao: [null],
      dadoAntigo: [null],
      dadoNovo: [null],
      ocorrencia: [null],
      modulo: [null],
      igrejaId: [this.igrejaId, [Validators.required]],
      pessoaId: [null, [Validators.required]],
      nomeMembro: [null]
    });
  }

  private buildFilhoForm() {
    this.filhoForm = this.formBuilder.group({
      id: [null],
      nome: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(120)]],
      email: [null],
      sexo: [null],
      dataNascimento: [null],
      cadastrado: ['s'],
      pessoaId: [null, [Validators.required]]
    });
  }

  onSelectNacionalidade() {
    if (this.pessoaForm.controls['nacionalidade'].value !== 'Brasil') {
      this.pessoaForm.controls['naturalidade'].setValue(" ");
      this.pessoaForm.controls['ufNatal'].setValue('');
    }
  }

  onChangeConjuge(id: { value: any; }) {
    if (id.value) {
      this.idConjugeDropDown = true;
      this.pessoaForm.controls['conjuge'].setValue(null);
      this.loadConjuge(id.value)
    }
  }

  loadConjuge(id: number) {
    this.pessoaService.getById(id)
      .subscribe({
        next: (response) => {
          this.pessoaForm.controls['conjuge'].setValue(response.nome);
        },
        error: () => { }
      });
  }

  onChangeDocumento(event: any, documento: DocumentoDTO): void {
    this.documentoArquivo = documento;
    const selectedFiles = <FileList>event.srcElement.files;
    this.size = selectedFiles[0].size
    let imagem = selectedFiles[0];

    if (this.size > 2000000) {
      this.documentoForm.controls['nomeArquivo'].setValue('');
      Swal.fire('Documentos', '"Arquivo excedeu o tamanho máximo permitido"', 'warning');
    } else {
      const fileNames = [];
      this.files = new Set();
      for (let i = 0; i < selectedFiles.length; i++) {
        fileNames.push(selectedFiles[i].name);
        this.files.add(selectedFiles[i]);
      }
      document.getElementById('fileLabel1')!.innerHTML = fileNames.join(', ');
    }
  }

  onChangeNovaSituacaoCadastral(evento: { value: any; }) {
    if (evento.value) {
      this.pessoaForm.controls['situacaoCadastral'].setValue(evento.value);
      this.historicoForm.controls['dadoAntigo'].setValue(this.pessoaForm.controls['situacaoCadastralAnterior'].value);
      this.historicoForm.controls['dadoNovo'].setValue(evento.value);
      this.historicoForm.controls['ocorrencia'].setValue('Situação Cadastral');
    }
  }

  onChangeNovaSituacaoEspiritual(evento: { value: any; }) {
    if (evento.value) {
      this.pessoaForm.controls['situacaoEspiritual'].setValue(evento.value);
      this.historicoForm.controls['dadoAntigo'].setValue(this.pessoaForm.controls['situacaoEspiritualAnterior'].value);
      this.historicoForm.controls['dadoNovo'].setValue(evento.value);
      this.historicoForm.controls['ocorrencia'].setValue('Situação Espiritual');
    }
  }

  onChangeNovaSituacaoMinisterial(evento: { value: string; }) {
    if (evento.value) {
      this.pessoaForm.controls['situacaoMinisterial'].setValue(evento.value);
      this.historicoForm.controls['dadoAntigo'].setValue(this.pessoaForm.controls['tituloMinisterialAnterior'].value + " | " + this.pessoaForm.controls['situacaoMinisterialAnterior'].value);
      this.historicoForm.controls['dadoNovo'].setValue(this.pessoaForm.controls['tituloMin'].value + " | " + evento.value);
      this.historicoForm.controls['ocorrencia'].setValue('Título | Situação Ministerial');
    }
  }

  onChangeNovoTituloMinisterial(evento: { value: number | undefined; }) {
    if (evento.value) {
      const titulo = this.tituloMinisteriais.filter(t => t.id == evento.value)
      this.pessoaForm.controls['abreviaturaMin'].setValue(titulo[0].abreviacao);
      this.pessoaForm.controls['tituloMin'].setValue(titulo[0].nome);

      this.historicoForm.controls['dadoAntigo'].setValue(this.pessoaForm.controls['tituloMinisterialAnterior'].value + " | " + this.pessoaForm.controls['situacaoMinisterial'].value);
      this.historicoForm.controls['dadoNovo'].setValue(titulo[0].nome + " | " + this.pessoaForm.controls['situacaoMinisterial'].value);
      this.historicoForm.controls['ocorrencia'].setValue('Título | Situação Ministerial');
    }
  }

  onChangeNovoTipoMembro(evento: { value: string; }) {
    if (evento.value == 'Obreiro') {
      this.pessoaForm.controls['situacaoMinisterial'].setValue('Ativo');
      this.pessoaForm.controls['tituloMinisterialId'].setValue(null); // para obrigar a escolha do titulo

      // Historico
      this.historicoForm.controls['dadoAntigo'].setValue(this.pessoaForm.controls['tipoMembroAnterior'].value);
      this.historicoForm.controls['dadoNovo'].setValue(evento.value);
      this.historicoForm.controls['ocorrencia'].setValue('Tipo de Membro');

    } else {
      this.pessoaForm.controls['tituloMin'].setValue("Membro");
      this.pessoaForm.controls['abreviaturaMin'].setValue(null);
      this.pessoaForm.controls['tituloMinisterialId'].setValue(10);
      this.pessoaForm.controls['situacaoMinisterial'].setValue('Não se Aplica');

      // Historico
      this.historicoForm.controls['dadoAntigo'].setValue(this.pessoaForm.controls['tipoMembroAnterior'].value);
      this.historicoForm.controls['dadoNovo'].setValue(evento.value);
      this.historicoForm.controls['ocorrencia'].setValue('Tipo de Membro');
    }
  }

  onChangeTipoMembro(nome: { value: string; }) {
    if (nome.value == "Membro" || "Congregado") {
      this.pessoaForm.controls['tituloMin'].setValue("Membro");
    }
  }

  onChangeGetTituloMinisterial(id: { value: any; }) {
    this.getTitulosMinisterial(id.value)
  }

  private getTitulosMinisterial(id: number) {
    this.tituloMinisterialService.findById(id)
      .subscribe({
        next: (response) => {
          this.pessoaForm.controls['tituloMin'].setValue(response.nome); // PASTOR PRESIDENTE, PASTOR DE SETOR E VICE
          response.nome == "Membro" ? this.pessoaForm.controls['situacaoMinisterial'].setValue("Não se Aplica") : this.pessoaForm.controls['situacaoMinisterial'].setValue("Ativo");
        },
        error: () => { }
      });
  }


  dataMesAno() {
    let data = new Date(),
      // dia = data.getDate().toString().padStart(2, '0'),
      mes = (data.getMonth() + 1).toString().padStart(2, '0'),
      ano = data.getFullYear();
    return `${mes}/${ano}`;

  }

  validaCPF(event: any) {
    this.cpf = (this.sharedService.validaCPF(event.target.value))
    if (this.cpf == false) {
      this.pessoaForm.controls['cpfOuCnpj'].setValue(null)
      this.toastr.warning('Cpf inválido!', '',);
    } else
      this.pessoaForm.controls['cpfOuCnpj'].setValue(this.sharedService.formatCnpjCpf(event.target.value));
  }

  removerFoto(pessoa: any): void {
    pessoa.foto = null;
    this.pessoaForm.controls['foto'].setValue(null);
    this.imageChangedEvent = null;
  }

  loadPessoas() {
    let situacaoCadastral = 'Ativo'
    this.pessoaService.getPessoasAtivasFromIgreja(GLOBALS.igrejaId, situacaoCadastral)
      .subscribe({
        next: (response) => {
          this.pessoas = response;
        },
        error: () => { }
      });
  }

  loadCidades(nomeCidade: string) {
    this.cidadeService.getListaCidadesUfEstados(nomeCidade)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.cidades = response['content'];

          // this.cidades = response['content'].map((c: { nome: any; uf: any; }) => {
          //   return {
          //     value: c.uf,
          //     label: c.nome
          //   };
          // });
        },
        error: () => { }
      });

  }


  public onChangeCidades(event: any) {
    if (event.id) {
      this.pessoaForm.controls['naturalidade'].setValue(event.nome + '/' + event.uf);
      this.pessoaForm.controls['idCidade'].setValue(event.id);
      this.pessoaForm.controls['ufNatal'].setValue(event.uf);
    }
  }

  loadPaises() {
    this.sharedService.getDataPaises()
      .then(async (dataPaises: any) => {
        let paises = await dataPaises.json();
        this.paises = paises.map((p: { id: { [x: string]: any; }; nome: any; }) => {
          return {
            sigla: p.id['ISO-ALPHA-2'], //Mapeia apenas o nome e a sigla do pais
            nome: p.nome
          }
        });
      },
        (error: any) => {
          this.errorApiIBGE(error);
        });

  }

  onCloseTMembroDropDown() {
    if (this.ctr_tipo_membro === false) {
      this.pessoaForm.controls['tipoMembro'].setValue(this.tipo_membro)
    };
  }


  // doSelectOptionsConjuge = (options: INgxSelectOption[]) => { // PEGA O NOME DO SELECT
  //   this.pessoaForm.controls['conjugeId'].setValue(options[0].data.id) // Escolhe os combo para gravar em banco
  // }

  public doSelectFilhos(value: any) {
    this.filhoForm.controls['email'].setValue(this.pessoaForm.controls['email'].value);
    this.filhoForm.controls['sexo'].setValue(this.pessoaForm.controls['sexo'].value);
    this.filhoForm.controls['dataNascimento'].setValue(this.pessoaForm.controls['dataNascimento'].value);
    this.createFilho();

  }


  ///////////////////////////// FIM - CONTROLES SELECT E DOSELECT NGX  ////////////////////

  public loadPessoa() { // Obs->> Aqui é que deve ser ser carregado os dados para o buildForm pegando classes individualizadas
    if (this.currentAction == "edit") {
      let params: Observable<Params> = this.route.params
      params.subscribe(urlParams => {
        this.id = urlParams['id'];
        this.pessoaId = urlParams['id'];
        this.pessoaService.getById(this.id)
          .subscribe(
            (response: any) => {
              this.pessoa = response; // binds loaded pessoa
              this.pessoaForm.patchValue(this.pessoa)   // binds loaded pessoa data to PessoaForm
              this.documentos = response['documentos']; // binds loaded Documentos
              this.filhos = response['filhos']; // binds loaded filhos

              //Historico
              this.historicos = response['historicos']; // binds loaded historicos
              this.historicoForm.controls['pessoaId'].setValue(this.pessoaId)
              this.historicoForm.controls['data'].setValue(this.sharedService.dataAtualFormatada());
              this.pessoaForm.controls['dataHistorico'].setValue(this.sharedService.dataAtualFormatada());
              this.historicoForm.controls['usuario'].setValue(GLOBALS.nomeUsuario);
              this.historicoForm.controls['acao'].setValue('Alteração');


              this.pessoaForm.controls['situacaoCadastralAnterior'].setValue(this.pessoa.situacaoCadastral); // Somente para mostrar na modal, não grava
              this.pessoaForm.controls['situacaoEspiritualAnterior'].setValue(this.pessoa.situacaoEspiritual); // Somente para mostrar na modal, não grava
              this.pessoaForm.controls['situacaoMinisterialAnterior'].setValue(this.pessoa.situacaoMinisterial); // Somente para mostrar na modal, não grava
              this.pessoaForm.controls['tipoMembroAnterior'].setValue(this.pessoa.tipoMembro); // Somente para mostrar na modal, não grava   
              this.pessoaForm.controls['tituloMinisterialAnterior'].setValue(this.pessoa.tituloMin); // Somente para mostrar na modal, não grava                      

              // Titulo Ministerial 
              this.tituloMinisterial = response['tituloMinisterial']
              this.pessoaForm.controls['tituloMinisterialId'].setValue(this.tituloMinisterial.id);
              this.pessoaForm.controls['tituloMin'].setValue(this.tituloMinisterial.nome);
              this.pessoaForm.controls['abreviaturaMin'].setValue(this.tituloMinisterial.abreviacao);

              this.pessoaForm.controls['tituloMinisterialId'].setValue(this.tituloMinisterial.id);

              this.tipo_membro = this.pessoa.tipoMembro;

              this.pessoaForm.controls['igrejaId'].setValue(GLOBALS.igrejaId);

              if (this.pessoa.dataNascimento) {
                this.pessoaForm.controls['idade'].setValue(this.sharedService.calcularIdade(this.pessoa.dataNascimento))
              } else {
                this.pessoaForm.controls['idade'].setValue('');
              }

              this.separacaoForm.controls['pessoaId'].setValue(this.id); //Necessário para Inclusao de Nova Separação
              this.separacao.id = this.id;

              // Igreja
              this.pessoaForm.controls['igrejaId'].setValue(GLOBALS.igrejaId);
              this.loadIgreja();// PARA PEGAR O NOME DO SETOR
              this.listaSeparacoes();
              this.cpf = this.sharedService.validaCPF(this.pessoaForm.controls['cpfOuCnpj'].value);
              if (this.cpf == false) { this.pessoaForm.controls['cpfOuCnpj'].setValue(null) };
            },

            error => { })
      })
    } else {
      if (this.currentAction == "new") {
        this.pessoaForm.controls['igrejaId'].setValue(this.igrejaId);
        //Historico
        this.historicoForm.controls['usuario'].setValue(GLOBALS.nomeUsuario);
        this.historicoForm.controls['acao'].setValue('Inclusão');
        this.historicoForm.controls['ocorrencia'].setValue('Novo Membro');

      }
    }
  }

  private loadTitulosMinisteriais() {
    this.tituloMinisterialService.getListTituloMinisterialFromIgreja(this.igrejaId)
      .subscribe(
        response => {
          this.tituloMinisteriais = response.sort((a: { id: number; }, b: { id: number; }) => b.id - a.id);

          // Pega titulos diferente de 'Membro'
          this.tituloMinisteriaisAux = this.tituloMinisteriais.filter(titulo => titulo.nome !== 'Membro');
        },
        (error) => this.actionsForError(error))
  }


  loadCargos() {
    this.cargoService.getListCargoFromIgreja(this.igrejaId)
      .subscribe({
        next: response => {
          this.cargos = response;
        },
        error: () => {
          (error: any) => this.actionsForError(error)
        }
      })
  }


  private loadIgreja() {
    this.igrejaService.getById(this.igrejaId)
      .subscribe(
        response => {
          this.igreja = response;
          this.pessoaForm.controls['setor'].setValue(response['setor'].nome);
        },
        (error) => this.actionsForError(error))

  }

  private setPageTitle() {
    if (this.currentAction == 'new')
      this.pageTitle = "Novo Membro"
    else {
      const pessoaName = this.pessoa?.nome || ""
      this.pageTitle = "Editando:  " + pessoaName;
    }
  }

  public setPageTitleSituacao(ctr: number) {
    if (ctr === 1) {
      this.ctr_situacao = ctr;
      this.pageTitleSituacao = "Alteração - Situação Cadastral";
    }

    if (ctr == 2) {
      this.ctr_situacao = 2;
      this.pageTitleSituacao = "Alteração - Situação Espiritual";
    }

    if (ctr == 3) {
      this.ctr_situacao = 3;
      this.pageTitleSituacao = "Alteração - Situação Ministerial";
    }

    if (ctr == 4) {
      this.ctr_situacao = 4;
      this.pageTitleSituacao = "Alteração - Tipo de Membro";
    }

  }

  public createPessoa() {
    // ESTE PARA DEIXAR TUDO EM CAIXA ALTA
    // this.pessoaForm.controls.nome.setValue(this.pessoaForm.controls.nome.value.toUpperCase()); /* Aqui que real mente coloca em caixa alta. 
    // Poque se o teclado estiver com o caps desl. grava miniscula  RsRS*/

    //ESTE PARA PRIMEIRA MAIUSCULAS
    // ESTE PARA DEIXAR TUDO EM CAIXA ALTA
    this.pessoaForm.controls['nome'].setValue(this.pessoaForm.controls['nome'].value.toUpperCase()); /* Aqui que real mente coloca em caixa alta. 
    
     // Poque se o teclado estiver com o caps desl. grava miniscula  RsRS*/
    //ESTE PARA PRIMEIRA MAIUSCULAS
    // this.pessoaForm.controls['nome'].setValue(this.sharedService.formataNome(this.pessoaForm.controls['nome'].value)); // Aqui formata o nome em Camel Case completo 

    // remove todos os acentos do nome, seta a coluna nomeSemAcento e grava a nela sem acentos apenas para pesquisa de membros
    this.pessoaForm.controls['nomeSemAcento'].setValue(this.sharedService.removerAcentos(this.pessoaForm.controls['nome'].value));

    let mba = this.pessoaForm.controls['membroDesde'].value;
    if (mba.length == 6) {
      let a = mba.substring(0, 2);
      let b = mba.substring(2, 7);
      let c = (a + '/' + b);
      this.pessoaForm.controls['membroDesde'].setValue(c);
    }

    const pessoa: PessoaDTO = this.pessoaForm.value;
    this.pessoaService.create(pessoa)
      .subscribe(
        (response: any): void => {
          const id = parseInt(this.extractId(response.headers.get('location'))); // Extrai o Id da URI retornada do banco
          this.pessoa.id = +id;

          this.historicoForm.controls['pessoaId'].setValue(id);
          this.historicoForm.controls['modulo'].setValue('Pessoa');
          this.historicoForm.controls['dadoNovo'].setValue(this.pessoaForm.controls['nome'].value);

          this.createHistorico();

          this.actionsForSuccess(this.pessoa);
          Swal.fire('Cadastro', 'Registro inserido com sucesso!', 'success');

        }),
      (error: { errors: { message: string | undefined; }[]; }) => {
        this.toastr.warning(error.errors[0].message, 'Cadastro');
        // this.submittingForm = false;

      }
  }

  public updatePessoa() {
    // ESTE PARA DEIXAR TUDO EM CAIXA ALTA
    // this.pessoaForm.controls.nome.setValue(this.pessoaForm.controls.nome.value.toUpperCase()); /* Aqui que real mente coloca em caixa alta. 
    // Poque se o teclado estiver com o caps desl. grava miniscula  RsRS*/

    //ESTE PARA PRIMEIRA MAIUSCULAS
    // ESTE PARA DEIXAR TUDO EM CAIXA ALTA
    this.pessoaForm.controls['nome'].setValue(this.pessoaForm.controls['nome'].value.toUpperCase()); /* Aqui que real mente coloca em caixa alta. 
    // Porque se o teclado estiver com o caps desl. grava miniscula  RsRS*/

    //ESTE PARA PRIMEIRA MAIUSCULAS
    // this.pessoaForm.controls['nome'].setValue(this.sharedService.formataNome(this.pessoaForm.controls['nome'].value)); // Aqui formata o nome completo

    // remove todos os acentos do nome, seta a coluna nomeSemAcento e grava a nela sem acentos apenas para pesquisa de membros
    this.pessoaForm.controls['nomeSemAcento'].setValue(this.sharedService.removerAcentos(this.pessoaForm.controls['nome'].value));
    let mba = this.pessoaForm.controls['membroDesde'].value;
    if (mba.length == 6) {
      let a = mba.substring(0, 2);
      let b = mba.substring(2, 7);
      let c = (a + '/' + b);
      this.pessoaForm.controls['membroDesde'].setValue(c);
    }

    const pessoa: PessoaDTO = Object.assign(new PessoaDTO(), this.pessoaForm.value);
    this.pessoaService.update(pessoa)
      .subscribe({
        next: (pessoa) => {
          this.actionsForSuccess(pessoa)
          Swal.fire('Atualização', 'Registro atualizado com sucesso!', 'success');
          this.historicoForm.controls['modulo'].setValue('Pessoa');

          if (this.ctr_situacao > 0 && this.historicoForm.controls['dadoNovo'].value !== null) { this.createHistorico(); } // Evita inclusão no historico sem alterações

        },
        error: (error) => {
          this.toastr.warning(error.errors[0].message, 'Cadastro');
        }

      })
  }

  exclusaoPessoa(pessoa: PessoaListDTO) {
    Swal.fire({
      // title: 'Exclusão',
      text: 'Tem certeza que deseja excluir este registro?',
      icon: 'error',
      // showCloseButton: true,
      showCancelButton: true
    }).then((willDelete) => {
      if (willDelete.dismiss) {
        // Swal.fire('Exclusão Cancelada', 'Seu registro está seguro', 'success');
      } else {
        this.excluirPessoa(pessoa);
        // Swal.fire('Exclusão', 'Registro excluido com sucesso!', 'success');
      }
    });
  }

  excluirPessoa(pessoa: any) {
    this.pessoaService.delete(pessoa.id)
      .subscribe(() => {
        this.router.navigate(['/pessoas'])
        // this.toastr.success('Registro excluido com sucesso!', 'Exclusão',);
        // Swal.fire('Exclusão', 'Registro excluido com sucesso!', 'success');
      },
        error => { });
  }

  limparConjuge() {
    this.pessoaForm.controls['conjugeId'].setValue(null);
    this.pessoaForm.controls['dataCasamento'].setValue(null);
  }

  limparCargo() {
    this.pessoaForm.controls['cargoPrincipal'].setValue(null);
  }

  /* INICIO Referente a ABA separacao - INICIO */

  loadSeparacao(separacao: any) {    // Recebendo item do ngFor do Html passado como parametro no evento (click)="loadMinisterio(item)"
    this.separacaoId = separacao.id;
    this.separacaoService.findById(this.separacaoId)
      .subscribe(
        (response) => {
          this.separacao = response;
          this.separacaoForm.patchValue(this.separacao)   // binds loaded category data to CategoryForm
          this.separacaoForm.controls['pessoaId'].setValue(this.id);
          this.setCurrentAction();
        },
        error => this.actionsForError(error))
  }


  listaSeparacoes() {
    this.pessoaService.getById(this.id)
      .subscribe(
        (response: any) => {
          this.separacoes = response['separacoes'].sort((a: { id: number; }, b: { id: number; }) => b.id - a.id)
        },
        error => {
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Ocorreu um erro ao carregar separações!' });
        })
  }


  // excluir Separaçao
  exclusaoSeparacao(separacao: any) {
    Swal.fire({
      // title: 'Exclusão',
      text: 'Tem certeza que deseja excluir este registro?',
      icon: 'error',
      // showCloseButton: true,
      showCancelButton: true
    }).then((willDelete) => {
      if (willDelete.dismiss) {
        // Swal.fire('Exclusão Cancelada', 'Seu registro está seguro', 'success');
      } else {
        this.excluirSeparacao(separacao);
        // Swal.fire('Exclusão', 'Registro excluido com sucesso!', 'success');
      }
    });
  }


  exclusaoDocumento(documento: any): void {
    Swal.fire({
      // title: 'Exclusão',
      text: 'Tem certeza que deseja excluir este registro?',
      icon: 'error',
      // showCloseButton: true,
      showCancelButton: true
    }).then((willDelete) => {
      if (willDelete.dismiss) {
        // Swal.fire('Exclusão Cancelada', 'Seu registro está seguro', 'success');
      } else {
        this.excluirDocumento(documento);
        // Swal.fire('Exclusão', 'Registro excluido com sucesso!', 'success');
      }
    });
  }

  excluirSeparacao(separacao: { id: number; }) {
    this.separacaoService.delete(separacao.id)
      .subscribe(() => {
        this.separacoes = this.separacoes.filter(element => element != this.separacoes)
        this.listaSeparacoes();
        this.toastr.success('Registro excluido com sucesso!', 'Exclusão',);
      },
        error => { });
  }

  excluirDocumento(documento: { id: number; }) {
    this.documentoService.delete(documento.id)
      .subscribe(() => {
        this.documentos = this.documentos.filter(element => element != this.documentos)
        // this.loadDocumentos();
        this.loadPessoa();
        this.toastr.success('Registro excluido com sucesso!', 'Exclusão',);
        // Swal.fire('Exclusão', 'Registro excluido com sucesso!', 'success');
      },
        error => { });
  }



  createSeparacao() {
    this.separacao = Object.assign(new SeparacaoDTO(), this.separacaoForm.value);
    this.separacaoForm.controls['pessoaId'].setValue(this.id);

    if (this.separacao.pessoaId === null) { // Recurso para evitar a PessoaId=Null na primeira inserção depois de um edit?????
      this.separacao = Object.assign(new SeparacaoDTO(), this.separacaoForm.value);
    }

    this.separacaoService.create(this.separacao)
      .subscribe(
        separacao => { // Não preciso do retorno do id do Cargo recen criado
          //  this.separacao.id =  parseInt(this.extractId(separacao.headers.get('location'))); // Extrai o Id da URI retornada do banco
          this.actionsForSuccessSeparacao();
          Swal.fire('Cadastro', 'Registro inserido com sucesso!', 'success');

        },
        error => this.actionsForError(error)
      )
  }

  updateSeparacao() {
    this.separacao = Object.assign(new SeparacaoDTO(), this.separacaoForm.value);
    this.separacaoService.update(this.separacao)
      .subscribe(
        () => {
          this.actionsForSuccessSeparacao()
          Swal.fire('Atualização', 'Registro atualizado com sucesso!', 'success');
        },
        error => {
          this.actionsForError(error)
        }
      )
  }

  resetModal() {
    this.separacaoForm.reset();
    this.separacaoForm.controls['pessoaId'].setValue(this.id);
  }

  setModalEdicao() {
    this.PageTitleModal = "Alteração"

  }

  setModalInclusao() {
    this.PageTitleModal = "Inclusao"

  }

  /* FIM Referente a ABA separacao - FIM */



  // Aba filhos

  deleteFilho(filho: { id: number; }) {
    this.filhoService.delete(filho.id)
      .subscribe(
        () => {
          this.loadPessoa();
        },
        () => {
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Ocorreu um erro ao tentar excluir!' });
        },

      )
  }

  createFilho() {
    this.filho = Object.assign(new FilhoDTO(), this.filhoForm.value);
    this.filhoForm.controls['pessoaId'].setValue(this.id);

    if (this.filho.pessoaId === null) { // Recurso para evitar a PessoaId=Null na primeira inserção depois de um edit?????
      this.filho = Object.assign(new FilhoDTO(), this.filhoForm.value);
    }

    this.filhoService.create(this.filho)
      .subscribe(
        () => {
          this.loadPessoa();
        },
        error => this.actionsForError(error)
      )

  }

  createHistorico() {
    this.historico = Object.assign(new HistoricoDTO(), this.historicoForm.value);
    this.historicoService.create(this.historico)
      .subscribe(
        () => {
          // this.loadPessoa();
        },
        error => this.actionsForError(error)
      )

  }

  onUpload() {
    if (this.size <= 2000000) {
      if (this.files) {
        this.documentoService.upload(this.files, this.igrejaId, this.pessoaId)
          .subscribe(response => {
            this.files.clear();
            document.getElementById('fileLabel1')!.innerHTML = '';
            // this.loadDocumentos();
            this.loadPessoa();
            this.documentoForm.controls['nomeArquivo'].setValue(null);
          });
      }
      this.toastr.success('Registro enviado com s sucesso!', 'Upload');
    }
  }

  onDownload(documento: { nomeArquivo: string; }) {
    let ext = this.getFileExtension(documento.nomeArquivo);
    this.documentoService.download(documento)
      .subscribe((response: any) => {

        if (ext === 'pdf') this.documentoService.handleFile(response, documento.nomeArquivo, documento)
        if (ext === 'jpg') this.documentoService.handleFile(response, documento.nomeArquivo, documento)
        if (ext === 'jpeg') this.documentoService.handleFile(response, documento.nomeArquivo, documento)
        if (ext === 'png') this.documentoService.handleFile(response, documento.nomeArquivo, documento)
        if (ext === 'doc') this.documentoService.handleFile(response, documento.nomeArquivo, documento)
        if (ext === 'docx') this.documentoService.handleFile(response, documento.nomeArquivo, documento)
        if (ext === 'xls') this.documentoService.handleFile(response, documento.nomeArquivo, documento)
        if (ext === 'xlsx') this.documentoService.handleFile(response, documento.nomeArquivo, documento)

      });
  }

  getFileExtension(filename: string) {
    return filename.split('.').pop();
  }
  // fim filhos

  // METODOS PRIVADOS
  private actionsForSuccess(pessoa: PessoaDTO) {

    if (this.currentAction === 'new' && this.iModo == 0) { // Novo Membro com opção de inserir novo
      this.activeTab = 'novo';
      this.ngOnInit();

    } else if (this.currentAction === 'new' && this.iModo == 1) { // Novo Membro com opção de finalizar cadastro
      this.currentAction = 'edit';
      this.activeTab = 'home';
      const path: string = this.route.snapshot.data['path'];

      // redirect/reload component page  
      this.router.navigateByUrl(path, { skipLocationChange: true }).then(
        () => this.router.navigate([path, pessoa.id, 'edit']))

    } else { // Edição de Pessoa normal
      const path: string = this.route.snapshot.data['path'];

      // redirect/reload component page
      this.router.navigateByUrl(path, { skipLocationChange: true })
        .then(
          () => this.router.navigate([path, pessoa.id, 'edit']))
    }
  }

  private actionsForSuccessSeparacao() {
    this.listaSeparacoes();
    this.resetModal();
  }

  private actionsForSuccessFilho() {
    this.loadPessoas();
  }

  private actionsForError(error: { status: number; _body: string; }) {
    this.submittingForm = false;

    if (error.status === 422) {
      this.serverErrorMessages = JSON.parse(error._body).errors;
    } else if (error.status == 403) {
      this.router.navigate(['login/signin'])

    } else {
      this.serverErrorMessages = ["Falha na comunicação com o servidor. Por favor, teste mais tarde."]
    }
  }

  private extractId(location: string): string { // Extrai o Id da URL
    let position = location.lastIndexOf('/');
    return location.substring(position + 1, location.length);
  }

  private showError(error: { message: any; }) {
    this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.message });
  }

  errorApiIBGE(_error: any) {
    this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro buscando cidades!' });
  }

  errorApiCep(_error: any) {
    this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro buscando CEP!' });
  }

  // METODOS AUXILIARES

  // UPLOAD/RECORTES/CONVERSÃO DE IMAGENS

  // cropped Image

  private flipAfterRotate() {
    const flippedH = this.transform.flipH;
    const flippedV = this.transform.flipV;
    this.transform = {
      ...this.transform,
      flipH: flippedV,
      flipV: flippedH
    };
  }

  fileChangeEvent(event: any, PessoaDTO: PessoaDTO): void {
    this.imageChangedEvent = event;
    this.pessoaFoto = PessoaDTO;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }

  imageLoaded() {
    this.showCropper = true;
    // show cropper
  }
  cropperReady(sourceImageDimensions: Dimensions) {
    // console.log('Cropper ready', sourceImageDimensions);
  }

  loadImageFailed() {
    // console.error('Load image failed');
  }

  rotateLeft() {
    this.canvasRotation--;
    this.flipAfterRotate();
  }

  rotateRight() {
    this.canvasRotation++;
    this.flipAfterRotate();
  }

  flipHorizontal() {
    this.transform = {
      ...this.transform,
      flipH: !this.transform.flipH
    };
  }

  flipVertical() {
    this.transform = {
      ...this.transform,
      flipV: !this.transform.flipV
    };
  }

  resetImage() {
    this.scale = 1;
    this.rotation = 0;
    this.canvasRotation = 0;
    this.transform = {};
  }

  zoomOut() {
    this.scale -= 0.1;
    this.transform = {
      ...this.transform,
      scale: this.scale
    };
  }

  zoomIn() {
    this.scale += 0.1;
    this.transform = {
      ...this.transform,
      scale: this.scale
    };
  }

  toggleContainWithinAspectRatio() {
    this.containWithinAspectRatio = !this.containWithinAspectRatio;
  }

  updateRotation() {
    this.transform = {
      ...this.transform,
      rotate: this.rotation
    };
  }

  //cropper 

  limparCampos() {
    this.filhoForm.controls['nome'].setValue('nome  ');
    this.filhoForm.controls['email'].setValue(null);
    this.filhoForm.controls['sexo'].setValue(null);
    this.filhoForm.controls['dataNascimento'].setValue(null);
  }


  uploadFoto(PessoaDTO: PessoaDTO) {
    if (this.croppedImage) {// Imagem base64 no formato png 
      this.convertPngToJpeg(this.croppedImage); // Enviada para ser convertida em para o formato jpeg ou jpg. Formatos diferentes somente no nome 
      let numero = 'data:image/jpeg;base64,';
      let N = numero.length;

      const base64 = this.croppedImage.substr(N, this.croppedImage.length); //Retira estes dados da imagem "data:image/png;base64"
      const nome = this.pessoaFoto.nome;
      const nome_sem_espacos = nome!.replace(/ /g, "_"); // regex que substitui todos os espaços por _

      const imageName = (nome_sem_espacos + '.jpeg'); // Tanto faz jpeg ou jpg
      const imageBlob = this.dataURItoBlob(base64);
      const imageFile = new File([imageBlob], imageName, { type: 'image/jpeg' });
      const foto = imageFile;
      const formData: FormData = new FormData();
      formData.append("foto", foto);
      this.pessoaService
        .upload(PessoaDTO, formData)
        .subscribe(() => this.loadPessoa());
    }
  }

  dataURItoBlob(dataURI: string) {
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'image/png' });
    return blob;
  }
  // Fim cropper - cortar imagem


  // Converter imagem  de PNG para Jpeg/Jpg

  convertPngToJpeg(imagePNG: string) {

    let maxWidth = 10000;
    let source_img_obj = new Image;
    source_img_obj.src = imagePNG;
    let mime_type = "image/jpeg",
      output_format = "jpeg";

    maxWidth = maxWidth || 10000;
    let natW = source_img_obj.naturalWidth;
    let natH = source_img_obj.naturalHeight;
    let ratio = natH / natW;
    if (natW > maxWidth) {
      natW = maxWidth;
      natH = ratio * maxWidth;
    }
    let cvs = document.createElement('canvas');
    cvs.width = natW;
    cvs.height = natH;
    let ctx = cvs.getContext("2d")!.drawImage(source_img_obj, 0, 0, natW, natH);
    let newImageData = cvs.toDataURL(mime_type, 0.4);
    let result_image_obj = new Image();
    result_image_obj.src = newImageData;
    this.croppedImage = null;
    this.croppedImage = newImageData; // Retorna da imagem convertida para Jpeg/Jpg 10 vezes menor que PNG

  }

  // Consulta CEP
  consultaCep(value: any) {
    if (value.length == 8) {
      this.sharedService.getDataCep(value)
        .then(async (dadosCep: any) => {
          this.dataCep = await dadosCep.json();
          this.populaForm(this.dataCep);
        })

    } else if (value.length == 9) {
      let cep = value.substring(0, 5) + "-" + value.substring(6);
      this.sharedService.getDataCep(cep)
        .then(async (dadosCep: any) => {
          this.dataCep = await dadosCep.json();
          this.populaForm(this.dataCep);
        })

    }
  }

  populaForm(dados: any) {
    if (dados.cep) { this.pessoaForm.controls['cep'].setValue(dados.cep) }; //Para deixar o usuário cadastrar lugares sem  CEP ou com CEP geral 
    this.pessoaForm.controls['logradouro'].setValue(dados.logradouro);
    this.pessoaForm.controls['complemento'].setValue(dados.complemento);
    this.pessoaForm.controls['bairro'].setValue(dados.bairro);
    this.pessoaForm.controls['cidadeEndereco'].setValue(dados.localidade);
    this.pessoaForm.controls['ufEndereco'].setValue(dados.uf);
  }


  // Fim CEP


  // FIM UPLOAD/RECORTES/CONVERSÃO DE IMAGENS
}
