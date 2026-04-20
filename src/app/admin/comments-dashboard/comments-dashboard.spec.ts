import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentsDashboard } from './comments-dashboard';

describe('CommentsDashboard', () => {
  let component: CommentsDashboard;
  let fixture: ComponentFixture<CommentsDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentsDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommentsDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
