import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { Expense } from 'src/app/interfaces';
import { BudgetService } from 'src/app/services/budget.service';

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
  globalChart?: Chart<"pie", number[], string>;
  constructor(private budgetServ: BudgetService) { }

  ngAfterViewInit(): void {
    this.budgetServ.expensesObs.subscribe(() => {
      this.handleCharts();
    });
  }

  readonly handleCharts = () => {
    switch (this.segment) {
      case 'month':
      case 'year':
        if (this.globalChart) this.globalChart.destroy();
        this.globalChart = this.loadExpensesChart(this.segment);
        break;
      case 'savings':
        break;
    }
  };

  loadExpensesChart(period: 'month' | 'year') {
    const canvaEl = document.getElementById('chart')! as HTMLCanvasElement;

    const expenses = period === 'year' ? this.budgetServ.Expenses : this.budgetServ.MonthExpenses;
    const data = this.calculateCategoryTotals(expenses);
    return new Chart(canvaEl, {
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

  private getRandomColors(amount: number = 1) {
    const colors = [];

    for (let i = 0; i < amount; i++) {
      const randomColor = `hsl(${360 * Math.random()},${25 + 70 * Math.random()}%,${55 + 10 * Math.random()}%`;
      colors.push(randomColor);
    }

    return colors;
  }
}
