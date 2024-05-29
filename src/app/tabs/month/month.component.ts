import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Budget, UserExpenses } from 'src/app/interfaces';
import { AuthService } from 'src/app/services/auth.service';
import { DatabaseService } from 'src/app/services/database.service';
import { MonthService } from 'src/app/services/month.service';

@Component({
  selector: 'app-month',
  templateUrl: './month.component.html',
  styleUrls: ['./month.component.scss'],
})
export class MonthComponent implements OnInit {
  readonly month: number;
  monthBudget!: Budget;
  monthExpenses!: UserExpenses;

  constructor(private db: DatabaseService, private auth: AuthService, private monthServ: MonthService, private spinner: NgxSpinnerService) {
    this.month = monthServ.SelMonth;
  }

  async ngOnInit() {
    this.monthBudget = await this.db.getData<Budget>('budgets')
      .then(async (budgets) => {
        for (const bud of budgets) {
          if (bud.userId === this.auth.UserInSession!.id && bud.month === this.month)
            return bud;
        }

        throw new Error('No registered budget for this user in given month.');
      });
  }
}
