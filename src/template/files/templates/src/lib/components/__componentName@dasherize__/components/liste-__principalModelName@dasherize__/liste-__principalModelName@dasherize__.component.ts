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
import { MatDialog } from '@angular/material/dialog';
import { CriteriaFormControl } from '@dsia/criteria';
import { Column, COLUMN_TYPE, ExportFile, Provider } from '@dsia/mat-data-table';
import { Criteria, InfoLevelData, NavigationRetourService } from '@dsia/navigation-retour';
import { Level, NotificationsService, Type } from '@dsia/notifications';
import { Header } from '@dsia/wms-common';
import { LanguageService, User, HeaderSelectorService } from '@lap';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  DATE_FULL_FORMAT,
  DATE_FULL_FORMAT_EN,
  EXPORT_FORMAT,
  TIMER_NOTIFICATION,
} from '../../../../const';
import { ReverseDialogValidationCancelComponent } from '../../../dialog-validation-cancel/dialog-validation-cancel.component';

import { <%= classify(principalModelName) %>Light, <%= classify(principalModelName) %> } from '../../model/<%= dasherize(principalModelName) %>.model';
import { Liste<%= classify(principalModelName) %>Service } from '../../services/liste-<%= dasherize(principalModelName) %>.service';
import { Liste<%= classify(secondModelName) %>Service } from '../../services/liste-<%= dasherize(secondModelName) %>.service';
import { <%= classify(componentName) %>Service } from '../../services/<%= dasherize(componentName) %>.service';
import { CommonService } from './../../../../services/common.service';
import { <%= touppercase(underscore(componentName)) %>_RIGHTS } from '../../model/<%= dasherize(componentName) %>-rights.enum';

@Component({
  selector: 'lib-liste-<%= dasherize(principalModelName) %>',
  templateUrl: './liste-<%= dasherize(principalModelName) %>.component.html',
  styleUrls: ['../../../../../assets/style/liste-n1.component.scss', './liste-<%= dasherize(principalModelName) %>.component.scss'],
})
export class Liste<%= classify(principalModelName) %>Component implements OnInit, OnDestroy, AfterViewInit {
  @Input() criteriaControls: Array<CriteriaFormControl> = new Array<CriteriaFormControl>();
  @Input() arrayHeader: Array<Header> = new Array<Header>();
  @Input() user: User = new User();
  @Output() showDetail: EventEmitter<string> = new EventEmitter();

  private readonly destroy$: Subject<void> = new Subject();

  public hasListe<%= classify(principalModelName) %>Data = false;
  private liste<%= classify(principalModelName) %>: <%= classify(principalModelName) %>Light[] = [];

  public nbRows = 0;
  public columns: Column[] = [];
  public templates: any[] = [];
  public selectedRow: <%= classify(principalModelName) %>Light;
  public launchSearch = false;
  public detailOpen = false;
  public liste<%= classify(principalModelName) %>Closed = false;
  public liste<%= classify(principalModelName) %>Opening = false;
  <% if (hasPagination) { %>
  private nextRowId = '';
  <% } %>
  public firstCall = true;
  private updatePagination = false;
  public ligne<%= classify(principalModelName) %>Checked: <%= classify(principalModelName) %>Light[] = [];
  private registeredRows: Array<{ index: number; data: any }> = new Array<{ index: number; data: any }>();
  public noAllData = true;

  public hasCreationRights = false;
  public hasUpdateRights = false;
  public hasDeleteRights = false;

  public messageNotification = '';

  public provider: Provider = new Provider();

  @ViewChild('<%= camelize(principalModelKey) %>') <%= camelize(principalModelKey) %>: TemplateRef<any>;
  @ViewChild('buttonGroup') buttonGroup: TemplateRef<any>;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly notificationService: NotificationsService,
    private readonly translate: TranslateService,
    private readonly <%= camelize(componentName) %>Service: <%= classify(componentName) %>Service,
    private readonly liste<%= classify(principalModelName) %>Service: Liste<%= classify(principalModelName) %>Service,
    private readonly liste<%= classify(secondModelName) %>Service: Liste<%= classify(secondModelName) %>Service,
    private readonly languageService: LanguageService,
    private readonly commonService: CommonService,
    private readonly headerSelectorService: HeaderSelectorService,
    private readonly dialog: MatDialog,
    <% if (hasLinkTo) { %>private readonly navigationRetourService: NavigationRetourService,<% } %>
  ) {}

  ngOnInit(): void {
    this.provider.uniqId = 'code<%= classify(principalModelName) %>';
    <% if (principalModelCrud  || secondModelCrud) { %>
    this.initRights();
    <% } %>

    this.<%= camelize(componentName) %>Service.callSearch$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.launchSearch = true;
      const dateDebut = document.getElementById('dateDebutCriteria') as HTMLInputElement;
      window.setTimeout(() => {
        if (dateDebut) {
          dateDebut.blur();
        }

        <% if (hasPagination) { %>this.nextRowId = '';<% } %>
        this.liste<%= classify(principalModelName) %> = [];
        this.selectedRow = null;
        this.updatePagination = true;
        <% if (hasLinkTo) { %>
        const previousInfoList: InfoLevelData = this.navigationRetourService.getLevelInfoListPileNavigation(1);
        if (previousInfoList && previousInfoList.list.length) {
          this.<%= camelize(componentName) %>Service.loading$.next(true);
          this.liste<%= classify(principalModelName) %> = previousInfoList.list;
          this.nbRows = previousInfoList.totalNbRows;
          this.registeredRows = this.liste<%= classify(principalModelName) %>.map((el, index) => ({ index: index, data: el }));
          this.hasListe<%= classify(principalModelName) %>Data = !!this.liste<%= classify(principalModelName) %>.length;
          this.updatePagination = false;
          this.refreshListe<%= classify(principalModelName) %>();
        } else {
        <% } %>
          this.noAllData = true;
          this.provider.applySort$.next({ active: '', direction: '' });
        this.provider.rowSelected$.next(null);
          this.search<%= classify(principalModelName) %>(<% if (hasPagination) { %>this.nextRowId<% } %>);
          this.provider.scrollToIndex$.next({ index: 0 });
        <% if (hasLinkTo) { %>
        }
        <% } %>
      }, 0);
    });

    this.liste<%= classify(principalModelName) %>Service.closeDetail$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.detailOpen = false;
      this.liste<%= classify(principalModelName) %>Closed = false;
    });

    this.liste<%= classify(principalModelName) %>Service.detailLigne<%= classify(principalModelName) %>Open$.pipe(takeUntil(this.destroy$)).subscribe(() => this.refreshListe<%= classify(principalModelName) %>());

    this.languageService.localeChange$
      .pipe(takeUntil(this.destroy$))
      .subscribe(locale => (this.liste<%= classify(principalModelName) %>Service.locale = locale));

    this.liste<%= classify(secondModelName) %>Service.openDetail$.pipe(takeUntil(this.destroy$)).subscribe(() => this.closeListe<%= classify(principalModelName) %>());

    <% if (principalModelCrud) { %>
      this.liste<%= classify(principalModelName) %>Service.newListChanged$.pipe(takeUntil(this.destroy$)).subscribe((listeN1: <%= classify(principalModelName) %>Light[]) => {
      this.liste<%= classify(principalModelName) %> = listeN1;
      this.firstCall = false;
      this.nbRows = listeN1.length;
      this.refreshListe<%= classify(principalModelName) %>();
    });

    this.liste<%= classify(principalModelName) %>Service.updateList$
      .pipe(takeUntil(this.destroy$))
      .subscribe((ligne1: <%= classify(principalModelName) %>) => this.updateListe<%= classify(principalModelName) %>(ligne1));

    <% } %>

    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.provider.dataList$.next([]);
    this.liste<%= classify(principalModelName) %> = [];
    this.ligne<%= classify(principalModelName) %>Checked = [];
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.initColumn();
    this.cdr.detectChanges();
  }

  <% if (principalModelCrud || secondModelCrud) { %>
  private initRights(): void {
    this.hasCreationRights = this.user['authorities'].some(
      item => item.authority === <%= touppercase(underscore(componentName)) %>_RIGHTS.ROLE_CONFIGURATOR || item.authority === <%= touppercase(underscore(componentName)) %>_RIGHTS.CREATE_<%= touppercase(underscore(componentName)) %>
    );
    this.<%= camelize(componentName) %>Service.hasCreationRights = this.hasCreationRights;

    this.hasUpdateRights = this.user['authorities'].some(
      item => item.authority === <%= touppercase(underscore(componentName)) %>_RIGHTS.ROLE_CONFIGURATOR || item.authority === <%= touppercase(underscore(componentName)) %>_RIGHTS.UPDATE_<%= touppercase(underscore(componentName)) %>
    );
    this.<%= camelize(componentName) %>Service.hasUpdateRights = this.hasUpdateRights;

    this.hasDeleteRights = this.user['authorities'].some(
      item => item.authority === <%= touppercase(underscore(componentName)) %>_RIGHTS.ROLE_CONFIGURATOR || item.authority === <%= touppercase(underscore(componentName)) %>_RIGHTS.DELETE_<%= touppercase(underscore(componentName)) %>
    );
    this.<%= camelize(componentName) %>Service.hasDeleteRights = this.hasDeleteRights;

  }
  <% } %>

  public userPreferenceLoaded(): void {
    <% if (hasPagination) { %>
    const previousInfoList: InfoLevelData = this.navigationRetourService.getLevelInfoListPileNavigation(1);
    if (previousInfoList && previousInfoList.list.length) {
      this.<%= camelize(componentName) %>Service.loading$.next(true);
      this.liste<%= classify(principalModelName) %> = previousInfoList.list;
      this.nbRows = Number(previousInfoList.totalNbRows);
      if (this.liste<%= classify(principalModelName) %>.length === this.nbRows) {
        this.noAllData = false;
      }
      this.registeredRows = this.liste<%= classify(principalModelName) %>.map((el, index) => ({ index: index, data: el }));
      this.has<%= classify(principalModelName) %>Data = !!this.liste<%= classify(principalModelName) %>.length;
      this.updatePagination = false;
      this.refreshListe<%= classify(principalModelName) %>();
    }
    <% } %>
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
        this.translate.instant('<%= touppercase(underscore(moduleI18nName)) %>.<%= touppercase(underscore(componentName)) %>.NOTIFICATION.ERROR_REQUIRED_CRITERIA'),
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
          this.translate.instant('<%= touppercase(underscore(moduleI18nName)) %>.<%= touppercase(underscore(componentName)) %>.NOTIFICATION.ERROR_DATE_MIN_MAX'),
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

  private search<%= classify(principalModelName) %>(<% if (hasPagination) { %>nextRowId: string, modeExport = false, sort: Sort = null<% } %>): void {
    if (!this.checkCriteria()) {
      return;
    }

    const criteriaList: Criteria[] = [];
    this.criteriaControls.forEach(crit => criteriaList.push({ fieldId: crit.criteria.fieldId, value: crit.value }));
    <% if (hasLinkTo) { %>
    this.navigationRetourService.setCriteriaPileNavigation(criteriaList);
    <% } %>
    
    <% if (hasPagination) { %>
    this.messageNotification = modeExport
    ? this.translate.instant('<%= touppercase(underscore(moduleI18nName)) %>.<%= touppercase(underscore(componentName)) %>.NOTIFICATION.CURRENT_EXPORT')
    : this.translate.instant('<%= touppercase(underscore(moduleI18nName)) %>.<%= touppercase(underscore(componentName)) %>.NOTIFICATION.CURRENT_SEARCHING');
    <% } else { %>
      this.messageNotification = this.translate.instant('<%= touppercase(underscore(moduleI18nName)) %>.<%= touppercase(underscore(componentName)) %>.NOTIFICATION.CURRENT_SEARCHING');
    <% } %>
    this.<%= camelize(componentName) %>Service.loading$.next(true);

    this.liste<%= classify(principalModelName) %>Service
    .search(
        this.headerSelectorService.getSelected('site'), this.headerSelectorService.getSelected('do'),
        this.criteriaControls <% if (hasPagination) { %>,
        modeExport || sort ? 0 : PAGE_SIZE_LISTE_<%= classify(principalModelName) %>,
        nextRowId<% } %>
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe(
      (liste: <%= classify(principalModelName) %>Light[]) => {
        <% if (hasPagination) { %>this.nextRowId = liste.nextRowId;<% } %>
        <% if (hasLinkTo) { %>
        this.navigationRetourService.setRowSelectedLevelListPileNavigation(1, null);
        <% } %>
        this.setData(liste<% if (hasPagination) { %>, modeExport, sort<% } %>);
        },
        () => {
        this.<%= camelize(componentName) %>Service.loading$.next(false);
        this.hasListe<%= classify(principalModelName) %>Data = false;
        }
    );
  }

  private setData(liste: <%= classify(principalModelName) %>Light[]<% if (hasPagination) { %>, modeExport = false, sort: Sort = null<% } %>) {
    if (!liste.length) {
      this.notificationService.push(
        '',
        this.translate.instant('<%= touppercase(underscore(moduleI18nName)) %>.<%= touppercase(underscore(componentName)) %>.NOTIFICATION.NO_RESULT_SEARCH'),
        Level.INFO,
        Type.FOOTER,
        null,
        TIMER_NOTIFICATION
      );
    }

    this.liste<%= classify(principalModelName) %> = <% if (hasPagination) { %>sort || modeExport ? <% } %>liste <% if (hasPagination) { %>: this.liste<%= classify(principalModelName) %>.concat(liste)<% } %>;

    <% if (hasLinkTo) { %>
    this.navigationRetourService.setLevelInfoListPileNavigation(1, this.liste<%= classify(principalModelName) %>, this.nextRowId);
    <% } %>
    this.hasListe<%= classify(principalModelName) %>Data = !!this.liste<%= classify(principalModelName) %>.length;

    <% if (hasPagination) { %>
    if (liste.nbRows && this.updatePagination  && !modeExport) {
      this.nbRows = liste.nbRows || 0;
    }
    <% } else { %>
      this.nbRows = this.liste<%= classify(principalModelName) %>.length || 0;
    <% } %>

    <% if (hasLinkTo) { %>
      this.navigationRetourService.setNbRowsLevelListPileNavigation(1, this.nbRows);
      <% } %>

    this.noAllData = this.nbRows > this.liste<%= classify(principalModelName) %>.length;

    this.updatePagination = false;

    this.refreshListe<%= classify(principalModelName) %>();
  }

  <% if (hasPagination) { %>
  loadMore() {
    <% if (hasLinkTo) { %>
    const previousInfoList: InfoLevelData = this.navigationRetourService.getLevelInfoListPileNavigation(1);
    <% } %>
    this.search<%= classify(principalModelName) %>(<% if (hasLinkTo) { %>previousInfoList.paginationNextRowId || <% } %>this.nextRowId);
  }
  <% } %>

  private refreshListe<%= classify(principalModelName) %>(): void {
    window.setTimeout(() => {
      this.provider.dataList$.next(this.liste<%= classify(principalModelName) %>);

      window.setTimeout(() => {
        this.provider.checkViewPort$.next();
        this.provider.refreshDataPosition$.next();
        <% if (hasLinkTo) { %>
        const previousInfoList: InfoLevelData = this.navigationRetourService.getLevelInfoListPileNavigation(1);
        <% } %>
        this.selectedRow = <% if (hasLinkTo) { %>previousInfoList.rowSelected || <% } %>null;
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

  public onRowSelect(row: <%= classify(principalModelName) %>Light): void {
    this.selectedRow = row;
    <% if (hasLinkTo) { %>
    this.navigationRetourService.setRowSelectedLevelListPileNavigation(1, row);
    <% } %>
    if (this.detailOpen && !this.liste<%= classify(principalModelName) %>Opening) {
      this.showDetail.emit(row.<%= camelize(principalModelKey) %>);
    }

    this.liste<%= classify(principalModelName) %>Opening = false;
  }

  public getDetailLigne<%= classify(principalModelName) %>(row: <%= classify(principalModelName) %>Light): void {
    this.detailOpen = true;
    this.showDetail.emit(row.<%= camelize(principalModelKey) %>);
  }

  public closeListe<%= classify(principalModelName) %>(): void {
    this.detailOpen = false;
    this.liste<%= classify(principalModelName) %>Closed = true;
    this.liste<%= classify(principalModelName) %>Service.detailLigne<%= classify(principalModelName) %>Close$.next();
  }

  public openListe<%= classify(principalModelName) %>(): void {
    this.liste<%= classify(secondModelName) %>Service.detailLigne<%= classify(secondModelName) %>Open = false;
    this.detailOpen = true;
    this.liste<%= classify(principalModelName) %>Closed = false;
    this.liste<%= classify(principalModelName) %>Opening = true;
    this.liste<%= classify(principalModelName) %>Service.detailLigne<%= classify(principalModelName) %>Open$.next();
    this.liste<%= classify(secondModelName) %>Service.detailLigne<%= classify(secondModelName) %>Close$.next();
    this.liste<%= classify(secondModelName) %>Service.selectedIndex = 0;
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
      this.<%= camelize(componentName) %>Service.loading$.next(false);

      <% if (hasLinkTo) { %>
      if (this.navigationRetourService.getLevelInfoListPileNavigation(2) && row) {
        this.getDetailLigne<%= classify(principalModelName) %>(row);
      }
      <% } %>
    }, 500);
  }

  public exportListe<%= classify(principalModelName) %>(): void {
    <% if (hasPagination) { %> if (this.ligne<%= classify(principalModelName) %>Checked.length || !this.noAllData) { <% } %>
      const exportFile: ExportFile = {
        filename: `Liste_<%= classify(principalModelName) %>_${moment(new Date()).format(EXPORT_FORMAT)}.csv`,
        list: <% if (!hasPagination) { %>this.ligne<%= classify(principalModelName) %>Checked.length ? <% } %>this.ligne<%= classify(principalModelName) %>Checked<% if (!hasPagination) { %> : this.liste<%= classify(principalModelName) %><% } %>,
      };
      this.provider.loadListeToExport$.next(exportFile);
    <% if (hasPagination) { %> } else { 
      this.showConfirmSortOrExport(null, true);
    } <% } %>
  }

  public showHideColumn(): void {
    this.provider.showHideColumnPopin$.next();
  }

  public formatDate(date): string {
    return this.commonService.formatDate(date, this.liste<%= classify(principalModelName) %>Service.locale, DATE_FULL_FORMAT, DATE_FULL_FORMAT_EN);
  }

  public onSelectionChange(liste: any[]) {
    this.ligne<%= classify(principalModelName) %>Checked = liste.map(ligne<%= classify(principalModelName) %> => ligne<%= classify(principalModelName) %>.data);
  }

  public checkIfLink1<%= classify(principalModelName) %>(): boolean {
    return true;
  }

  public checkIfLink2<%= classify(principalModelName) %>(): boolean {
    return false;
  }

  public link1<%= classify(principalModelName) %>(ligne<%= classify(principalModelName) %>: <%= classify(principalModelName) %>Light): void {
    console.log('link1<%= classify(principalModelName) %>', ligne<%= classify(principalModelName) %>);
  }

  public link2<%= classify(principalModelName) %>(ligne<%= classify(principalModelName) %>: <%= classify(principalModelName) %>Light): void {
    console.log('link2<%= classify(principalModelName) %>', ligne<%= classify(principalModelName) %>);
  }

  <% if (hasPagination) { %>
  private showConfirmSortOrExport(sort: Sort, modeExport: boolean): void {
    const dialogRef = this.dialog.open(ReverseDialogValidationCancelComponent, {
      panelClass: 'confirmation-dialog',
      data: {
        messageTitle: this.translate.instant(sort ? '<%= touppercase(underscore(moduleI18nName)) %>.DIALOG.SORT.TITLE' : '<%= touppercase(underscore(moduleI18nName)) %>.DIALOG.EXPORT.TITLE'),
        messageContent: this.translate.instant(
          sort ? '<%= touppercase(underscore(moduleI18nName)) %>.DIALOG.SORT.MESSAGE_CONFIRM_DIALOG' : '<%= touppercase(underscore(moduleI18nName)) %>.DIALOG.EXPORT.MESSAGE_CONFIRM_DIALOG'
        ),
      },
      disableClose: true,
    });
    dialogRef
      ?.afterClosed()
      .pipe(take(1))
      .subscribe(validation => {
        if (validation) {
          this.search<%= classify(principalModelName) %>(null, modeExport, sort);
        }
      });
  }
  <% } %>

  <% if (principalModelCrud) { %>
  public create<%= classify(principalModelName) %>(): void {
    this.liste<%= classify(principalModelName) %>Service.create<%= classify(principalModelName) %>$.next();
  }

  private updateListe<%= classify(principalModelName) %>(ligne1: <%= classify(principalModelName) %>): void {
    const ligne1Find = this.liste<%= classify(principalModelName) %>.find(
      ligne1Search => ligne1Search.<%= camelize(principalModelKey) %>.toUpperCase() === ligne1.<%= camelize(principalModelKey) %>.toUpperCase()
    );

    if (ligne1Find) {
      ligne1Find.<%= camelize(principalModelKey) %> = ligne1.<%= camelize(principalModelKey) %>;
      this.refreshListe<%= classify(principalModelName) %>();
    }
  }

  public delete<%= classify(principalModelName) %>(): void {
    const dialogRef = this.dialog.open(ReverseDialogValidationCancelComponent, {
      panelClass: 'confirmation-dialog',
      data: {
        messageTitle: this.translate.instant('<%= touppercase(underscore(moduleI18nName)) %>.<%= touppercase(underscore(componentName)) %>.DIALOG.DELETE.TITLE'),
        messageContent:
          this.ligne<%= classify(principalModelName) %>Checked.length === 1
            ? this.translate.instant('<%= touppercase(underscore(moduleI18nName)) %>.<%= touppercase(underscore(componentName)) %>.DIALOG.DELETE.MESSAGE_CONFIRM_DIALOG')
            : this.translate.instant('<%= touppercase(underscore(moduleI18nName)) %>.<%= touppercase(underscore(componentName)) %>.DIALOG.DELETE.MESSAGE_CONFIRM_DIALOG_MULTI'),
      },
    });
    dialogRef.afterClosed().subscribe(validation => {
      if (validation) {
        this.<%= camelize(componentName) %>Service.loading$.next(true);

        this.liste<%= classify(principalModelName) %>Service
              .delete<%= classify(principalModelName) %>(
                this.headerSelectorService.getSelected('site'),
                this.headerSelectorService.getSelected('do'),
                this.ligne<%= classify(principalModelName) %>Checked.map(ligne => ligne.<%= camelize(principalModelKey) %>).join(',')
              )
              .subscribe(
                () => this.deleteLignesSuccess(),
                () => this.<%= camelize(componentName) %>Service.loading$.next(false)
              );
      }
    });
  }

  private deleteLignesSuccess(): void {
    this.notificationService.push(
      null,
      this.ligne<%= classify(principalModelName) %>Checked.length === 1
        ? this.translate.instant('<%= touppercase(underscore(moduleI18nName)) %>.<%= touppercase(underscore(componentName)) %>.NOTIFICATION.SUCCESS_DELETE')
        : this.translate.instant('<%= touppercase(underscore(moduleI18nName)) %>.<%= touppercase(underscore(componentName)) %>.NOTIFICATION.SUCCESS_DELETE_MULTI'),
      Level.SUCCESS,
      Type.FOOTER,
      null,
      TIMER_NOTIFICATION
    );

    this.liste<%= classify(principalModelName) %> = this.liste<%= classify(principalModelName) %>.filter(
      row => !this.ligne<%= classify(principalModelName) %>Checked.map(ligne => ligne.<%= camelize(principalModelKey) %>.toUpperCase()).includes(row.<%= camelize(principalModelKey) %>.toUpperCase())
    );
    this.nbRows = this.liste<%= classify(principalModelName) %>.length;
    this.registeredRows = this.liste<%= classify(principalModelName) %>.map((el, index) => ({ index: index, data: el }));
    this.hasListe<%= classify(principalModelName) %>Data = !!this.liste<%= classify(principalModelName) %>.length;
    this.updatePagination = false;
    this.ligne<%= classify(principalModelName) %>Checked = [];
    this.refreshListe<%= classify(principalModelName) %>();

    this.provider.unChekAllMultiSelection$.next();

    this.<%= camelize(componentName) %>Service.loading$.next(false);
  }

  <% } %>
}
