import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Tab } from '@dsia/wms-common';
import { Level, NotificationsService, Type } from '@dsia/notifications';
import { TranslateService } from '@ngx-translate/core';
import { User, HeaderSelectorService } from '@lap';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { cloneDeep, isEqual } from 'lodash';
import { TIMER_NOTIFICATION } from '../../../../const';
import { ReverseDialogValidationCancelComponent } from '../../../dialog-validation-cancel/dialog-validation-cancel.component';
import { ResizeContainer } from '../../../../services/resize-container';
import { <%= classify(principalModelName) %>, <%= classify(principalModelName) %>Light } from '../../model/<%= dasherize(principalModelName) %>.model';
import { Liste<%= classify(principalModelName) %>Service } from '../../services/liste-<%= dasherize(principalModelName) %>.service';
import { Liste<%= classify(secondModelName) %>Service } from '../../services/liste-<%= dasherize(secondModelName) %>.service';
import { <%= classify(componentName) %>Service } from '../../services/<%= dasherize(componentName) %>.service';

@Component({
  selector: 'lib-detail-<%= dasherize(principalModelName) %>',
  templateUrl: './detail-<%= dasherize(principalModelName) %>.component.html',
  styleUrls: ['../../../../../assets/style/detail-n1.component.scss', './detail-<%= dasherize(principalModelName) %>.component.scss'],
})
export class Detail<%= classify(principalModelName) %>Component implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @Input() tabList: Tab[] = [];
  @Input() user: User;
  @Input() modeCreate = false;
  @Input() <%= camelize(principalModelKey) %>: string;

  private readonly destroy$: Subject<void> = new Subject();
  private resizeContainer: ResizeContainer;
  private previous<%= classify(principalModelKey) %>: string;

  public selectedIndex = 0;
  public hideButtonAction = true;
  public tabsDetail<%= classify(secondModelName) %>: Tab[] = [];
  public modeDetail<%= classify(secondModelName) %> = false;
  public liste<%= classify(secondModelName) %>Closed = false;
  public <%= camelize(secondModelKey) %>: string;
  public isLoading = false;
  public detail<%= classify(principalModelName) %>: <%= classify(principalModelName) %> = new <%= classify(principalModelName) %>();

  <% if (principalModelCrud) { %>
    public modeUpdate = false;
    private ligne<%= classify(principalModelName) %>Changed = false;
    private detailLigne<%= classify(principalModelName) %>Diff: <%= classify(principalModelName) %> = new <%= classify(principalModelName) %>();
    private newListe<%= classify(principalModelName) %>: <%= classify(principalModelName) %>Light[] = [];
  <% } %>

  <% if (secondModelCrud) { %>
    public modeCreate<%= classify(secondModelName) %> = false;
  <% } %>

  <% if (principalModelCrud || secondModelCrud) { %>
    public saveButtonDisabled = true;
    public disabledButtonAdd = true;
    public disabledButtonDelete = true;
    public hasCreationRights = false;
    public hasUpdateRights = false;
    public hasDeleteRights = false;
  <% } %>

  constructor(
    private readonly <%= camelize(componentName) %>Service: <%= classify(componentName) %>Service,
    private readonly liste<%= classify(principalModelName) %>Service: Liste<%= classify(principalModelName) %>Service,
    private readonly liste<%= classify(secondModelName) %>Service: Liste<%= classify(secondModelName) %>Service,
    private readonly headerSelectorService: HeaderSelectorService,
    private readonly notificationService: NotificationsService,
    private readonly translate: TranslateService,
    private readonly dialog: MatDialog,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    <% if (principalModelCrud) { %>
    // important : modeUpdate ne sert qu'à savoir si on est sur le fenêtre de création ou sur la fnêtre de détail
    // il ne faut pas la modifier
    this.modeUpdate = !this.modeCreate;
    <% } %>

    <% if (principalModelCrud || secondModelCrud) { %>
    this.hasCreationRights = this.<%= camelize(componentName) %>Service.hasCreationRights;
    this.hasUpdateRights = this.<%= camelize(componentName) %>Service.hasUpdateRights;
    this.hasDeleteRights = this.<%= camelize(componentName) %>Service.hasDeleteRights;
    <% } %>
    this.tabList.forEach(element => (element['disabled'] = false));
    this.liste<%= classify(secondModelName) %>Service.current<%= classify(secondModelKey) %> = null;
    this.tabsDetail<%= classify(secondModelName) %> = this.liste<%= classify(secondModelName) %>Service.context.tabs;

    this.selectedIndex = this.liste<%= classify(principalModelName) %>Service.selectedIndex || 0;

    this.cdr.detectChanges();

    this.liste<%= classify(principalModelName) %>Service.hideButtonActionDetail$
      .pipe(takeUntil(this.destroy$))
      .subscribe((hide: boolean) => (this.hideButtonAction = hide));

    this.liste<%= classify(principalModelName) %>Service.detailLigne<%= classify(principalModelName) %>Open$.pipe(takeUntil(this.destroy$)).subscribe(() => this.closeDetailListe<%= classify(secondModelName) %>());

    this.liste<%= classify(secondModelName) %>Service.detailLigne<%= classify(secondModelName) %>Close$.pipe(takeUntil(this.destroy$)).subscribe(() => this.closeDetailListe<%= classify(secondModelName) %>());
  
    <% if (principalModelCrud || secondModelCrud) { %>
      this.liste<%= classify(secondModelName) %>Service.disabledButtonDelete<%= classify(secondModelName) %>$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isDisabled => (this.disabledButtonDelete = isDisabled));
    <% } %>
  }

  ngOnDestroy(): void {
    this.resizeContainer.stopListener();
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.<%= camelize(principalModelKey) %>) {
      this.showDetail();
    }
  }

  ngAfterViewInit(): void {
    this.resizeContainer = new ResizeContainer('drawerLeftListe<%= classify(secondModelName) %>', 'drawerRightListe<%= classify(secondModelName) %>', 8);
  }

  public showDetail(): void {
    if (this.selectedIndex === 0 && this.previous<%= classify(principalModelKey) %> !== this.<%= camelize(principalModelKey) %>) {
      this.previous<%= classify(principalModelKey) %> = this.<%= camelize(principalModelKey) %>;

      if (this.selectedIndex === 0) {
        this.isLoading = true;
      }

      this.liste<%= classify(principalModelName) %>Service
        .getDetail(this.headerSelectorService.getSelected('site'), this.headerSelectorService.getSelected('do'), this.<%= camelize(principalModelKey) %>)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (detail: <%= classify(principalModelName) %>) => {
            this.detail<%= classify(principalModelName) %> = detail;
            this.isLoading = false;
          },
          () => (this.isLoading = false)
        );
        return;
    }
    <% if (principalModelCrud) { %>
      this.newLigne<%= classify(principalModelName) %>()
    <% } %>
  }

  <% if (principalModelCrud) { %>
  public newLigne<%= classify(principalModelName) %>(): void {
    this.modeCreate = true;
    this.saveButtonDisabled = true;
    this.disabledButtonAdd = true;
    this.detail<%= classify(principalModelName) %> = new <%= classify(principalModelName) %>();
    this.detailLigne<%= classify(principalModelName) %>Diff = cloneDeep(this.detail<%= classify(principalModelName) %>);
    this.isLoading = false;
  }

  public checkValidity(detail<%= classify(principalModelName) %>: <%= classify(principalModelName) %>): void {
    if (detail<%= classify(principalModelName) %>) {
      this.detail<%= classify(principalModelName) %> = cloneDeep(detail<%= classify(principalModelName) %>);

      if (this.detail<%= classify(principalModelName) %>.<%= camelize(principalModelKey) %>) {
        this.saveButtonDisabled = false;
      } else {
        this.saveButtonDisabled = true;
      }

      if (!isEqual(this.detail<%= classify(principalModelName) %>, this.detailLigne<%= classify(principalModelName) %>Diff)) {
        this.ligne<%= classify(principalModelName) %>Changed = true;
        this.<%= camelize(componentName) %>Service.navigationBlocked$.next();
      } else {
        this.ligne<%= classify(principalModelName) %>Changed = false;
      }
    } else {
      this.saveButtonDisabled = true;
    }
  }

  public createLigne<%= classify(principalModelName) %>(): void {
    this.isLoading = true;

    this.liste<%= classify(principalModelName) %>Service
      .create<%= classify(principalModelName) %>(
        this.headerSelectorService.getSelected('site'),
        this.headerSelectorService.getSelected('do'),
        this.detail<%= classify(principalModelName) %>
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        () => {
          this.detailLigne<%= classify(principalModelName) %>Diff = cloneDeep(this.detail<%= classify(principalModelName) %>);
          this.liste<%= classify(principalModelName) %>Service.ligne<%= classify(principalModelName) %>DetailChanged$.next(this.detail<%= classify(principalModelName) %>);

          this.addLigne<%= classify(principalModelName) %>ToList();

          this.modeCreate = false;
          this.disabledButtonAdd = false;
          this.ligne<%= classify(principalModelName) %>Changed = false;
          this.isLoading = false;

          this.notificationService.push(
            '',
            this.translate.instant('<%= touppercase(underscore(moduleI18nName)) %>.<%= touppercase(underscore(componentName)) %>.NOTIFICATION.SUCCESS_CREATE'),
            Level.SUCCESS,
            Type.FOOTER,
            null,
            TIMER_NOTIFICATION,
            false
          );
        },
        () => (this.isLoading = false)
      );
    return;
  }

  private addLigne<%= classify(principalModelName) %>ToList(): void {
    const new<%= classify(principalModelName) %> = new <%= classify(principalModelName) %>Light();
    this.hydrate<%= classify(principalModelName) %>(new<%= classify(principalModelName) %>);
    this.newListe<%= classify(principalModelName) %>.push(new<%= classify(principalModelName) %>);
  }

  public updateLigne<%= classify(principalModelName) %>(): void {
    this.isLoading = true;

    this.liste<%= classify(principalModelName) %>Service
      .updateClient(
        this.headerSelectorService.getSelected('site'),
        this.headerSelectorService.getSelected('do'),
        this.detail<%= classify(principalModelName) %>
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        () => {
          this.detailLigne<%= classify(principalModelName) %>Diff = cloneDeep(this.detail<%= classify(principalModelName) %>);
          this.liste<%= classify(principalModelName) %>Service.ligne<%= classify(principalModelName) %>DetailChanged$.next(this.detail<%= classify(principalModelName) %>);

          this.updateLigne<%= classify(principalModelName) %>List();

          this.isLoading = false;

          this.notificationService.push(
            '',
            this.translate.instant('<%= touppercase(underscore(moduleI18nName)) %>.<%= touppercase(underscore(componentName)) %>.NOTIFICATION.SUCCESS_UPDATE'),
            Level.SUCCESS,
            Type.FOOTER,
            null,
            TIMER_NOTIFICATION,
            false
          );
        },
        () => (this.isLoading = false)
      );
    return;
  }

  private updateLigne<%= classify(principalModelName) %>List(): void {
    if (this.modeUpdate) {
      this.liste<%= classify(principalModelName) %>Service.updateList$.next(this.detail<%= classify(principalModelName) %>);
    } else {
      const ligne1Find = this.newListe<%= classify(principalModelName) %>.find(
        ligne1Search => ligne1Search.<%= camelize(principalModelKey) %>.toUpperCase() === this.detail<%= classify(principalModelName) %>.<%= camelize(principalModelKey) %>.toUpperCase()
      );

      if (ligne1Find) {
        this.hydrate<%= classify(principalModelName) %>(ligne1Find);
      }
    }
  }

  private hydrate<%= classify(principalModelName) %>(<%= camelize(principalModelName) %>: <%= classify(principalModelName) %>Light): void {
    <%= camelize(principalModelName) %>.<%= camelize(principalModelKey) %> = this.detail<%= classify(principalModelName) %>.<%= camelize(principalModelKey) %>;
  }

  private callConfirmChange(andClose = false): void {
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
        this.liste<%= classify(principalModelName) %>Service.cancelForm$.next();
        this.detail<%= classify(principalModelName) %> = cloneDeep(this.detailLigne<%= classify(principalModelName) %>Diff);
        this.ligne<%= classify(principalModelName) %>Changed = false;
        this.modeCreate = !this.modeUpdate;
        this.cdr.detectChanges();
        if (andClose) {
          this.closeDetailListe<%= classify(principalModelName) %>();
        }
      }
    });
  }

  public cancelDetail(): void {
    if (this.ligne<%= classify(principalModelName) %>Changed) {
      this.callConfirmChange();
    } else {
      this.detail<%= classify(principalModelName) %> = cloneDeep(this.detailLigne<%= classify(principalModelName) %>Diff);
      this.ligne<%= classify(principalModelName) %>Changed = false;
      this.modeCreate = !this.modeUpdate;
      this.cdr.detectChanges();
    }
  }

  <% } %>

  public closeDetailListe<%= classify(principalModelName) %>(): void {
    <% if (principalModelCrud) { %>
    if (this.ligne<%= classify(principalModelName) %>Changed) {
      this.callConfirmChange(true);
      return;
    }

    if (this.newListe<%= classify(principalModelName) %>.length) {
      this.liste<%= classify(principalModelName) %>Service.newListChanged$.next(this.newListe<%= classify(principalModelName) %>);
    }
    <% } %>
    this.selectedIndex = 0;
    this.liste<%= classify(principalModelName) %>Service.selectedIndex = 0;
    this.liste<%= classify(principalModelName) %>Service.closeDetail$.next(true);
    this.liste<%= classify(secondModelName) %>Service.current<%= classify(secondModelKey) %> = null;
    this.liste<%= classify(secondModelName) %>Service.currentRowSelect = null;
    this.liste<%= classify(secondModelName) %>Service.currentListe<%= classify(secondModelName) %> = [];
    this.liste<%= classify(secondModelName) %>Service.detailLigne<%= classify(secondModelName) %>Open = false;
  }

  public selectedIndexChange(index: number): void {
    this.selectedIndex = index;
    this.liste<%= classify(principalModelName) %>Service.selectedIndex = index;
    if (this.liste<%= classify(principalModelName) %>Service.selectedIndex === 0) {
      this.liste<%= classify(secondModelName) %>Service.current<%= classify(secondModelKey) %> = null;
      this.liste<%= classify(secondModelName) %>Service.currentRowSelect = null;
      this.liste<%= classify(secondModelName) %>Service.currentListe<%= classify(secondModelName) %> = [];
    }

    this.showDetail();
  }

  public exportListe<%= classify(secondModelName) %>(): void {
    if (this.selectedIndex === 1) {
      this.liste<%= classify(secondModelName) %>Service.exportLignes<%= classify(secondModelName) %>$.next();
    }
  }

  public showHideColumn(): void {
    if (this.selectedIndex === 1) {
      this.liste<%= classify(secondModelName) %>Service.showHideColumnLignes<%= classify(secondModelName) %>$.next();
    }
  }

  public showDetailListe<%= classify(secondModelName) %>(<%= camelize(secondModelKey) %>: string): void {
    this.resizeContainer = new ResizeContainer('drawerLeftListe<%= classify(secondModelName) %>', 'drawerRightListe<%= classify(secondModelName) %>', 8);
    this.resizeContainer.startListener();
    this.modeDetail<%= classify(secondModelName) %> = true;
    this.<%= camelize(secondModelKey) %> = <%= camelize(secondModelKey) %>;
    this.tabList.forEach(element => {
      if (element.fieldId !== '<%= camelize(secondModelName) %>') {
        element['disabled'] = true;
      }
    });
  }

  public closeListe<%= classify(secondModelName) %>(): void {
    this.liste<%= classify(secondModelName) %>Closed = true;
    this.liste<%= classify(secondModelName) %>Service.ligne<%= classify(secondModelName) %>Close$.next();
  }

  public openListe<%= classify(secondModelName) %>(): void {
    this.liste<%= classify(secondModelName) %>Closed = false;
    this.liste<%= classify(secondModelName) %>Service.ligne<%= classify(secondModelName) %>Open$.next();
  }

  public closeDetailListe<%= classify(secondModelName) %>(): void {
    <% if (secondModelCrud) { %>
      this.modeCreate<%= classify(secondModelName) %> = false;
    <% } %>
    this.modeDetail<%= classify(secondModelName) %> = false;
    this.liste<%= classify(secondModelName) %>Closed = false;
    this.liste<%= classify(secondModelName) %>Service.ligne<%= classify(secondModelName) %>Open$.next();
    this.tabList.forEach(element => (element['disabled'] = false));
    this.cdr.detectChanges();
  }

  <% if (secondModelCrud) { %>
  public newLigne<%= classify(secondModelName) %>(): void {
    this.cdr.detectChanges();
    this.modeCreate<%= classify(secondModelName) %> = true;
    this.liste<%= classify(secondModelName) %>Service.modeCreate = true;
    this.liste<%= classify(secondModelName) %>Service.newLigne$.next();
  }

  public deleteLigne<%= classify(secondModelName) %>(): void {
    this.cdr.detectChanges();
    this.liste<%= classify(secondModelName) %>Service.deleteLigne$.next();
  }
  <% } %>
}
