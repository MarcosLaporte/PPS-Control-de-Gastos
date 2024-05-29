export interface User {
  id: string
  userId: number,
  email: string,
  name: string,
  lastname: string,
  type: UserType,
  gender: UserGender,
}

export type UserType = 'admin' | 'tester' | 'invitado' | 'usuario';
export type UserGender = 'femenino' | 'masculino';

declare interface Month { longStr: string, shortStr: string }
export const spMonths: Month[] = [
  { longStr: 'Enero', shortStr: 'en' },
  { longStr: 'Febrero', shortStr: 'feb' },
  { longStr: 'Marzo', shortStr: 'mar' },
  { longStr: 'Abril', shortStr: 'abr' },
  { longStr: 'Mayo', shortStr: 'may' },
  { longStr: 'Junio', shortStr: 'jun' },
  { longStr: 'Julio', shortStr: 'jul' },
  { longStr: 'Agosto', shortStr: 'ag' },
  { longStr: 'Septiembre', shortStr: 'set' },
  { longStr: 'Octubre', shortStr: 'oct' },
  { longStr: 'Noviembre', shortStr: 'nov' },
  { longStr: 'Diciembre', shortStr: 'dic' },
];

export interface Budget {
  id: string,
  userId: string,
  month: number, // 0-11
  year: number,
  income: number,
  expenseRatio: number // >0-100
}

export interface Expense {
  id: string,
  date: Date,
  category: string,
  description: string,
  value: number,
}

export interface UserExpenses {
  id: string,
  budgetId: string,
  // expenses: Expense[]
  expensesId: string[]
}