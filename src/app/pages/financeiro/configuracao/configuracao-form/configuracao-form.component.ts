// import { ConfiguracaoDTO, ConfiguracaoListDTO } from 'src/app/models/configuracao.dto';
// import { AfterContentChecked, Component, OnDestroy, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { ActivatedRoute, Params, Router } from '@angular/router';
// import { Observable } from 'rxjs';
// import { ConfiguracaoService } from '../../../services/configuracao.service';
// import { ToastrService } from 'ngx-toastr';

// import { SharedService } from 'src/app/services/shared.service';

// import Swal from 'sweetalert2';

// import { GLOBALS } from 'src/app/_helpers/globals';

// //declare const $: any;

// @Component({
//   selector: 'app-configuracao-form',
//   templateUrl: './configuracao-form.component.html',
//   styleUrls: ['./configuracao-form.component.scss'],
//   // encapsulation: ViewEncapsulation.None //as vezes não deixa aparecer o input da foto
// })

// export class ConfiguracaoFormComponent implements OnInit, AfterContentChecked, OnDestroy {

//   iModo: number = 1;
//   pageTitle: string;
//   id: number;
//   submittingForm: boolean = false;
//   igrejaId: number = GLOBALS.igrejaId;
//   perfil: string = GLOBALS.perfil;
//   public activeTab: string;

//   /*  Referente a ConfiguracaoDTO */
//   currentAction: string;
//   configuracaoForm: FormGroup;

//   configuracaos: ConfiguracaoListDTO[] = [];
//   configuracao: ConfiguracaoDTO = new ConfiguracaoDTO();

//   constructor(
//     private configuracaoService: ConfiguracaoService,
//     private route: ActivatedRoute,
//     private router: Router,
//     private sharedService: SharedService,
//     private formBuilder: FormBuilder,
//     private toastr: ToastrService

//   ) {
//     this.activeTab = 'home';
//   }

//   ngOnInit(): void {
//     this.igrejaId = GLOBALS.igrejaId;
//     this.setCurrentAction();
//     this.buildConfiguracaoForm();
//     this.loadConfiguracoes();
//     this.loadConfiguracao();
//   }


//   public setCurrentAction() {
//     if (this.route.snapshot.url[0].path == "new") {
//       this.currentAction = "new",
//         this.activeTab = 'novo';
//     } else
//       this.currentAction = "edit"
//   }

//   submitForm() {
//     this.submittingForm = true;
//     if (this.currentAction == "new") {
//       this.createConfiguracao();
//     } else { // currentAction == "edit"
//       this.updateConfiguracao();
//       this.submittingForm = true;
//       // this.router.navigate(["/configuracaos"])
//     }
//   }


//   private buildConfiguracaoForm() {
//     this.configuracaoForm = this.formBuilder.group({
//       id: [null],
//       nome: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(120)]]
//     });
//   }


//   loadConfiguracoes() {
//     this.configuracaoService.getConfiguracoesAtivasFromIgreja(GLOBALS.igrejaId)
//       .subscribe({
//         next: (response) => {
//           this.configuracaos = response;
//         },
//         error: () => { }
//       });
//   }


//   public loadConfiguracao() { // Obs->> Aqui é que deve ser ser carregado os dados para o buildForm pegando classes individualizadas
//     if (this.currentAction == "edit") {
//       let params: Observable<Params> = this.route.params
//       params.subscribe(urlParams => {
//         this.id = urlParams['id'];
//         this.configuracaoService.getById(this.id)
//           .subscribe(
//             (response) => {
//               this.configuracao = response; // binds loaded configuracao
//               this.configuracaoForm.patchValue(this.configuracao)   // binds loaded configuracao data to ConfiguracaoForm
//               this.configuracaoForm.controls['igrejaId'].setValue(GLOBALS.igrejaId);
//             })
//       })
//     } else {
//       if (this.currentAction == "new") {
//         this.configuracaoForm.controls['igrejaId'].setValue(this.igrejaId);
//       }
//     }
//   }

//   private setPageTitle() {
//     if (this.currentAction == 'new')
//       this.pageTitle = "Novo Membro"
//     else {
//       const configuracaoName = this.configuracao.nome || ""
//       this.pageTitle = "Editando:  " + configuracaoName;
//     }
//   }

//   public createConfiguracao() {
//     this.configuracaoForm.controls['nome'].setValue(this.configuracaoForm.controls['nome'].value.toUpperCase());
//     this.configuracaoForm.controls['nomeSemAcento'].setValue(this.sharedService.removerAcentos(this.configuracaoForm.controls['nome'].value));

//     const configuracao: ConfiguracaoDTO = this.configuracaoForm.value;
//     this.configuracaoService.create(configuracao)
//       .subscribe({
//         next: (configuracao) => {
//           this.id = parseInt(this.extractId(configuracao.headers.get('location'))); // Extrai o Id da URI retornada do banco
//           this.configuracao.id = this.id;

//           this.actionsForSuccess(this.configuracao);
//           Swal.fire('Configuração', 'Registro inserido com sucesso!', 'success');

//         }
//       })
//   }

//   public updateConfiguracao() {
//     const configuracao: ConfiguracaoDTO = Object.assign(new ConfiguracaoDTO(), this.configuracaoForm.value);
//     this.configuracaoService.update(configuracao)
//       .subscribe({
//         next: (configuracao) => {
//           this.actionsForSuccess(configuracao)
//           Swal.fire('Atualização', 'Registro atualizado com sucesso!', 'success');
//         }
//       })
//   }

//   private actionsForSuccess(disciplina: ConfiguracaoDTO) {
//     const path: string = this.route.snapshot.parent.url[0].path;
//     this.router.navigateByUrl(path)
//   }


//   private extractId(location: string): string { // Extrai o Id da URL
//     let position = location.lastIndexOf('/');
//     return location.substring(position + 1, location.length);
//   }
// }
