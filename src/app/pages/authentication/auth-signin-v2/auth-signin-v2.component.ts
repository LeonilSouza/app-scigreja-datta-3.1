// Angular import
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AuthenticationService } from 'src/app/theme/shared/services';

// rxjs library
import { first } from 'rxjs/operators';

interface Roles {
  name: string;
  email: string;
  password: string;
  role: string;
}

@Component({
  selector: 'app-auth-signin-v2',
  standalone: true,
  imports: [CommonModule, SharedModule, RouterModule],
  templateUrl: './auth-signin-v2.component.html',
  styleUrls: ['./auth-signin-v2.component.scss', '../auth-v2-style.scss']
})
export class AuthSigninV2Component implements OnInit {
  private formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  authenticationService = inject(AuthenticationService);

  // public method
  showPassword: boolean = false;

  roles: Roles[] = [
    {
      name: 'Admin',
      email: 'admin@gmail.com',
      password: 'Admin@123',
      role: 'Admin'
    },
    {
      name: 'User',
      email: 'user@gmail.com',
      password: 'User@123',
      role: 'User'
    }
  ];

  // Default to the first role
  selectedRole = this.roles[0];

  onSelectRole(role: Roles) {
    this.selectedRole = role;
  }

  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  returnUrl!: string;
  classList!: { toggle: (arg0: string) => void };

  // life cycle hook
  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });

    if (window.location.pathname !== '/login-v2') {
      if (this.authenticationService.user) {
        this.router.navigate(['/dashboard/default']);
      }
    }

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'];
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
        next: () => {
          this.router.navigate(['/dashboard/default']);
        },
        error: (error) => {
          this.error = error;
          this.loading = false;
        }
      });
  }
}
