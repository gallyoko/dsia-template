import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CriteriaFormControl } from '@dsia/criteria';
import { ApiWmsService } from '@lap';
import * as moment from 'moment';
import { Observable, of, Subject } from 'rxjs';
import { map, retry, tap } from 'rxjs/operators';
import { DATE_SEARCH } from '../../../const';
import { CommonService } from '../../../services/common.service';
import { ListeAideService } from '../../../services/liste-aide.service';
import { <%= classify(principalModelName) %>Light, <%= classify(principalModelName) %> } from '../model/<%= dasherize(principalModelName) %>.model';
import { <%= touppercase(underscore(componentName)) %>_API } from './<%= dasherize(componentName) %>-api.enum';

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
  <% if (principalModelCrud) { %>
  public create<%= classify(principalModelName) %>$: Subject<void> = new Subject();
  public newListChanged$: Subject<<%= classify(principalModelName) %>Light[]> = new Subject();
  public updateList$: Subject<<%= classify(principalModelName) %>> = new Subject();
  public cancelForm$: Subject<<%= classify(principalModelName) %>> = new Subject();
  <% } %>

  constructor(
    protected readonly http: HttpClient,
    private readonly commonService: CommonService,
    private readonly apiWmsService: ApiWmsService,
    private readonly listeAideService: ListeAideService
  ) {}

  public search(
    codeSite: string,
    codeDo: string,
    criteriaControls: Array<CriteriaFormControl>
  ): Observable<<%= classify(principalModelName) %>Light[]> {
    const <%= camelize(principalModelName) %>Light = new <%= classify(principalModelName) %>Light();
    <%= camelize(principalModelName) %>Light.<%= camelize(principalModelKey) %> = '<%= camelize(principalModelKey) %>';
    return of([<%= camelize(principalModelName) %>Light]);

    return of([new <%= classify(principalModelName) %>Light()]);
    const params = this.getCriteriaQueryParams(criteriaControls);
    this.mapToQueryParam(params, 'codeSite', codeSite);
    this.mapToQueryParam(params, 'codeDo', codeDo);

    return this.apiWmsService
      .get<any>({ api: <%= touppercase(underscore(componentName)) %>_API.SEARCH, queryParams: params })
      .pipe(map(response => (response?.liste<%= classify(principalModelName) %> ? response.liste<%= classify(principalModelName) %> : [])));
  }

  public getDetail(codeSite: string, codeDo: string, code<%= classify(principalModelName) %>: string): Observable<any> {
      return of(new <%= classify(principalModelName) %>());
    }

  <% if (principalModelCrud) { %>
  public create<%= classify(principalModelName) %>(codeSite: string, codeDo: string, <%= camelize(principalModelName) %>: <%= classify(principalModelName) %>): Observable<void> {
    return this.apiWmsService.post<void>({
      api: <%= touppercase(underscore(componentName)) %>_API.CREATE,
      body: { <%= camelize(principalModelName) %>: [{ ...<%= camelize(principalModelName) %>, codeSite: codeSite, codeDo: codeDo }] },
    });
  }

  public update<%= classify(principalModelName) %>(codeSite: string, codeDo: string, <%= camelize(principalModelName) %>: <%= classify(principalModelName) %>): Observable<void> {
    return this.apiWmsService.put<void>({
      api: <%= touppercase(underscore(componentName)) %>_API.UPDATE,
      body: { <%= camelize(principalModelName) %>: [{ ...<%= camelize(principalModelName) %>, codeSite: codeSite, codeDo: codeDo }] },
    });
  }

  public delete<%= classify(principalModelName) %>(
    codeSite: string,
    codeDo: string,
    liste<%= classify(principalModelKey) %>: string
  ): Observable<void> {
    const queryParams = {
      codeSite: codeSite,
      codeDo: codeDo,
      liste<%= classify(principalModelKey) %>: liste<%= classify(principalModelKey) %>,
    };
    return this.apiWmsService.delete({
      api: <%= touppercase(underscore(componentName)) %>_API.DELETE,
      queryParams: queryParams,
    });
  }
  <% } %>

  private getCriteriaQueryParams(criteriaControls: Array<CriteriaFormControl>) {
    const params = {};
    const criteriaFormToSend = criteriaControls.filter(
      (criteriaFormControl: CriteriaFormControl) =>
        (criteriaFormControl.value && !Array.isArray(criteriaFormControl.value)) ||
        (Array.isArray(criteriaFormControl.value) && criteriaFormControl.value.length)
    );

    criteriaFormToSend.forEach((criteriaFormControl: CriteriaFormControl) => {
      let value = '';
      if (Array.isArray(criteriaFormControl.value)) {
        value = criteriaFormControl.value.join(',');
      } else if (moment.isDate(criteriaFormControl.value) || criteriaFormControl.value instanceof moment) {
        value = moment(criteriaFormControl.value).format(DATE_SEARCH);
      } else if (criteriaFormControl.criteria.fieldId2 && criteriaFormControl.value2) {
        this.mapToQueryParam(params, criteriaFormControl.criteria.fieldId2, criteriaFormControl.value2);
        value = criteriaFormControl.value;
      } else {
        value = criteriaFormControl.value;
      }
      this.mapToQueryParam(params, criteriaFormControl.criteria.fieldId, value);
    });

    return params;
  }

  private mapToQueryParam(queryParam: any, key: string, value: string) {
    if (value) {
      queryParam[key] = value;
    }
  }
}