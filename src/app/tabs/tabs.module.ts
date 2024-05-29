import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TabsPageRoutingModule } from './tabs-routing.module';

import { TabsPage } from './tabs.page';
import { MonthSpanishPipe } from '../month-spanish.pipe';
import { HomeComponent } from './home/home.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TabsPageRoutingModule,
    MonthSpanishPipe
  ],
  declarations: [
    TabsPage,
    HomeComponent,
  ]
})
export class TabsPageModule {}
