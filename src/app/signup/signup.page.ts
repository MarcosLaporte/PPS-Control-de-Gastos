import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { NavController } from '@ionic/angular';
import { ToastError, ToastSuccess } from '../utils';
import { UserGender, UserType } from '../interfaces';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage {
  name: string = "";
  lastName: string = "";
  email: string = "";
  type?: UserType;
  gender?: UserGender;
  password: string = "";
  passCheck: string = "";

  constructor(
    private auth: AuthService,
    public navCtrl: NavController,
    private spinner: NgxSpinnerService
  ) { }

  filterInput(event: any): boolean {
    const pattern = /^[A-Za-záéíóúÁÉÍÓÚüÜñÑ\s]+$/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
    return true;
  }

  getGenderStyle = (gender: UserGender) => this.gender === gender ? '--ion-color-contrast: red !important; font-weight: bolder' : '';
  getTypeStyle = (uType: UserType) => this.type === uType ? '--ion-color-contrast: red !important; font-weight: bolder' : '';

  async signup() {
    this.spinner.show();
    try {
      if (!this.name || !this.lastName || !this.email || !this.type || !this.gender)
        throw new Error('Rellene todos los campos.')
      if (this.password.length < 6 || this.password.length > 20)
        throw new Error('La contraseña debe tener entre 6 y 20 caracteres.');
      if (this.password != this.passCheck)
        throw new Error('Las contraseñas deben coincidir');

      this.name = this.capitalize(this.name);
      this.lastName = this.capitalize(this.lastName);
      await this.auth.createAccount(this.name, this.lastName, this.email, this.type, this.gender, this.password);
      this.email = "";
      this.password = "";
      this.passCheck = "";
      this.gender = undefined;
      this.type = undefined;
      ToastSuccess.fire('Operación realizada con éxito.');
      this.navCtrl.navigateRoot('/tabs');
    } catch (error: any) {
      this.spinner.hide();
      ToastError.fire('Ups! Algo salió mal.', error.message);

    } finally { this.spinner.hide(); }
  }

  capitalize = (input: string) => {
    return (input.toLowerCase()).replace(/\b\w/g, (char: string) => char.toUpperCase());
  }

}