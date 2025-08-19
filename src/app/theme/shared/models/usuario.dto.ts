export class UsuarioDTO {
  constructor(
      public id?: number,
      public name?: string,
      public email?: string,
      public password?: string,
      public rememberMe?: string,
      public imageUrl?: string,
      public foto?: string,
      public igrejaAtivaId?: number,
      public igrejaAtivaNome?: string
  ){}
}

export class UserDTO {
    constructor(
        public id?: number,
        public name?: string,
        public email?: string,
        public password?: string,
        public perfil?: string,
        public imageUrl?: string

        ){}
}

export interface LocalToken {
  token: string;
}

export interface LocalUser {
    email: string;
    name: string;
    perfil: string;
    imageUrl: string;
}

export interface LocalIgreja {
    igrejaId: number;
    setorId: number;
    nomeIgreja: string;
    nomeUser: string;
    perfil: string;
}

export interface CredenciaisDTO {
    email: string;
    password: string;
    rememberMe: string;
}





