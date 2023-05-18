import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CriteriaFormControl } from '@dsia/criteria';
import * as moment from 'moment';
import { Observable, of, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { DATE_SEARCH } from '../../../shared/const';
import { ProduitLight } from '../model/produit.model';

@Injectable({
  providedIn: 'root',
})
export class ListeProduitService {
  public locale = 'fr';
  public selectedIndex = 0;

  public callSearch$: Subject<void> = new Subject();
  public ligneProduitSelected$: Subject<ProduitLight> = new Subject();
  public ligneProduitDetailChanged$: Subject<ProduitLight> = new Subject();
  public ligneProduitCancelDetailChanged$: Subject<ProduitLight> = new Subject();
  public isDetailXl$: Subject<boolean> = new Subject();
  public initListeProduit$: Subject<void> = new Subject();
  public closeDetail$: Subject<boolean> = new Subject();
  public detailLigneProduitOpen$: Subject<void> = new Subject();
  public detailLigneProduitClose$: Subject<void> = new Subject();
  public updateDetail$: Subject<void> = new Subject();
  public hideButtonActionDetail$: Subject<boolean> = new Subject();

  constructor(protected readonly http: HttpClient) {}

}