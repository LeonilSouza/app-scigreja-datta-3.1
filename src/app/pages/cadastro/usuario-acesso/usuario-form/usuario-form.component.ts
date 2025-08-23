import { AfterContentChecked, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ConfirmationService, MessageService, SharedModule } from 'primeng/api';

// import { TranslateService } from '@ngx-translate/core';
import { INgxSelectOption, NgxSelectModule } from 'ngx-select-ex';
import { SetorDTO } from 'src/app/models/setor.dto';
import { Dimensions, ImageCroppedEvent, ImageTransform, ImageCropperModule } from 'ngx-image-cropper';
import { UsuarioDTO } from 'src/app/models/usuario.dto';
import { AcessoDTO } from 'src/app/models/acesso.dto.';
import { IgrejaDTO } from 'src/app/models/igreja.dto';

import Swal from 'sweetalert2';

import { AcessoService } from 'src/app/services/acesso.service';
import { CargoService } from 'src/app/services/cargo.service';
import { IgrejaService } from 'src/app/services/igreja.service';
import { SetorService } from 'src/app/services/setor.service';
import { SharedService } from 'src/app/services/shared.service';
import { StorageService } from 'src/app/services/storage.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { GLOBALS } from 'src/app/_helpers/globals';
import { TableModule } from 'primeng/table';
import { UiModalComponent } from '../../../../shared/components/modal/ui-modal/ui-modal.component';
import { NgbDropdown, NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { ButtonModule } from 'primeng/button';
import { NgIf, NgClass } from '@angular/common';

//declare const $: any;

@Component({
    selector: 'app-usuario-form',
    templateUrl: './usuario-form.component.html',
    styleUrls: ['./usuario-form.component.scss'],
    encapsulation: ViewEncapsulation.None //as vezes não deixa aparecer o input da foto
    ,
    standalone: true,
    imports: [NgIf, ButtonModule, RouterLink, NgClass, FormsModule, ReactiveFormsModule, NgbDropdown, NgbTooltip, UiModalComponent, ImageCropperModule, NgxSelectModule, TableModule, SharedModule]
})

export class UsuarioFormComponent implements OnInit, AfterContentChecked, OnDestroy {

    // cropper
    imageChangedEvent: any = '';
    croppedImage: any = '';
    canvasRotation = 0;
    rotation = 0;
    scale = 1;
    showCropper = false;
    containWithinAspectRatio = false;
    transform: ImageTransform = {};
    usuarioFoto: UsuarioDTO;

    // cropper
    error = '';


    // Funciona muito bem para campos que não precisam de validação com membroDesde que usei primeNg
    public maskCelularArea = ['(', /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]; // Celular
    public maskFixoArea = ['(', /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]; // Telefone Fixo

    subscription: Subscription;

    public activeTab: string;

    currentAction: string;
    usuarioForm: FormGroup;
    setorForm: FormGroup;
    acessoForm: FormGroup;
    igrejaForm: FormGroup;
    serverErrorMessages: string[] = null;
    pageTitle: string;
    submittingForm: boolean = false;
    igrejas: IgrejaDTO[];
    igrejasSetor: IgrejaDTO[];
    igreja: IgrejaDTO = new IgrejaDTO();
    usuario: UsuarioDTO = new UsuarioDTO();
    acesso: AcessoDTO = new AcessoDTO();
    id: number;
    usuarioId: number;
    perfis: number;
    PageTitleModal: string;
    acessos: AcessoDTO[] = [];
    setores: SetorDTO[] = [];

    igrejaId: number;

    nomeUsuario: string = GLOBALS.nomeUsuario;

    nomeIgreja: string = GLOBALS.nomeIgreja;
    setor: string;
    perfil: string = GLOBALS.perfil;


    jwtHelperService: JwtHelperService = new JwtHelperService();

    // selectOptionService: any;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private usuarioService: UsuarioService,
        public storage: StorageService,
        public acessoService: AcessoService,
        public igrejaService: IgrejaService,
        public setorService: SetorService,
        public cargoService: CargoService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private sharedService: SharedService


    ) {
        this.activeTab = 'user';
    }

    ngOnInit(): void {
        this.igrejaId = GLOBALS.igrejaId;
        this.setCurrentAction();
        this.buildUsuarioForm();
        this.buildAcessoForm();
        this.buildSetorForm();
        this.loadUsuario();
        this.loadSetores();

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
            this.createUsuario();
        else // currentAction == "edit"
            this.updateUsuario();
        // this.router.navigate(["/usuarios"])
    }

    submitAcessoForm() {
        this.submittingForm = true;

        if (this.currentAction == "new")
            this.createAcesso();
    }

    private buildUsuarioForm() {
        this.usuarioForm = this.formBuilder.group({
            id: [null],
            name: [null, [Validators.required, Validators.minLength(5), Validators.maxLength(120)]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(120)]],
            foto: [null],
            igrejaAtivaId: [null],
            igrejaAtivaNome: [null]
        });
    }

    private buildAcessoForm() {
        this.acessoForm = this.formBuilder.group({
            id: [null],
            nomeIgreja: [null, [Validators.required]],
            setor: [null, [Validators.required]],
            igrejaId: [null, [Validators.required]],
            usuarioId: [null, [Validators.required]],
        });
    }

    private buildSetorForm() {
        this.setorForm = this.formBuilder.group({
            id: [null],
            nome: [null, [Validators.required]]
        });
    }


    //   Inicio Eventos NGX-Select
    public doSelectOptionsSetor = (options: INgxSelectOption[]) => { // PEGA O NOME DO SELECT
        this.setorForm.controls['nome'].setValue(options[0].data.nome);
        this.acessoForm.controls['setor'].setValue(options[0].data.nome);
    }

    public doSelectOptionsIgreja = (options: INgxSelectOption[]) => { // PEGA O NOME DO SELECT
        if (options[0] !== undefined) {
            this.acessoForm.controls['nomeIgreja'].setValue(options[0].data.nome);
        } else {
            Swal.fire('Informação', 'Setor ainda não possui igrejas cadastrada.!', 'info');
            this.acessoForm.controls['setor'].setValue(null);

        }
    }

    public doSelectIgreja = (value: any) => {
        this.igrejaId = value;
        this.acessoForm.controls['igrejaId'].setValue(value);
    }

    public doSelectSetor = (value: any) => {
        if (value) {
            this.setorForm.controls['id'].setValue(value);
            this.updateIgrejas(value);
        }
    }

    // Fim Eventos NGX-Select    

    private loadUsuario() { // Obs->> Aqui é que deve ser ser carregado os dados para o buildForm pegando classes individualizadas
        if (this.currentAction == "edit") {
            let params: Observable<Params> = this.route.params
            params.subscribe(urlParams => {
                this.id = urlParams['id'];
                this.usuarioId = urlParams['id'];

                this.usuarioService.findById(this.id)
                    .subscribe({
                        next: (response) => {
                            this.usuario = response;
                            this.usuarioForm.patchValue(this.usuario)   // binds loaded usuario data to UsuarioForm
                            this.acessoForm.controls['usuarioId'].setValue(this.usuario.id);
                            this.perfis = response['perfis']
                            this.acessos = response['acesso']
                        },
                        error: (error) => {
                            this.error = error;
                            this.showError(error)
                        }
                    });
            })
        }
    }

    loadSetores() {
        this.setorService
            .findAll()
            .subscribe({
                next: (response) => {
                    this.setores = response['content'];
                },
                error: (error) => {
                    this.error = error;
                    this.showError(error)
                }
            })

    }

    updateIgrejas(setor) {
        this.igrejaService
            .getByIgrejaFromSetor(setor)
            .subscribe({
                next: (response) => {
                    this.igrejasSetor = response['content'];
                    if (this.igrejasSetor.length > 0) {
                        this.acessoForm.controls['igrejaId'].setValue(this.igrejasSetor[0].id)
                    }
                },
                error: (error) => {
                    this.error = error;
                    this.showError(error)
                }
            });
    }


    private setPageTitle() {
        if (this.currentAction == 'new')
            this.pageTitle = "Novo usuario"
        else {
            const usuarioName = this.usuario.name || ""
            this.pageTitle = "Editando:  " + usuarioName;
        }
    }

    public createUsuario() {
        // ESTE PARA DEIXAR TUDO EM CAIXA ALTA
        // this.usuarioForm.controls.nome.setValue(this.usuarioForm.controls.nome.value.toUpperCase()); /* Aqui que real mente coloca em caixa alta. 
        // Poque se o teclado estiver com o caps desl. grava miniscula  RsRS*/

        //ESTE PARA PRIMEIRA MAIUSCULAS
        this.usuarioForm.controls['name'].setValue(this.sharedService.formataNome(this.usuarioForm.controls['name'].value)); // Aqui formata o nome completo
        const usuario: UsuarioDTO = this.usuarioForm.value;
        this.usuarioService
            .create(usuario)
            .subscribe({
                next: (usuario) => {
                    this.id = parseInt(this.extractId(usuario.headers.get('location'))); // Extrai o Id da URI retornada do banco
                    this.usuario.id = this.id;
                    Swal.fire('Cadastro', 'Usuário cadastrado com sucesso!', 'success');
                },
                error: (error) => {
                    this.error = error;
                    this.showError(error)
                }
            });
    }

    public updateUsuario() {
        // ESTE PARA DEIXAR TUDO EM CAIXA ALTA
        // this.usuarioForm.controls.nome.setValue(this.usuarioForm.controls.nome.value.toUpperCase()); /* Aqui que real mente coloca em caixa alta. 
        // Poque se o teclado estiver com o caps desl. grava miniscula  RsRS*/

        //ESTE PARA PRIMEIRA MAIUSCULAS
        this.usuarioForm.controls['name'].setValue(this.sharedService.formataNome(this.usuarioForm.controls['name'].value)); // Aqui formata o nome completo
        const usuario: UsuarioDTO = Object.assign(new UsuarioDTO(), this.usuarioForm.value);

        this.usuarioService
            .update(usuario)
            .subscribe({
                next: () => {
                    Swal.fire('Atualização', 'Usuario atualizado com sucesso!', 'success');
                },
                error: (error) => {
                    this.error = error;
                    this.showError(error)
                }
            });
    }


    confirmarExclusaoUsuario(usuario: UsuarioDTO): void {
        let user = usuario.name;
        this.confirmationService.confirm({
            message: 'Tem certeza que deseja excluir - ' + ' ' + user + '?',
            accept: () => {
                this.excluir(usuario);
            }
        });
    }

    excluir(usuario: UsuarioDTO) {
        this.usuarioService
            .delete(usuario.id)
            .subscribe({
                next: (): void => {
                    this.router.navigate(['/usuarios'])
                    Swal.fire('Exclusão', 'Usuário excluido com sucesso!', 'success');
                },
                error: (error) => {
                    this.error = error;
                    this.showError(error)
                }
            });
    }

    // REFERENTE A TABELA DE ACESSO
    public createAcesso() {
        let busca = 0;
        this.acesso = Object.assign(new AcessoDTO(), this.acessoForm.value);

        if (this.acesso.igrejaId == 0 || this.acesso.igrejaId == null) {
            Swal.fire('Informação', 'Selecione uma Igreja', 'warning');
        } else {
            this.acessoService.getByBuscaFromIgrejaUsuario(this.acesso.igrejaId, this.acesso.usuarioId) // Verifica se ja existe Igreja Cadastrada
                .subscribe(
                    response => {
                        busca = response.length
                        if (busca === 0 || busca == null) {
                            this.acessoService
                                .create(this.acesso)
                                .subscribe({
                                    next: (acesso) => {
                                        this.id = parseInt(this.extractId(acesso.headers.get('location'))); // Extrai o Id da URI retornada do banco
                                        this.acesso.id = this.id;
                                        Swal.fire('Cadastro', 'Acesso inserido com sucesso', 'success');
                                        this.loadAcesso();
                                    },
                                    error: (error) => {
                                        this.error = error;
                                        this.showError(error)
                                    }
                                });
                        } else {
                            Swal.fire('Informação', 'Igreja já está inserida para este usuário!', 'warning');
                        }
                    });
        }

    }

    confirmarExclusaoAcesso(acesso: AcessoDTO): void {
        this.confirmationService.confirm({
            message: 'Tem certeza que deseja excluir este acesso?',
            accept: () => {
                this.excluirAcesso(acesso);
            }
        });
    }

    excluirAcesso(acesso) {
        this.acessoService
            .delete(acesso.id)
            .subscribe({
                next: () => {
                    this.acessos = this.acessos.filter(element => element != acesso)
                    Swal.fire('Exclusão', 'Acesso removido com sucesso', 'success');
                },
                error: (error) => {
                    this.error = error;
                    this.showError(error)
                }
            });
    }

    loadAcesso() {
        this.acessoForm.patchValue(this.acesso)   // binds loaded category data to CategoryForm
        this.acessoForm.controls['usuarioId'].setValue(this.usuarioId);
        this.acessoForm.controls['igrejaId'].setValue(this.igrejaId);
        this.acessoForm.controls['nomeIgreja'].setValue(this.nomeIgreja);
        this.loadUsuario();
    }

    //METODOS PRIVADOS

    // private actionsForSuccess(usuario: UsuarioDTO) {
    //     const path: string = this.route.snapshot.parent.url[0].path;

    //     // redirect/reload component page  
    //     this.router.navigateByUrl(path, { skipLocationChange: true }).then(
    //         () => this.router.navigate([path, usuario.id, 'edit']))
    // }

    private showError(error) {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.message });
        this.submittingForm = false;
    }



    // Metodos Utilitários

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

    private flipAfterRotate() {
        const flippedH = this.transform.flipH;
        const flippedV = this.transform.flipV;
        this.transform = {
            ...this.transform,
            flipH: flippedV,
            flipV: flippedH
        };
    }

    fileChangeEvent(event: any, UsuarioDTO: UsuarioDTO): void {
        this.imageChangedEvent = event;
        this.usuarioFoto = UsuarioDTO;
    }

    imageCropped(event: ImageCroppedEvent) {
        this.croppedImage = event.base64;
    }

    imageLoaded() {
        this.showCropper = true;
        // show cropper
    }
    cropperReady(sourceImageDimensions: Dimensions) {
        console.log('Cropper ready', sourceImageDimensions);
    }

    loadImageFailed() {
        console.error('Load image failed');
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

    //cropper - cortar imagem



    uploadFoto(UsuarioDTO: UsuarioDTO) {
        if (this.croppedImage) {// Imagem base64 no formato png 
          this.convertPngToJpeg(this.croppedImage); // Enviada para ser convertida em para o formato jpeg ou jpg. Formatos diferentes somente no nome 
          let numero = 'data:image/jpeg;base64,';
          let N = numero.length;
    
          const base64 = this.croppedImage.substr(N, this.croppedImage.length); //Retira estes dados da imagem "data:image/png;base64"
          const nome = this.usuarioFoto.name;
          const nome_sem_espacos = nome.replace(/ /g, "_"); // regex que substitui todos os espaços por _
    
          const imageName = (nome_sem_espacos + '.jpeg'); // Tanto faz jpeg ou jpg
          const imageBlob = this.dataURItoBlob(base64);
          const imageFile = new File([imageBlob], imageName, { type: 'image/jpeg' });
    
          const tamanhoImagem = imageFile.size;
    
          if (tamanhoImagem > 10000) {
            Swal.fire('Imagem', 'Imagem muito grande!', 'warning');
            // this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Imagem muito grande' });
          } else {
            const foto = imageFile;
            const formData: FormData = new FormData();
            formData.append("foto", foto);
            this.usuarioService
              .upload(UsuarioDTO, formData)
              .subscribe(() => {
                  this.loadUsuario();
              }
          )}
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

    removerFoto(usuario: { foto: null; }) {
        usuario.foto = null;
        this.usuarioForm.controls['foto'].setValue(null);
        // this.croppedImage = null;
        this.imageChangedEvent = null;
    }

    // FIM FOTO

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

    // Alesrts

    successSwal() {
        Swal.fire('Sucesso', 'Igreja Inserida com sucesso', 'success');
    }

    warningSwal() {
        Swal.fire('Aviso!!!', 'Igreja já inserida para este usuário!', 'warning');
    }

    infoSwal() {
        Swal.fire('Informação!', 'Selecione uma Igreja', 'info');
    }

}