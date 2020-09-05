import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Dia } from '../../../interfaces/dia.interface';

@Component({
  selector: 'app-modal-lancamentos-dia',
  templateUrl: './modal-lancamentos-dia.component.html',
  styleUrls: ['./modal-lancamentos-dia.component.scss'],
})
export class ModalLancamentosDiaComponent implements OnInit {

  public dia: Dia;

  constructor(public modalController: ModalController) { }

  ngOnInit() {
    console.log(this.dia);
  }

  dismissModal() {
    this.modalController.dismiss();
  }

}
