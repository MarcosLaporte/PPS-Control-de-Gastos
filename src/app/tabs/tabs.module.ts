import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TabsPageRoutingModule } from './tabs-routing.module';

import { TabsPage } from './tabs.page';
import { MonthSpanishPipe } from '../month-spanish.pipe';
import { HomeComponent } from './home/home.component';
import { MonthComponent } from './month/month.component';
import { GraphsComponent } from './graphs/graphs.component';
import { NewExpenseComponent } from './new-expense/new-expense.component';

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
    MonthComponent,
    GraphsComponent,
    NewExpenseComponent
  ]
})
export class TabsPageModule {}
