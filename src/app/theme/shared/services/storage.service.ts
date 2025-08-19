import { HttpClient } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { LocalIgreja, LocalUser, UsuarioDTO } from '../models/usuario.dto';
import { Router } from '@angular/router';
import { GLOBALS, STORAGE_KEYS } from 'src/app/app-config';

@Injectable()
export class StorageService {

    usuario!: UsuarioDTO;

    constructor(
        public http: HttpClient,
        private router: Router,

    ) {
    }

    getLocalToken(): string {
        let tok = localStorage.getItem(STORAGE_KEYS.localToken);
        if (tok === null) {
            return null;
        }
        else {
            return JSON.parse(tok);
        }
    }


    setLocalToken(obj: string) {
        if (obj === null) {
            localStorage.removeItem(STORAGE_KEYS.localToken);
        }
        else {
            localStorage.setItem(STORAGE_KEYS.localToken, JSON.stringify(obj));
        }
    }


    getLocalUser(): LocalUser { // Obter um usuario que está no localUser
        let user = localStorage.getItem(STORAGE_KEYS.localUser);
        if (user === null) {
            return null;
        }
        else {
            return JSON.parse(user);
        }
    }

    setLocalUser(obj: LocalUser) {  // Armazenar um dado objeto no  localUser
        if (obj === null) {
            localStorage.removeItem(STORAGE_KEYS.localUser);
        }
        else {
            localStorage.setItem(STORAGE_KEYS.localUser, JSON.stringify(obj));
        }
    }


    getLocalIgreja(): LocalIgreja { // Obter um id da igreja que está no localIgreja
        let igr = localStorage.getItem(STORAGE_KEYS.localIgreja);
        if (igr === null) {
            return null;
        }
        else {
            return JSON.parse(igr);
        }
    }

    setLocalIgreja(obj: LocalIgreja) {  // Armazenar um id  objeto no  localIgreja
        if (obj === null) {
            localStorage.removeItem(STORAGE_KEYS.localIgreja);
        }
        else {
            localStorage.setItem(STORAGE_KEYS.localIgreja, JSON.stringify(obj));
        }
    }

    resetLogin() {// Prevene atualização do navegador e Seta os valores Globais
        let igreja = localStorage.getItem(STORAGE_KEYS.localIgreja);
        if (!igreja) {
            this.router.navigate(['login'])
        } else {
            GLOBALS.igrejaId = this.getLocalIgreja().igrejaId;
            GLOBALS.setorId = this.getLocalIgreja().setorId;
            GLOBALS.nomeIgreja = this.getLocalIgreja().nomeIgreja;
            GLOBALS.nomeUsuario = this.getLocalIgreja().nomeUser;
            GLOBALS.imageUrl = this.getLocalUser().imageUrl;
            GLOBALS.perfil = this.getLocalIgreja().perfil;
        }
    }

}
