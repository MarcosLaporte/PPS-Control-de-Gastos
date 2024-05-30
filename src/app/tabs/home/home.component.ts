import { Component, OnInit } from '@angular/core';
import { spMonths } from 'src/app/interfaces';
import { MonthService } from 'src/app/services/month.service'; 
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  selMonth: number;
  readonly spMonths = spMonths;

  constructor(private monthServ: MonthService, private navCtrl: NavController) {
    this.selMonth = monthServ.SelMonth;
  }

  onIonChange(event: CustomEvent) {
    this.selMonth = event.detail.value;
  }

  onDidDismiss(event: CustomEvent) {
    if (event.detail.role === 'confirm') {
      this.monthServ.SelMonth = event.detail.data;
      this.navCtrl.navigateForward('tabs/month');
    }

    this.selMonth = this.monthServ.SelMonth;
  }
}
