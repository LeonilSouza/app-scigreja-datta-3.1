import { AfterContentChecked, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { Observable, Subject, Subscription, takeUntil } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';


import moment from 'moment';

import Swal from 'sweetalert2';

import { trim } from 'lodash-es';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { InputTextModule } from 'primeng/inputtext';
import { SplitButtonModule } from 'primeng/splitbutton';
import { CKEditorModule } from 'ng2-ckeditor';
import { MultiSelectModule } from 'primeng/multiselect';
import { CartaService } from 'src/app/theme/shared/services/carta.service';
import { ModeloDocumentoService } from 'src/app/theme/shared/services/modelo-documento.service';
import { PessoaService } from 'src/app/theme/shared/services/pessoa.service';
import { CidadeService } from 'src/app/theme/shared/services/cidade.service';
import { PaisService } from 'src/app/theme/shared/services/pais.service';
import { CartaDTO } from 'src/app/theme/shared/models/carta.dto';
import { IgrejaDTO } from 'src/app/theme/shared/models/igreja.dto';
import { CidadeDTO } from 'src/app/theme/shared/models/cidade.dto';
import { EstadoDTO } from 'src/app/theme/shared/models/estado.dto';
import { PessoaDTO } from 'src/app/theme/shared/models/pessoa.dto';
import { ModeloDocumentoDTO } from 'src/app/theme/shared/models/modelo-documento.dto';
import { PaisDTO } from 'src/app/theme/shared/models/pais.dto';
import { IgrejaService } from 'src/app/theme/shared/services/igreja.service';
import { SharedService } from 'src/app/theme/shared/services/shared.service';
import { StorageService } from 'src/app/theme/shared/services/storage.service';
import { igrejaIdSignal, nomeIgrejaSignal, nomeUsuarioSignal, perfilSignal, setorIdSignal } from 'src/app/theme/shared/_helpers/shared-signals';
import { NgSelectModule, NgSelectComponent } from '@ng-select/ng-select';
import { DatePicker } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';

moment.locale('pt-br')
//declare const $: any;

@Component({
  selector: 'app-carta-form',
  templateUrl: './carta-form.component.html',
  styleUrls: ['./carta-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    InputTextModule,
    SplitButtonModule,
    CKEditorModule,
    MultiSelectModule,
    SelectModule,
    DatePicker,
    NgSelectModule,
    NgSelectComponent,
    ButtonModule,
    RouterLink

  ],
  providers: [
    CartaService,
    ModeloDocumentoService,
    PessoaService,
    CidadeService,
    PaisService
  ]
})

export class CartaFormComponent implements OnInit, OnDestroy, AfterContentChecked {

  nomeIgrejaSignal = nomeIgrejaSignal; //Signal 
  igrejaIdSignal = igrejaIdSignal;
  nomeUsuarioSignal = nomeUsuarioSignal;
  perfilSignal = perfilSignal;
  setorIdSignal = setorIdSignal;

  nomeIgreja = nomeIgrejaSignal();
  igrejaId = igrejaIdSignal();
  nomeUsuario = nomeUsuarioSignal();
  perfil = perfilSignal();

  private destroy$: Subject<void> = new Subject<void>();
  qtdes = [
    { label: '0', value: 0 },
    { label: '1', value: 1 },
    { label: '2', value: 2 },
    { label: '3', value: 3 },
    { label: '4', value: 4 },
  ];

  crtCidade: boolean = false;

  error = '';

  public nome = '';
  public tipoDocumento = 'Carta'; // Campo deve ser setado de acordo com o documento

  subscription: Subscription;
  conteudoHTML;
  cartaId: number = 0;
  nomeMembro: string;

  currentAction: string;
  cartaForm: FormGroup;
  pessoaForm: FormGroup;

  pageTitle: string;
  submittingForm: boolean = false;
  id: number;
  qtde: number = 0;

  modeloDocId: number;
  dataAtual = moment();

  hoje: string;
  nomeCidade: string;

  // Consulta Estados

  carta: CartaDTO = new CartaDTO();
  igreja: IgrejaDTO = new IgrejaDTO();
  cidade: CidadeDTO = new CidadeDTO();
  estado: EstadoDTO = new EstadoDTO();
  pais!: any[];
  pessoa: PessoaDTO = new PessoaDTO();
  conjuge: PessoaDTO = new PessoaDTO();
  modeloDocumento: ModeloDocumentoDTO = new ModeloDocumentoDTO();
  modelo: ModeloDocumentoDTO[] = [];
  responsavel: PessoaDTO = new PessoaDTO();
  secretario: PessoaDTO = new PessoaDTO();
  cidadeFiltrada: CidadeDTO[] = [];


  paises: PaisDTO[] = [];
  obreiros: PessoaDTO[];
  pessoas: PessoaDTO[] = [];
  pessoasNomeConjugeFilhos: PessoaDTO[] = [];
  filhos: PessoaDTO[] = [];
  cidades: any[] = [];
  cidadesFiltradas!: any[];

  estados: EstadoDTO[] = [];
  modeloDocumentos: ModeloDocumentoDTO[] = [];
  documentosAux: ModeloDocumentoDTO[] = [];
  serverErrorMessages: string[] = null;
  modeloDocumentoId: number;
  pessoaId: number;

  // VARIAVEIS DE CONTROLE
  familia: boolean = false;
  noiva: boolean = false;
  esposa: boolean = false;
  filho: boolean = false;

  controlePais: string = 'Brasil';
  estadual: boolean = false;
  territorial: boolean = false;

  estadoDestinoEx: string;

  observacao: boolean = true;

  ctr_update: boolean = false;

  obs: string;
  win;

  public ckeditorContent: string;
  public config;
  visualizar: boolean = false;

  jwtHelperService: JwtHelperService = new JwtHelperService();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public cartaService: CartaService,
    public pessoaService: PessoaService,
    public documentoService: ModeloDocumentoService,
    private formBuilder: FormBuilder,
    private igrejaService: IgrejaService,
    private sharedService: SharedService,
    public storage: StorageService,
    private toastr: ToastrService,
    public modeloDocumentoService: ModeloDocumentoService,
    private cidadeService: CidadeService,
    private paisService: PaisService
  ) {
    this.config = {
      uiColor: '#F0F3F4',
      height: '500',
      extraPlugins: 'divarea',
      versionCheck: false
    };

  }

  ngOnInit(): void {
    // OS CAMPOS COMENTADOS SÃO PARA GRAVAR OS DADOS DA CARTA NO BANCO. BASTA APENAS DESCOMENTAR
    this.loadIgreja()
    this.setCurrentAction();
    this.buildCartaForm();
    this.loadModeloDocumentos(this.igrejaId, this.nome); // Valores Default
    this.loadPaises();
    this.loadCidades(this.nomeCidade);
    this.loadEstados();
    this.loadPessoas();
    this.loadPessoasNomeConjugeFilhos();
    this.loadCarta();
    this.hoje = this.sharedService.dataAtualFormatada();
  }

  ngAfterContentChecked() {
    this.setPageTitle()

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private setCurrentAction() {
    if (this.route.snapshot.url[0].path == "new")
      this.currentAction = "new"
    else
      this.currentAction = "edit"
  }

  ctrUpdate() {
    this.ctr_update = true;
  }


  // ckeDITOR
  onChange(event) {
    this.ckeditorContent = event;
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
      .map((cidade: {
        id: { [x: number]: any };
        nome: { [x: string]: any };
        uf: { [x: string]: any };
        estado: { [x: string]: any };
        nomeSemAcento: { [x: string]: any };
      }) => {
        return {
          id: cidade.id,
          nome: cidade.nome,
          uf: cidade.uf,
          estado: cidade.estado,
          nomeSemAcento: cidade.nomeSemAcento
        };
      },
      );
  }

  public onChangeCidades(event: any) {
    if (event.id) {
      this.cartaForm.controls['estadoDestino'].setValue(event.estado);
      this.cartaForm.controls['ufDestino'].setValue(event.uf);
      this.cartaForm.controls['cidadeDestino'].setValue(event.nome + '/' + event.uf);

    }
  }

  // Busca documento
  onChangeTipoCarta(event) {
    this.modelo = this.modeloDocumentos.filter(modelo => modelo.id == event.value);
    this.cartaForm.controls['modeloCarta'].setValue(this.modelo[0].tipo);

    this.cartaForm.controls['tipoCarta'].setValue(this.modelo[0].nome)//

    // SUBSTITUIÇÃO DOS CAMPOS DO MODELO DA CARTA
    this.cartaForm.controls['modeloDocumentoId'].setValue(this.modelo[0].id)//

    this.conteudoHTML = this.modelo[0].conteudo;

    this.cartaForm.controls['membroDesde'].value == null || '' ? this.cartaForm.controls['membroDesde'].setValue('há tempos')
      : this.cartaForm.controls['membroDesde'].value;
  }


  onChangePessoa(id) {
    this.loadPessoa(id.value)
  }

  onChangeFilho1(id) {
    const filho = this.pessoasNomeConjugeFilhos.filter(f => (f.id == id.value))
    this.cartaForm.controls['filho1'].setValue(filho[0].nome)// 
    this.cartaForm.controls['idFilho1'].setValue(id.value)// 
  }

  onChangeFilho2(id) {
    const filho = this.pessoasNomeConjugeFilhos.filter(f => (f.id == id.value))
    this.cartaForm.controls['filho2'].setValue(filho[0].nome)// 
    this.cartaForm.controls['idFilho2'].setValue(id.value)// 
  }

  onChangeFilho3(id) {
    const filho = this.pessoasNomeConjugeFilhos.filter(f => (f.id == id.value))
    this.cartaForm.controls['filho3'].setValue(filho[0].nome)// 
    this.cartaForm.controls['idFilho3'].setValue(id.value)// 
  }

  onChangeFilho4(id) {
    const filho = this.pessoasNomeConjugeFilhos.filter(f => (f.id == id.value))
    this.cartaForm.controls['filho4'].setValue(filho[0].nome)// 
    this.cartaForm.controls['idFilho4'].setValue(id.value)// 
  }

  onChangeResponsavel(id) {
    this.loadResponsavel(id.value)
  }

  onChangeSecretario(id) {
    this.loadSecretario(id.value)
  }

  onChangeConjuge(id) {
    this.loadConjuge(id.value)
  }

  onChangeQtde(id) {
    this.qtde = id.value
    this.cartaForm.controls['qtde'].setValue(id.value)
    if (this.qtde == 1) {
      this.cartaForm.controls['filho2'].setValue(null);
      this.cartaForm.controls['filho3'].setValue(null);
      this.cartaForm.controls['filho4'].setValue(null);
    }
    if (this.qtde == 2) {
      this.cartaForm.controls['filho3'].setValue(null);
      this.cartaForm.controls['filho4'].setValue(null);
    }
    if (this.qtde == 3) {
      this.cartaForm.controls['filho4'].setValue(null);
    }

  }


  onChangeEstado(event) {
    this.estadual = true;
    this.cartaForm.controls['congregacaoDestino'].setValue('POR ONDE PASSAR');
    if (this.cartaForm.controls['paisDestino'].value == 'Brasil') {
      this.loadEstado(event.value)
      //
    }
  }


  voltar() {
    this.visualizar = false;
    const path: string = this.route.snapshot.data['path'];
    this.router.navigateByUrl(path, { skipLocationChange: true }).then(
      () => this.router.navigate([path, this.carta.id, 'edit']))
  }

  // VISÃO CHAMA METODO PARA SUBSTITUIR AS VARIAVEIS NO MODELO DA CARTA
  visao(): void {
    this.substituirVariaveisCarta();
  }

  // CRIA UMA CAIXA/TELA LIMPA COM AS CONFIGURAÇÕES DE estilo PARA IMPRESSÃO
  imprimir(): void {
    // Linha que remove o cabeçalho e o rodape do previw da impressão   
    const estilo = "<style>@media print {@page { size:  auto; margin: 5mm; margin-right: 100px }}</style>";
    this.win = window.open();
    this.win.document.write('<html><head>');
    this.win.document.write('<title></title>');
    this.win.document.write('</head><body>');
    this.win.document.write(this.ckeditorContent);
    this.win.document.write(estilo);
    this.win.document.write('</body></html>');
    this.win.print();
    this.win.close();
  }

  private buildCartaForm() {
    this.cartaForm = this.formBuilder.group({
      id: [null],
      nomeMembro: [null, [Validators.required]],
      membroDesde: [null],
      situacaoEspiritual: [null],
      statusMembro: [null],
      cartaoMembro: [null],
      cartaoConjuge: [null],
      tituloMin: [null], //do membro
      tituloMin2: [null], //do membro para auxiliar codigo
      tituloMin3: [null], //do membro para auxiliar codigo
      abreviaturaMin: [null], // do membro
      nomeResponsavel: [null, [Validators.required]],
      tituloResponsavel: [null],
      cargoResponsavel: [null],
      abreviaturaMinResponsavel: [null],
      nomeSecretario: [null, [Validators.required]],
      contatoSecretarioEscrevente: [null],
      conjuge: [null],
      sexo: [null],
      modeloCarta: [null],
      conteudo: [null],
      dataEmissao: [this.sharedService.dataAtualFormatada()],
      dataValidade: [this.sharedService.dataAddMes(this.sharedService.dataAtualFormatada(), 1)],
      cidadeDestino: [null],
      ufDestino: [null],
      estadoDestino: [null],
      paisDestino: ['Brasil', [Validators.required]],
      siglaPais: ['BR'],
      observacao: [null, [Validators.maxLength(220)]],
      tipoCarta: [null, [Validators.required]],
      igrejaLocal: [this.nomeIgreja],
      congregacaoDestino: ['', [Validators.required]],
      cidadeLocal: [null], // Cidade onde localiza a Igreja
      ufLocal: [null], // UF onde localiza a Igreja
      filho1: [null],
      filho2: [null],
      filho3: [null],
      filho4: [null],
      qtde: [this.qtde],
      esposa: [false],//[null, Validators.pattern('true')], para validar true no checkbox
      territorial: [false],
      estadual: [false],
      filho: [false],
      unica: [false],
      pessoaId: [null],
      idPaisDestino: [1, [Validators.required]],
      idPais: [null],
      idCidadeDestino: [null],
      idConjuge: [null],
      idResponsavel: [null],
      idSecretario: [null],
      idEstadoDestino: [null],
      idFilho1: [null],
      idFilho2: [null],
      idFilho3: [null],
      idFilho4: [null],
      modeloDocumentoId: [null, [Validators.required]],
      igrejaId: [this.igrejaId, [Validators.required]]
    });
  }


  submitForm() {
    const estado = trim(this.cartaForm.controls['estadoDestino'].value);
    const uf = trim(this.cartaForm.controls['ufDestino'].value);
    const cidade = trim(this.cartaForm.controls['cidadeDestino'].value);
    if (this.estadual == true && (estado == "" || estado == null
      || uf == '' || uf == null)) {
      Swal.fire('Estado | UF', 'Preencha todos os campos', 'warning');
    } else {
      if (this.estadual == false && this.territorial == false
        && (estado == "" || estado == null
          || cidade == "" || cidade == null
          || uf == '' || uf == null)) {
        Swal.fire('Cidade | Estado | UF', 'Preencha todos os campos', 'warning');
      } else {
        const cartao = trim(this.cartaForm.controls['cartaoConjuge'].value)
        if ((this.familia == true || this.esposa == true)
          && (this.cartaForm.controls['idConjuge'].value == null
            || cartao == null
            || cartao == "")) {
          Swal.fire('Conjuge | Cartão GT', 'Preencha o campo Conjuge', 'warning');
        } else {

          this.removeVazio();
          if (this.filho == false && this.qtde == 0) {
            if (this.cartaForm.controls['cargoResponsavel'].value == null) {
              Swal.fire('Assinatura', 'O cargo do responsavel está inválido!', 'warning');
            } else {
              if (this.cartaForm.controls['contatoSecretarioEscrevente'].value == null) {
                Swal.fire('Escrevente', 'O Contato do escrevente está inválido!', 'warning');
              } else {
                this.submittingForm = true;
                this.visualizar = true;
                if (this.currentAction == "new") {
                  this.createCarta();
                  this.visao()
                } else {
                  if (this.currentAction == "edit") {
                    this.updateCarta();
                    this.visao()
                  }
                }
              }
            }

          } else {
            if ((this.filho == true && this.qtde == 1) && this.cartaForm.controls['filho1'].value == null) {
              Swal.fire('Carta', 'Preencha o nome do filho!', 'warning');
            } else {
              if ((this.filho == true && this.qtde == 2)
                && (this.cartaForm.controls['filho2'].value == null || this.cartaForm.controls['filho1'].value == null)) {
                Swal.fire('Carta', 'Preencha todos os filhos!', 'warning');
              } else {
                if ((this.filho == true && this.qtde == 3)
                  && (this.cartaForm.controls['filho3'].value == null || this.cartaForm.controls['filho2'].value == null
                    || this.cartaForm.controls['filho1'].value == null)) {
                  Swal.fire('Carta', 'Preencha todos os filhos!', 'warning');
                } else {
                  if ((this.filho == true && this.qtde == 4)
                    && ((this.cartaForm.controls['filho4'].value == null || this.cartaForm.controls['filho4'].value == '')
                      || (this.cartaForm.controls['filho3'].value == null || this.cartaForm.controls['filho3'].value == '')
                      || (this.cartaForm.controls['filho2'].value == null || this.cartaForm.controls['filho2'].value == '')
                      || (this.cartaForm.controls['filho1'].value == null || this.cartaForm.controls['filho1'].value == ''))) {
                    Swal.fire('Carta', 'Preencha todos os filhos!', 'warning');
                  } else {
                    if (this.cartaForm.controls['cargoResponsavel'].value == null) {
                      Swal.fire('Assinatura', 'O cargo do responsavel está inválido!', 'warning');
                    } else {
                      if (this.cartaForm.controls['contatoSecretarioEscrevente'].value == null) {
                        Swal.fire('Escrevente', 'O Contato do escrevente está inválido!', 'warning');
                      }
                      else {
                        this.submittingForm = true;
                        this.visualizar = true;
                        this.visao();
                        if (this.currentAction == "new") {
                          this.createCarta();
                          this.visao()
                        } else {
                          if (this.currentAction == "edit") {
                            this.updateCarta();
                            this.visao()
                          }
                        }
                      }
                    }

                  }
                }
              }
            }
            // }
          }
        }
      }
    }
  }

  removeVazio() {
    const f1 = trim(this.cartaForm.controls['filho1'].value);
    const f2 = trim(this.cartaForm.controls['filho2'].value);
    const f3 = trim(this.cartaForm.controls['filho3'].value);
    const f4 = trim(this.cartaForm.controls['filho4'].value);
    f1 == '' ? this.cartaForm.controls['filho1'].setValue(null) : f1;
    f2 == '' ? this.cartaForm.controls['filho2'].setValue(null) : f2;
    f3 == '' ? this.cartaForm.controls['filho3'].setValue(null) : f3;
    f4 == '' ? this.cartaForm.controls['filho4'].setValue(null) : f4;
  }


  // Métodos dos CheckBox

  // Métodos dos CheckBox
  onChangeEstadual($event: { target: { checked: boolean; }; }) {
    const isChecked = $event.target.checked;
    if (isChecked) {
      this.estadual = true;
      this.cartaForm.controls['estadual'].setValue(true);
      this.cartaForm.controls['territorial'].setValue(false);
      this.cartaForm.controls['idEstadoDestino'].setValue(null);
      this.cartaForm.controls['cidadeDestino'].setValue('  '); //APENAS PARA CUMPRIR REQUIRED
      this.cartaForm.controls['congregacaoDestino'].setValue('POR ONDE PASSAR'); //APENAS PARA CUMPRIR REQUIRED cinco caracteres minimo
      if (this.territorial == true) {
        this.territorial = false;
      }
    } else {
      this.estadual = false;
      this.cartaForm.controls['estadual'].setValue(false);
      this.cartaForm.controls['idCidadeDestino'].setValue(null);
      this.cartaForm.controls['idEstadoDestino'].setValue(null);
      this.cartaForm.controls['congregacaoDestino'].setValue(null);
      this.cartaForm.controls['estadoDestino'].setValue(null);
      this.cartaForm.controls['ufDestino'].setValue(null);
    }
  }

  onChangeTerritorial($event: { target: { checked: boolean; }; }) { // Territorial Nacional  e Internacional
    const isChecked = $event.target.checked;
    if (isChecked) {
      this.territorial = true;
      this.cartaForm.controls['territorial'].setValue(true);
      this.cartaForm.controls['estadual'].setValue(false);
      this.cartaForm.controls['cidadeDestino'].setValue('  '); //APENAS PARA CUMPRIR REQUIRED
      this.cartaForm.controls['congregacaoDestino'].setValue('POR ONDE PASSAR'); //APENAS PARA CUMPRIR REQUIRED cinco caracteres minimo
      if (this.estadual == true) {
        this.estadual = false;
      }
      if (this.cartaForm.controls['cartaoConjuge'].value == null) {
        this.cartaForm.controls['cartaoConjuge'].setValue(null);
      }
    } else {
      this.territorial = false;
      this.cartaForm.controls['territorial'].setValue(false);
      this.cartaForm.controls['idCidadeDestino'].setValue(null);
      this.cartaForm.controls['idEstadoDestino'].setValue(null);
      this.cartaForm.controls['congregacaoDestino'].setValue(null);
      this.cartaForm.controls['estadoDestino'].setValue(null);
      this.cartaForm.controls['ufDestino'].setValue(null);
    }
  }



  onChangeEsposa($event: { target: { checked: boolean; }; }) {
    const isChecked = $event.target.checked;
    if (isChecked) {
      if (this.filho == true) {
        this.filho = false;
        this.cartaForm.controls['filho1'].setValue(null);
        this.cartaForm.controls['filho2'].setValue(null);
        this.cartaForm.controls['filho3'].setValue(null);
        this.cartaForm.controls['filho4'].setValue(null);
      }
      this.esposa = true;
      this.familia = false;
      this.qtde = 0;
      this.cartaForm.controls['qtde'].setValue(0);
      //
      this.cartaForm.controls['esposa'].setValue(true);
      this.cartaForm.controls['idConjuge'].setValue(null);
      //
      this.cartaForm.controls['cartaoConjuge'].setValue(null);
      this.cartaForm.controls['filho'].setValue(false);
    } else {
      this.esposa = false;
      this.qtde = 0;
      this.cartaForm.controls['qtde'].setValue(0);
      //
      this.cartaForm.controls['esposa'].setValue(false);
      this.cartaForm.controls['idConjuge'].setValue(null);
      this.cartaForm.controls['cartaoConjuge'].setValue(null);
      //
      this.cartaForm.controls['conjuge'].setValue(null);
      this.cartaForm.controls['filho'].setValue(false);
      //
      if (!this.filho) {
        this.cartaForm.controls['filho1'].setValue(null);
        this.cartaForm.controls['filho2'].setValue(null);
        this.cartaForm.controls['filho3'].setValue(null);
        this.cartaForm.controls['filho4'].setValue(null);
      }

    }
  }

  // Métodos dos CheckBox
  onChangeFamilia($event: { target: { checked: boolean; }; }) {
    const isChecked = $event.target.checked;
    if (isChecked) {
      this.cartaForm.controls['filho1'].setValue(null);
      this.cartaForm.controls['filho2'].setValue(null);
      this.cartaForm.controls['filho3'].setValue(null);
      this.cartaForm.controls['filho4'].setValue(null);

      this.familia = true;
      this.esposa = false;
      this.filho = false;
      this.qtde = 0;
      this.cartaForm.controls['qtde'].setValue(0);
      //
      // this.cartaForm.controls['familia'].setValue(true);
      this.cartaForm.controls['idConjuge'].setValue(null);
      this.cartaForm.controls['esposa'].setValue(false);
      this.cartaForm.controls['cartaoConjuge'].setValue(null);
      this.cartaForm.controls['filho'].setValue(false);
      //


    } else {
      this.esposa = false;
      this.familia = false;
      this.filho = false;
      this.qtde = 0;
      this.cartaForm.controls['qtde'].setValue(0);
      //
      this.cartaForm.controls['esposa'].setValue(false);
      this.cartaForm.controls['idConjuge'].setValue(null);
      this.cartaForm.controls['cartaoConjuge'].setValue(null);
      //
      this.cartaForm.controls['conjuge'].setValue(null);
      this.cartaForm.controls['filho'].setValue(false);
      //
      this.cartaForm.controls['filho1'].setValue(null);
      this.cartaForm.controls['filho2'].setValue(null);
      this.cartaForm.controls['filho3'].setValue(null);
      this.cartaForm.controls['filho4'].setValue(null);
    }
  }

  onChangeFilho($event: { target: { checked: boolean; }; }) {
    const isChecked = $event.target.checked;
    if (isChecked) {
      this.filho = true;
      this.qtde = 1;
      this.cartaForm.controls['qtde'].setValue(1);
      if (this.familia) {
        this.familia = false;
      }
      this.cartaForm.controls['filho'].setValue(true);
      this.cartaForm.controls['filho1'].setValue(null);
      this.cartaForm.controls['filho2'].setValue(null);
      this.cartaForm.controls['filho3'].setValue(null);
      this.cartaForm.controls['filho4'].setValue(null);
      //

    } else {
      this.filho = false;
      this.qtde = 0;
      this.cartaForm.controls['qtde'].setValue(0);
      this.cartaForm.controls['filho'].setValue(false);
      //
      this.cartaForm.controls['filho1'].setValue(null);
      this.cartaForm.controls['filho2'].setValue(null);
      this.cartaForm.controls['filho3'].setValue(null);
      this.cartaForm.controls['filho4'].setValue(null);
    }
  }

  private loadCarta() { // Obs->> Aqui é que deve ser ser carregado os dados para o buildForm pegando classes individualizadas
    if (this.currentAction == "edit") {
      const params: Observable<Params> = this.route.params
      params.subscribe(urlParams => {
        this.id = urlParams['id'];
        this.cartaId = urlParams['id'];
        this.cartaService.findById(this.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              this.carta = response;

              response.abreviaturaMin == null ? this.cartaForm.controls['tituloMin3'].setValue('Membro') :
                response.abreviaturaMin == 'Coop.' ? this.cartaForm.controls['tituloMin3'].setValue('Cooperador') :
                  response.abreviaturaMin == 'Dc.' ? this.cartaForm.controls['tituloMin3'].setValue('Diácono') :
                    response.abreviaturaMin == 'Pb.' ? this.cartaForm.controls['tituloMin3'].setValue('Presbítero') :
                      response.abreviaturaMin == 'Ev.' ? this.cartaForm.controls['tituloMin3'].setValue('Evangelista') :
                        response.abreviaturaMin == 'Pr.' ? this.cartaForm.controls['tituloMin3'].setValue('Pastor') : "";

              this.cartaForm.patchValue(this.carta)   // binds loaded carta data to cartaForm

              // ModeloDocumento
              this.modeloDocumento = (response['modeloDocumento'])
              this.cartaForm.controls['tipoCarta'].setValue(this.modeloDocumento.nome)//
              this.cartaForm.controls['modeloDocumentoId'].setValue(this.modeloDocumento.id)//

              // SUBSTITUIÇÃO DOS CAMPOS DO MODELO DA CARTA
              this.cartaForm.controls['modeloDocumentoId'].setValue(this.modeloDocumento.id)//

              this.conteudoHTML = this.modeloDocumento.conteudo;

              this.cartaForm.controls['membroDesde'].setValue('há tempos');

              // FIM - ModeloDocumento

              //Seta os Ids
              this.pessoaId = response['pessoa'].id;
              this.cartaForm.controls['modeloDocumentoId'].setValue(response['modeloDocumento'].id); //Guarda o Id do ModeloDoc atual
              this.cartaForm.controls['pessoaId'].setValue(this.pessoaId)
              this.cartaForm.controls['tituloMin2'].setValue(this.pessoa.tituloMin)//
              this.cartaForm.controls['idCidadeDestino'].setValue(this.carta.idCidadeDestino);//Dropdown só aceita inteiro no id

              this.cartaForm.controls['idResponsavel'].setValue(this.carta.idResponsavel); //Dropdown só aceita inteiro no id
              this.cartaForm.controls['idSecretario'].setValue(this.carta.idSecretario);
              this.cartaForm.controls['idConjuge'].setValue(this.carta.idConjuge); //Dropdown só aceita inteiro no id

              if (this.carta.conjuge !== null && this.carta.esposa == true && this.carta.filho == true) {
                this.esposa = true;
                this.familia = false;
                this.filho = true;
                this.qtde = this.carta.qtde;
                //
              }

              if (this.carta.conjuge !== null && this.carta.esposa == true && this.carta.filho == false) {
                this.esposa = true;
                this.familia = false;
                this.filho = false;
                this.qtde = 0;
                //
              }

              if (this.carta.conjuge !== null && this.carta.esposa == false && this.carta.filho == false) {
                this.esposa = false;
                this.familia = true;
                this.filho = false;
                this.qtde = this.carta.qtde;
                //
                // this.cartaForm.controls['familia'].setValue(true)
              }

              if (this.carta.filho1 !== null && this.carta.filho2 == null && this.carta.filho3 == null && this.carta.filho4 == null) {
                this.qtde = 1;
                this.filho = true;
                this.cartaForm.controls['qtde'].setValue(1)
                //
              }
              if (this.carta.filho1 !== null && this.carta.filho2 !== null && this.carta.filho3 == null && this.carta.filho4 == null) {
                this.qtde = 2;
                this.filho = true;
                this.cartaForm.controls['qtde'].setValue(2)
                //
              }

              if (this.carta.filho1 !== null && this.carta.filho2 !== null && this.carta.filho3 !== null && this.carta.filho4 == null) {
                this.qtde = 3;
                this.filho = true;
                this.cartaForm.controls['qtde'].setValue(3)
                //
              }

              if (this.carta.filho1 !== null && this.carta.filho2 !== null && this.carta.filho3 !== null && this.carta.filho4 !== null) {
                this.qtde = 4;
                this.filho = true;
                this.cartaForm.controls['qtde'].setValue(4);
                //
              }

              if (this.carta.filho == false) {
                this.qtde = 0;
                this.filho = false;
                this.cartaForm.controls['qtde'].setValue(0);
                //
              }

              if (this.carta.territorial == false) {
                this.cartaForm.controls['territorial'].setValue(false);
                this.territorial = false;
              } else {
                this.cartaForm.controls['territorial'].setValue(true);
                this.territorial = true;
              }

              if (this.carta.estadual == false) {
                this.cartaForm.controls['estadual'].setValue(false);
                this.estadual = false;
              } else {
                this.cartaForm.controls['estadual'].setValue(true);
                this.estadual = true;
              }
            }
          }),
          (error) => {
            this.error = error;
            this.showError(error)
          }
      });

    }
    else {
      if (this.currentAction == "new") {
        this.loadIgreja() // Carrega todos os dados da IgrejaLocal
      }
    }
  }

  public createCarta() {
    this.cartaForm.controls['tituloMin3'].setValue(this.pessoa.tituloMin);
    this.cartaForm.controls['conteudo'].setValue(null);

    if (this.cartaForm.controls['modeloCarta'].value == 'Mudança') {
      this.cartaForm.controls['statusMembro'].setValue('Transferido')
    }
    this.cartaForm.controls['congregacaoDestino'].setValue(this.cartaForm.controls['congregacaoDestino'].value.toUpperCase())
    const carta: CartaDTO = this.cartaForm.value;
    this.cartaService.create(carta)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (carta) => {
          this.id = parseInt(this.extractId(carta.headers.get('location'))); // Extrai o Id da URI retornada do banco
          this.carta.id = this.id;
          this.actionsForSuccess(this.carta);
        },
        error: (error) => {
          this.toastr.warning(error.errors[0].message, 'Carta');
        }

      })
  }


  public updateCarta() {
    if (this.cartaForm.controls['modeloCarta'].value == 'Mudança') {
      this.cartaForm.controls['statusMembro'].setValue('Transferido');
    }
    this.cartaForm.controls['conteudo'].setValue(null);
    this.cartaForm.controls['congregacaoDestino'].setValue(this.cartaForm.controls['congregacaoDestino'].value.toUpperCase())
    const carta: CartaDTO = Object.assign(new CartaDTO(), this.cartaForm.value);
    this.cartaService.update(carta)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (carta) => {
          if (this.ctr_update) {
            this.actionsForSuccess(carta)
            this.toastr.success('Registro atualizado com sucesso!', 'Carta');
          }
        },
        error: (error) => {
          this.toastr.warning(error.errors[0].message, 'Carta');
        }

      })
  }

  loadObreiros() {
    this.pessoaService.getByListaObreirosAtivosFromIgreja(this.igrejaId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.obreiros = response;
          // this.obreiros = response.map((p: any) => ({ label: p.nome, value: p.nome }));
        },
        error: () => { }
      });
  }


  private loadIgreja() {
    this.igrejaService.getById(this.igrejaId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.igreja = response;
          this.cartaForm.controls['igrejaId'].setValue(this.igreja.id);
          this.cartaForm.controls['igrejaLocal'].setValue(this.igreja.nome);
          this.cartaForm.controls['cidadeLocal'].setValue(this.igreja.cidade);
          this.cartaForm.controls['ufLocal'].setValue(this.igreja.uf);
          this.igreja.celular1;

        },
        error: error => {
          return this.actionsForError(error);
        }
      })

  }

  loadPessoas() {
    const situacaoCadastral = 'Ativo'
    this.pessoaService.getPessoasAtivasFromIgreja(this.igrejaId, situacaoCadastral)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.pessoas = response;
        },
        error: () => { }
      });
  }

  loadPessoasNomeConjugeFilhos() {
    const situacaoCadastral = 'Ativo' // Do banco vai  Trazer Ativo ou Transferido
    this.pessoaService.getPessoasAtivasTransferidasIgreja(this.igrejaId, situacaoCadastral)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.pessoasNomeConjugeFilhos = response;
        },
        error: () => { }
      });
  }

  private loadPessoa(id) {
    this.pessoaService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.pessoa = response;
          this.pessoaId = this.pessoa.id;
          this.nomeMembro = this.pessoa.nome;
          this.cartaForm.controls['nomeMembro'].setValue(this.pessoa.nome); //  
          this.cartaForm.controls['tituloMin'].setValue(this.pessoa.tituloMin); //  
          this.cartaForm.controls['pessoaId'].setValue(this.pessoa.id); //  
          this.cartaForm.controls['membroDesde'].setValue(this.pessoa.membroDesde);//  
          this.cartaForm.controls['situacaoEspiritual'].setValue(this.pessoa.situacaoEspiritual);//  Situação do Membro Prova/Em Comunhao  
          this.cartaForm.controls['sexo'].setValue(this.pessoa.sexo);//   
          this.cartaForm.controls['statusMembro'].setValue(this.pessoa.situacaoCadastral);// Status do Membro Ativo/Inativo 
          this.cartaForm.controls['cartaoMembro'].setValue(this.pessoa.cartaoMembro);// 
          this.cartaForm.controls['abreviaturaMin'].setValue(this.pessoa.abreviaturaMin);//   

          (((this.pessoa.sexo == 'Feminino' && (this.pessoa.tipoMembro == 'Obreiro' || 'Membro')
            && this.pessoa.tituloMin !== null)) &&
            (this.pessoa.tituloMin == 'Missionária' || this.pessoa.tituloMin == 'Diaconisa'
              || this.pessoa.tituloMin == 'Cooperadora' || this.pessoa.tituloMin == 'Pastora')) ?
            (this.cartaForm.controls['observacao'].setValue('A mesma serve ao Senhor como ' + this.pessoa.tituloMin + '.')) :

            ((this.pessoa.sexo == 'Masculino' && this.pessoa.tipoMembro == 'Obreiro' && this.pessoa.tituloMin !== null))
              ? this.cartaForm.controls['observacao'].setValue('O mesmo serve ao Senhor como ' + this.pessoa.tituloMin + '.') :
              this.cartaForm.controls['observacao'].setValue('');
          this.cartaForm.controls['tituloMin'].setValue(null);
          this.cartaForm.controls['tituloMin2'].setValue(this.pessoa.tituloMin); /*Necessario porque tituloMin precisa ser nulo na linha acima.
                                                                                       Assim não aparece o titulo na tela campo Titulo Ministerial*/
        },
        error: () => { }
      });
  }

  private loadResponsavel(id) {
    this.pessoaService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.responsavel = response;
          const nome = this.responsavel.nome.toUpperCase();
          this.cartaForm.controls['nomeResponsavel'].setValue(nome); // 
          this.cartaForm.controls['cargoResponsavel'].setValue(this.responsavel.cargoPrincipal);// Cargo especificado no Módulo de Pessoa. Usado para assinatura de cartas  
          this.cartaForm.controls['tituloResponsavel'].setValue(this.responsavel.tituloMin); // Título Ministerial do Responsável

          (this.responsavel.abreviaturaMin !== null ?
            this.cartaForm.controls['abreviaturaMinResponsavel'].setValue(this.responsavel.abreviaturaMin) :
            this.cartaForm.controls['abreviaturaMinResponsavel'].setValue(''));
        },
        error: () => { }
      });
  }

  private loadSecretario(id: number) {
    this.pessoaService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.secretario = response;
          this.cartaForm.controls['contatoSecretarioEscrevente'].setValue(this.secretario.celular1);
          this.cartaForm.controls['nomeSecretario'].setValue(this.secretario.nome);
        },
        error: () => { }
      });
  }

  private loadConjuge(id) {
    this.pessoaService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.conjuge = response;
          this.cartaForm.controls['idConjuge'].setValue(this.conjuge.id)// 
          this.cartaForm.controls['conjuge'].setValue(this.conjuge.nome)//  
          this.cartaForm.controls['cartaoConjuge'].setValue(this.conjuge.cartaoMembro)//  
        },
        error: () => { }
      });
  }



  loadModeloDocumentos(igrejaId, nome) {
    this.documentoService.getByListModeloDocumentoFromIgreja(igrejaId, nome)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.modeloDocumentos = response.filter(modelo => (modelo.tipo == 'Recomendação' || modelo.tipo == 'Mudança' || modelo.tipo == 'Apresentação'));
          this.modeloDocumentoId = response[0].id;
        },
        error: (error): void => {
          if (error.status == 403) {
            this.router.navigate(['auth/signin'])

          } else {
            this.router.navigate(['auth/signin'])
          }
        }
      });
  }

  // METODOS

   exclusaoCarta(carta: CartaDTO) {
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
          this.excluir(carta);
          Swal.fire('Exclusão', 'Registro excluido com sucesso!', 'success');
        }
      });
    }
  
    excluir(carta: any) {
      this.cartaService.delete(carta.id)
        .subscribe({
          next: () => {
            this.router.navigate(['/cartas']);
          },
          error: () => { },
        });
    }

  addMes() {
    this.cartaForm.controls['dataValidade'].setValue(this.sharedService.dataAddMes(this.cartaForm.controls['dataEmissao'].value, 1));
  }

  private setPageTitle() {
    const pessoaName = this.nomeMembro || ""
    this.pageTitle = "Emitindo carta.:   " + pessoaName.toUpperCase();
  }

  loadCidades(cidade) {
    this.cidadeService.getListaCidadesUfEstados(cidade)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.cidades = response['content'];
        },
        error: () => { }
      });

  }

  loadEstados() {
    this.sharedService.getDataEstados()
      .then(async (response) => {
        this.estados = await response.json();
        //
      },
        () => {
        });

  }

  loadEstado(id) {
    this.sharedService.getDataEstado(id)
      .then(async (response) => {
        this.estado = await response.json();
        const nome = this.estado.nome;
        const uf = this.estado.sigla;
        this.cartaForm.controls['estadoDestino'].setValue(nome);
        this.cartaForm.controls['ufDestino'].setValue(uf);
        this.cartaForm.controls['idEstadoDestino'].setValue(this.estado.id);
      },
        () => {
        });
  }


  onChangePaisDestino(id) {
    this.cartaForm.controls['idPaisDestino'].setValue(id.value);
    this.cartaForm.controls['idPais'].setValue(id.value);

    if (this.cartaForm.controls['paisDestino'].value !== 'Brasil') {
      this.cartaForm.controls['cidadeDestino'].setValue(null);
      this.cartaForm.controls['estadoDestino'].setValue('');
      this.cartaForm.controls['ufDestino'].setValue('');
      this.cartaForm.controls['idCidadeDestino'].setValue(null);
      this.cartaForm.controls['congregacaoDestino'].setValue('');
    } else if (this.cartaForm.controls['paisDestino'].value == 'Brasil' && (this.territorial == true || this.estadual == true)) {
      this.cartaForm.controls['congregacaoDestino'].setValue('POR ONDE PASSAR');// Para satisfazer requerido tres caracteres
    }

    this.loadPaisDestino(id.value)
  }

  loadPaises() {
    this.paisService.getListaPaisSigla()
      .subscribe({
        next: (response) => {
          this.paises = response['content'].map(
            (p: { id: { [x: number]: any }; sigla: { [x: string]: any }; nomePt: any }) => {
              return {
                id: p.id,
                sigla: p.sigla,
                nome: p.nomePt,
              };
            },
          );
        },
        error: () => { },
      });
  }

  loadPaisDestino(id) {
    this.pais = this.paises.filter(p => p.id === id)
    this.cartaForm.controls['paisDestino'].setValue(this.pais[0].nome);
    this.cartaForm.controls['siglaPais'].setValue(this.pais[0].sigla);

    if (this.cartaForm.controls['paisDestino'].value !== 'Brasil') {
      this.cartaForm.controls['cidadeDestino'].setValue(null);
      this.cartaForm.controls['estadoDestino'].setValue('');
      this.cartaForm.controls['ufDestino'].setValue('');
      this.cartaForm.controls['idCidadeDestino'].setValue(null);
      this.cartaForm.controls['congregacaoDestino'].setValue('POR ONDE PASSAR');
    } else if (this.cartaForm.controls['paisDestino'].value == 'Brasil' && (this.territorial == true || this.estadual == true)) {
      this.cartaForm.controls['congregacaoDestino'].setValue('POR ONDE PASSAR');// Para satisfazer requerido tres caracteres
    } else {
      this.cartaForm.controls['congregacaoDestino'].setValue('');// Para satisfazer requerido tres caracteres
    }

  }


  // METODOS AUXILIARES

  private actionsForSuccess(carta: CartaDTO) {
    const path: string = this.route.snapshot.data['path'];
    if (this.currentAction == 'new') {
      this.toastr.success('Registro inserido com sucesso!', 'Carta');
      this.router.navigateByUrl(path, { skipLocationChange: true }).then(
        () => this.router.navigate([path, carta.id, 'edit']))

    } else {
      // redirect/reload component page
      this.router.navigateByUrl(path, { skipLocationChange: true }).then(
        () => this.router.navigate([path, carta.id, 'edit']))
    }
  }

  private extractId(location: string): string { // Extrai o Id da URL
    const position = location.lastIndexOf('/');
    return location.substring(position + 1, location.length);
  }

  private actionsForError(error) {
    this.submittingForm = false;

    if (error.status === 422) {
      this.serverErrorMessages = JSON.parse(error._body).errors;
    } else if (error.status == 403) {
      this.router.navigate(['login/signin'])

    } else {
      this.serverErrorMessages = ["Falha na comunicação com o servidor. Por favor, teste mais tarde."]
    }
  }

  private showError(error) {
    // this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.message });
  }


  // Metodos

  substituirVariaveisCarta() {

    const string0 = this.conteudoHTML;

    const string1 = string0.replaceAll(/%CIDADE_LOCAL_CARTA%/g, this.cartaForm.controls['cidadeLocal'].value);
    const string2 = string1.replaceAll(/%UF_LOCAL_CARTA%/g, this.cartaForm.controls['ufLocal'].value.toUpperCase());
    const string3 = string2.replaceAll(/%DATA_EMISSAO%/g, this.cartaForm.controls['dataEmissao'].value);
    const string4 = string3.replaceAll(/%TIPO_CARTA%/g, this.cartaForm.controls['tipoCarta'].value);

    // DADOS DA CONGREGAÃO PARA DESTINO DAS CARTAS
    let dadosDestinoCarta = '';
    // Estadual true carta por onde passar em um estado especifico(Apenas recomendação)
    if (this.estadual == true) {
      dadosDestinoCarta = 'POR ONDE PASSAR' + '  ' + this.cartaForm.controls['estadoDestino'].value +
        ' - ' + this.cartaForm.controls['paisDestino'].value.toUpperCase();

    } else if (this.territorial == true && this.cartaForm.controls['paisDestino'].value == 'Brasil') {
      // Territorial true carta para todo o território territorial/territorial segundo o pais
      dadosDestinoCarta = 'POR ONDE PASSAR' + '  ' + this.cartaForm.controls['paisDestino'].value.toUpperCase() + '/' +
        this.cartaForm.controls['siglaPais'].value.toUpperCase();
    } else if (this.territorial == true && this.cartaForm.controls['paisDestino'].value !== 'Brasil') {
      // Territorial true carta para todo o território territorial/territorial segundo o pais
      dadosDestinoCarta = 'POR ONDE PASSAR' + '  ' + this.cartaForm.controls['paisDestino'].value.toUpperCase() + '/' +
        this.cartaForm.controls['siglaPais'].value.toUpperCase();
    } else if (this.territorial == false && this.estadual == false) {
      // Cidade caso contrário carta para a cidade e estado especifico
      dadosDestinoCarta = this.cartaForm.controls['congregacaoDestino'].value + '  ' + this.cartaForm.controls['cidadeDestino'].value +
        ' - ' + this.cartaForm.controls['paisDestino'].value.toUpperCase();
    }
    const string5 = string4.replaceAll(/%DADOS_DESTINO_CARTA%/g, dadosDestinoCarta.toUpperCase());



    //NOME_MEMBRO_CARTA 
    const nomeMembro = this.cartaForm.controls['nomeMembro'].value.toUpperCase();

    const nomeEsposa = this.cartaForm.controls['conjuge'].value !== null ? this.cartaForm.controls['conjuge'].value.toUpperCase() : '';
    const e_esposa = (this.cartaForm.controls['conjuge'].value !== null) ? ' <i>e Esposa</i> ' : '';
    const e_familia = (this.cartaForm.controls['conjuge'].value !== null && this.cartaForm.controls['esposa'].value == false
      && this.cartaForm.controls['filho'].value == false) ? ' <i>e Família</i> ' : '';

    const cartaoM = this.cartaForm.controls['cartaoMembro'].value;
    const cartaoConjuge = this.cartaForm.controls['conjuge'].value !== null
      || this.cartaForm.controls['esposa'].value == true ? this.cartaForm.controls['cartaoConjuge'].value : '';
    const cartaoMembro = this.cartaForm.controls['conjuge'].value ? '<i> (Matricula ' + cartaoM + ' / ' + cartaoConjuge + ')</i>' :
      '<i> (Matricula ' + cartaoM + ')</i>';

    //E_FILHO_S
    const e_filho_s = this.cartaForm.controls['filho'].value == true
      && this.cartaForm.controls['filho1'].value !== null
      && this.cartaForm.controls['filho2'].value == null
      && this.cartaForm.controls['filho3'].value == null
      && this.cartaForm.controls['filho4'].value == null ? ' <i>e Filho(a):</i> ' :

      this.cartaForm.controls['filho'].value == true
        && this.cartaForm.controls['filho1'].value !== null
        && this.cartaForm.controls['filho2'].value !== null
        || this.cartaForm.controls['filho3'].value !== null
        || this.cartaForm.controls['filho4'].value !== null ? ' <i>e Filhos:</i> ' : '';
    //E_FILHO_S

    //;_E
    const sinal_1 = this.cartaForm.controls['filho1'].value ? '' : '';
    const sinal_2 = this.cartaForm.controls['filho2'].value && this.cartaForm.controls['filho3'].value ? ', ' : ' e ';
    const sinal_3 = this.cartaForm.controls['filho3'].value && !this.cartaForm.controls['filho4'].value ? ' e ' : ', ';
    let sinal_4 = '';
    if (this.cartaForm.controls['filho4'].value) {
      sinal_4 = ' e ';
    }

    //;_E

    const filho1 = (this.cartaForm.controls['filho1'].value ? this.cartaForm.controls['filho1'].value : '' + sinal_1).toUpperCase();
    const filho2 = (this.cartaForm.controls['filho2'].value ? this.cartaForm.controls['filho2'].value : '' + sinal_2).toUpperCase();
    const filho3 = (this.cartaForm.controls['filho3'].value ? this.cartaForm.controls['filho3'].value : '' + sinal_3).toUpperCase();
    const filho4 = (this.cartaForm.controls['filho4'].value ? this.cartaForm.controls['filho4'].value : '' + sinal_4).toUpperCase();

    const nomeFilhos = this.cartaForm.controls['filho'].value && this.cartaForm.controls['filho1'].value !== null
      && this.cartaForm.controls['filho2'].value == null && this.cartaForm.controls['filho3'].value == null
      && this.cartaForm.controls['filho4'].value == null ? filho1 + sinal_1 :

      this.cartaForm.controls['filho'].value && this.cartaForm.controls['filho1'].value !== null
        && this.cartaForm.controls['filho2'].value !== null && this.cartaForm.controls['filho3'].value == null
        && this.cartaForm.controls['filho4'].value == null ? filho1 + sinal_2 + filho2 + sinal_1 :

        this.cartaForm.controls['filho'].value && this.cartaForm.controls['filho1'].value !== null
          && this.cartaForm.controls['filho2'].value !== null && this.cartaForm.controls['filho3'].value !== null
          && this.cartaForm.controls['filho4'].value == null ? filho1 + sinal_2 + filho2 + sinal_3 + filho3 + sinal_4 :

          this.cartaForm.controls['filho'].value && this.cartaForm.controls['filho1'].value !== null
            && this.cartaForm.controls['filho2'].value !== null && this.cartaForm.controls['filho3'].value !== null
            && this.cartaForm.controls['filho4'].value !== null ? filho1 + sinal_2 + filho2 + sinal_3 + filho3 + sinal_4 + filho4 : '';


    const nomesMembro = nomeMembro + e_esposa + nomeEsposa + cartaoMembro + e_familia + e_filho_s + nomeFilhos
    const string6 = string5.replaceAll(/%NOME_MEMBRO_CARTA%/g, nomesMembro);
    //NOME_MEMBRO_CARTA

    //LINHA PARA APRESENTAR MES E ANO DE CASA
    const string7 = string6.replaceAll(/%MEMBRO_DESDE%/g, this.cartaForm.controls['membroDesde'].value == null ? 'há tempos' :
      this.cartaForm.controls['membroDesde'].value);

    // AQUI MEMBRO_DESDE // ESTÁ SETADO DIRETO PARA HÁ TEMPOS PARA SEGUIR O PADRÃO DO GT. M

    // const string9 = string8.replaceAll(/%MEMBRO_DESDE%/g, 'há tempos');
    //MEMBRO_DESDE

    //O_A_OS_AS// 
    const string8 = string7.replaceAll(/%O_A_OS_AS%/g,
      (this.cartaForm.controls['sexo'].value == 'Masculino'
        && (this.cartaForm.controls['conjuge'].value == null || "")
        && this.cartaForm.controls['filho'].value == true) ? 'os' :

        (this.cartaForm.controls['sexo'].value == 'Feminino'
          && (this.cartaForm.controls['conjuge'].value == null || "")
          && this.cartaForm.controls['filho'].value == true) ? 'os' :

          (this.cartaForm.controls['sexo'].value == 'Masculino'
            && this.cartaForm.controls['conjuge'].value == null) ? 'o' :

            (this.cartaForm.controls['sexo'].value == 'Feminino'
              && this.cartaForm.controls['conjuge'].value == null) ? 'a' :
              (this.cartaForm.controls['sexo'].value == 'Masculino'
                && this.cartaForm.controls['conjuge'].value !== null) ? 'os' : '');
    //O_A_OS_AS// 

    //MESMO_A_OS_AS// 
    const string9 = string8.replaceAll(/%MESMO_A_OS_AS%/g,
      (this.cartaForm.controls['sexo'].value == 'Masculino'
        && (this.cartaForm.controls['conjuge'].value == null || "")
        && this.cartaForm.controls['filho'].value == true) ? 'mesmos' :

        (this.cartaForm.controls['sexo'].value == 'Feminino'
          && (this.cartaForm.controls['conjuge'].value == null || "")
          && this.cartaForm.controls['filho'].value == true) ? 'mesmos' :

          (this.cartaForm.controls['sexo'].value == 'Masculino' && this.cartaForm.controls['conjuge'].value == null) ? 'mesmo' :
            (this.cartaForm.controls['sexo'].value == 'Feminino' && this.cartaForm.controls['conjuge'].value == null) ? 'mesma' :
              (this.cartaForm.controls['sexo'].value == 'Masculino' && this.cartaForm.controls['conjuge'].value !== null) ? 'mesmos' : '');
    //MESMO_A_OS_AS// 

    //RECEBIDO_A_OS_AS// 
    const string10 = string9.replaceAll(/%RECEBIDO_A_OS_AS%/g,
      (this.cartaForm.controls['sexo'].value == 'Masculino'
        && (this.cartaForm.controls['conjuge'].value == null || "")
        && this.cartaForm.controls['filho'].value == true) ? 'recebidos' :

        (this.cartaForm.controls['sexo'].value == 'Feminino'
          && (this.cartaForm.controls['conjuge'].value == null || "")
          && this.cartaForm.controls['filho'].value == true) ? 'recebidos' :

          (this.cartaForm.controls['sexo'].value == 'Masculino' && this.cartaForm.controls['conjuge'].value == null) ? 'recebido' :
            (this.cartaForm.controls['sexo'].value == 'Feminino' && this.cartaForm.controls['conjuge'].value == null) ? 'recebida' :
              (this.cartaForm.controls['sexo'].value == 'Masculino' && this.cartaForm.controls['conjuge'].value !== null) ? 'recebidos' : '');
    //RECEBIDO_A_OS_AS// 

    const string11 = string10.replaceAll(/%IGREJA_LOCAL_CARTA%/g, this.cartaForm.controls['igrejaLocal'].value);

    //MEMBRO_S// 
    const string12 = string11.replaceAll(/%MEMBRO_S%/g,
      (this.cartaForm.controls['conjuge'].value !== null
        || this.cartaForm.controls['esposa'].value == true
        || this.cartaForm.controls['filho'].value == true ? 'membros' : 'membro'));
    //MEMBRO_S//  

    const string13 = string12.replaceAll(/%ABREVIATURA_MIN_RESPONSAVEL%/g, this.cartaForm.controls['abreviaturaMinResponsavel'].value);
    const string14 = string13.replaceAll(/%NOME_RESPONSAVEL%/g, this.cartaForm.controls['nomeResponsavel'].value.toUpperCase());
    const string15 = string14.replaceAll(/%CARGO_RESPONSAVEL%/g, this.cartaForm.controls['cargoResponsavel'].value);
    const string16 = string15.replaceAll(/%NOME_IGREJA%/g, this.cartaForm.controls['igrejaLocal'].value);
    // Igreja
    const string17 = string16.replaceAll(/%LOGRADOURO_IGREJA%/g, this.igreja.logradouro);
    const string18 = string17.replaceAll(/%NUMERO_IGREJA%/g, this.igreja.numero);
    const string19 = string18.replaceAll(/%BAIRRO_IGREJA%/g, this.igreja.bairro);
    const string20 = string19.replaceAll(/%CIDADE_IGREJA%/g, this.igreja.cidade);
    const string21 = string20.replaceAll(/%UF_IGREJA%/g, this.igreja.uf);
    const string22 = string21.replaceAll(/%CEP_IGREJA%/g, this.igreja.cep);
    const string23 = string22.replaceAll(/%EMAIL_IGREJA%/g, this.igreja.email);
    const string24 = string23.replaceAll(/%CONTATO_SECRETARIO%/g, this.cartaForm.controls['contatoSecretarioEscrevente'].value !== '' || null ?
      this.cartaForm.controls['contatoSecretarioEscrevente'].value : this.secretario.celular1);


    // Coloca apenas o titulo ministerial em negrito na Observação

    if (this.cartaForm.controls['tituloMin2'].value !== 'Membro' && this.cartaForm.controls['tituloMin2'].value !== null) {
      this.cartaForm.controls['tituloMin'].setValue(this.cartaForm.controls['tituloMin2'].value);
    }

    if (this.cartaForm.controls['tituloMin'].value == null) {
      this.obs = this.cartaForm.controls['observacao'].value;


    } else if (this.cartaForm.controls['tituloMin'].value == 'Pastor') {
      this.obs = this.cartaForm.controls['observacao'].value.replaceAll(/Pastor/g, '<b>Pastor</b>')
    } else if (this.cartaForm.controls['tituloMin'].value == 'Evangelista') {
      this.obs = this.cartaForm.controls['observacao'].value.replaceAll(/Evangelista/g, '<b>Evangelista</b>')
    } else if (this.cartaForm.controls['tituloMin'].value == 'Presbítero') {
      this.obs = this.cartaForm.controls['observacao'].value.replaceAll(/Presbítero/g, '<b>Presbítero</b>')
    } else if (this.cartaForm.controls['tituloMin'].value == 'Diácono') {
      this.obs = this.cartaForm.controls['observacao'].value.replaceAll(/Diácono/g, '<b>Diácono</b>')
    } else if (this.cartaForm.controls['tituloMin'].value == 'Cooperador') {
      this.obs = this.cartaForm.controls['observacao'].value.replaceAll(/Cooperador/g, '<b>Cooperador</b>')
    } else if (this.cartaForm.controls['tituloMin'].value == 'Missionário') {
      this.obs = this.cartaForm.controls['observacao'].value.replaceAll(/Missionário/g, '<b>Missionário</b>')
    } else if (this.cartaForm.controls['tituloMin'].value == 'Missionária') {
      this.obs = this.cartaForm.controls['observacao'].value.replaceAll(/Missionária/g, '<b>Missionária</b>')
    }
    this.cartaForm.controls['tituloMin'].setValue(this.cartaForm.controls['tituloMin'].value)

    const string25 = string24.replaceAll(/%OBSERVACAO%/g, this.obs);
    const string26 = string25.replaceAll(/%OBS%/g, (this.cartaForm.controls['observacao'].value.trim() !== '' ? 'Obs:.' : ''));
    const string27 = string26.replaceAll(/%DATA_ATUAL_EXTENSO%/g, this.sharedService.dataAtualExtenso());
    const string28 = string27.replaceAll(/%DATA_VALIDADE%/g, this.cartaForm.controls['dataValidade'].value);

    const string29 = string28.replaceAll(/%ESTAR_ESTAREM%/g, this.cartaForm.controls['filho'].value == true
      || this.cartaForm.controls['conjuge'].value !== null ? 'estarem' : 'estar');

    // DEPOIS DE SUBSTITUIR TODOS OS CAMPOS, SETA A ULTIMA STRING ATUALIZADA EM "conteudo"
    this.cartaForm.controls['conteudo'].setValue(string29);
  }
}
