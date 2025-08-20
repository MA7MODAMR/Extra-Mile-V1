import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { Router } from '@angular/router';
import { AccountService } from '../../../core/services/account.service';
import { User } from '../../../shared/models/user';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { JsonPipe } from '@angular/common';
import { TextInputComponent } from "../../../shared/components/text-input/text-input.component";

@Component({
  selector: 'app-register',
  imports: [
    MatCard,
    ReactiveFormsModule,
    MatButton,
    TextInputComponent,
    MatRadioModule
],
  standalone: true,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private router = inject(Router);
  private snack = inject(SnackbarService);
  validationErrors: any[] = [];

  registerForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    role: ['Customer', Validators.required]
  })

  onSubmit() {
    this.accountService.register(this.registerForm.value).subscribe({
      next: (user: User) => {
        this.snack.success('Registration successful!');
        const role = this.registerForm.value.role;
        if (role === 'Admin') {
          this.router.navigateByUrl('/admin/dashboard');
        } else if (role === 'Vendor') {
          this.router.navigateByUrl('/vendor/dashboard');
        } else {
          this.router.navigateByUrl('/');
        }
      },
      error: err => this.validationErrors = err
    });
  }
}
