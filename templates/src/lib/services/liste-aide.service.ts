import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { PopinMono, PopinMulti } from '../model/liste-aide.model';
import { POPIN_MONO, POPIN_MULTI } from '../shared/data.const';

@Injectable({
  providedIn: 'root',
})
export class ListeAideService {
  constructor(protected readonly http: HttpClient) {}

  public getPopinMono(codeSite: string, codeDo: string): Observable<PopinMono[]> {
    const queryParams = { codeSite: codeSite, codeDo: codeDo };

    return of(POPIN_MONO).pipe(map(res => res['listePopinMono'] || []));
  }

  public getPopinMulti(codeSite: string, codeDo: string): Observable<PopinMulti[]> {
    const queryParams = { codeSite: codeSite, codeDo: codeDo };

    return of(POPIN_MULTI).pipe(map(res => res['listePopinMulti'] || []));
  }
}
