import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalLancamentosDiaComponent } from './modal-lancamentos-dia/modal-lancamentos-dia.component';



@NgModule({
  declarations: [ModalLancamentosDiaComponent],
  imports: [
    CommonModule
  ],
  exports: [ModalLancamentosDiaComponent]
})
export class ComponentsModule { }
