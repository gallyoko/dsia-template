import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTabGroup } from '@angular/material/tabs';
import { Level, NotificationsService, Type } from '@dsia/notifications';
import { Tab } from '@dsia/wms-common';
import { HeaderSelectorService, User } from '@lap';
import { TranslateService } from '@ngx-translate/core';
import { cloneDeep, isEqual } from 'lodash';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TIMER_NOTIFICATION } from '../../../../const';
import { CommonService } from '../../../../services/common.service';
import { ReverseDialogValidationCancelComponent } from '../../../dialog-validation-cancel/dialog-validation-cancel.component';
import { <%= classify(secondModelName) %>, <%= classify(secondModelName) %>Light } from '../../model/<%= dasherize(secondModelName) %>.model';
import { Liste<%= classify(secondModelName) %>Service } from '../../services/liste-<%= dasherize(secondModelName) %>.service';
import { <%= classify(componentName) %>Service } from '../../services/<%= dasherize(componentName) %>.service';
  
  @Component({
    selector: 'lib-detail-<%= dasherize(secondModelName) %>',
    templateUrl: './detail-<%= dasherize(secondModelName) %>.component.html',
    styleUrls: ['../../../../../assets/style/detail-n2.component.scss', './detail-<%= dasherize(secondModelName) %>.component.scss'],
  })
  export class Detail<%= classify(secondModelName) %>Component  implements OnInit, OnDestroy, OnChanges {
    @Input() <%= camelize(secondModelKey) %>: string;
    @Input() <%= camelize(principalModelKey) %>: string;
    @Input() modeCreate = false;
    @Input() user: User;
    @Output() closeDetailListe<%= classify(secondModelName) %>: EventEmitter<void> = new EventEmitter();
  
    private previous<%= classify(secondModelKey) %>: string;
  
    private readonly destroy$: Subject<void> = new Subject();
  
    public isLoading = false;
    public messageNotification: string;
    public <%= camelize(secondModelName) %>: <%= classify(secondModelName) %> = new <%= classify(secondModelName) %>();
    public selectedIndex = 0;
    public hideButtonAction = true;
    public liste<%= classify(secondModelName) %>Closed = false;
    public tabs: Tab[] = [];
  
    public title = '';
    public <%= camelize(secondModelName) %>Changed = false;
  
    private <%= camelize(secondModelName) %>Diff: <%= classify(secondModelName) %> = new <%= classify(secondModelName) %>();
    <% if (secondModelCrud) { %>
    public modeUpdate = false;
    public saveButtonDisabled = true;
    public disabledButtonAdd = true;
  
    public hasCreationRights = false;
    public hasUpdateRights = false;
    public hasDeleteRights = false;
  
    private newListe<%= classify(secondModelName) %>: <%= classify(secondModelName) %>Light[] = [];

    <% } %>
  
    @ViewChild('tabgroup') tabGroup: MatTabGroup;
  
    constructor(
      private readonly <%= camelize(componentName) %>Service: <%= classify(componentName) %>Service,
      private readonly liste<%= classify(secondModelName) %>Service: Liste<%= classify(secondModelName) %>Service,
      private readonly commonService: CommonService,
      private readonly cdr: ChangeDetectorRef,
      private readonly headerSelectorService: HeaderSelectorService,
      private readonly notificationService: NotificationsService,
      private readonly translate: TranslateService,
      private readonly dialog: MatDialog
    ) {}
  
    ngOnInit(): void {
      <% if (secondModelCrud) { %>
      // important : modeUpdate ne sert qu'à savoir si on est sur le fenêtre de création ou sur la fnêtre de détail
      // il ne faut pas la modifier
      this.modeUpdate = !this.modeCreate;

      this.checkRights();
      <% } %>
  
      this.tabs = [
        {
          fieldId: 'general',
          label: this.translate.instant('<%= touppercase(underscore(moduleI18nName)) %>.<%= touppercase(underscore(componentName)) %>.TABS.GENERAL'),
          order: 1,
        },
      ];
  
      this.selectedIndex = this.liste<%= classify(secondModelName) %>Service.selectedIndex || 0;
  
      this.setTitle();
  
      <% if (secondModelCrud) { %>
      if (this.modeCreate) {
        this.liste<%= classify(secondModelName) %>Service.selectedIndex = 0;
        this.selectedIndex = this.liste<%= classify(secondModelName) %>Service.selectedIndex;
      } else {
        this.selectedIndex = this.liste<%= classify(secondModelName) %>Service.selectedIndex || 0;
      }
      <% } %>
  
      this.liste<%= classify(secondModelName) %>Service.ligne<%= classify(secondModelName) %>Close$.pipe(takeUntil(this.destroy$)).subscribe(() => (this.liste<%= classify(secondModelName) %>Closed = true));
  
      this.liste<%= classify(secondModelName) %>Service.ligne<%= classify(secondModelName) %>Open$.pipe(takeUntil(this.destroy$)).subscribe(() => (this.liste<%= classify(secondModelName) %>Closed = false));
  
      <% if (secondModelCrud) { %>
      this.liste<%= classify(secondModelName) %>Service.ligne<%= classify(secondModelName) %>DetailChanged$.pipe(takeUntil(this.destroy$)).subscribe((<%= camelize(secondModelName) %>: <%= classify(secondModelName) %>) => {
        this.checkValidity(<%= camelize(secondModelName) %>);
      });

      this.liste<%= classify(secondModelName) %>Service.newLigne$.pipe(takeUntil(this.destroy$)).subscribe(() => this.newLigne());
      <% } %>
  
      this.cdr.detectChanges();
    }
  
    ngOnChanges(changes: SimpleChanges): void {
      if (this.<%= camelize(secondModelKey) %>) {
        if (this.<%= camelize(secondModelKey) %> !== this.previous<%= classify(secondModelKey) %>) {
          this.loadDetail<%= classify(secondModelName) %>();
        }
      }
    }
  
    ngOnDestroy(): void {
      this.destroy$.next();
      this.destroy$.complete();
    }
  
    private setTitle(): void {
      <% if (secondModelCrud) { %>
      this.title = this.modeUpdate
        ? this.translate.instant('<%= touppercase(underscore(moduleI18nName)) %>.<%= touppercase(underscore(componentName)) %>.<%= touppercase(underscore(secondModelName)) %>.TITLE.DETAIL', {
            <%= camelize(principalModelKey) %>: this.<%= camelize(principalModelKey) %>,
            <%= camelize(secondModelKey) %>: this.<%= camelize(secondModelKey) %>,
          })
        : this.translate.instant('<%= touppercase(underscore(moduleI18nName)) %>.<%= touppercase(underscore(componentName)) %>.<%= touppercase(underscore(secondModelName)) %>.TITLE.CREATION', { <%= camelize(principalModelKey) %>: this.<%= camelize(principalModelKey) %> });
      <% } else { %>
          this.title = this.translate.instant('<%= touppercase(underscore(moduleI18nName)) %>.<%= touppercase(underscore(componentName)) %>.<%= touppercase(underscore(secondModelName)) %>.TITLE.DETAIL', {
            <%= camelize(principalModelKey) %>: this.<%= camelize(principalModelKey) %>,
            <%= camelize(secondModelKey) %>: this.<%= camelize(secondModelKey) %>,
          })
      <% } %>
    }
  
    <% if (secondModelCrud) { %>
    private checkRights(): void {
      this.hasCreationRights = this.<%= camelize(componentName) %>Service.hasCreationRights;
      this.hasUpdateRights = this.<%= camelize(componentName) %>Service.hasUpdateRights;
      this.hasDeleteRights = this.<%= camelize(componentName) %>Service.hasDeleteRights;
    }
  
    public checkValidity(<%= camelize(secondModelName) %>: <%= classify(secondModelName) %>): void {
      if (<%= camelize(secondModelName) %>) {
        this.<%= camelize(secondModelName) %> = cloneDeep(<%= camelize(secondModelName) %>);
  
        if (this.<%= camelize(secondModelName) %>.<%= camelize(secondModelKey) %>) {
          this.saveButtonDisabled = false;
        } else {
          this.saveButtonDisabled = true;
        }
  
        if (!isEqual(this.<%= camelize(secondModelName) %>, this.<%= camelize(secondModelName) %>Diff)) {
          this.<%= camelize(secondModelName) %>Changed = true;
          this.<%= camelize(componentName) %>Service.navigationBlocked$.next();
          this.cdr.detectChanges();
        } else {
          this.<%= camelize(secondModelName) %>Changed = false;
        }
      } else {
        this.saveButtonDisabled = true;
      }
    }
  <% } %>

    private loadDetail<%= classify(secondModelName) %>(): void {
      <% if (secondModelCrud) { %>if (!this.modeCreate) { <% } %>
        this.isLoading = true;
        this.cdr.detectChanges();
        this.liste<%= classify(secondModelName) %>Service
          .getDetail<%= classify(secondModelName) %>(
            this.headerSelectorService.getSelected('site'),
            this.headerSelectorService.getSelected('do'),
            this.<%= camelize(principalModelKey) %>,
            this.<%= camelize(secondModelKey) %>
          )
          .pipe(takeUntil(this.destroy$))
          .subscribe(
            (<%= camelize(secondModelName) %>: <%= classify(secondModelName) %>) => {
              this.<%= camelize(secondModelName) %> = <%= camelize(secondModelName) %>;
              this.previous<%= classify(secondModelKey) %> = <%= camelize(secondModelName) %>?.<%= camelize(secondModelKey) %>;
              this.<%= camelize(secondModelName) %>Diff = cloneDeep(<%= camelize(secondModelName) %>);
              this.cdr.detectChanges();
              this.isLoading = false;
            },
            () => (this.isLoading = false)
          );
          <% if (secondModelCrud) { %>}<% } %>
    }

    
  public onCloseDetail<%= classify(secondModelName) %>(): void {
    <% if (secondModelCrud) { %>
    if (this.<%= camelize(secondModelName) %>Changed) {
      this.callConfirmChange('cancel', null, true);
    } else {
      this.liste<%= classify(secondModelName) %>Service.detailLigne<%= classify(secondModelName) %>Open = false;
        this.liste<%= classify(secondModelName) %>Service.modeCreate = false;
        this.closeDetailListe<%= classify(secondModelName) %>.next();
        this.liste<%= classify(secondModelName) %>Service.detailLigne<%= classify(secondModelName) %>Close$.next();
        this.selectedIndex = 0;
        this.liste<%= classify(secondModelName) %>Service.selectedIndex = 0;
        if (this.newListe<%= classify(secondModelName) %>.length) {
          this.liste<%= classify(secondModelName) %>Service.newListChanged$.next(this.newListe<%= classify(secondModelName) %>);
        }
    }
    <% } else { %>
      this.liste<%= classify(secondModelName) %>Service.detailLigne<%= classify(secondModelName) %>Open = false;
      this.closeDetailListe<%= classify(secondModelName) %>.next();
      this.liste<%= classify(secondModelName) %>Service.detailLigne<%= classify(secondModelName) %>Close$.next();
      this.selectedIndex = 0;
      this.liste<%= classify(secondModelName) %>Service.selectedIndex = 0;
    <% } %>
  }

  public selectedIndexChange(index: number): void {
    this.selectedIndex = index;
    this.liste<%= classify(secondModelName) %>Service.selectedIndex = index;
  }

  <% if (secondModelCrud) { %>
  public newLigne(): void {
    this.modeCreate = true;
    this.liste<%= classify(secondModelName) %>Service.modeCreate = true;
    this.modeUpdate = !this.modeCreate;
    this.saveButtonDisabled = true;
    this.disabledButtonAdd = true;
    this.<%= camelize(secondModelName) %> = new <%= classify(secondModelName) %>();
    this.<%= camelize(secondModelName) %>Diff = cloneDeep(this.<%= camelize(secondModelName) %>);
    this.liste<%= classify(secondModelName) %>Service.ligne<%= classify(secondModelName) %>DetailChanged$.next(this.<%= camelize(secondModelName) %>);
    this.selectedIndex = 0;
    this.isLoading = false;
  }

  public createLigne(): void {
    this.messageNotification = '<%= touppercase(underscore(moduleI18nName)) %>.<%= touppercase(underscore(componentName)) %>.NOTIFICATION.CURRENT_SAVING';
    this.isLoading = true;

    this.liste<%= classify(secondModelName) %>Service
      .create<%= classify(secondModelName) %>(
        this.headerSelectorService.getSelected('site'),
        this.headerSelectorService.getSelected('do'),
        this.<%= camelize(principalModelKey) %>,
        this.<%= camelize(secondModelName) %>
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        () => {
          this.<%= camelize(secondModelName) %>Diff = cloneDeep(this.<%= camelize(secondModelName) %>);
          this.liste<%= classify(secondModelName) %>Service.ligne<%= classify(secondModelName) %>DetailChanged$.next(this.<%= camelize(secondModelName) %>);

          this.addLigneToList();

          this.modeCreate = false;
          this.disabledButtonAdd = false;
          this.<%= camelize(secondModelName) %>Changed = false;
          this.isLoading = false;

          this.notificationService.push(
            '',
            this.translate.instant('<%= touppercase(underscore(moduleI18nName)) %>.<%= touppercase(underscore(componentName)) %>.NOTIFICATION.SUCCESS_CREATE_PLF'),
            Level.SUCCESS,
            Type.FOOTER,
            null,
            TIMER_NOTIFICATION
          );
        },
        () => (this.isLoading = false)
      );
    return;
  }

  private addLigneToList(): void {
    const newLigne = new <%= classify(secondModelName) %>Light();

    this.hydratePlateforme(newLigne);

    this.newListe<%= classify(secondModelName) %>.push(newLigne);
  }

  private hydratePlateforme(<%= camelize(secondModelName) %>Light: <%= classify(secondModelName) %>Light): void {
    <%= camelize(secondModelName) %>Light.<%= camelize(secondModelKey) %> = this.<%= camelize(secondModelName) %>.<%= camelize(secondModelKey) %>;
  }

  public updateLigne(): void {
    this.messageNotification = '<%= touppercase(underscore(moduleI18nName)) %>.<%= touppercase(underscore(componentName)) %>.NOTIFICATION.CURRENT_SAVING';
    this.isLoading = true;

    this.liste<%= classify(secondModelName) %>Service
      .update<%= classify(secondModelName) %>(
        this.headerSelectorService.getSelected('site'),
        this.headerSelectorService.getSelected('do'),
        this.<%= camelize(principalModelKey) %>,
        this.<%= camelize(secondModelName) %>
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        () => {
          this.<%= camelize(secondModelName) %>Diff = cloneDeep(this.<%= camelize(secondModelName) %>);
          this.liste<%= classify(secondModelName) %>Service.ligne<%= classify(secondModelName) %>DetailChanged$.next(this.<%= camelize(secondModelName) %>);

          this.updateLigneList();

          this.isLoading = false;

          this.notificationService.push(
            '',
            this.translate.instant('<%= touppercase(underscore(moduleI18nName)) %>.<%= touppercase(underscore(componentName)) %>.NOTIFICATION.SUCCESS_UPDATE_PLF'),
            Level.SUCCESS,
            Type.FOOTER,
            null,
            TIMER_NOTIFICATION
          );
        },
        () => (this.isLoading = false)
      );
    return;
  }

  private updateLigneList(): void {
    if (this.modeUpdate) {
      this.liste<%= classify(secondModelName) %>Service.updateList$.next(this.<%= camelize(secondModelName) %>);
    } else {
      const ligne1Find = this.newListe<%= classify(secondModelName) %>.find(
        ligne1Search => ligne1Search.<%= camelize(secondModelKey) %>.toUpperCase() === this.<%= camelize(secondModelName) %>.<%= camelize(secondModelKey) %>.toUpperCase()
      );

      if (ligne1Find) {
        this.hydratePlateforme(ligne1Find);
      }
    }
  }

  private callConfirmChange(reason?: 'cancel' | 'switchTab', switchTabSettings?, andClose = false): void {
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

        this.liste<%= classify(secondModelName) %>Service.cancelForm$.next();
        this.<%= camelize(secondModelName) %> = cloneDeep(this.<%= camelize(secondModelName) %>Diff);
        this.<%= camelize(secondModelName) %>Changed = false;

        if (reason === 'switchTab') {
          this.tabGroup.selectedIndexChange.next(switchTabSettings.index);
        }

        if (andClose) {
          this.modeCreate = false;
          this.liste<%= classify(secondModelName) %>Service.modeCreate = this.modeCreate;
          this.closeDetailListe<%= classify(secondModelName) %>.next();
        }
      }
    });
  }
  

  public cancelDetail(): void {
    if (this.<%= camelize(secondModelName) %>Changed) {
      this.callConfirmChange();
    } else {
      this.<%= camelize(secondModelName) %> = cloneDeep(this.<%= camelize(secondModelName) %>Diff);
      this.<%= camelize(secondModelName) %>Changed = false;
      this.modeCreate = !this.modeUpdate;
    }
  }
  <% } %>
  }