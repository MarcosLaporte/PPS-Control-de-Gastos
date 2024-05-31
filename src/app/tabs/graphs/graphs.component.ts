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
  expensesChart?: Chart<"pie", number[], string>;
  constructor(private budgetServ: BudgetService) {
  }

  ngAfterViewInit(): void {
    this.budgetServ.expensesObs.subscribe(() => {
      if (this.expensesChart) this.expensesChart.destroy();

      this.loadChart();
    })
  }

  loadChart() {
    const canvaEl = document.getElementById('expenses')! as HTMLCanvasElement;

    const data = this.calculateCategoryTotals(this.budgetServ.Expenses);
    this.expensesChart = new Chart(canvaEl, {
      type: 'pie',
      data: {
        labels: data.map(row => row.category),
        datasets: [{
          label: 'Total $',
          data: data.map(row => row.totalValue),
          backgroundColor: this.getRandomColors(data.length)
        }]
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
      const randomColor = `hsl(${360 * Math.random()},${25 + 70 * Math.random()}%,${85 + 10 * Math.random()}%`;
      colors.push(randomColor);
    }

    return colors;
  }
}
