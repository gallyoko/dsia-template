import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { ApiWmsService } from '@lap';
import { map, retry, tap } from 'rxjs/operators';
import { CommonService } from '../../../services/common.service';
import { InitData } from '../model/init-data.model';
import { <%= touppercase(underscore(componentName)) %>_API } from './<%= dasherize(componentName) %>-api.enum';

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

  constructor(protected readonly http: HttpClient,
    private readonly commonService: CommonService,
    private readonly apiWmsService: ApiWmsService,) {}

  public getInitData(codeSite: string, codeDo: string): Observable<InitData> {
    return of({});
    return this.apiWmsService
    .get<InitData>({
      api: <%= touppercase(underscore(componentName)) %>_API.INIT_DATA,
      queryParams: { codeSite: codeSite, codeDo: codeDo },
    })
    .pipe(
      retry(2),
      tap((data: InitData) => {
        // à compléter
      })
    );
  }
}
