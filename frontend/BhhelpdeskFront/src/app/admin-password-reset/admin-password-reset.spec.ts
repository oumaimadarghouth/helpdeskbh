import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPasswordReset } from './admin-password-reset';

describe('AdminPasswordReset', () => {
  let component: AdminPasswordReset;
  let fixture: ComponentFixture<AdminPasswordReset>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPasswordReset]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPasswordReset);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
