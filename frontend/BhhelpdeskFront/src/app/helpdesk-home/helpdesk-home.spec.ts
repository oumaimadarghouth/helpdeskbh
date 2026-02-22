import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpdeskHome } from './helpdesk-home';

describe('HelpdeskHome', () => {
  let component: HelpdeskHome;
  let fixture: ComponentFixture<HelpdeskHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpdeskHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpdeskHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
