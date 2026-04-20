import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipesDashboard } from './recipes-dashboard';

describe('RecipesDashboard', () => {
  let component: RecipesDashboard;
  let fixture: ComponentFixture<RecipesDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipesDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipesDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
