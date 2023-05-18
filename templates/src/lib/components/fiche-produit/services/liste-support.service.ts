import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TypeContext } from '@dsia/wms-common';
import { Observable, of, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { SupportLight } from '../model/support.model';

@Injectable({
  providedIn: 'root',
})
export class ListeSupportService {
  public locale = 'fr';
  public selectedIndex = 0;
  public detailLigneSupportOpen = false;
  public ligneSupportOpen$: Subject<void> = new Subject();
  public ligneSupportClose$: Subject<void> = new Subject();
  public openDetail$: Subject<void> = new Subject();
  public context: TypeContext;
  public exportLignesSupport$: Subject<void> = new Subject();
  public showHideColumnLignesSupport$: Subject<void> = new Subject();
  public hideButtonActionDetail$: Subject<boolean> = new Subject();
  public detailLigneSupportOpen$: Subject<void> = new Subject();
  public detailLigneSupportClose$: Subject<void> = new Subject();
  public currentListeSupport: SupportLight[] = [];
  public currentCodeSupport = '';
  public currentRowSelect: SupportLight;

  constructor(protected readonly http: HttpClient) {}

}