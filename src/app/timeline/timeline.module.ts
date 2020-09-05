import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { TimelinePage } from './timeline.page';
import { TimelinePageRoutingModule } from './timeline-routing.module';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ComponentsModule } from '../shared/components/components.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InfiniteScrollModule,
    TimelinePageRoutingModule,
    ComponentsModule
  ],
  declarations: [TimelinePage]
})
export class TimelinePageModule { }
