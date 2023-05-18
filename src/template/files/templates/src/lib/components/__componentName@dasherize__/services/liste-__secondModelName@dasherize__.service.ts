import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TypeContext } from '@dsia/wms-common';
import { Observable, of, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { <%= classify(secondModelName) %>Light } from '../model/<%= dasherize(secondModelName) %>.model';

@Injectable({
  providedIn: 'root',
})
export class Liste<%= classify(secondModelName) %>Service {
  public locale = 'fr';
  public selectedIndex = 0;
  public detailLigne<%= classify(secondModelName) %>Open = false;
  public ligne<%= classify(secondModelName) %>Open$: Subject<void> = new Subject();
  public ligne<%= classify(secondModelName) %>Close$: Subject<void> = new Subject();
  public openDetail$: Subject<void> = new Subject();
  public context: TypeContext;
  public exportLignes<%= classify(secondModelName) %>$: Subject<void> = new Subject();
  public showHideColumnLignes<%= classify(secondModelName) %>$: Subject<void> = new Subject();
  public hideButtonActionDetail$: Subject<boolean> = new Subject();
  public detailLigne<%= classify(secondModelName) %>Open$: Subject<void> = new Subject();
  public detailLigne<%= classify(secondModelName) %>Close$: Subject<void> = new Subject();
  public currentListe<%= classify(secondModelName) %>: <%= classify(secondModelName) %>Light[] = [];
  public current<%= classify(secondModelKey) %> = '';
  public currentRowSelect: <%= classify(secondModelName) %>Light;

  constructor(protected readonly http: HttpClient) {}

}