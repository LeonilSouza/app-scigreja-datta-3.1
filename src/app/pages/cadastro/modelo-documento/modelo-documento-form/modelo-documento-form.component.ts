import { AfterContentChecked, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { ConfirmationService, LazyLoadEvent, MessageService, SharedModule } from 'primeng/api';


import { TranslateService } from '@ngx-translate/core';
import { PrimeNGConfig } from 'primeng/api';
import { GLOBALS } from 'src/app/_helpers/globals';
import { PessoaListDTO } from 'src/app/models/pessoa.dto';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { Observable, Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ModeloDocumentoDTO } from 'src/app/models/modelo-documento.dto';
import { ModeloDocumentoService } from 'src/app/services/modelo-documento.service';

import Swal from 'sweetalert2';

import { VariavelService } from 'src/app/services/variavel.service';
import { VariavelDTO } from 'src/app/models/variavel.dto';
import { Table, TableModule } from 'primeng/table';
import { CKEditorModule } from 'ng2-ckeditor';
import { UiModalComponent } from '../../../../shared/components/modal/ui-modal/ui-modal.component';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { NgxSelectModule } from 'ngx-select-ex';
import { ButtonModule } from 'primeng/button';
import { NgIf, NgClass } from '@angular/common';;



//declare const $: any;

@Component({
    selector: 'app-modelo-documento-form',
    templateUrl: './modelo-documento-form.component.html',
    styleUrls: ['./modelo-documento-form.component.scss'],
    standalone: true,
    imports: [
        NgIf,
        ButtonModule,
        RouterLink,
        NgClass,
        FormsModule,
        ReactiveFormsModule,
        NgxSelectModule,
        NgbTooltip,
        UiModalComponent,
        TableModule,
        SharedModule,
        CKEditorModule,
    ],
})

export class ModeloDocumentoFormComponent implements OnInit, AfterContentChecked, OnDestroy {

    @ViewChild('dtvariavel') grid!: Table;

    public page = 0;
    public linesPerPage = 5;
    totalRegistros: number = 0
    variaveis: VariavelDTO[] = [];

    public conteudo: string;

    public variavel = '';

    tipos = ['Padrao', 'Igreja']; // Tipo padrão é o tipo que grava null no igrejaId do Banco, tadas a Igreja podem ver. Igreja grava o id da igreja do usuario, outras igreja não pode ver.
    tipoDocumentos = [
        'Recomendação',
        'Mudança',
        'Apresentação',
        'Outros'];

    // cropper
    imageChangedEvent: any = '';
    croppedImage: any = '';
    modeloDocumentoLogo: ModeloDocumentoDTO;

    public activeTab: string;

    perfil: string = GLOBALS.perfil;

    subscription: Subscription;

    nomeIgreja: string = GLOBALS.nomeIgreja;

    igrejaId: number = GLOBALS.igrejaId;

    // @ViewChild('dtdocumento') grid!: Table;

    /*  Referente a ModeloDocumentoDTO */
    currentAction: string;
    modeloDocumentoForm: FormGroup;
    pageTitle: string;
    serverErrorMessages: string[] = null;
    submittingForm: boolean = false;

    modeloDocumento: ModeloDocumentoDTO = new ModeloDocumentoDTO();
    filiais: ModeloDocumentoDTO = new ModeloDocumentoDTO();
    pessoas: PessoaListDTO[];
    id: number;

    public ckeditorContent:string;
    public config: any;

    constructor(
        private route: ActivatedRoute,

        private router: Router,
        private formBuilder: FormBuilder,
        private modeloDocumentoService: ModeloDocumentoService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        public translate: TranslateService,
        public primeNGConfig: PrimeNGConfig,
        private toastr: ToastrService,
        private variavelService: VariavelService

    ) {
        //Calendar PrimeNG
        translate.setDefaultLang('pt-br');

        this.subscription = this.translate.stream('primeng').subscribe(data => {
            this.primeNGConfig.setTranslation(data);
        });
        this.activeTab = 'modeloDocumento';

        this.ckeditorContent = '<div>Hey we are testing CKEditor</div>';
        
        this.config = {
            uiColor: '#F0F3F4',
            height: '500',
            extraPlugins: 'divarea',
            versionCheck: false
          };
    }

    // ckeDITOR
    onChange(event: any) {
        setTimeout(() => {
        //   this.ckeditorContent = event;
        });

      }
      onReady(event: any) {
        // if(event.model.schema.isRegistered('image')) {
        //     event.model.schema.extend( 'image', { allowAttributes: 'blockIdent'})
        // }
       }
      onFocus(event: any) { 
        //   console.log("editor is focused");
      }
      onBlur(event: any) {
      }

    changeLang(lang: string) {
        this.translate.use(lang);
    }
    //Fim Calendar PrimeNG

    ngOnInit(): void {
        // this.conteudo = '<p>Hello...</p>';
        this.setCurrentAction();
        this.buildModelomodeloDocumentoForm();
        this.loadModeloDocumento();

    }

    imprimir(): void{
        // Linha que remove o cabeçalho e o rodape do previw da impressão 
        let estilo = "<style>@media print {@page { size:  auto; margin: 5mm; margin-right: 100px }}</style>" ;
          let win = window.open('',  '', 'height=1080, width=2648');
          win.document.write('<html><head>');
          win.document.write('<title></title>');
          win.document.write('</head><body>');
          win.document.write(this.ckeditorContent);
          win.document.write(estilo);
          win.document.write('</body></html>'); 
          win.print();
          win.close();      
    }

    // Carrega lista das Variaveis
    loadVariavelLazy(event: LazyLoadEvent) {
        const page = event!.first! / event!.rows!; // divisão para encontrar a paginações
        this.loadVariaveis(this.variavel.toLocaleLowerCase(), page, this.linesPerPage);
    }


    loadVariaveis(variavel, page, linesPerPage) {

        this.variavelService.getByPageVariavel(variavel, page, linesPerPage)
            .subscribe({
                next: (response) => {
                    this.variaveis = response['content'].sort((a, b) => b.id - a.id)
                    this.totalRegistros = response.totalElements

                },
                error: (error): void => {
                    if (error.status == 403) {
                        this.router.navigate(['login/signin'])

                    } else {
                        this.router.navigate(['login/signin'])
                    }
                }
            })
    }

    ngAfterContentChecked() {
        this.setPageTitle();
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
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
            this.createModeloDocumento();
        else // currentAction == "edit"
            this.updateModeloDocumento();
    }

    private buildModelomodeloDocumentoForm() {
        this.modeloDocumentoForm = this.formBuilder.group({
            id: [null],
            nome: [null, [Validators.required]], // As vezes tem que deixar vazio "" ao invés de null p/ não dá BO
            tipo: ['', [Validators.required]],
            conteudo: [this.conteudo, [Validators.required]],
            observacao: [null],
            tipoDocumento: ['Padrao'], // Campo inexistente no banco. Utilizados apenas para Admin para setar null em igrejaId
            logo: [null],
            igrejaId: [(this.perfil == 'ADMIN') ? null : this.igrejaId]
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

    // cropped

    fileChangeEvent(event: any, ModeloDocumentoDTO): void {
        this.imageChangedEvent = event;
        this.modeloDocumentoLogo = ModeloDocumentoDTO;
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

    uploadLogo(ModeloDocumentoDTO) {
        if (this.croppedImage) {// Imagem base64 no formato png 
            this.convertPngToJpeg(this.croppedImage); // Enviada para ser convertida em para o formato jpeg ou jpg. Formatos diferentes somente no nome 
            let numero = 'data:image/jpeg;base64,';
            let N = numero.length;

            const base64 = this.croppedImage.substr(N, this.croppedImage.length); //Retira estes dados da imagem "data:image/png;base64"
            const nome = this.modeloDocumentoLogo.nome;
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
                this.modeloDocumentoService
                    .upload(ModeloDocumentoDTO, formData)
                    .subscribe(response => {
                        this.loadModeloDocumento();
                        this.croppedImage = null;
                        this.imageChangedEvent = null;
                        this.toastr.success('Registro cadastrado com sucesso');
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

    removerLogo(modeloDocumento) {
        modeloDocumento.logo = null;
        this.modeloDocumentoForm.controls['logo'].setValue(null);
        this.croppedImage = null;
        this.imageChangedEvent = null;
    }

    // FIM FOTO


    // EVENTOS DO NGX-SELECT-EX

    ///////////////////////////// Tipo   ///////////////////////////
    public doSelectTipoDocumento = (value: any) => {
        if (value === 'Padrao') {
            this.modeloDocumentoForm.controls['igrejaId'].setValue(null);
        } else {
            this.modeloDocumentoForm.controls['igrejaId'].setValue(GLOBALS.igrejaId);
        }
    }

    private loadModeloDocumento() { // Obs->> Aqui é que deve ser ser carregado os dados para o buildForm pegando classes individualizadas
        if (this.currentAction == "edit") {
            let params: Observable<Params> = this.route.params
            params.subscribe(urlParams => {
                this.id = urlParams['id'];

                this.modeloDocumentoService.findById(this.id)
                    .subscribe({
                        next: (response) => {
                            this.modeloDocumento = response;
                            this.modeloDocumentoForm.patchValue(this.modeloDocumento)   // binds loaded modeloDocumento data to modeloDocumentoForm
                            this.modeloDocumentoForm.controls['tipoDocumento'].setValue(this.modeloDocumento.igrejaId ? 'Igreja' : 'Padrao')
                        },
                        error: () => this.showError()
                    })
            })
        }
    }

    private setPageTitle() {
        if (this.currentAction == 'new')
            this.pageTitle = "Novo Modelo de Documento"
        else {
            const documentoName = this.modeloDocumento.nome || ""
            this.pageTitle = "Editando:  " + documentoName;
        }
    }

    public createModeloDocumento() {
        // ESTE PARA DEIXAR TUDO EM CAIXA ALTA
        // this.modeloDocumentoForm.controls.nome.setValue(this.modeloDocumentoForm.controls.nome.value.toUpperCase()); /* Aqui que real mente coloca em caixa alta. 
        // Poque se o teclado estiver com o caps desl. grava miniscula  RsRS*/

        //ESTE PARA PRIMEIRA MAIUSCULAS
        // ESTE PARA DEIXAR TUDO EM CAIXA ALTA
        // this.modeloDocumentoForm.controls.nome.setValue(this.modeloDocumentoForm.controls.nome.value.toUpperCase()); /* Aqui que real mente coloca em caixa alta. 
        // Poque se o teclado estiver com o caps desl. grava miniscula  RsRS*/
        //ESTE PARA PRIMEIRA MAIUSCULAS
        this.modeloDocumentoForm.controls['nome'].setValue(this.formataNome(this.modeloDocumentoForm.controls['nome'].value)); // Aqui formata o nome completo
        const modeloDocumento: ModeloDocumentoDTO = this.modeloDocumentoForm.value;
        this.modeloDocumentoService.create(modeloDocumento)
            .subscribe(
                modeloDocumento => {
                    this.id = parseInt(this.extractId(modeloDocumento.headers.get('location'))); // Extrai o Id da URI retornada do banco
                    this.modeloDocumento.id = this.id;
                    this.actionsForSuccess(this.modeloDocumento)

                    // this.messageService.add({ severity: 'success', summary: 'Successo', detail: 'Registro salvo com sucesso!' });
                    Swal.fire('Modelo de documento', 'Registro Inserido com sucesso', 'success');

                },
                error => this.actionsForError(error)
            )
    }

    public updateModeloDocumento() {
        // ESTE PARA DEIXAR TUDO EM CAIXA ALTA
        // this.modeloDocumentoForm.controls.nome.setValue(this.modeloDocumentoForm.controls.nome.value.toUpperCase()); /* Aqui que real mente coloca em caixa alta. 
        // Poque se o teclado estiver com o caps desl. grava miniscula  RsRS*/

        //ESTE PARA PRIMEIRA MAIUSCULAS
        // ESTE PARA DEIXAR TUDO EM CAIXA ALTA
        // this.modeloDocumentoForm.controls.nome.setValue(this.modeloDocumentoForm.controls.nome.value.toUpperCase()); /* Aqui que real mente coloca em caixa alta. 
        // Poque se o teclado estiver com o caps desl. grava miniscula  RsRS*/
        //ESTE PARA PRIMEIRA MAIUSCULAS
        this.modeloDocumentoForm.controls['nome'].setValue(this.formataNome(this.modeloDocumentoForm.controls['nome'].value)); // Aqui formata o nome completo
        const modeloDocumento: ModeloDocumentoDTO = Object.assign(new ModeloDocumentoDTO(), this.modeloDocumentoForm.value);

        this.modeloDocumentoService.update(modeloDocumento)
            .subscribe({
                next: (response) => {
                    this.actionsForSuccess(response)
                    // this.messageService.add({ severity: 'success', summary: 'Successo', detail: 'Registro atualizado com sucesso!' });
                    Swal.fire('Atualização', 'Modelo Atualizado com sucesso', 'success');

                },
                error: error => this.actionsForError(error)
            })
    }



    // METODOS PRIVADOS

    confirmarExclusaoModeloDocumento(modeloDocumento: ModeloDocumentoDTO): void {
        this.confirmationService.confirm({
            message: 'Tem certeza que deseja excluir este registro?',
            accept: () => {
                this.excluir(modeloDocumento);
            }
        });
    }

    excluir(modeloDocumento: ModeloDocumentoDTO) {
        this.modeloDocumentoService.delete(modeloDocumento.id)
            .subscribe(() => {
                this.router.navigate(['/modelodocumentos'])
                this.messageService.add({ severity: 'success', summary: 'Successo', detail: 'Registro excluido com sucesso!' });
            },
                () => { });
    }

    private actionsForSuccess(modeloDocumento: ModeloDocumentoDTO) {
        const path: string = this.route.snapshot.parent.url[0].path;

        // redirect/reload component page  
        this.router.navigateByUrl(path, { skipLocationChange: true }).then(
            () => this.router.navigate([path, modeloDocumento.id, 'edit']))
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

    formataNome(nome: string) {
        return nome.toLowerCase().replace(/(?:^|\s)(?!da|de|do)\S/g, l => l.toUpperCase());
    };

    showError() {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro no servidor tente mais tarde' });
    }

    // Biblioteca Terceiros
}