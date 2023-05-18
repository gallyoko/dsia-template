import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { CriteriaFormControl } from '@dsia/criteria';
import { Column, COLUMN_TYPE, ExportFile, Provider } from '@dsia/mat-data-table';
import { Criteria, InfoLevelData, NavigationRetourService } from '@dsia/navigation-retour';
import { Level, NotificationsService, Type } from '@dsia/notifications';
import { Header } from '@dsia/wms-common';
import { LanguageService, User } from '@lap';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  DATE_FULL_FORMAT,
  DATE_FULL_FORMAT_EN,
  EXPORT_FORMAT,
  LIMIT_EXPORT_LISTE_Produit,
  PAGE_SIZE_LISTE_Produit,
  TIMER_NOTIFICATION,
} from '../../../../shared/const';
import { ProduitLight } from '../../model/produit.model';
import { ListeProduitService } from '../../services/liste-produit.service';
import { ListeSupportService } from '../../services/liste-support.service';
import { FicheProduitService } from '../../services/fiche-produit.service';
import { CommonService } from './../../../../services/common.service';

@Component({
  selector: 'lib-liste-produit',
  templateUrl: './liste-produit.component.html',
  styleUrls: ['../../../../../assets/style/liste-n1.component.scss', './liste-produit.component.scss'],
})
export class ListeProduitComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() criteriaControls: Array<CriteriaFormControl> = new Array<CriteriaFormControl>();
  @Input() arrayHeader: Array<Header> = new Array<Header>();
  @Input() user: User = new User();
  @Output() showDetail: EventEmitter<string> = new EventEmitter();

  private readonly destroy$: Subject<void> = new Subject();

  public hasListeProduitData = false;
  private listeProduit: ProduitLight[] = [];

  public nbRows = 0;
  public columns: Column[] = [];
  public templates: any[] = [];
  public selectedRow: ProduitLight;
  public launchSearch = false;
  public detailOpen = false;
  public listeProduitClosed = false;
  public listeProduitOpening = false;
  
  private nextRowId = '';
  
  public firstCall = true;
  private updatePagination = false;
  public ligneProduitChecked: ProduitLight[] = [];
  private registeredRows: Array<{ index: number; data: any }> = new Array<{ index: number; data: any }>();

  public messageNotification = '';

  public provider: Provider = new Provider();

  @ViewChild('codeProduit') codeProduit: TemplateRef<any>;
  @ViewChild('texte') texte: TemplateRef<any>;
  @ViewChild('nombre') nombre: TemplateRef<any>;
  @ViewChild('date') date: TemplateRef<any>;
  @ViewChild('heure') heure: TemplateRef<any>;
  @ViewChild('booleen') booleen: TemplateRef<any>;
  @ViewChild('buttonGroup') buttonGroup: TemplateRef<any>;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly notificationService: NotificationsService,
    private readonly translate: TranslateService,
    private readonly ficheProduitService: FicheProduitService,
    private readonly listeProduitService: ListeProduitService,
    private readonly listeSupportService: ListeSupportService,
    private readonly languageService: LanguageService,
    private readonly commonService: CommonService,
    private readonly navigationRetourService: NavigationRetourService,
  ) {}

  ngOnInit(): void {
    this.ficheProduitService.callSearch$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.launchSearch = true;
      const dateDebut = document.getElementById('dateDebutCriteria') as HTMLInputElement;
      window.setTimeout(() => {
        if (dateDebut) {
          dateDebut.blur();
        }

        this.nextRowId = '';
        this.listeProduit = [];
        this.selectedRow = new ProduitLight();
        this.updatePagination = true;
        
        const previousInfoList: InfoLevelData = this.navigationRetourService.getLevelInfoListPileNavigation(1);
        if (previousInfoList && previousInfoList.list.length) {
          this.ficheProduitService.loading$.next(true);
          this.listeProduit = previousInfoList.list;
          this.nbRows = previousInfoList.totalNbRows;
          this.registeredRows = this.listeProduit.map((el, index) => ({ index: index, data: el }));
          this.hasListeProduitData = !!this.listeProduit.length;
          this.updatePagination = false;
          this.refreshListeProduit();
        } else {
        
          this.searchProduit(this.nextRowId);
        
        }
        
      }, 0);
    });

    this.listeProduitService.closeDetail$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.detailOpen = false;
      this.listeProduitClosed = false;
    });

    this.listeProduitService.detailLigneProduitOpen$.pipe(takeUntil(this.destroy$)).subscribe(() => this.refreshListeProduit());

    this.languageService.localeChange$
      .pipe(takeUntil(this.destroy$))
      .subscribe(locale => (this.listeProduitService.locale = locale));

    this.listeSupportService.openDetail$.pipe(takeUntil(this.destroy$)).subscribe(() => this.closeListeProduit());

    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.initColumn();
    this.cdr.detectChanges();
  }

  private checkCriteria(): boolean {
    // contrôle saise champ clé
    if (this.criteriaControls.find(control => !!control.criteria.isKeyField && !!control.value)) {
      return true;
    }

    // contrôle champs obligatoires
    if (this.criteriaControls.find(control => !!control.criteria?.inputValidityOptions?.required && !control.value)) {
      this.notificationService.push(
        '',
        this.translate.instant('GENERIC.TEMPLATE.NOTIFICATION.ERROR_REQUIRED_CRITERIA'),
        Level.ERROR,
        Type.FOOTER,
        null,
        TIMER_NOTIFICATION
      );
      return false;
    }

    const dateDebutControl = this.criteriaControls.find(control => control.criteria.fieldId === 'dateDebut');
    const dateFinControl = this.criteriaControls.find(control => control.criteria.fieldId === 'dateFin');

    if (dateDebutControl && dateDebutControl.value && dateFinControl && dateFinControl.value) {
      const dateMin = moment(dateDebutControl.value, DATE_FULL_FORMAT);
      const dateMax = moment(dateFinControl.value, DATE_FULL_FORMAT);

      if (dateMin > dateMax) {
        this.notificationService.push(
          '',
          this.translate.instant('PREPARATION.LANCEMENT_PREPA.NOTIFICATION.ERROR_DATE_MIN_MAX'),
          Level.ERROR,
          Type.FOOTER,
          null,
          TIMER_NOTIFICATION
        );
        return false;
      }
    }

    return true;
  }

  private searchProduit(nextRowId: string, modeExport = false): void {
    if (!this.checkCriteria()) {
      return;
    }

    const criteriaList: Criteria[] = [];
    this.criteriaControls.forEach(crit => criteriaList.push({ fieldId: crit.criteria.fieldId, value: crit.value }));
    
    this.navigationRetourService.setCriteriaPileNavigation(criteriaList);
    
    
    this.messageNotification = modeExport
    ? this.translate.instant('COMMAND.SYNTHESE_COMMANDE.NOTIFICATION.CURRENT_EXPORT')
    : this.translate.instant('COMMAND.SYNTHESE_COMMANDE.NOTIFICATION.CURRENT_SEARCHING');
    this.ficheProduitService.loading$.next(true);

    this.listeProduitService
    .getLignesProduit(
        this.user.context['idsite'],
        this.user.context['do'],
        this.criteriaControls,
        modeExport ? LIMIT_EXPORT_LISTE_Produit : PAGE_SIZE_LISTE_Produit,
        nextRowId
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe(
        res => {
        this.nextRowId = res.nextRowId;
        
        this.navigationRetourService.setRowSelectedLevelListPileNavigation(1, null);
        
        this.setData(res, modeExport);
        },
        () => {
        this.ficheProduitService.loading$.next(false);
        this.hasListeProduitData = false;
        }
    );
  }

  private setData(res, modeExport = false) {
    if (!res.listeProduit.length) {
      this.notificationService.push(
        '',
        this.translate.instant('GENERIC.TEMPLATE.NOTIFICATION.NO_RESULT_SEARCH'),
        Level.INFO,
        Type.FOOTER,
        null,
        TIMER_NOTIFICATION
      );
    }

    if (modeExport) {
      if (this.nbRows > LIMIT_EXPORT_LISTE_Produit) {
        this.notificationService.push(
          '',
          this.translate.instant('COMMAND.SYNTHESE_COMMANDE.NOTIFICATION.LIMIT_EXPORT', {
            nbLimit: LIMIT_EXPORT_LISTE_Produit,
            nbMax: this.nbRows,
          }),
          Level.WARNING,
          Type.FOOTER,
          null,
          TIMER_NOTIFICATION
        );
      }

      const exportFile: ExportFile = {
        filename: `Liste_Produit_${moment(new Date()).format(EXPORT_FORMAT)}.csv`,
        list: res.listeProduit,
      };
      this.provider.loadListeToExport$.next(exportFile);
      this.ficheProduitService.loading$.next(false);

      return;
    }

    this.listeProduit = this.listeProduit.concat(res.listeProduit);

    
    this.navigationRetourService.setLevelInfoListPileNavigation(1, this.listeProduit, this.nextRowId);
    
    this.hasListeProduitData = !!this.listeProduit.length;

    if (res.nbRows && this.updatePagination && !modeExport) {
      this.nbRows = res.nbRows || 0;
      
      this.navigationRetourService.setNbRowsLevelListPileNavigation(1, this.nbRows);
      
    }

    this.updatePagination = false;

    this.refreshListeProduit();
  }

  loadMore() {
    
    const previousInfoList: InfoLevelData = this.navigationRetourService.getLevelInfoListPileNavigation(1);
    
    this.searchProduit(previousInfoList.paginationNextRowId || this.nextRowId);
  }

  private refreshListeProduit(): void {
    window.setTimeout(() => {
      this.provider.dataList$.next(this.listeProduit);

      window.setTimeout(() => {
        this.provider.checkViewPort$.next();
        this.provider.refreshDataPosition$.next();
        
        const previousInfoList: InfoLevelData = this.navigationRetourService.getLevelInfoListPileNavigation(1);
        
        this.selectedRow = previousInfoList.rowSelected || new ProduitLight();
        this.updatePosition(!!this.selectedRow);
        this.provider.hideLoaderTable$.next();
      }, 0);
    }, 0);
  }

  private initColumn(): void {
    this.arrayHeader.forEach(header => {
      this.columns.push({
        name: header.fieldId,
        type: (header.type as COLUMN_TYPE) || COLUMN_TYPE.TEXT,
        label: header.label,
        isVisible: true,
        isHideable: true,
        isExportVisible: true,
        minWidth: header.minWidth,
        maxWidth: header.maxWidth,
        disableSort: false,
      });

      this.templates.push(this[header.fieldId]);
    });

    this.columns.push({
      name: 'buttonGroup',
      type: COLUMN_TYPE.TEXT,
      label: '',
      isVisible: true,
      isHideable: false,
      isExportVisible: false,
      stickyRight: true,
      minWidth: '87px',
      maxWidth: '87px',
      disableSort: true,
    });

    this.templates.push(this.buttonGroup);
  }

  public onRowSelect(row: ProduitLight): void {
    this.selectedRow = row;
    
    this.navigationRetourService.setRowSelectedLevelListPileNavigation(1, row);
    
    if (this.detailOpen && !this.listeProduitOpening) {
      this.showDetail.emit(row.codeProduit);
    }

    this.listeProduitOpening = false;
  }

  public getDetailLigneProduit(row: ProduitLight): void {
    this.detailOpen = true;
    this.showDetail.emit(row.codeProduit);
  }

  public closeListeProduit(): void {
    this.detailOpen = false;
    this.listeProduitClosed = true;
    this.listeProduitService.detailLigneProduitClose$.next();
  }

  public openListeProduit(): void {
    this.listeSupportService.detailLigneSupportOpen = false;
    this.detailOpen = true;
    this.listeProduitClosed = false;
    this.listeProduitOpening = true;
    this.listeProduitService.detailLigneProduitOpen$.next();
    this.listeSupportService.detailLigneSupportClose$.next();
    this.listeSupportService.selectedIndex = 0;
    this.updatePosition();
  }

  public updatePosition(rowSelect = true): void {
    const row = this.selectedRow;
    this.provider.hideLoaderTable$.next();

    if (rowSelect) {
      this.provider.rowSelected$.next(row);
    }

    window.setTimeout(() => {
      if (this.selectedRow) {
        const rowSelected = this.registeredRows.find(registeredRow => registeredRow.data === row);
        if (rowSelected) {
          this.provider.scrollToIndex$.next({ index: rowSelected.index });
        }
      }
      this.firstCall = false;
      this.ficheProduitService.loading$.next(false);

      
      if (this.navigationRetourService.getLevelInfoListPileNavigation(2) && row) {
        this.getDetailLigneProduit(row);
      }
      
    }, 500);
  }

  public ExportListeProduit(): void {
     if (this.ligneProduitChecked.length) { 
      const exportFile: ExportFile = {
        filename: `Liste_Produit_${moment(new Date()).format(EXPORT_FORMAT)}.csv`,
        list: this.ligneProduitChecked,
      };
      this.provider.loadListeToExport$.next(exportFile);
     } else { 
      this.searchProduit('', true);
    } 
  }

  public showHideColumn(): void {
    this.provider.showHideColumnPopin$.next();
  }

  public formatDate(date): string {
    return this.commonService.formatDate(date, this.listeProduitService.locale, DATE_FULL_FORMAT, DATE_FULL_FORMAT_EN);
  }

  public onSelectionChange(liste: any[]) {
    this.ligneProduitChecked = liste.map(ligneProduit => ligneProduit.data);
  }

  public checkIfLink1Produit(): boolean {
    return true;
  }

  public checkIfLink2Produit(): boolean {
    return false;
  }

  public link1Produit(ligneProduit: ProduitLight): void {
    console.log('link1Produit', ligneProduit);
  }

  public link2Produit(ligneProduit: ProduitLight): void {
    console.log('link2Produit', ligneProduit);
  }
}
