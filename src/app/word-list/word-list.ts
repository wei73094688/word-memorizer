import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-word-list',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  template: `
    <div class="word-list-container">
      <button class="back-btn" (click)="goHome()">返回主页</button>
      <h2>单词一览</h2>
      <button *ngIf="isAdmin" class="add-btn" (click)="openAddDialog()">新增单词</button>
      <table class="word-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>单词</th>
            <th>中文意思</th>
            <th *ngIf="isAdmin">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let word of pagedWords" (click)="goDetail(word.id)">
            <td>{{ word.id }}</td>
            <td>{{ word.word }}</td>
            <td>{{ word.meaning }}</td>
            <td *ngIf="isAdmin">
              <button class="delete-btn" (click)="deleteWord(word.id, $event)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="pagination">
        <button (click)="firstPage()" [disabled]="currentPage === 1">首页</button>
        <button (click)="prevPage()" [disabled]="currentPage === 1">上一页</button>
        <span>第</span>
        <input type="number" min="1" [max]="totalPages" [(ngModel)]="inputPage" (keydown.enter)="jumpToPage()" style="width: 48px; text-align: center;" />
        <span>/ {{totalPages}} 页</span>
        <button (click)="nextPage()" [disabled]="currentPage === totalPages">下一页</button>
        <button (click)="lastPage()" [disabled]="currentPage === totalPages">末页</button>
        <button (click)="jumpToPage()" [disabled]="inputPage < 1 || inputPage > totalPages || inputPage === currentPage">跳转</button>
      </div>
      <!-- 新增弹窗 -->
      <div class="modal" *ngIf="showDialog">
        <div class="modal-content">
          <h3>新增单词</h3>
          <form (ngSubmit)="onSubmit()">
            <input [(ngModel)]="formWord.word" name="word" placeholder="单词" required />
            <input [(ngModel)]="formWord.phonetic" name="phonetic" placeholder="音标" />
            <input [(ngModel)]="formWord.meaning" name="meaning" placeholder="中文意思" required />
            <input [(ngModel)]="formWord.example" name="example" placeholder="例句" />
            <div class="modal-actions">
              <button type="submit">保存</button>
              <button type="button" (click)="closeDialog()">取消</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styleUrl: './word-list.scss'
})
export class WordListComponent {
  pageSize = 10;
  currentPage = 1;
  inputPage = 1;
  words: any[] = [];
  total = 0;
  isAdmin = false;
  showDialog = false;
  formWord: any = { word: '', phonetic: '', meaning: '', example: '' };

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {
    this.isAdmin = this.authService.getRole() === 'admin';
    this.fetchWords();
  }

  fetchWords() {
    this.http.get<any>(
      `/api/words?page=${this.currentPage}&pageSize=${this.pageSize}`,
      { withCredentials: true }
    ).subscribe(res => {
      this.words = res.data;
      this.total = res.total;
      this.inputPage = this.currentPage;
      this.cdr.detectChanges();
    });
  }

  get totalPages() {
    return Math.ceil(this.total / this.pageSize) || 1;
  }

  get pagedWords() {
    return this.words;
  }

  firstPage() {
    if (this.currentPage !== 1) {
      this.currentPage = 1;
      this.fetchWords();
    }
  }
  lastPage() {
    if (this.currentPage !== this.totalPages) {
      this.currentPage = this.totalPages;
      this.fetchWords();
    }
  }
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchWords();
    }
  }
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.fetchWords();
    }
  }
  jumpToPage() {
    if (this.inputPage >= 1 && this.inputPage <= this.totalPages && this.inputPage !== this.currentPage) {
      this.currentPage = this.inputPage;
      this.fetchWords();
    }
  }
  goDetail(id: number) {
    this.router.navigate(['/wei/words', id]);
  }
  goHome() {
    this.router.navigate(['/']);
  }
  openAddDialog() {
    this.formWord = { word: '', phonetic: '', meaning: '', example: '' };
    this.showDialog = true;
  }
  closeDialog() {
    this.showDialog = false;
    this.formWord = { word: '', phonetic: '', meaning: '', example: '' };
  }
  onSubmit() {
    this.http.post('/api/words', this.formWord, { withCredentials: true }).subscribe(() => {
      this.fetchWords();
      this.closeDialog();
    });
  }
  deleteWord(id: number, event: Event) {
    event.stopPropagation();
    if (confirm('确定要删除吗？')) {
      this.http.delete(`/api/words/${id}`, { withCredentials: true }).subscribe(() => {
        this.fetchWords();
      });
    }
  }
} 