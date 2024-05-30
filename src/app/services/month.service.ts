import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MonthService {
  private _selMonthSub = new BehaviorSubject<number>(new Date().getMonth());
  public selMonthObs = this._selMonthSub.asObservable();

  public get SelMonth() {
    return this._selMonthSub.getValue();
  }
  public set SelMonth(month: number) {
    if (month < 0 || month > 11)
      throw new Error(`'${month}' Month doesn't exist`);

    this._selMonthSub.next(month);
  }

  private _componentIsUpdatedSub = new BehaviorSubject<boolean>(false);
  public componentIsUpdatedObs = this._componentIsUpdatedSub.asObservable();

  public get CompIsUpdated() {
    return this._componentIsUpdatedSub.getValue();
  }
  public set CompIsUpdated(value: boolean) {

    this._componentIsUpdatedSub.next(value);
  }
}
