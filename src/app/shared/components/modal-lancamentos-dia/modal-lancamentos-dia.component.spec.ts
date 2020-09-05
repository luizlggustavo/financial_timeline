import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ModalLancamentosDiaComponent } from './modal-lancamentos-dia.component';

describe('ModalLancamentosDiaComponent', () => {
  let component: ModalLancamentosDiaComponent;
  let fixture: ComponentFixture<ModalLancamentosDiaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalLancamentosDiaComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalLancamentosDiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
