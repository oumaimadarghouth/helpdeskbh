import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentHome } from './agent-home';

describe('AgentHome', () => {
  let component: AgentHome;
  let fixture: ComponentFixture<AgentHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
