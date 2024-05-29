import { Component, OnInit } from '@angular/core';
import { ToastInfo, ToastWarning } from './utils';
import { AuthService } from './services/auth.service';
import { NavigationStart, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  currentRoute: string = '';

  constructor(protected auth: AuthService, protected router: Router, public spinner: NgxSpinnerService) {
    const ssUser = sessionStorage.getItem('userInSession');
    this.auth.UserInSession = ssUser ? JSON.parse(ssUser) : null;

    router.events.subscribe((ev) => {
      if (ev instanceof NavigationStart)
        this.currentRoute = ev.url;
    });
  }

  ngOnInit() {
    this.router.navigateByUrl('splash');
    window.addEventListener('storage', (e) => {
      if (e.storageArea === sessionStorage && e.key === 'userInSession') {
        this.auth.signOut();
        ToastWarning.fire('Hubo un problema con su sesión.', ' Ingrese nuevamente.');
        this.router.navigateByUrl('login');
      }
    });
  }
}
