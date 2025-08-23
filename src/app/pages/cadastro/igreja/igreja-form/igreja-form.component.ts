import { AfterContentChecked, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ConfirmationService, MessageService } from 'primeng/api';

import Swal from 'sweetalert2';

import { TranslateService } from '@ngx-translate/core';
import { PrimeNGConfig } from 'primeng/api';
import { INgxSelectOption, NgxSelectModule } from 'ngx-select-ex';
import { CargoDTO } from 'src/app/models/cargo.dto';
import { SetorDTO } from 'src/app/models/setor.dto';
import { CargoService } from 'src/app/services/cargo.service';
import { SetorService } from 'src/app/services/setor.service';
import { IgrejaService } from 'src/app/services/igreja.service';
import { StorageService } from 'src/app/services/storage.service';
import { GLOBALS } from 'src/app/_helpers/globals';
import { PessoaService } from 'src/app/services/pessoa.service';
import { PessoaListDTO } from 'src/app/models/pessoa.dto';
import { ImageCroppedEvent, ImageCropperModule } from 'ngx-image-cropper';
import { IgrejaDTO } from 'src/app/models/igreja.dto';
import { CidadeDTO } from 'src/app/models/cidade.dto';
import { PaisDTO } from 'src/app/models/pais.dto';
import { SharedService } from 'src/app/services/shared.service';
import { EstadoDTO } from 'src/app/models/estado.dto';
import { ToastrService } from 'ngx-toastr';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { NgIf, NgClass } from '@angular/common';

//declare const $: any;

@Component({
    selector: 'app-igreja-form',
    templateUrl: './igreja-form.component.html',
    styleUrls: ['./igreja-form.component.scss'],
    encapsulation: ViewEncapsulation.None //as vezes não deixa aparecer o input da foto
    ,
    standalone: true,
    imports: [NgIf, ButtonModule, RouterLink, NgClass, FormsModule, ReactiveFormsModule, DropdownModule, NgxSelectModule, CalendarModule, InputNumberModule, ImageCropperModule]
})

export class IgrejaFormComponent implements OnInit, AfterContentChecked, OnDestroy {

    // Consulta CEP ViaCep
    dataCep!: any[];

    // Consulta Estados
    estados: EstadoDTO[] = [];

    // cropper
    imageChangedEvent: any = '';
    croppedImage: any = '';
    igrejaLogo: IgrejaDTO;

    public activeTab: string;

    // Funciona muito bem para campos que não precisam de validação com membroDesde que usei primeNg
    public maskCelularArea = ['(', /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]; // Celular
    public maskFixoArea = ['(', /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]; // Telefone Fixo

    subscription: Subscription;

    nomeIgreja: string = GLOBALS.nomeIgreja;

    // @ViewChild('dtigreja') grid!: Table;

    /*  Referente a IgrejaDTO */
    currentAction: string;
    igrejaForm: FormGroup;
    pageTitle: string;
    serverErrorMessages: string[] = null;
    submittingForm: boolean = false;

    setores: SetorDTO[];
    cargos: CargoDTO[];
    setor: SetorDTO = new SetorDTO();

    perfil: string = GLOBALS.perfil;

    cidades: CidadeDTO[] = [];

    paises: PaisDTO[] = [];

    error = '';


    igreja: IgrejaDTO = new IgrejaDTO();
    filiais: IgrejaDTO = new IgrejaDTO();
    pessoas: PessoaListDTO[];
    id: number;

    setorId: number;

    modo: number = 0;

    igrejaId: number = GLOBALS.igrejaId

    tipo = [{ nome: 'Sede' }, { nome: 'Subsede' }, { nome: 'Subcongregação' }]; //PrimeNG
    status = ['Ativa', 'Inativa'];

    PageTitleModal: string
    /*  Referente a ABA SeparacaoDTO */

    jwtHelperService: JwtHelperService = new JwtHelperService();

    // selectOptionService: any;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private igrejaService: IgrejaService,
        public storage: StorageService,
        public setorService: SetorService,
        public cargoService: CargoService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        public translate: TranslateService,
        public primeNGConfig: PrimeNGConfig,
        public pessoaService: PessoaService,
        private sharedService: SharedService,
        private toastr: ToastrService,

    ) {
        this.activeTab = 'dados';
        //Calendar PrimeNG
        translate.setDefaultLang('pt-br');

        this.subscription = this.translate.stream('primeng').subscribe(data => {
            this.primeNGConfig.setTranslation(data);
        });

    }

    changeLang(lang: string) {
        this.translate.use(lang);
    }
    //Fim Calendar PrimeNG

    ngOnInit(): void {
        this.igrejaId = GLOBALS.igrejaId;
        this.setCurrentAction();
        this.buildIgrejaForm();
        this.loadIgreja();
        this.loadPaises();
        this.loadEstados();
        // this.loadCargos();

    }

    ngAfterContentChecked() {
        this.setPageTitle();
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    novaIgrejaUsuario(setorId) {
        this.currentAction = "new"
        this.buildIgrejaForm();
        this.setorId = setorId;
        this.igrejaForm.controls['setorId'].setValue(setorId);
    }

    public setCurrentAction() {
        if (this.route.snapshot.url[0].path == "new") {
            this.currentAction = "new"
        } else
            this.currentAction = "edit"
    }

    submitForm() {
        this.submittingForm = true;
        if (this.currentAction == "new")
            this.createIgreja();
        else // currentAction == "edit"
            this.updateIgreja();
        // this.router.navigate(["/igrejas"])
    }

    private buildIgrejaForm() {
        this.igrejaForm = this.formBuilder.group({
            id: [null],
            nome: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(120)]],
            dataFundacao: [null],
            cpfOuCnpj: ['', [Validators.required]],
            ie: [null],
            logradouro: [null],
            numero: [null],
            complemento: [null],
            logo: [null],
            bairro: [null],
            cep: ['', [Validators.minLength(8), Validators.maxLength(9)]],
            tipo: [null, [Validators.required]],
            tipoPessoa: ['Pessoa Juridica'],
            uf: [null],
            status: ["Ativa"],
            telefone1: [null],
            celular1: [null],
            pais: ['Brasil'],
            cidade: [null],
            estado: [null],
            sigla: [null],
            percentualMaior: [0.00],
            percentualMenor: [0.00],
            contribuicao1: [0.001],
            email: [null],
            nomeSetor: [null],
            numeroAta: [null],
            nivel: [null],

            setorId: [null, [Validators.required]],

            setor: this.igrejaForm = this.formBuilder.group({
                id: [null],
                nome: [null],
            })
        });
    }

    dataMesAno() {
        let data = new Date(),
            // dia = data.getDate().toString().padStart(2, '0'),
            mes = (data.getMonth() + 1).toString().padStart(2, '0'),
            ano = data.getFullYear();
        return `${mes}/${ano}`;

    }

    dataAtualFormatada() {
        let data = new Date(),
            dia = data.getDate().toString().padStart(2, '0'),
            mes = (data.getMonth() + 1).toString().padStart(2, '0'),
            ano = data.getFullYear();
        return `${dia}/${mes}/${ano}`;

    }

    // Consulta CEP
    consultaCep(value) {
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
        if (dados.cep) { this.igrejaForm.controls['cep'].setValue(dados.cep) }; //Para deixar o usuário cadastrar lugares sem  CEP ou com CEP geral 
        this.igrejaForm.controls['logradouro'].setValue(dados.logradouro);
        this.igrejaForm.controls['complemento'].setValue(dados.complemento);
        this.igrejaForm.controls['bairro'].setValue(dados.bairro);
        this.igrejaForm.controls['cidade'].setValue(dados.localidade);
        this.igrejaForm.controls['uf'].setValue(dados.uf);
    }

    // cropped

    fileChangeEvent(event: any, IgrejaDTO): void {
        this.imageChangedEvent = event;
        this.igrejaLogo = IgrejaDTO;
    }

    imageCropped(event: ImageCroppedEvent) {
        this.croppedImage = event.base64;
    }

    imageLoaded() {
        // show cropper
    }
    cropperReady() {

    }
    loadImageFailed() {
        console.error('Load image failed');
    }
    //   fim cropped


    //cropper - cortar imagem

    uploadLogo(IgrejaDTO) {
        if (this.croppedImage) {// Imagem base64 no formato png 
            this.convertPngToJpeg(this.croppedImage); // Enviada para ser convertida em para o formato jpeg ou jpg. Formatos diferentes somente no nome 
            let numero = 'data:image/jpeg;base64,';
            let N = numero.length;

            const base64 = this.croppedImage.substr(N, this.croppedImage.length); //Retira estes dados da imagem "data:image/png;base64"
            const nome = this.igrejaLogo.nome;
            const nome_sem_espacos = nome.replace(/ /g, "_"); // regex que substitui todos os espaços por _

            const imageName = (nome_sem_espacos + '.jpeg'); // Tanto faz jpeg ou jpg
            const imageBlob = this.dataURItoBlob(base64);
            const imageFile = new File([imageBlob], imageName, { type: 'image/jpeg' });

            const tamanhoImagem = imageFile.size;

            if (tamanhoImagem > 10000) {
                this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Imagem muito grande' });
            } else {
                const logo = imageFile;
                const formData: FormData = new FormData();
                formData.append("logo", logo);
                this.igrejaService
                    .upload(IgrejaDTO, formData)
                    .subscribe(() => {
                        this.loadIgreja();
                        this.croppedImage = null;
                        this.imageChangedEvent = null;
                        this.toastr.success('Registro cadastrado com sucesso', 'Cadastro');
                    });
            }
        }
    }

    dataURItoBlob(dataURI) {
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

    convertPngToJpeg(imagePNG) {

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
        let ctx = cvs.getContext("2d").drawImage(source_img_obj, 0, 0, natW, natH);
        let newImageData = cvs.toDataURL(mime_type, 0.4);
        let result_image_obj = new Image();
        result_image_obj.src = newImageData;
        this.croppedImage = null;
        this.croppedImage = newImageData; // Retorna da imagem convertida para Jpeg/Jpg 10 vezes menor que PNG

    }

    removerLogo(igreja) {
        igreja.logo = null;
        this.igrejaForm.controls['logo'].setValue(null);
        this.croppedImage = null;
        this.imageChangedEvent = null;
        this.deletLogo();
    }

    deletLogo() {
        this.igrejaForm.controls['nome'].setValue(this.igrejaForm.controls['nome'].value.toUpperCase());
        const igreja: IgrejaDTO = Object.assign(new IgrejaDTO(), this.igrejaForm.value);
        this.igrejaService.update(igreja)
            .subscribe({
                next: () => {
                    this.toastr.success('Registro excluido com sucesso', 'Exclusão');
                },
                error: () => {
                    error => this.actionsForError(error)
                }
            });
    }

    // FIM FOTO

    loadPaises() {
        this.sharedService.getDataPaises()
            .then(async (response: any) => {
                let paises = await response.json();
                this.paises = paises.map(p => {
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

    loadEstados() {
        this.sharedService.getDataEstados()
            .then(async (response: any) => {
                let estados = await response.json();
                this.estados = estados.map(e => {
                    return {
                        uf: e.sigla, //Mapeia apenas o nome e a UF do estado
                        nome: e.nome
                    }
                });
            },
                (error: any) => {
                    this.errorApiIBGE(error);
                });

    }


    // EVENTOS DO NGX-SELECT-EX eprimeNG

    onChangeTipo(event) {
        if (event.value == 'Sede') {
            this.igrejaForm.controls['nivel'].setValue(1);
        }

        if (event.value == 'Subsede') {
            this.igrejaForm.controls['nivel'].setValue(2);
        }

        if (event.value == 'Subcongregação') {
            this.igrejaForm.controls['nivel'].setValue(3);
        }
    }

    public doSelectOptionsSetor = (options: INgxSelectOption[]) => { // PEGA O NOME DO SELECT
        this.igrejaForm.controls['nomeSetor'].setValue(options[0].text);
    }

    doSelectOptionsPaises = (options: INgxSelectOption[]) => {
        this.igrejaForm.controls['pais'].setValue(options[0].data.nome);
        this.igrejaForm.controls['sigla'].setValue(options[0].data.sigla);
    }

    doSelectOptionsEstados = (options: INgxSelectOption[]) => {
        this.igrejaForm.controls['estado'].setValue(options[0].data.nome);
        this.igrejaForm.controls['uf'].setValue(options[0].data.uf);
    }


    /////////////////////////////  CONTROLE CIDADES  ///////////////////////////

    private loadIgreja() { // Obs->> Aqui é que deve ser ser carregado os dados para o buildForm pegando classes individualizadas
        if (this.currentAction == "edit") {
            let params: Observable<Params> = this.route.params
            params.subscribe(urlParams => {
                this.id = urlParams['id'];

                this.igrejaService.getById(this.id)
                    .subscribe({
                        next: (response) => {
                            this.igreja = response;
                            this.igrejaForm.patchValue(this.igreja)   // binds loaded category data to CategoryForm
                            this.setor = response['setor'];
                            this.igrejaForm.controls['setorId'].setValue(this.setor.id);
                            this.setorId = this.setor.id;
                            this.loadSetorIgreja();

                        },
                        error: () => {
                            () => this.showError()
                        }
                    })
            })
        } else {

            this.loadSetorIgreja();
        }
    }

    loadSetorIgreja() {
        if (this.perfil == 'ADMIN' && this.currentAction == 'new') {
            this.setorService.findSetorIgrejaNewAdmin()
                .subscribe({
                    next: response => {
                        this.setores = response['content'];
                    },
                    error: () => {
                        () => { }
                    }
                });

        } else if (this.perfil === 'ADMIN' && this.currentAction == 'edit') {
            this.setorService.findSetorIgrejaEditAdmin()
                .subscribe({
                    next: response => {
                        this.setores = response['content'];
                        this.igrejaForm.controls['setorId'].setValue(this.setor.id);
                    },
                    error: () => {
                        () => { }
                    }
                });

        } else if (this.perfil !== 'ADMIN' && this.currentAction == 'new') {
            this.setorService.findSetorIgrejaNewUsuario(this.setor.id)
                .subscribe({
                    next: response => {
                        this.setores = response['content'];

                    },
                    error: () => {
                        () => { }
                    }
                });


        } else if (this.perfil !== 'ADMIN' && this.currentAction == 'edit') {
            this.setorService.findSetorIgrejaEditUsuario(this.setor.id)
                .subscribe({
                    next: response => {
                        this.setores = response['content'];
                        this.igrejaForm.controls['setorId'].setValue(this.setor.id);
                    },
                    error: () => {
                        () => { }
                    }
                });
        }
    }


    private setPageTitle() {
        if (this.currentAction == 'new')
            this.pageTitle = "Inserindo: Nova Igreja"
        else {
            const igrejaName = this.igreja.nome || ""
            this.pageTitle = "Editando:  " + igrejaName;
        }
    }

    public createIgreja() {
        //ESTE PARA PRIMEIRA MAIUSCULAS
        // this.igrejaForm.controls.nome.setValue(this.sharedService.formataNome(this.igrejaForm.controls.nome.value)); // Aqui formata o nome completo
        // Poque se o teclado estiver com o caps desl. grava miniscula  RsRS*/

        // ESTE PARA DEIXAR TUDO EM CAIXA ALTA
        //ESTE PARA PRIMEIRA MAIUSCULAS
        // this.igrejaForm.controls.nome.setValue(this.sharedService.formataNome(this.igrejaForm.controls.nome.value)); // Aqui formata o nome completo
        // Poque se o teclado estiver com o caps desl. grava miniscula  RsRS*/
        // ESTE PARA DEIXAR TUDO EM CAIXA ALTA
        this.igrejaForm.controls['nome'].setValue(this.igrejaForm.controls['nome'].value.toUpperCase()); /* Aqui que real mente coloca em caixa alta.*/
        const igreja: IgrejaDTO = this.igrejaForm.value;
        this.igrejaService.create(igreja)
            .subscribe({
                next: (igreja) => {
                    this.id = parseInt(this.extractId(igreja.headers.get('location'))); // Extrai o Id da URI retornada do banco
                    this.igreja.id = this.id;
                    this.actionsForSuccess(this.igreja)

                    Swal.fire('Cadastro', 'Registro inserido com sucesso!', 'success');

                },
                error: () => {
                    error => this.actionsForError(error)
                }
            })
    }

    public updateIgreja() {
        //ESTE PARA PRIMEIRA MAIUSCULAS
        // this.igrejaForm.controls.nome.setValue(this.sharedService.formataNome(this.igrejaForm.controls.nome.value)); // Aqui formata o nome completo
        // Poque se o teclado estiver com o caps desl. grava miniscula  RsRS*/

        // ESTE PARA DEIXAR TUDO EM CAIXA ALTA
        //ESTE PARA PRIMEIRA MAIUSCULAS
        // this.igrejaForm.controls.nome.setValue(this.sharedService.formataNome(this.igrejaForm.controls.nome.value)); // Aqui formata o nome completo
        // Poque se o teclado estiver com o caps desl. grava miniscula  RsRS*/
        // ESTE PARA DEIXAR TUDO EM CAIXA ALTA
        this.igrejaForm.controls['nome'].setValue(this.igrejaForm.controls['nome'].value.toUpperCase()); /* Aqui que real mente coloca em caixa alta.*/
        const igreja: IgrejaDTO = Object.assign(new IgrejaDTO(), this.igrejaForm.value);
        // igreja.nivel = this.nivel;
        this.igrejaService.update(igreja)
            .subscribe({
                next: (igreja) => {
                    this.actionsForSuccess(igreja)
                    Swal.fire('Atualização', 'Registro atualizado com sucesso!', 'success');
                },
                error: () => {
                    error => this.actionsForError(error)
                }
            });
    }


    // METODOS PRIVADOS

    confirmarExclusaoIgreja(igreja: IgrejaDTO): void {
        this.confirmationService.confirm({
            message: 'Tem certeza que deseja excluir esta Igreja?',
            accept: () => {
                this.excluir(igreja);
            }
        });
    }

    excluir(igreja: IgrejaDTO) {
        this.igrejaService.delete(igreja.id)
            .subscribe(() => {
                this.router.navigate(['/igrejas'])
                Swal.fire('Exclusão', 'Igreja exluída com sucesso!', 'success');
            },
                () => { });
    }

    private actionsForSuccess(igreja: IgrejaDTO) {
        const path: string = this.route.snapshot.parent.url[0].path;

        // redirect/reload component page  
        this.router.navigateByUrl(path, { skipLocationChange: true }).then(
            () => this.router.navigate([path, igreja.id, 'edit']))
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

    private extractId(location: string): string { // Extrai o Id da URL
        let position = location.lastIndexOf('/');
        return location.substring(position + 1, location.length);
    }

    showError() {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro no servidor tente mais tarde' });
    }

    errorApiIBGE(_error: any) {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro buscando cidades!' });
    }

    // Biblioteca Terceiros
}
