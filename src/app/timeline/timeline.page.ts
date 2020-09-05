import { formatCurrency, getCurrencySymbol, DOCUMENT } from '@angular/common';
import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, ViewChildren, QueryList, HostListener, Inject } from '@angular/core';

import { Storage } from '@ionic/storage';
import { AlertController, ToastController, IonContent, ModalController } from '@ionic/angular';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { elementsFromPoint } from './element.fromPoint';

import { Dia } from '../interfaces/dia.interface';
import { Ano } from '../interfaces/ano-interface';
import { TimelineService } from '../services/timeline.service';
import { Lancamento } from '../interfaces/lancamento-interface';
import 'hammerjs';
import { fromEvent } from 'rxjs';
import { tap, map, switchMap, catchError } from 'rxjs/operators';
import { ModalLancamentosDiaComponent } from '../shared/components/modal-lancamentos-dia/modal-lancamentos-dia.component';

@Component({
  selector: 'app-timeline',
  templateUrl: 'timeline.page.html',
  styleUrls: ['timeline.page.scss'],
})
export class TimelinePage implements OnInit, AfterViewInit {

  @ViewChildren('item') itemElements: QueryList<any>;
  @ViewChild('timelineContainer', { static: false }) timelineContainer: ElementRef;
  @ViewChild('ionContentScroll', { static: false }) IonContent: IonContent;
  @ViewChild('container') containerElm: ElementRef<HTMLElement>;

  public anos: Ano[];
  public dias: Dia[];
  public currentYear: string;
  public tamanhoMinimoDia: number;
  public timelineScrollContainer: any;
  public canScroll: boolean;
  public currentDay: string;
  public currentMonth: string;
  public weekDaysName: string[];
  public days: any[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  constructor(
    private storage: Storage,
    private alertController: AlertController,
    private toastController: ToastController,
    private timelineService: TimelineService,
    private screenOrientation: ScreenOrientation,
    private modalController: ModalController,
    @Inject(DOCUMENT) private document
  ) {
    this.currentDay = this.buildDate(0);
    this.buildMonthString(new Date(this.currentDay).getMonth() + 1);
    this.tamanhoMinimoDia = 110;
    this.currentYear = '2020';
    this.dias = [];
    this.weekDaysName = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  }

  ngOnInit() {
    this.buildTimelineWithInitialDays();
    this.screenOrientation.unlock();
    this.buildMesAtualByToqueTela();
  }

  buildMesAtualByToqueTela() {
    const hm = new Hammer(this.document);

    fromEvent(hm, 'panmove').pipe(
      tap((e: HammerInput) => {
        elementsFromPoint(this.document, e.center.x, e.center.y,
          (elm: HTMLElement) => {
            if (e.target.classList.contains('day')) {
              return true;
            }
            return false;
          },
          (elm: HTMLElement) => {
            if (!this.containerElm.nativeElement.contains(elm)) {
              return true;
            }
            return false;
          }).then((elm: HTMLElement) => {
            this.buildMonthString(new Date(elm.id).getMonth() + 1);
          }).catch(e => {
          })
      }),
    ).subscribe();
  }

  rotate() {
    if (this.screenOrientation.type === 'portrait') {
      this.screenOrientation.lock('landscape');
    }
    else {
      this.screenOrientation.lock('portrait');
    }
  }

  ngAfterViewInit(): void {
    this.setTimelineScrollContainer();
  }

  setTimelineScrollContainer() {
    this.timelineScrollContainer = this.timelineContainer.nativeElement;
    // this.itemElements.changes.subscribe((teste) => {
    //   console.log(teste);
    // this.smoothRollPreviousDays();
    // });
  }

  buildTimelineWithInitialDays() {
    let passo;
    let startDay: number = new Date().getDate() + this.currentWeekDay();
    console.log('this.currentWeekDay() :', this.currentWeekDay());
    for (passo = 0; passo < 100; passo++) {
      const newDateWithoutHours: string = this.buildDate(startDay);
      const newDay: Dia = {
        label: newDateWithoutHours,
        lancamentos: []
      };
      this.dias.push(newDay);
      startDay = startDay + 1;
    }
    this.buildStorageDays();
  }

  currentWeekDay(): number {
    const dayToStart = -47;
    const currentWeekDay = new Date().toLocaleString('pt-br', { weekday: 'long' });
    switch (currentWeekDay) {
      case 'segunda':
        return dayToStart;
      case 'terça':
        return dayToStart + 1;
      case 'quarta':
        return dayToStart + 2;
      case 'quinta':
        return dayToStart + 3;
      case 'sexta':
        return dayToStart + 4;
      case 'sábado':
        return dayToStart + 5;
      case 'domingo':
        return dayToStart + 6;
    }
  }

  buildDate(startDay: number): string {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(Date.now() - tzoffset));
    const addDays = localISOTime.setDate(localISOTime.getDate() + startDay);
    const removeHours = new Date(addDays).setHours(0, 0, 0, 0);
    return new Date(removeHours).toISOString().slice(0, -1);
  }

  buildLaterDays() {
    let passo;
    const day = 1;
    for (passo = 0; passo < 7; passo++) {
      const tzoffset = (new Date()).getTimezoneOffset() * 60000;
      const lastDate: string = this.dias[this.dias.length - 1].label;
      const newDate: number = new Date(lastDate).setDate(new Date(lastDate).getDate() + day);
      const newDateSlice = new Date(newDate - tzoffset).toISOString().slice(0, -1);
      const newDay: Dia = {
        label: newDateSlice,
        lancamentos: []
      };
      this.dias.push(newDay);
    }
    // if (infiniteScrollEvent) {
    //   console.log('buildLaterDays:', infiniteScrollEvent)
    //   infiniteScrollEvent.target.complete();
    // }
    // this.enableScrolling();
  }

  buildPreviousDays() {
    let passo;
    const day = 1;
    for (passo = 0; passo < 7; passo++) {
      const tzoffset = (new Date()).getTimezoneOffset() * 60000;
      const firstDate: string = this.dias[0].label;
      const newDate: number = new Date(firstDate).setDate(new Date(firstDate).getDate() - day);
      const newDateSlice = new Date(newDate - tzoffset).toISOString().slice(0, -1);
      const newDay: Dia = {
        label: newDateSlice,
        lancamentos: []
      };
      this.dias.unshift(newDay);
    }
    // this.smoothRollPreviousDays();
    // if (infiniteScrollEvent) {
    //   console.log('infiniteScrollEvent :', infiniteScrollEvent);
    //   infiniteScrollEvent.target.complete();
    // }
    // this.enableScrolling();
  }

  buildStorageDays() {
    this.storage.keys().then((keys: string[]) => {
      this.dias.map((dia: Dia) => {
        if (keys.includes(dia.label.toString())) {
          this.storage.get(dia.label.toString()).then((storageDia: Dia) => {
            dia.lancamentos = storageDia.lancamentos;
          });
        }
      });
    });
    // this.enableScrolling();
    // this.scrollCurrentDay();
    this.scroll();
  }

  scroll() {
    setTimeout(() => {
      document.getElementById(this.currentDay).scrollIntoView({ behavior: 'smooth' });
    }, 1000);
  }

  // getCurrentMonthInScreen(event?) {
  //   console.log('event :', event);
  //   setTimeout(() => {
  //     const dateTime: number = +document.elementFromPoint(180, 570).id;
  //     this.buildMonthString(new Date(dateTime).getMonth());
  //   }, 400);
  // }

  buildMonthString(month: number) {
    switch (month) {
      case 1:
        this.currentMonth = 'Janeiro';
        break;
      case 2:
        this.currentMonth = 'Fevereiro';
        break;
      case 3:
        this.currentMonth = 'Março';
        break;
      case 4:
        this.currentMonth = 'Abril';
        break;
      case 5:
        this.currentMonth = 'Maio';
        break;
      case 6:
        this.currentMonth = 'Junho';
        break;
      case 7:
        this.currentMonth = 'Julho';
        break;
      case 8:
        this.currentMonth = 'Agosto';
        break;
      case 9:
        this.currentMonth = 'Setembro';
        break;
      case 10:
        this.currentMonth = 'Outubro';
        break;
      case 11:
        this.currentMonth = 'Novembro';
        break;
      case 12:
        this.currentMonth = 'Dezembro';
        break;
    }
  }

  get(event) {
    console.log('event :', event);
  }

  // enableScrolling() {
  //   setTimeout(() => {
  //     this.canScroll = true;
  //   }, 500);
  // }

  // disableScrolling() {
  //   this.canScroll = false;
  // }

  smoothRollPreviousDays() {
    this.timelineScrollContainer.scroll({
      top: 100,
      behavior: 'smooth'
    });
    // this.timelineContainer.nativeElement.scrollLeft = 20;
  }

  scrollCurrentDay() {
    // const ionContent: any = document.getElementById('ionContentScroll');
    setTimeout(() => {
      this.timelineScrollContainer.scroll({
        top: this.timelineScrollContainer.scrollHeight / 2,
        behavior: 'smooth'
      });
      // this.IonContent.scrollToPoint(0, 300);
    }, 100);
    // this.getCurrentMonthInScreen();
  }

  getTimeline() {
    this.timelineService.getTimeline().subscribe((anos: Ano[]) => {
      this.anos = anos;
    });
  }

  zoomIn() {
    if (this.tamanhoMinimoDia >= 55 && this.tamanhoMinimoDia < 200) { this.tamanhoMinimoDia = this.tamanhoMinimoDia + 10; }
  }

  zoomOut() {
    if (this.tamanhoMinimoDia > 55) { this.tamanhoMinimoDia = this.tamanhoMinimoDia - 10; }
  }

  async novoLancamento(diaSelecionado: Dia) {
    const alert = await this.alertController.create({
      message: 'Nome do lançamento',
      inputs: [
        {
          type: 'text',
          name: 'label',
          placeholder: 'Nome',
        },
        {
          type: 'number',
          name: 'valor',
          placeholder: 'R$',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',

        },
        {
          text: 'Ok',
          handler: (dadosLancamento: Lancamento) => {
            if (dadosLancamento.label && dadosLancamento.valor) {
              this.adicionarLancamento(diaSelecionado, dadosLancamento);
            } else { this.buildToast('Insira corretamente os dados'); }
          }
        }
      ]
    });
    await alert.present();
  }

  adicionarLancamento(diaSelecionado: Dia, novoLancamento: Lancamento) {
    this.storage.get(diaSelecionado.label.toString()).then((storageDia: Dia) => {
      if (storageDia) {
        storageDia.lancamentos.push(novoLancamento);
        this.atualizarStorage(storageDia, diaSelecionado, novoLancamento);
      } else {
        const toSaveDia: Dia = {
          label: diaSelecionado.label,
          lancamentos: []
        };
        toSaveDia.lancamentos.push(novoLancamento);
        this.atualizarStorage(toSaveDia, diaSelecionado, novoLancamento);
      }
    });
  }

  atualizarStorage(dia: Dia, diaSelecionado: Dia, novoLancamento: Lancamento) {
    this.storage.set(dia.label.toString(), dia).then((storageDia: Dia) => {
      if (storageDia) {
        diaSelecionado.lancamentos = storageDia.lancamentos;
        // this.alertLancamentoIncluido(novoLancamento);
      }
    });
  }

  convertToBrlCurrency(numero: number): string {
    return formatCurrency(numero, 'pt-BR', getCurrencySymbol('BRL', 'wide'), 'R$');
  }

  async alertLancamentoIncluido(novoLancamento: Lancamento) {
    const message = `${novoLancamento.label.toUpperCase()} no valor de ${this.convertToBrlCurrency(novoLancamento.valor)} incluído`;
    const toast = await this.toastController.create({
      message,
      duration: 3000
    });
    toast.present();
  }

  async buildToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      buttons: [{ text: 'Fechar' }]
    });
    toast.present();
  }

  async alertLancamento(dia: Dia, index: number, lancamento: Lancamento, event: MouseEvent) {
    event.stopPropagation();
    const alert = await this.alertController.create({
      header: `${lancamento.label}`,
      message: this.convertToBrlCurrency(lancamento.valor),
      buttons: [
        {
          text: 'Fechar',
          role: 'fechar',
        },
        {
          text: 'Excluir',
          role: 'excluir',
          cssClass: 'button-alert-red',
          handler: () => {
            this.deleteLancamento(dia, index, lancamento);
          }
        },
      ]
    });
    await alert.present();
  }

  deleteLancamento(diaSelecionado: Dia, index: number, lancamento: Lancamento) {
    this.storage.get(diaSelecionado.label.toString()).then((storageDia: Dia) => {
      storageDia.lancamentos.splice(index, 1);
      this.storage.set(storageDia.label.toString(), storageDia).then((dia: Dia) => {
        if (dia) {
          diaSelecionado.lancamentos = dia.lancamentos;
          // this.buildToast(`${lancamento.label} removido com sucesso`);
        }
      });
    });
    // this.anos[0].meses.map(mes => {
    //   if (mes.label === mesSelecionado.label) {
    //     mes.dias.map(dia => {
    //       if (dia.label === diaSelecionado.label) {
    //         dia.lancamentos.splice(index);
    //       }
    //     });
    //   }
    // });
  }

  onPinch(event) {
  }

  currentDayStyle(dia: Dia): boolean {
    return dia.label === this.currentDay;
  }

  // logScrolling(ionScrollEvent) {
  //   console.log('ionScrollEvent :', ionScrollEvent);
  //   console.log('deltaY :', ionScrollEvent.detail.deltaY);
  //   console.log('currentY :', ionScrollEvent.detail.currentY);
  //   console.log('startY :', ionScrollEvent.detail.startY);
  //   const ionContent: any = document.getElementById('ionContentScroll');
  //   ionContent.getScrollElement().then(main => {
  //     const totalContentHeight = main.scrollHeight;
  //     const scrollPosition = ionScrollEvent.detail.scrollTop;
  //     const viewportHeight = ionContent.offsetHeight;
  //     const percentage = scrollPosition / (totalContentHeight - viewportHeight);
  //     console.log(percentage);
  //     if (percentage === 0 && this.canScroll) {
  //       // this.disableScrolling();
  //       // this.onScrollLeft();
  //     }
  //     if (percentage >= 0.95 && this.canScroll) {
  //       // this.disableScrolling();
  //       // this.onScrollRight();
  //     }
  //   });
  // }

  evenMonth(date: number): boolean {
    const month: number = new Date(date).getMonth();
    if (month & 1) { return true; }
  }

  async showLancamentosDia(event, dia: Dia) {
    event.stopPropagation();
    const modal = await this.modalController.create({
      component: ModalLancamentosDiaComponent,
      componentProps: { dia }
    });
    await modal.present();
  }

}
