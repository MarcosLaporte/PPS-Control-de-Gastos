import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Budget, Expense } from 'src/app/interfaces';
import { DatabaseService } from 'src/app/services/database.service';
import { MySwal } from 'src/app/utils';

@Component({
  selector: 'app-new-expense',
  templateUrl: './new-expense.component.html',
  styleUrls: ['./new-expense.component.scss'],
})
export class NewExpenseComponent implements OnInit {
  budget!: Budget;
  newExpense: Expense = new Expense();
  protected selDateISO?: string;
  protected firstDayISO?: string;
  protected lastDayISO?: string;

  constructor(private modalCtrl: ModalController, private db: DatabaseService) { }

  ngOnInit() {
    if (!this.budget) {
      this.cancelModal();
      throw new Error('No budget provided.');
    }

    this.selDateISO = this.newExpense.date.toISOString();
    this.firstDayISO = new Date(this.budget.year, this.budget.month, 1).toISOString();
    const amountDays = new Date(this.budget.year, this.budget.month + 1, 0).getDate();
    this.lastDayISO = new Date(this.budget.year, this.budget.month, amountDays).toISOString();
  }

  cancelModal() {
    return MySwal.fire({
      icon: 'question',
      title: 'Desea cancelar el nuevo registro?',
      showConfirmButton: true,
      confirmButtonText: 'Cancelar',
      showCancelButton: true,
      cancelButtonText: 'Volver'
    }).then((res) => {
      if (res.isConfirmed)
        return this.modalCtrl.dismiss(null, 'cancel');

      return;
    })
  }

  async saveExpense() {
    this.newExpense.date = new Date(this.selDateISO!);
    this.newExpense.budgetId = this.budget.id;
    
    const expId = await this.db.addData('expenses', this.newExpense, true);
    this.newExpense.id = expId;
    return this.modalCtrl.dismiss(this.newExpense, 'confirm');
  }
}
