import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';

// import { environment } from 'src/environments/environment';
import { LocalUser, UserDTO, UsuarioDTO } from '../models/usuario.dto';
import { ToastrService } from 'ngx-toastr';
import { StorageService } from './storage.service';
import { API_CONFIG, GLOBALS } from 'src/app/app-config';


@Injectable({ providedIn: 'root' })

export class AuthenticationService {
  jwtHelperService: JwtHelperService = new JwtHelperService();

  user: UserDTO = {};
  usuario: UsuarioDTO;
  user$ = (new BehaviorSubject<UserDTO>(this.user));

  perfis0: string;
  perfis1: string;

  constructor(
    public http: HttpClient,
    public storage: StorageService,
    public router: Router,
    private toast: ToastrService
  ) {
  }

  login(email: string, password: string) {
    return this.http.post(`${API_CONFIG.baseUrl}/login`, { email, password },
      {
        observe: 'response',
        responseType: 'text'
      });
  }

  refreshToken() {
    return this.http.post(
      `${API_CONFIG.baseUrl}/auth/refresh_token`, {},
      {
        observe: 'response',
        responseType: 'text'
      });
  }

  successfulLogin(authorizationValue: string) {
    const tok = authorizationValue.substring(7);
    const email = this.jwtHelperService.decodeToken(tok).sub;

    const user: LocalUser = {
      email: this.jwtHelperService.decodeToken(tok).sub,
      name: this.user.name,
      perfil: GLOBALS.perfil,
      imageUrl: ''
    };

    this.storage.setLocalToken(tok);
    this.storage.setLocalUser(user);

    if (email) {
      this.http.get(`${API_CONFIG.baseUrl}/usuarios/email?value=${email}`)
        .subscribe({
          next: (response) => {
            this.usuario = response;
            this.perfis0 = response['perfis'][0]
            this.perfis1 = response['perfis'][1]
            this.perfil();

            const user: LocalUser = {
              email: this.usuario.email,
              name: this.usuario.name,
              perfil: GLOBALS.perfil,
              imageUrl: this.usuario.imageUrl
            };
            this.user = user;
            this.storage.setLocalUser(user);
            return user;

          },
          error: () => {
            catchError((error) => {
              return throwError(() => error);
            });
          }
        })
    }
  }

  private perfil() {// perfil de ADMIN
    if (this.perfis0 === 'ADMIN' || this.perfis1 === 'ADMIN') { // Se for ADMIN
      GLOBALS.perfil = 'ADMIN'
    } else { // Se for USUARIO
      GLOBALS.perfil = 'USUARIO'
    }
  }



  checkLocalUser() {
    const localUser = this.storage.getLocalUser();
    if (localUser && localUser.email) {
      const email = localUser.email;
      return this.http.get(`${API_CONFIG.baseUrl}/users/email?value=${email}`)
    }
  }

  logout() {
    this.storage.setLocalToken(null);
    this.storage.setLocalUser(null);
    this.storage.setLocalIgreja(null);
    GLOBALS.igrejaId = 0;
    GLOBALS.nomeUsuario = 'IEAD';
    GLOBALS.nomeUsuario = '';
    GLOBALS.perfil = '';
    this.toast.info('Usuario desconectado com sucesso.')
    this.router.navigate(['login']);
  }
}
