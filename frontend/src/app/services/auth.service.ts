import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private router: Router) {}

  isAuthenticated(): boolean {
    // 简单判断：本地有登录标记即可
    return !!localStorage.getItem('loggedIn');
  }

  setLoggedIn(flag: boolean) {
    if (flag) {
      localStorage.setItem('loggedIn', 'true');
    } else {
      localStorage.removeItem('loggedIn');
      localStorage.removeItem('role');
    }
  }

  setRole(role: string) {
    localStorage.setItem('role', role);
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  setUsername(username: string) {
    localStorage.setItem('username', username);
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  logout() {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    this.router.navigate(['/login']);
  }

  // 获取Basic认证头
  getBasicAuthHeaders(username: string, password: string) {
    const credentials = btoa(`${username}:${password}`);
    return { 'Authorization': `Basic ${credentials}` };
  }
} 