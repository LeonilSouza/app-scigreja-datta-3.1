// angular import
import { Component, DoCheck, OnDestroy, OnInit, inject } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';

// bootstrap import
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from 'src/app/theme/shared/services';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ThemeConfig } from 'src/app/app-config';

// third party
import { TranslateService } from '@ngx-translate/core';
import { UserDTO, UsuarioDTO } from 'src/app/theme/shared/models/usuario.dto';
import { StorageService } from 'src/app/theme/shared/services/storage.service';
import { UsuarioService } from 'src/app/theme/shared/services/usuario.service';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { igrejaIdSignal, nomeIgrejaSignal, nomeUsuarioSignal, } from 'src/app/theme/shared/_helpers/shared-signals';


@Component({
  selector: 'app-nav-right',
  standalone: true,
  imports: [
    SharedModule,
    RouterLink
  ],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss'],
  providers: [NgbDropdownConfig],
  animations: [
    trigger('slideInOutLeft', [
      transition(':enter', [style({ transform: 'translateX(100%)' }), animate('300ms ease-in', style({ transform: 'translateX(0%)' }))]),
      transition(':leave', [animate('300ms ease-in', style({ transform: 'translateX(100%)' }))])
    ]),
    trigger('slideInOutRight', [
      transition(':enter', [style({ transform: 'translateX(-100%)' }), animate('300ms ease-in', style({ transform: 'translateX(0%)' }))]),
      transition(':leave', [animate('300ms ease-in', style({ transform: 'translateX(-100%)' }))])
    ])
  ]
})
export class NavRightComponent implements DoCheck, OnInit, OnDestroy {


  nomeIgrejaSignal = nomeIgrejaSignal; //Signal 
  nomeUsuarioSignal = nomeUsuarioSignal;

  igrejaId = igrejaIdSignal();
  nomeUsuario = nomeUsuarioSignal();


  private subscription: Subscription = new Subscription;

  authenticationService = inject(AuthenticationService);
  private translate = inject(TranslateService);
  private storage = inject(StorageService);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);

  user!: UserDTO;

  fotoUsuario?: string
  acessoId!: number;
  usuario: UsuarioDTO = new UsuarioDTO();
  perfis0!: string;
  perfis1!: string;
  perfil!: string;

  // public props
  visibleUserList: boolean;
  chatMessage: boolean;
  friendId: boolean = false;
  config;

  // constructor
  constructor() {
    const config = inject(NgbDropdownConfig);
    const translate = this.translate;

    config.placement = 'bottom-right';
    this.visibleUserList = false;
    this.chatMessage = false;
    this.config = ThemeConfig;
    translate.setDefaultLang(ThemeConfig.i18n);
  }


  ngOnInit() {
    setTimeout(() => {
      this.useLanguage(ThemeConfig.i18n);
    }, 0);
    this.checkLocalUser();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  checkLocalUser() {
    const localToken = this.storage.getLocalToken();
    const localUser = this.storage.getLocalUser();
    if (localToken && localUser.email) {
      const email = localUser.email;
      this.usuarioService.getUsuarioFromEmail(email)
        .subscribe({
          next: (response) => {
            this.usuario = response;
            this.fotoUsuario = this.usuario.foto;
            this.perfis0 = response['perfis'][0]
            this.perfis1 = response['perfis'][1]
            this.nomeUsuarioSignal.update(() => this.usuario.name!);
            this.perfis();
          },
          error: () => { }
        });
    } else {
      this.router.navigate(['login'])
    }
  }

  private perfis() {// perfil de ADMIN
    if (this.perfis0 === 'ADMIN' || this.perfis1 === 'ADMIN') { // Se for ADMIN
      this.perfil = 'ADMIN'
    } else { // Se for USUARIO
      this.perfil = 'USUARIO'
    }
  }

  // public method
  onChatToggle(friend_id: boolean) {
    this.friendId = friend_id;
    this.chatMessage = !this.chatMessage;
  }

  // life cycle event
  ngDoCheck() {
    if (document.querySelector('body')!.classList.contains('datta-rtl')) {
      (this.config as any)['rtl-layout'] = true;
    } else {
      (this.config as any)['rtl-layout'] = false;
    }
  }

  // user according language change of sidebar menu item
  useLanguage(language: string) {
    this.translate.use(language);
  }

  logout() {
    this.authenticationService.logout();
  }
}
