import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  username = '';
  password = '';
  loginError = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  onLogin() {
    const credentials = btoa(`${this.username}:${this.password}`);
    this.http.post<any>(`${environment.apiUrl}/api/login`, {}, {
      headers: { 'Authorization': `Basic ${credentials}` },
      withCredentials: true
    }).subscribe({
      next: (res) => {
        this.authService.setLoggedIn(true);
        if (res && res.role) {
          this.authService.setRole(res.role);
        }
        if (this.username) {
          this.authService.setUsername(this.username);
        }
        this.router.navigate(['/']);
      },
      error: () => {
        this.loginError = '用户名或密码错误';
      }
    });
  }
} 