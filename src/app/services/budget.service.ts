import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Budget, Expense } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  //#region Selected Month
  private _selMonthBS = new BehaviorSubject<number>(new Date().getMonth());
  public selMonthObs = this._selMonthBS.asObservable();
  public get SelMonth() {
    return this._selMonthBS.getValue();
  }
  public set SelMonth(month: number) {
    if (month < 0 || month > 11)
      throw new Error(`'${month}' Month doesn't exist`);

    this._selMonthBS.next(month);
  }
  //#endregion

  //#region Component is Updated flag
  private _componentIsUpdatedBS = new BehaviorSubject<boolean>(false);
  public componentIsUpdatedObs = this._componentIsUpdatedBS.asObservable();
  public get CompIsUpdated() {
    return this._componentIsUpdatedBS.getValue();
  }
  public set CompIsUpdated(value: boolean) {

    this._componentIsUpdatedBS.next(value);
  }
  //#endregion

  //#region Budget
  private _budgetBS = new BehaviorSubject<Budget | undefined>(undefined);
  public budgetObs = this._budgetBS.asObservable();
  public get Budget() {
    return this._budgetBS.getValue();
  }
  public set Budget(budget: Budget | undefined) {
    if (!budget) {
      this.Expenses = [];
      this.expenseThreshold = 0;
    } else 
      this.expenseThreshold = budget.income * budget.expenseRatio / 100;

    this._budgetBS.next(budget);
  }
  //#endregion
  
  //#region Expenses
  expenseThreshold: number = 0;
  private _expensesBS = new BehaviorSubject<Expense[]>([]);
  public expensesObs = this._expensesBS.asObservable();
  public get Expenses() {
    return this._expensesBS.getValue();
  }
  public set Expenses(expenses: Expense[]) {
    this._expensesBS.next(expenses);
    this._monthExpenses = expenses.filter((exp) => exp.date.getMonth() === this.SelMonth);
  }
  
  private _monthExpenses: Expense[] = [];
  public get MonthExpenses() {
    return this._monthExpenses;
  }

  sortExpenses(fieldSortBy: 'date' | 'category' | 'description' | 'value', order: 'asc' | 'desc' = 'asc') {
    this.Expenses = this.Expenses.sort((exp1, exp2) => {
      let value1 = exp1[fieldSortBy];
      let value2 = exp2[fieldSortBy];
  
      // Convert Date objects to timestamps for comparison
      if (fieldSortBy === 'date') {
        value1 = new Date(value1).getTime();
        value2 = new Date(value2).getTime();
      }
  
      // Compare values based on the order
      if (order === 'asc') {
        return value1 > value2 ? 1 : value1 < value2 ? -1 : 0;
      } else {
        return value1 < value2 ? 1 : value1 > value2 ? -1 : 0;
      }
    });
  }
  
  //#endregion
}
