import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-word-memorizer',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './word-memorizer.html',
  styleUrl: './word-memorizer.scss'
})
export class WordMemorizer {
  words: any[] = [];
  currentIndex = 0;
  showMeaning = false;
  username = '';
  isAdmin = false;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {
    this.isAdmin = this.authService.getRole() === 'admin';
    this.username = this.authService.getUsername() || '';
    this.fetchWords();
  }

  fetchWords() {
    this.http.get<any>(`${environment.apiUrl}/api/words?page=1&pageSize=1000`, {
      withCredentials: true
    }).subscribe(res => {
      this.words = res.data;
      this.currentIndex = 0;
      this.showMeaning = false;
      this.cdr.detectChanges();
    });
  }

  get currentWord() {
    return this.words[this.currentIndex] || { word: '', meaning: '', phonetic: '' };
  }

  onShowMeaning() {
    this.showMeaning = true;
  }

  onNextWord() {
    if (this.currentIndex < this.words.length - 1) {
      this.currentIndex++;
      this.showMeaning = false;
    } else {
      // 如果已经是最后一个单词，重新开始
      this.currentIndex = 0;
      this.showMeaning = false;
    }
  }

  speak() {
    if (this.currentWord && this.currentWord.word) {
      const utter = new SpeechSynthesisUtterance(this.currentWord.word);
      utter.lang = 'en-US';
      window.speechSynthesis.speak(utter);
    }
  }

  onLogout() {
    this.http.post(`${environment.apiUrl}/api/logout`, {}, { withCredentials: true }).subscribe(() => {
      this.authService.logout();
    });
  }

  onAddWord() {
    // 这里可以弹窗或跳转到新增单词页面，暂留空实现
    alert('新增单词功能仅admin可见');
  }
}
