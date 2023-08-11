import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GlobalVariable, GlobalVariableParams, GlobalVariableService } from '@dsia/wms-common';
import { User } from '@lap';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  constructor(
    protected readonly http: HttpClient,
    private readonly globalVariableService: GlobalVariableService,
    private readonly translate: TranslateService
  ) {}

  public updateLibelleList(list: any[], code: string, libelle: string, noValue = true, defaut = ''): any[] {
    if (list) {
      const newList = [];
      list.forEach(line => {
        const element = {};
        element[code] = line[code];
        element[libelle] = `${line[code]} - ${line[libelle]}`;
        if (defaut) {
          element[defaut] = line[defaut];
        }
        newList.push(element);
      });
      return this.initNoValueList(newList, code, libelle, noValue);
    } else {
      return this.initNoValueList([], code, libelle, noValue);
    }
  }

  public createList(list: any[], code: string, libelle: string): any[] {
    if (!list) {
      return [];
    }

    const newList = [];
    list.forEach(line => {
      const element = {};
      element[code] = line[code];
      element[libelle] = line[libelle];
      newList.push(element);
    });
    return newList;
  }

  public initNoValueList(list: any[], code: string, libelle: string, noValue = true): any[] {
    if (!list) {
      return [];
    }

    if (noValue) {
      const element = {};
      element[code] = '';
      element[libelle] = '';
      list.unshift(element);
    }

    return list;
  }

  public numberToTime(value: number | string) {
    if (!value) {
      return '';
    }

    let time = value.toString();

    while (time.length < 4) {
      time = `0${time}`;
    }

    return `${time.slice(0, 2)}:${time.slice(2, 4)}`;
  }

  public getGlobalVariable(user: User): Promise<GlobalVariable> {
    const gvp = new GlobalVariableParams();
    gvp.url = '';
    gvp.userDo = user.context['do'];
    gvp.userSite = user.context['idsite'];
    return this.globalVariableService
      .getVariableGlobalList(gvp)
      .then((globalVariable: GlobalVariable) => this.translateGlobalVariable(globalVariable));
  }

  private translateGlobalVariable(globalVariable: GlobalVariable): GlobalVariable {
    globalVariable.pdsCourt = this.translate.instant(globalVariable.pdsCourt);
    globalVariable.pdsLong = this.translate.instant(globalVariable.pdsLong);
    globalVariable.dimensCourt = this.translate.instant(globalVariable.dimensCourt);
    globalVariable.dimensLong = this.translate.instant(globalVariable.dimensLong);
    globalVariable.surfaceCourt = this.translate.instant(globalVariable.surfaceCourt);
    globalVariable.surfaceLong = this.translate.instant(globalVariable.surfaceLong);
    globalVariable.volCourt = this.translate.instant(globalVariable.volCourt);
    globalVariable.volLong = this.translate.instant(globalVariable.volLong);

    return globalVariable;
  }

  public applyDefautNumber(element, className): void {
    let verif = new className();
    for (const [key, value] of Object.entries(element)) {
      if (typeof verif[key] === 'number' && value === null) {
        element[key] = 0;
      }
    }
  }

  public formatDate(date, locale: string, formatFr: string, formatEn: string): string {
    if (date) {
      return moment(date).format(locale.toUpperCase() === 'FR' ? formatFr : formatEn);
    }

    return ' ';
  }
}
