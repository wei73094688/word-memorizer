import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-word-detail',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
    <div class="word-detail-container" *ngIf="word">
      <button class="back-btn" (click)="goBack()">返回</button>
      <h2>{{ word.word }} <span *ngIf="word.phonetic" class="phonetic">{{ word.phonetic }}</span></h2>
      <div class="meaning">{{ word.meaning }}</div>
      <button class="speak-btn" (click)="speak()">🔊 发音</button>
      <div class="example" *ngIf="word.example">例句：{{ word.example }}</div>
    </div>
    <div *ngIf="!word">未找到该单词</div>
  `,
  styleUrl: './word-detail.scss'
})
export class WordDetailComponent {
  word: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.http.get<any>(`/api/words/${id}`, {
      withCredentials: true
    }).subscribe({
      next: res => {
        console.log('详情页API返回:', res);
        this.word = res.data;
        this.cdr.detectChanges();
      },
      error: () => this.word = null
    });
  }

  goBack() {
    this.router.navigate(['/wei/words']);
  }

  speak() {
    if (this.word && this.word.word) {
      const utter = new SpeechSynthesisUtterance(this.word.word);
      utter.lang = 'en-US';
      window.speechSynthesis.speak(utter);
    }
  }
} 