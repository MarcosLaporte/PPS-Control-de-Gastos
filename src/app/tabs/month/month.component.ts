import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { NgxSpinnerService } from 'ngx-spinner';
import { Budget } from 'src/app/interfaces';
import { MonthSpanishPipe } from 'src/app/month-spanish.pipe';
import { AuthService } from 'src/app/services/auth.service';
import { DatabaseService } from 'src/app/services/database.service';
import { MonthService } from 'src/app/services/month.service';
import { MySwal, ToastError } from 'src/app/utils';

const monthSpanishPipe = new MonthSpanishPipe();
@Component({
  selector: 'app-month',
  templateUrl: './month.component.html',
  styleUrls: ['./month.component.scss'],
})
export class MonthComponent implements OnInit {
  monthBudget: Budget | undefined;

  constructor(
    private db: DatabaseService,
    private auth: AuthService,
    protected monthServ: MonthService,
    private spinner: NgxSpinnerService,
    private navCtrl: NavController,
  ) { }

  async ngOnInit() {
    const budget = await this.getUserBudget();
    if (budget)
      this.monthBudget = budget;
    else {
      ToastError.fire('Operación cancelada.');
      this.navCtrl.navigateBack('tabs/home');
    }
  }

  async getUserBudget(): Promise<Budget | undefined> {
    this.spinner.show();
    let budget: Budget | undefined;
    try {
      budget = await this.db.getData<Budget>('budgets')
        .then(async (budgets) => {
          for (const bud of budgets) {
            if (bud.userId === this.auth.UserInSession!.id && bud.month === this.monthServ.SelMonth)
              return bud;
          }

          throw new Error('No registered budget for this user in given month.');
        });
    } catch (error: any) {
      this.spinner.hide();
      budget = await this.createBudgetData()
        .then(async (data) => {
          this.spinner.show();
          const newBudget: Budget = {
            id: '',
            userId: this.auth.UserInSession!.id,
            month: this.monthServ.SelMonth,
            year: new Date().getFullYear(),
            income: data!.income,
            expenseRatio: data!.expenseRatio,
            expenses: []
          };

          const budgetId = await this.db.addData('budgets', newBudget, true);
          // this.db.addData('userExpenses', { budgetId: budgetId, expensesId: [] }, true);
          return data ? newBudget : undefined;
        });
    } finally {
      this.spinner.hide()
    }

    return budget;
  }

  async createBudgetData(): Promise<{ income: number, expenseRatio: number } | undefined> {
    return await MySwal.fire({
      icon: 'info',
      title: `No hay nada registrado para el mes de ${monthSpanishPipe.transform(this.monthServ.SelMonth)}`,
      html: `
      <h2>A continuación rellene:</h2>
      <ion-item>
        <ion-input id="income" type="number" step="5000" value="650000" labelPlacement="stacked" label="Ingreso mensual"
          class="swal2-input"></ion-input>$
      </ion-item>
      <ion-item>
        <ion-input id="expenseRatio" type="number" min="0.5" max="100" step="0.5" value="25" labelPlacement="stacked"
          label="Porcentaje de gasto" class="swal2-input"></ion-input>%
      </ion-item>
      `,
      showConfirmButton: true,
      confirmButtonText: 'Aceptar',
      focusConfirm: false,
      showCancelButton: false,
      preConfirm: () => {
        const popup = MySwal.getPopup()!;
        const incomeInput = popup.querySelector('#income') as HTMLIonInputElement;
        const expenseRatioInput = popup.querySelector('#expenseRatio') as HTMLIonInputElement;

        const income: number | undefined = Number(incomeInput.value);
        const expenseRatio: number | undefined = Number(expenseRatioInput.value);

        if (!income || !expenseRatio)
          MySwal.showValidationMessage('Debe rellenar ambos campos.');
        else if (income < 0)
          MySwal.showValidationMessage('El ingreso mensual no puede ser negativo.');
        else if (expenseRatio < 0.5 || expenseRatio > 100)
          MySwal.showValidationMessage('El porcentaje de gasto debe ser entre el 0,5 y el 100%');

        return { income: income, expenseRatio: expenseRatio };
      }
    }).then(async (res) => {
      return res.value;
    });
  }
}
