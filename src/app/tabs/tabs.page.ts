import { Component } from '@angular/core';
import { BudgetService } from '../services/budget.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
})
export class TabsPage {
  selMonth: number;

  constructor(protected budgetServ: BudgetService) {
    this.selMonth = budgetServ.SelMonth;

    budgetServ.selMonthObs.subscribe((value) => this.selMonth = value);
  }
}
