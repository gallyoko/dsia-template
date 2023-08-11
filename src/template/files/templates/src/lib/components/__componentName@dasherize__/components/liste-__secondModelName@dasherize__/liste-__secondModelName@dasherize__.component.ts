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
    SimpleChanges
  } from '@angular/core';
  import { MatDialog } from '@angular/material/dialog';
import { COLUMN_TYPE, Column, ExportFile, Provider } from '@dsia/mat-data-table';
import { Level, NotificationsService, Type } from '@dsia/notifications';
import { HeaderSelectorService, User } from '@lap';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
    DATE_FULL_FORMAT,
    DATE_FULL_FORMAT_EN,
    DATE_FULL_HOUR_FORMAT,
    DATE_FULL_HOUR_FORMAT_EN,
    EXPORT_FORMAT,
    TIMER_NOTIFICATION,
  } from '../../../../const';
import { CommonService } from './../../../../services/common.service';
import { <%= classify(secondModelName) %>Light, <%= classify(secondModelName) %> } from '../../model/<%= dasherize(secondModelName) %>.model';
import { <%= classify(componentName) %>Service } from '../../services/<%= dasherize(componentName) %>.service';
import { Liste<%= classify(secondModelName) %>Service } from '../../services/liste-<%= dasherize(secondModelName) %>.service';
import { ReverseDialogValidationCancelComponent } from '../../../dialog-validation-cancel/dialog-validation-cancel.component';


  @Component({
    selector: 'lib-liste-<%= dasherize(secondModelName) %>',
    templateUrl: './liste-<%= dasherize(secondModelName) %>.component.html',
    styleUrls: ['../../../../../assets/style/liste-n2.component.scss', './liste-<%= dasherize(secondModelName) %>.component.scss'],
  })
  export class Liste<%= classify(secondModelName) %>Component  implements OnInit {
    @Input() user: User;
    @Input() <%= camelize(principalModelKey) %>: string;
    @Output() showDetailLigne: EventEmitter<string> = new EventEmitter();
  
    private readonly destroy$: Subject<void> = new Subject();
  
    public isLoading = false;
    private _detailLigneOpen = false;
    get detailLigneOpen(): boolean {
      return this._detailLigneOpen;
    }
    set detailLigneOpen(detailLigneOpen: boolean) {
      this._detailLigneOpen = detailLigneOpen;
      this.liste<%= classify(secondModelName) %>Service.detailLigne<%= classify(secondModelName) %>Open = detailLigneOpen;
      this.cdr.detectChanges();
    }
  
    public nbRows = 0;
    public columns: Column[] = [];
    public templates: any[] = [];
    public selectedRow: <%= classify(secondModelName) %>Light;
    public provider: Provider = new Provider();
    public messageNotification = '';
    private listeLignes<%= classify(secondModelName) %>: <%= classify(secondModelName) %>Light[] = [];
    private listeLignes<%= classify(secondModelName) %>Checked: <%= classify(secondModelName) %>Light[] = [];
    private callListe<%= classify(secondModelName) %>Service = true;
  
    @ViewChild('<%= camelize(secondModelKey) %>') <%= camelize(secondModelKey) %>: TemplateRef<any>;
    @ViewChild('buttonGroup') buttonGroup: TemplateRef<any>;

    constructor(
        private readonly cdr: ChangeDetectorRef,
        private readonly dialog: MatDialog,
        private readonly translate: TranslateService,
        private readonly liste<%= classify(secondModelName) %>Service: Liste<%= classify(secondModelName) %>Service,
        private readonly headerSelectorService: HeaderSelectorService,
        private readonly commonService: CommonService,
        private readonly notificationService: NotificationsService,
        private readonly <%= camelize(componentName) %>Service: <%= classify(componentName) %>Service,
      ) {}
    
      ngOnInit(): void {
        this.detailLigneOpen = this.liste<%= classify(secondModelName) %>Service.detailLigne<%= classify(secondModelName) %>Open;
        this.liste<%= classify(secondModelName) %>Service.exportLignes<%= classify(secondModelName) %>$.pipe(takeUntil(this.destroy$)).subscribe(() => this.exportData());
    
        this.liste<%= classify(secondModelName) %>Service.showHideColumnLignes<%= classify(secondModelName) %>$
          .pipe(takeUntil(this.destroy$))
          .subscribe(() => this.provider.showHideColumnPopin$.next());
    
        this.liste<%= classify(secondModelName) %>Service.detailLigne<%= classify(secondModelName) %>Close$
          .pipe(takeUntil(this.destroy$))
          .subscribe(() => (this.detailLigneOpen = false));

        <% if (secondModelCrud) { %>
            this.liste<%= classify(secondModelName) %>Service.updateList$
            .pipe(takeUntil(this.destroy$))
            .subscribe((ligne2: <%= classify(secondModelName) %>) => this.updateListe(ligne2));
    
            this.liste<%= classify(secondModelName) %>Service.deleteLigne$.pipe(takeUntil(this.destroy$)).subscribe(() => this.deleteLignes());
    
            this.liste<%= classify(secondModelName) %>Service.newListChanged$
            .pipe(takeUntil(this.destroy$))
            .subscribe((liste: <%= classify(secondModelName) %>Light[]) => {
                this.listeLignes<%= classify(secondModelName) %> = liste;
                this.nbRows = liste.length;
                this.refreshTable();
            });
        <% } %>
      }
    
      ngOnDestroy(): void {
        this.provider.dataList$.next();
        this.listeLignes<%= classify(secondModelName) %> = [];
        this.listeLignes<%= classify(secondModelName) %>Checked = [];
        this.selectedRow = null;
        this.destroy$.next();
        this.destroy$.complete();
      }
    
      ngOnChanges(changes: SimpleChanges): void {
        if (this.<%= camelize(principalModelKey) %> && this.callListe<%= classify(secondModelName) %>Service) {
          this.loadListe();
        }
      }
    
      ngAfterViewInit(): void {
        this.initColumn();
      }
    
      private initColumn(): void {
        this.columns = [
          {
            name: '<%= camelize(secondModelKey) %>',
            type: COLUMN_TYPE.TEXT,
            label: this.translate.instant('<%= touppercase(underscore(moduleI18nName)) %>.<%= touppercase(underscore(componentName)) %>.<%= touppercase(underscore(secondModelName)) %>.DETAIL.<%= touppercase(underscore(secondModelKey)) %>'),
            isVisible: true,
            isHideable: true,
            isExportVisible: true,
            minWidth: '225px',
            maxWidth: 'auto',
            disableSort: false,
          },
          {
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
          },
        ];
    
        this.templates = [this.<%= camelize(secondModelKey) %>, this.buttonGroup];
    
        this.cdr.detectChanges();
      }
    
      private loadListe(): void {
        this.messageNotification = this.translate.instant('<%= touppercase(underscore(moduleI18nName)) %>.<%= touppercase(underscore(componentName)) %>.NOTIFICATION.CURRENT_SEARCHING');
        this.isLoading = true;
        this.cdr.detectChanges();
        this.liste<%= classify(secondModelName) %>Service
          .search(
            this.headerSelectorService.getSelected('site'),
            this.headerSelectorService.getSelected('do'),
            this.<%= camelize(principalModelKey) %>
          )
          .pipe(takeUntil(this.destroy$))
          .subscribe(
            (liste: <%= classify(secondModelName) %>Light[]) => this.loadData(liste),
            () => (this.isLoading = false)
          );
      }
    
      private loadData(listeLignes<%= classify(secondModelName) %>: <%= classify(secondModelName) %>Light[]): void {
        this.liste<%= classify(secondModelName) %>Service.currentListe<%= classify(secondModelName) %> = listeLignes<%= classify(secondModelName) %>;
        this.listeLignes<%= classify(secondModelName) %> = listeLignes<%= classify(secondModelName) %>;
        this.nbRows = listeLignes<%= classify(secondModelName) %>.length;
        this.provider.unChekAllMultiSelection$.next();
        this.listeLignes<%= classify(secondModelName) %>Checked = [];
        this.selectedRow = null;
        this.provider.rowSelected$.next(null);
        setTimeout(() => {
          this.refreshTable();
          this.cdr.detectChanges();
        }, 0);
      }
    
      public refreshTable(): void {
        this.provider.dataList$.next([]);
        this.cdr.detectChanges();
        this.provider.dataList$.next(this.listeLignes<%= classify(secondModelName) %>);
        this.provider.checkViewPort$.next();
    
        const row = this.liste<%= classify(secondModelName) %>Service.currentRowSelect;
    
        if (row) {
          this.provider.rowSelected$.next(row);
        }
    
        this.provider.hideLoaderTable$.next();
    
        window.setTimeout(() => {
          this.isLoading = false;
          this.provider.refreshDataPosition$.next();
        }, 500);
      }
    
      public onRowSelect(row: <%= classify(secondModelName) %>Light): void {
        const prevRow = this.selectedRow;
        this.liste<%= classify(secondModelName) %>Service.currentRowSelect = row;
        this.selectedRow = row;
        
        if (this.detailLigneOpen) {
          if (row !== prevRow) {
            if (!this.liste<%= classify(secondModelName) %>Service.ligne<%= classify(secondModelName) %>Changed) {
              this.getDetail<%= classify(secondModelName) %>(row);
            } 
            <% if (secondModelCrud) { %>
            else {
              this.selectedRow = prevRow;
              this.liste<%= classify(secondModelName) %>Service.currentRowSelect = prevRow;
              this.provider.rowSelected$.next(prevRow);
              this.callConfirmChange(row);
            }
            <% } %>
          }
        }
      }
    
      <% if (secondModelCrud) { %>
      private callConfirmChange(row: <%= classify(secondModelName) %>Light): void {
        const dialogRef = this.dialog.open(ReverseDialogValidationCancelComponent, {
          panelClass: 'confirmation-dialog',
          data: {
            messageTitle: this.translate.instant('<%= touppercase(underscore(moduleI18nName)) %>.<%= touppercase(underscore(componentName)) %>.DIALOG.CONFIRMATION.TITLE'),
            messageContent: this.translate.instant('<%= touppercase(underscore(moduleI18nName)) %>.<%= touppercase(underscore(componentName)) %>.DIALOG.CONFIRMATION.MESSAGE_CONFIRM_DIALOG'),
          },
          disableClose: true,
        });
        dialogRef.afterClosed().subscribe(validation => {
          if (validation) {
            this.selectedRow = row;
            this.liste<%= classify(secondModelName) %>Service.currentRowSelect = row;
            this.provider.rowSelected$.next(row);
            this.getDetail<%= classify(secondModelName) %>(row);
          }
        });
      }
      <% } %>

      public onSelectionChange(liste: any[]) {
        <% if (secondModelCrud) { %>
        this.liste<%= classify(secondModelName) %>Service.disabledButtonDelete<%= classify(secondModelName) %>$.next(liste?.length ? false : true);
        <% } %>
        this.listeLignes<%= classify(secondModelName) %>Checked = liste.map(com => com.data);
      }
    
      private exportData(): void {
        const exportFile: ExportFile = {
          filename: `${this.translate.instant('<%= touppercase(underscore(moduleI18nName)) %>.<%= touppercase(underscore(componentName)) %>.<%= touppercase(underscore(secondModelName)) %>.TITLE.FILENAME')}_${moment(new Date()).format(
            EXPORT_FORMAT
          )}.csv`,
        };
    
        exportFile.list = this.listeLignes<%= classify(secondModelName) %>Checked.length ? this.listeLignes<%= classify(secondModelName) %>Checked : this.listeLignes<%= classify(secondModelName) %>;
    
        this.provider.loadListeToExport$.next(exportFile);
      }
    
      public getDetail<%= classify(secondModelName) %>(row: <%= classify(secondModelName) %>Light): void {
        this.liste<%= classify(secondModelName) %>Service.modeCreate = false;
        this.detailLigneOpen = true;
        this.showDetailLigne.emit(row.<%= camelize(secondModelKey) %>);
        this.liste<%= classify(secondModelName) %>Service.openDetail$.next();
        setTimeout(() => {
          this.cdr.detectChanges();
        }, 0);
      }
    
      public formatDateHeure(date): string {
        return this.commonService.formatDate(
          date,
          this.<%= camelize(componentName) %>Service.locale,
          DATE_FULL_HOUR_FORMAT,
          DATE_FULL_HOUR_FORMAT_EN
        );
      }
      
      public userPreferenceLoaded(): void {
        window.setTimeout(() => {
          this.refreshTable();
        }, 0);
      }

      <% if (secondModelCrud) { %>
      private updateListe(<%= camelize(secondModelName) %>: <%= classify(secondModelName) %>): void {
        const ligneFind = this.listeLignes<%= classify(secondModelName) %>.find(
          ligneSearch => ligneSearch.<%= camelize(secondModelKey) %>.toUpperCase() === <%= camelize(secondModelName) %>.<%= camelize(secondModelKey) %>.toUpperCase()
        );
    
        if (ligneFind) {
          ligneFind.<%= camelize(secondModelKey) %> = <%= camelize(secondModelName) %>.<%= camelize(secondModelKey) %>;
    
          this.refreshTable();
        }
      }

      public deleteLignes(): void {
        const dialogRef = this.dialog.open(ReverseDialogValidationCancelComponent, {
          panelClass: 'confirmation-dialog',
          data: {
            messageTitle: this.translate.instant('<%= touppercase(underscore(moduleI18nName)) %>.<%= touppercase(underscore(componentName)) %>.DIALOG.DELETE.TITLE'),
            messageContent:
              this.listeLignes<%= classify(secondModelName) %>Checked.length === 1
                ? this.translate.instant('<%= touppercase(underscore(moduleI18nName)) %>.<%= touppercase(underscore(componentName)) %>.DIALOG.DELETE.MESSAGE_CONFIRM_DIALOG')
                : this.translate.instant('<%= touppercase(underscore(moduleI18nName)) %>.<%= touppercase(underscore(componentName)) %>.DIALOG.DELETE.MESSAGE_CONFIRM_DIALOG_MULTI'),
          },
        });
        dialogRef.afterClosed().subscribe(validation => {
          if (validation) {
            this.<%= camelize(componentName) %>Service.loading$.next(true);
    
            this.liste<%= classify(secondModelName) %>Service
              .delete<%= classify(secondModelName) %>(
                this.headerSelectorService.getSelected('site'),
                this.headerSelectorService.getSelected('do'),
                this.<%= camelize(principalModelKey) %>,
                this.listeLignes<%= classify(secondModelName) %>Checked.map(ligne => ligne.<%= camelize(secondModelKey) %>).join(',')
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
          this.listeLignes<%= classify(secondModelName) %>Checked.length === 1
            ? this.translate.instant('<%= touppercase(underscore(moduleI18nName)) %>.<%= touppercase(underscore(componentName)) %>.NOTIFICATION.SUCCESS_DELETE')
            : this.translate.instant('<%= touppercase(underscore(moduleI18nName)) %>.<%= touppercase(underscore(componentName)) %>.NOTIFICATION.SUCCESS_DELETE_MULTI'),
          Level.SUCCESS,
          Type.FOOTER,
          null,
          TIMER_NOTIFICATION
        );
    
        this.listeLignes<%= classify(secondModelName) %> = this.listeLignes<%= classify(secondModelName) %>.filter(
          row =>
            !this.listeLignes<%= classify(secondModelName) %>Checked
              .map(n2 => n2.<%= camelize(secondModelKey) %>.toUpperCase())
              .includes(row.<%= camelize(secondModelKey) %>.toUpperCase())
        );
        this.nbRows = this.listeLignes<%= classify(secondModelName) %>.length;
        this.listeLignes<%= classify(secondModelName) %>Checked = [];
        this.refreshTable();
    
        this.provider.unChekAllMultiSelection$.next();
    
        this.<%= camelize(componentName) %>Service.loading$.next(false);
      }
    
      <% } %>
    }