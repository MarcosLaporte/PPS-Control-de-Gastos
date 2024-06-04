import { Component, OnInit } from '@angular/core';
import { spMonths } from 'src/app/interfaces';
import { BudgetService } from 'src/app/services/budget.service';
import { NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { ToastInfo } from 'src/app/utils';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  selMonth: number;
  readonly spMonths = spMonths;

  constructor(private budgetServ: BudgetService, protected navCtrl: NavController, private auth: AuthService) {
    this.selMonth = budgetServ.SelMonth;
  }

  onIonChange(event: CustomEvent) {
    this.selMonth = event.detail.value;
  }
  
  onDidDismiss(event: CustomEvent) {
    if (event.detail.role === 'confirm') {
      if (event.detail.value !== this.selMonth) this.budgetServ.CompIsUpdated = false;
      this.budgetServ.SelMonth = event.detail.data;
      this.navCtrl.navigateForward('tabs/month');
    }

    this.selMonth = this.budgetServ.SelMonth;
  }

  signOut() {
    this.auth.signOut();
    ToastInfo.fire('Sesión cerrada.');
    this.navCtrl.navigateBack('/login');
  }
}
