import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientPortfolio } from './client-portfolio';

describe('ClientPortfolio', () => {
  let component: ClientPortfolio;
  let fixture: ComponentFixture<ClientPortfolio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientPortfolio]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientPortfolio);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
