import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NgxSpinnerService } from 'ngx-spinner';
import { Budget, Expense } from 'src/app/interfaces';
import { MonthSpanishPipe } from 'src/app/month-spanish.pipe';
import { AuthService } from 'src/app/services/auth.service';
import { DatabaseService } from 'src/app/services/database.service';
import { BudgetService } from 'src/app/services/budget.service';
import { MySwal, ToastSuccess, ToastWarning } from 'src/app/utils';
import { NewExpenseComponent } from '../new-expense/new-expense.component';
import { Timestamp } from '@angular/fire/firestore';

const monthSpanishPipe = new MonthSpanishPipe();
const defaultExpCategories = [
  'Alimentación',
  'Cuentas y pagos',
  'Casa',
  'Transporte',
  'Ropa',
  'Salud',
  'Diversión'
];
@Component({
  selector: 'app-month',
  templateUrl: './month.component.html',
  styleUrls: ['./month.component.scss'],
})
export class MonthComponent {
  totalExpenses: number = 0;

  constructor(
    private db: DatabaseService,
    private auth: AuthService,
    protected budgetServ: BudgetService,
    private spinner: NgxSpinnerService,
    private modalCtrl: ModalController,
  ) {
    this.budgetServ.componentIsUpdatedObs.subscribe((isUpdated) => {
      if (!isUpdated) this.setupData();
    });
  }

  async setupData() {
    this.budgetServ.Budget = await this.getUserBudget();

    if (!this.budgetServ.Budget) return;

    this.spinner.show();

    this.budgetServ.Expenses = (await this.db.getData<Expense>('expenses', 'date'))
      .map((exp) => this.timestampParse(exp))
      .filter((exp) => exp.userId === this.budgetServ.Budget!.userId && exp.date.getFullYear() === this.budgetServ.Budget!.year);
    this.totalExpenses = this.getTotalExpenses();
    this.budgetServ.CompIsUpdated = true;

    this.spinner.hide();
  }

  readonly timestampParse = (exp: Expense) => {
    exp.date = exp.date instanceof Timestamp ? exp.date.toDate() : exp.date;
    return exp;
  }

  async getUserBudget(): Promise<Budget | undefined> {
    this.spinner.show();
    let budget: Budget | undefined;
    try {
      budget = await this.db.getData<Budget>('budgets')
        .then(async (budgets) => {
          for (const bud of budgets) {
            if (bud.userId === this.auth.UserInSession!.id && bud.month === this.budgetServ.SelMonth)
              return bud;
          }

          throw new Error('No registered budget for this user in given month.');
        });
    } catch (error: any) {
      this.spinner.hide();
      budget = await this.createBudgetData()
        .then(async (data) => {
          if (!data) return;

          this.spinner.show();
          const newBudget: Budget = {
            id: '',
            userId: this.auth.UserInSession!.id,
            month: this.budgetServ.SelMonth,
            year: new Date().getFullYear(),
            income: data.income,
            expenseRatio: data.expenseRatio,
            expenseCategories: defaultExpCategories
          };

          const budId = await this.db.addData('budgets', newBudget, true);
          newBudget.id = budId;
          return newBudget;
        });
    } finally {
      this.spinner.hide()
    }

    return budget;
  }

  async createBudgetData(): Promise<{ income: number, expenseRatio: number } | undefined> {
    return await MySwal.fire({
      icon: 'info',
      title: `No hay nada registrado para el mes de ${monthSpanishPipe.transform(this.budgetServ.SelMonth)}`,
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

  readonly getTotalExpenses = (): number => {
    return this.budgetServ.MonthExpenses.reduce((total, exp) => total + exp.value, 0);
  }

  async openExpenseModal() {
    const modal = await this.modalCtrl.create({
      component: NewExpenseComponent,
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      this.budgetServ.Expenses.push(data);
      this.totalExpenses += data.value;
      if (this.totalExpenses > this.budgetServ.expenseThreshold * 0.2)
        MySwal.fire({
          icon: 'warning',
          title: 'Alerta!',
          text: 'Le queda menos del 20% de su dinero disponible para gastos.',
          confirmButtonText: 'Cerrar',
          timer: 5000
        });
      else
        ToastSuccess.fire('Gasto agregado!');

      this.budgetServ.sortExpenses(this.fieldOrderBy, this.order);
    }
  }

  fieldOrderBy: 'date' | 'category' | 'description' | 'value' = 'date';
  order: 'asc' | 'desc' = 'asc';
  toggleOrder(field: 'date' | 'category' | 'description' | 'value') {
    if (this.fieldOrderBy === field) {
      this.order = this.order === 'asc' ? 'desc' : 'asc';
    } else {
      this.fieldOrderBy = field;
      this.order = 'asc';
    }

    this.budgetServ.sortExpenses(this.fieldOrderBy, this.order);
  }
}
