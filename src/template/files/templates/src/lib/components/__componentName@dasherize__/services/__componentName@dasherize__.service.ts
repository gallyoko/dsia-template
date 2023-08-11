import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CommonService } from '../../../services/common.service';
import { InitData } from '../model/init-data.model';

@Injectable({
  providedIn: 'root',
})
export class <%= classify(componentName) %>Service {
  public locale = 'fr';
  
  public navigationBlocked$: Subject<void> = new Subject();
  public callSearch$: Subject<void> = new Subject();
  public resizeContainer$: Subject<void> = new Subject();
  public loading$: Subject<boolean> = new Subject();
  <% if (principalModelCrud || secondModelCrud) { %>  
    public hasCreationRights = false;
    public hasUpdateRights = false;
    public hasDeleteRights = false;
    <% } %>

  constructor(protected readonly http: HttpClient, private readonly commonService: CommonService) {}

  public getInitData(codeSite: string, codeDo: string): Observable<InitData> {
    return of({});
  }
}
