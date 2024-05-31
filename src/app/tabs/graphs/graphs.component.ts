import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { NgxSpinnerService } from 'ngx-spinner';
import { Budget, Expense } from 'src/app/interfaces';
import { BudgetService } from 'src/app/services/budget.service';
import { DatabaseService } from 'src/app/services/database.service';

declare interface CategoryTotal {
  category: string;
  totalValue: number;
}
@Component({
  selector: 'app-graphs',
  templateUrl: './graphs.component.html',
  styleUrls: ['./graphs.component.scss'],
})
export class GraphsComponent implements AfterViewInit {
  segment: 'month' | 'year' | 'savings' = 'month';
  globalChart?: Chart<"pie" | "bar", number[], string>;
  canvaEl!: HTMLCanvasElement;
  constructor(private budgetServ: BudgetService, private db: DatabaseService, private spinner: NgxSpinnerService) { }

  ngAfterViewInit(): void {
    this.canvaEl = document.getElementById('chart')! as HTMLCanvasElement;
    this.budgetServ.expensesObs.subscribe(() => {
      this.handleCharts();
    });
  }

  readonly handleCharts = async () => {
    if (this.globalChart) this.globalChart.destroy();

    switch (this.segment) {
      case 'month':
      case 'year':
        this.globalChart = this.loadExpensesChart(this.segment);
        break;
      case 'savings':
        this.globalChart = await this.loadSavingsChart();
        break;
    }
  };

  loadExpensesChart(period: 'month' | 'year') {
    const expenses = period === 'year' ? this.budgetServ.Expenses : this.budgetServ.MonthExpenses;
    const data = this.calculateCategoryTotals(expenses);
    return new Chart(this.canvaEl, {
      type: 'pie',
      data: {
        labels: data.map(row => row.category),
        datasets: [{
          label: 'Total $',
          data: data.map(row => row.totalValue),
          backgroundColor: this.getRandomColors(data.length)
        }]
      },
      options: {
        plugins: {
          legend: {
            labels: {
              color: '#e6eb84',
              font: {
                size: 16,
                weight: 'bolder'
              }
            }
          }
        }
      }
    });
  }

  private calculateCategoryTotals(expenses: Expense[]): CategoryTotal[] {
    const categoryMap = new Map<string, number>();

    for (const exp of expenses) {
      const currentTotal = categoryMap.get(exp.category) || 0;
      categoryMap.set(exp.category, currentTotal + exp.value);
    }

    const result: CategoryTotal[] = [];
    for (const [category, totalValue] of categoryMap.entries()) {
      result.push({ category, totalValue });
    }

    return result;
  }

  async loadSavingsChart() {
    const data = await this.calcSavingsInYear();
    return new Chart(this.canvaEl, {
      type: 'bar',
      data: {
        labels: ['Gasto esperado', 'Gasto total', 'Ahorro'],
        datasets: [{
          label: '$ Anual',
          data: [data.expectedExpenses, data.totalExpenses, data.savings],
          backgroundColor: this.getRandomColors(3)
        }]
      },
      options: {
        plugins: {
          legend: {
            labels: {
              color: '#e6eb84',
              font: {
                size: 16,
                weight: 'bolder'
              }
            }
          }
        },
        scales: {
          xAxis: {
            ticks: {
              color: '#e6eb84',
              font: {
                size: 16,
                weight: 'bolder'
              }
            }
          },
          yAxis: {
            beginAtZero: true,
            ticks: {
              color: '#e6eb84',
              font: {
                size: 16,
                weight: 'bolder'
              },
            }
          },
        }
      }
    });
  }

  async calcSavingsInYear() {
    this.spinner.show();
    const curYearBudgets = (await this.db.getData<Budget>('budgets'))
      .filter((bud) => bud.userId === this.budgetServ.Budget!.userId && bud.year === this.budgetServ.Budget!.year);

    let totalExpThreshold = curYearBudgets.reduce((total, bud) => total + (bud.income * bud.expenseRatio / 100), 0);
    // const totalIncome = curYearBudgets.reduce((total, bud) => total + bud.income, 0);
    const totalExpenses = this.budgetServ.Expenses.reduce((total, exp) => total + exp.value, 0);
    this.spinner.hide();

    return { expectedExpenses: totalExpThreshold, totalExpenses: totalExpenses, savings: (totalExpThreshold - totalExpenses) };
  }

  private getRandomColors(amount: number = 1) {
    const colors = [];

    for (let i = 0; i < amount; i++) {
      const randomColor = `hsl(${360 * Math.random()},${25 + 70 * Math.random()}%,${55 + 10 * Math.random()}%`;
      colors.push(randomColor);
    }

    return colors;
  }
}
