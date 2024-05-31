import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NgxSpinnerService } from 'ngx-spinner';
import { Budget, Expense } from 'src/app/interfaces';
import { BudgetService } from 'src/app/services/budget.service';
import { DatabaseService } from 'src/app/services/database.service';
import { MySwal, ToastError } from 'src/app/utils';

@Component({
  selector: 'app-new-expense',
  templateUrl: './new-expense.component.html',
  styleUrls: ['./new-expense.component.scss'],
})
export class NewExpenseComponent implements OnInit {
  newExpense: Expense = new Expense();
  protected selDateISO?: string;
  protected firstDayISO?: string;
  protected lastDayISO?: string;

  constructor(private modalCtrl: ModalController, protected budgetServ: BudgetService, private db: DatabaseService, private spinner: NgxSpinnerService) { }

  ngOnInit() {
    if (!this.budgetServ.Budget) {
      this.cancelModal();
      throw new Error('No budget provided.');
    }

    this.selDateISO = this.newExpense.date.toISOString();
    this.firstDayISO = new Date(this.budgetServ.Budget.year, this.budgetServ.Budget.month, 1).toISOString();
    const amountDays = new Date(this.budgetServ.Budget.year, this.budgetServ.Budget.month + 1, 0).getDate();
    this.lastDayISO = new Date(this.budgetServ.Budget.year, this.budgetServ.Budget.month, amountDays).toISOString();
  }

  showCategoryInput: boolean = false;
  newCategory: string = '';
  async addNewCategory() {
    try {
      this.spinner.show();
      if (!this.newCategory || this.newCategory.length === 0)
        throw new Error('Escriba algo!');
      else if (this.budgetServ.Budget!.expenseCategories.includes(this.newCategory))
        throw new Error('Esta categoría ya existe.');

      this.budgetServ.Budget!.expenseCategories.push(this.newCategory);
      this.newExpense.category = this.newCategory;
      this.showCategoryInput = false;
      this.newCategory = '';

      await this.db.updateDoc('budgets', this.budgetServ.Budget!.id, { expenseCategories: this.budgetServ.Budget!.expenseCategories });
      this.spinner.hide();
    } catch (error: any) {
      this.spinner.hide();
      ToastError.fire('Ups..', error.message);
    }
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
    this.newExpense.budgetId = this.budgetServ.Budget!.id;

    if (!this.newExpense.category || this.newExpense.value < 0 || !this.newExpense.description) {
      ToastError.fire('Revise los campos.');
      return;
    }

    const expId = await this.db.addData('expenses', this.newExpense, true);
    this.newExpense.id = expId;
    return this.modalCtrl.dismiss(this.newExpense, 'confirm');
  }
}
