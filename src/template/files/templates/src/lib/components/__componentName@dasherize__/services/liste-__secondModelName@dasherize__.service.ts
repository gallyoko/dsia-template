import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TypeContext } from '@dsia/wms-common';
import { ApiWmsService } from '@lap';
import { Observable, of, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { <%= classify(secondModelName) %>Light, <%= classify(secondModelName) %> } from '../model/<%= dasherize(secondModelName) %>.model';
import { <%= touppercase(underscore(componentName)) %>_<%= touppercase(underscore(secondModelName)) %>_API } from './<%= dasherize(componentName) %>-api.enum';

@Injectable({
  providedIn: 'root',
})
export class Liste<%= classify(secondModelName) %>Service {
  public locale = 'fr';
  public selectedIndex = 0;
  public detailLigne<%= classify(secondModelName) %>Open = false;
  public ligne<%= classify(secondModelName) %>Open$: Subject<void> = new Subject();
  public ligne<%= classify(secondModelName) %>Close$: Subject<void> = new Subject();
  public ligne<%= classify(secondModelName) %>DetailChanged$: Subject<<%= classify(secondModelName) %>> = new Subject();
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
  public newLigne$: Subject<void> = new Subject();
  public deleteLigne$: Subject<void> = new Subject();
  public reloadDetail$: Subject<void> = new Subject();
  public cancelForm$: Subject<void> = new Subject();
  public newListChanged$: Subject<<%= classify(secondModelName) %>Light[]> = new Subject();
  public updateList$: Subject<<%= classify(secondModelName) %>> = new Subject();
  public ligne<%= classify(secondModelName) %>Changed: boolean = false;
  public disabledButtonDelete<%= classify(secondModelName) %>$: Subject<boolean> = new Subject();
  public modeCreate = false;

  
  constructor(protected readonly http: HttpClient, private readonly apiWmsService: ApiWmsService) {}

  public search(
    codeSite: string,
    codeDo: string,
    <%= camelize(principalModelKey) %>: string
  ): Observable<<%= classify(secondModelName) %>Light[]> {
    const <%= camelize(secondModelName) %>Light = new <%= classify(secondModelName) %>Light();
    <%= camelize(secondModelName) %>Light.<%= camelize(secondModelKey) %> = '<%= camelize(secondModelKey) %>';
    return of([<%= camelize(secondModelName) %>Light]);
    const queryParams = { codeSite: codeSite, codeDo: codeDo };
    this.mapToQueryParam(queryParams, '<%= camelize(principalModelKey) %>', <%= camelize(principalModelKey) %>);

    return this.apiWmsService
      .get<any>({ api: <%= touppercase(underscore(componentName)) %>_<%= touppercase(underscore(secondModelName)) %>_API.SEARCH, queryParams: queryParams })
      .pipe(map(response => (response?.liste<%= classify(secondModelName) %> ? response.liste<%= classify(secondModelName) %> : [])));
  }

  public getDetail<%= classify(secondModelName) %>(
    codeSite: string,
    codeDo: string,
    <%= camelize(principalModelKey) %>: string,
    <%= camelize(secondModelKey) %>: string
  ): Observable<<%= classify(secondModelName) %>> {
    const queryParams = {
      codeSite: codeSite,
      codeDo: codeDo,
    };
    this.mapToQueryParam(queryParams, '<%= camelize(principalModelKey) %>', <%= camelize(principalModelKey) %>);
    this.mapToQueryParam(queryParams, '<%= camelize(secondModelKey) %>', <%= camelize(secondModelKey) %>);
    return this.apiWmsService
      .get<<%= classify(secondModelName) %>[]>({
        api: <%= touppercase(underscore(componentName)) %>_<%= touppercase(underscore(secondModelName)) %>_API.DETAIL,
        queryParams: queryParams,
      })
      .pipe(
        map(res =>
          res['detail<%= classify(secondModelName) %>'] && res['detail<%= classify(secondModelName) %>'].length
            ? res['detail<%= classify(secondModelName) %>'][0]
            : null
        )
      );
  }

  <% if (secondModelCrud) { %>

  public create<%= classify(secondModelName) %>(
    codeSite: string,
    codeDo: string,
    <%= camelize(principalModelKey) %>: string,
    <%= camelize(secondModelName) %>: <%= classify(secondModelName) %>
  ): Observable<void> {
    return this.apiWmsService.post<any>({
      api: <%= touppercase(underscore(componentName)) %>_<%= touppercase(underscore(secondModelName)) %>_API.CREATE,
      body: { <%= camelize(secondModelName) %>: [{ ...<%= camelize(secondModelName) %>, codeSite: codeSite, codeDo: codeDo, <%= camelize(principalModelKey) %>: <%= camelize(principalModelKey) %> }] },
    });
  }

  public update<%= classify(secondModelName) %>(
    codeSite: string,
    codeDo: string,
    <%= camelize(principalModelKey) %>: string,
    <%= camelize(secondModelName) %>: <%= classify(secondModelName) %>
  ): Observable<void> {
    return this.apiWmsService.put<any>({
      api: <%= touppercase(underscore(componentName)) %>_<%= touppercase(underscore(secondModelName)) %>_API.UPDATE,
      body: { <%= camelize(secondModelName) %>: [{ ...<%= camelize(secondModelName) %>, codeSite: codeSite, codeDo: codeDo, <%= camelize(principalModelKey) %>: <%= camelize(principalModelKey) %> }] },
    });
  }

  public delete<%= classify(secondModelName) %>(
    codeSite: string,
    codeDo: string,
    <%= camelize(principalModelKey) %>: string,
    liste<%= classify(secondModelKey) %>: string
  ): Observable<void> {
    const queryParams = {
      codeSite: codeSite,
      codeDo: codeDo,
      <%= camelize(principalModelKey) %>: <%= camelize(principalModelKey) %>,
      liste<%= classify(secondModelKey) %>: liste<%= classify(secondModelKey) %>,
    };
    return this.apiWmsService.delete({
      api: <%= touppercase(underscore(componentName)) %>_<%= touppercase(underscore(secondModelName)) %>_API.DELETE,
      queryParams: queryParams,
    });
  }

  <% } %>


  private mapToQueryParam(queryParam: any, key: string, value: string) {
    if (value) {
      queryParam[key] = value;
    }
  }

}