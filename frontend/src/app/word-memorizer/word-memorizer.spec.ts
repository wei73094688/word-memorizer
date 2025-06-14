import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WordMemorizer } from './word-memorizer';

describe('WordMemorizer', () => {
  let component: WordMemorizer;
  let fixture: ComponentFixture<WordMemorizer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WordMemorizer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WordMemorizer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
