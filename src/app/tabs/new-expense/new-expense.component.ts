import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Budget, Expense } from 'src/app/interfaces';
import { DatabaseService } from 'src/app/services/database.service';
import { MySwal, ToastError } from 'src/app/utils';

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

  showCategoryInput: boolean = false;
  newCategory: string = '';
  addNewCategory() {
    try {
      if (!this.newCategory || this.newCategory.length === 0)
        throw new Error('Escriba algo!');
      else if (this.budget.expenseCategories.includes(this.newCategory))
        throw new Error('Esta categoría ya existe.');

      this.budget.expenseCategories.push(this.newCategory);
      this.newExpense.category = this.newCategory;
      this.showCategoryInput = false;
      this.newCategory = '';

      this.db.updateDoc('budgets', this.budget.id, { expenseCategories: this.budget.expenseCategories });
    } catch (error: any) {
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
    this.newExpense.budgetId = this.budget.id;

    if (!this.newExpense.category || this.newExpense.value < 0 || !this.newExpense.description) {
      ToastError.fire('Revise los campos.');
      return;
    }

    const expId = await this.db.addData('expenses', this.newExpense, true);
    this.newExpense.id = expId;
    return this.modalCtrl.dismiss(this.newExpense, 'confirm');
  }
}
