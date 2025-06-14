import { Routes } from '@angular/router';
import { WordMemorizer } from './word-memorizer/word-memorizer';
import { WordListComponent } from './word-list/word-list';
import { WordDetailComponent } from './word-detail/word-detail';
import { LoginComponent } from './login/login';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: '', 
    component: WordMemorizer,
    canActivate: [AuthGuard]
  },
  { 
    path: 'wei/words', 
    component: WordListComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'wei/words/:id', 
    component: WordDetailComponent,
    canActivate: [AuthGuard]
  }
];
