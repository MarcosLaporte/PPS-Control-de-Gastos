import { Component } from '@angular/core';
import { MonthService } from '../services/month.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
})
export class TabsPage {
  selMonth: number;

  constructor(private monthServ: MonthService) {
    this.selMonth = monthServ.SelMonth;

    monthServ.selMonthObs.subscribe((value) => this.selMonth = value);
  }
}
