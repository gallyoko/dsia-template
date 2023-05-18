import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CriteriaFormControl } from '@dsia/criteria';
import * as moment from 'moment';
import { Observable, of, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { DATE_SEARCH } from '../../../shared/const';
import { <%= classify(principalModelName) %>Light } from '../model/<%= dasherize(principalModelName) %>.model';

@Injectable({
  providedIn: 'root',
})
export class Liste<%= classify(principalModelName) %>Service {
  public locale = 'fr';
  public selectedIndex = 0;

  public callSearch$: Subject<void> = new Subject();
  public ligne<%= classify(principalModelName) %>Selected$: Subject<<%= classify(principalModelName) %>Light> = new Subject();
  public ligne<%= classify(principalModelName) %>DetailChanged$: Subject<<%= classify(principalModelName) %>Light> = new Subject();
  public ligne<%= classify(principalModelName) %>CancelDetailChanged$: Subject<<%= classify(principalModelName) %>Light> = new Subject();
  public isDetailXl$: Subject<boolean> = new Subject();
  public initListe<%= classify(principalModelName) %>$: Subject<void> = new Subject();
  public closeDetail$: Subject<boolean> = new Subject();
  public detailLigne<%= classify(principalModelName) %>Open$: Subject<void> = new Subject();
  public detailLigne<%= classify(principalModelName) %>Close$: Subject<void> = new Subject();
  public updateDetail$: Subject<void> = new Subject();
  public hideButtonActionDetail$: Subject<boolean> = new Subject();

  constructor(protected readonly http: HttpClient) {}

}