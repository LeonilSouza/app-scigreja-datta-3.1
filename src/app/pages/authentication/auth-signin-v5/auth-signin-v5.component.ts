// angular import
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { first } from 'rxjs';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AuthenticationService } from 'src/app/theme/shared/services';
import { LocalIgreja, UsuarioDTO } from 'src/app/theme/shared/models/usuario.dto';
import { ToastrService } from 'ngx-toastr';
import { StorageService } from 'src/app/theme/shared/services/storage.service';
import { UsuarioService } from 'src/app/theme/shared/services/usuario.service';
import { igrejaIdSignal, nomeIgrejaSignal, nomeUsuarioSignal, perfilSignal, setorIdSignal } from 'src/app/theme/shared/_helpers/shared-signals';



@Component({
  selector: 'app-auth-signin-v5',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    SharedModule,
    RouterModule
  ],
  templateUrl: './auth-signin-v5.component.html',
  styleUrls: ['./auth-signin-v5.component.scss', '../auth-v5-style.scss']
})
export class AuthSigninV5Component {

  nomeIgrejaSignal = nomeIgrejaSignal; //Signal 
  igrejaIdSignal = igrejaIdSignal;
  nomeUsuarioSignal = nomeUsuarioSignal;
  perfilSignal = perfilSignal;
  setorIdSignal = setorIdSignal;

  nomeIgreja = nomeIgrejaSignal();
  igrejaId = igrejaIdSignal();
  nomeUsuario = nomeUsuarioSignal();
  perfil = perfilSignal();
  setorId = setorIdSignal();



  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  authenticationService = inject(AuthenticationService);
  private storage = inject(StorageService);
  private toast = inject(ToastrService);
  private usuarioService = inject(UsuarioService);



  usuario: UsuarioDTO = new UsuarioDTO();
  toggler: string;
  nome: string;
  email: string;
  acessoId: number;
  // setorId: number;
  perfis0: string;
  perfis1: string;

  // public method
  showPassword: boolean = false;

  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  returnUrl!: string;
  classList!: { toggle: (arg0: string) => void };


  constructor() {
    // redireciona para home se já estiver logado
    if (this.authenticationService.user.email) {
      this.router.navigate(['/dashboard/default']);
    }
  }
  // life cycle hook
  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      id: [null],
      name: [null],
      email: ['leonilsouza@gmail.com', Validators.compose([Validators.required, emailValidator])],
      password: ['01020102', Validators.compose([Validators.required, Validators.minLength(6)])],
      perfil: [null],
      imageUrl: [null]
    });
  }

  // public method
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
    const password = document.querySelector('#password');
    const type = password?.getAttribute('type') === 'password' ? 'text' : 'password';
    password?.setAttribute('type', type);
  }

  // convenience getter for easy access to form fields
  get formValues() {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.error = '';
    this.loading = true;
    this.authenticationService
      .login(this.formValues?.['email']?.value, this.formValues?.['password']?.value)
      .pipe(first())
      .subscribe({
        next: (response): void => {
          this.authenticationService.successfulLogin(response.headers.get('Authorization'));
          this.checkAcesso();
          this.router.navigate(['/dashboard/default']);
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;

        }
      });
  }

  checkLocalUser() {
    const localToken = this.storage.getLocalToken();
    const localUser = this.storage.getLocalUser();
    if (localToken && localUser.email) {
      const email = localUser.email;
      return this.usuarioService
        .getUsuarioFromEmail(email)
        .subscribe({
          next: (response) => {
            this.usuario = response;
            this.usuario.igrejaAtivaId = this.usuario.igrejaIdHome;
            this.usuario.igrejaAtivaNome = this.usuario.igrejaNomeHome;

            this.setorId = this.usuario.setorIdHome;
            this.perfis0 = response['perfis'][0]
            this.perfis1 = response['perfis'][1]
            this.nome = this.usuario.name;
            this.email = this.usuario.email;

            this.perfils();

            // Atualiza o signal para Igreja Padrão do Usuario
            this.nomeIgrejaSignal.update(() => this.usuario.igrejaNomeHome);
            this.igrejaIdSignal.update(() => this.usuario.igrejaIdHome);
            this.setorIdSignal.update(() => this.usuario.setorIdHome);
            this.nomeUsuarioSignal.update(() => this.usuario.name);
            this.perfilSignal.update(() => this.perfil);

            this.nomeUsuario = this.usuario.name;
            this.igrejaId = this.usuario.igrejaIdHome;
            this.setorId = this.usuario.setorIdHome;
            this.nomeIgreja = this.usuario.igrejaNomeHome;


            // Objeto locaStorage - Os dados são atualizados para o Usuario e Igreja Padão
            const igr: LocalIgreja = {
              igrejaId: this.usuario.igrejaIdHome,
              setorId: this.usuario.setorIdHome,
              nomeIgreja: this.usuario.igrejaNomeHome,
              nomeUser: this.usuario.name,
              perfil: this.perfil
            };

            // Grava Objeto no locaStorage - Os dados são atualizados para o Usuario e Igreja Padão
            this.storage.setLocalIgreja(igr);

            this.usuario.igrejaAtivaId = this.usuario.igrejaIdHome;
            this.usuario.igrejaAtivaNome = this.usuario.igrejaNomeHome;
            const usuario: UsuarioDTO = Object.assign(new UsuarioDTO(), this.usuario);
            usuario.igrejaAtivaId = this.usuario.igrejaIdHome;
            usuario.igrejaAtivaNome = this.usuario.igrejaNomeHome;

            this.usuarioService.update(usuario)
              .subscribe({
                next: () => { }
              })
          },
          error: (error) => {
            if (error.status == 403) {
              this.router.navigate(['login'])

            } else {
              this.router.navigate(['login'])
            }
          }
        });
    } else {
      this.router.navigate(['login'])
    }
  }

  private perfils() {// perfil de ADMIN
    if (this.perfis0 === 'ADMIN' || this.perfis1 === 'ADMIN') { // Se for ADMIN
      this.perfil = 'ADMIN'
    } else { // Se for USUARIO
      this.perfil = 'USUARIO'
    }
  }

  checkAcesso() { //VERIFICA SE O USUARIO TEM ACESSO, OU SEJA, IGREJA CADASTRADO NO CADASTRO DE ACESSO DE USUARIO
    const localToken = this.storage.getLocalToken();
    const localUser = this.storage.getLocalUser();
    if (localToken && localUser.email) {
      const email = localUser.email;
      return this.usuarioService.getUsuarioFromEmail(email)
        .subscribe({
          next: (response) => {
            this.usuario = response;
            this.acessoId = response['acesso'].length;
            if (this.acessoId === 0) {
              this.toast.warning('Usuario não possui Igreja Cadastrada');
              this.router.navigate(['login'])
            }
            if (this.acessoId !== 0) {
              this.checkLocalUser();
            }
          },
          error: (error) => {
            if (error.status == 403) {
              this.router.navigate(['login'])

            } else {
              this.router.navigate(['login'])
            }
          }
        });
    } else {
      this.router.navigate(['login'])
    }
  }
}

export function emailValidator(control: FormControl): { [key: string]: any } | null {
  const emailRegexp = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/;
  if (control.value && !emailRegexp.test(control.value)) {
    return { invalidEmail: true };
  }
  return null
}
