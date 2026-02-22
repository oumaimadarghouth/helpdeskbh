import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPasswordResetRequests } from './admin-password-reset-requests';

describe('AdminPasswordResetRequests', () => {
  let component: AdminPasswordResetRequests;
  let fixture: ComponentFixture<AdminPasswordResetRequests>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPasswordResetRequests]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPasswordResetRequests);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
