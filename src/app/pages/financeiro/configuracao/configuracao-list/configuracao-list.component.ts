// import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
// import { ConfiguracaoService } from 'src/app/services/configuracao.service';
// import { LazyLoadEvent, MenuItem, MessageService } from 'primeng/api';
// import { GLOBALS } from 'src/app/_helpers/globals';

// @Component({
//   selector: 'app-configuracao-list',
//   templateUrl: './configuracao-list.component.html',
//   styleUrls: ['./configuracao-list.component.scss'],
// })

// export class ConfiguracaoListComponent implements OnInit {

//   igrejaId: number = GLOBALS.igrejaId;

//   perfil: string = GLOBALS.perfil;

//   configuracoes: ConfiguracaoDTO[] = [];

//   error = '';

//   public page = 0;
//   public linesPerPage = 6;
//   public nome = '';

//   constructor(
//     private configuracaoService: ConfiguracaoService,

//   ) { }


//   ngOnInit() {
//     // this.grid.reset();//atualiza a tabela do primeng
//   };

//   loadConfiguracoesLazy(event: LazyLoadEvent) {
//     const page = event!.first! / event!.rows!; // divisão para encontrar a paginações
//     this.loadConfiguracoes(this.igrejaId);
//   }


//   loadConfiguracoes(igrejaId) {
//     this.configuracaoService.getByPageConfiguracaoFromIgreja(igrejaId)
//       .subscribe({
//         next: (response) => {
//           this.configuracoes = response;
//         }
//       });
//   }

// }

