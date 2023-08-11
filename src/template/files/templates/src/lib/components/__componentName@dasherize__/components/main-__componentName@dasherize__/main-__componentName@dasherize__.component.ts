import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Criteria, CriteriaFormControl } from '@dsia/criteria';
import { DsiaInputsService } from '@dsia/inputs';
import { MenuItem, MenuNavigationService } from '@dsia/menu-navigation';
import { NavigationRetourService } from '@dsia/navigation-retour';
import { Level, NotificationsService, Type } from '@dsia/notifications';
import { ContextService, Header, Tab, TypeContext } from '@dsia/wms-common';
import { User, UserService, HeaderSelectorService } from '@lap';
import { TranslateService } from '@ngx-translate/core';
import { cloneDeep } from 'lodash';
import { Observable, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { ResizeContainer } from '../../../../services/resize-container';
import { TIMER_NOTIFICATION } from '../../../../const';
import { Liste<%= classify(principalModelName) %>Service } from '../../services/liste-<%= dasherize(principalModelName) %>.service';
import { Liste<%= classify(secondModelName) %>Service } from '../../services/liste-<%= dasherize(secondModelName) %>.service';
import { <%= classify(componentName) %>Service } from '../../services/<%= dasherize(componentName) %>.service';
import { ListeAideService } from './../../../../services/liste-aide.service';

@Component({
  selector: 'lib-main-<%= dasherize(componentName) %>',
  templateUrl: './main-<%= dasherize(componentName) %>.component.html',
  styleUrls: [
    '../../../../../assets/style/main.component.scss',
    './main-<%= dasherize(componentName) %>.component.scss',
  ],
})
export class Main<%= classify(componentName) %>Component implements OnInit, OnDestroy {
  
 
  private readonly destroy$: Subject<void> = new Subject();
  private user: User;
  private resizeContainer: ResizeContainer;

  public isLoading = false;
  public messageNotification = '';
  public isCriteriaLoaded = false;

  public canBeLoaded = false;
  public criteria: Array<Criteria> = new Array<Criteria>();
  public requiredCriteria: Array<Criteria> = new Array<Criteria>();
  public advancedCriteria: Array<Criteria> = new Array<Criteria>();
  public criteriaControls: Array<CriteriaFormControl> = new Array<CriteriaFormControl>();

  public arrayHeader: Header[] = [];
  public tabs: Tab[] = [];
  public <%= camelize(principalModelKey) %>: string;

  public modeDetail = false;

  <% if (principalModelCrud) { %>
    public modeCreate = false;
  <% } %>

  public liste<%= classify(principalModelName) %>Closed = false;

  <% if (hasLinkFrom) { %>
    public fromLinkLevel1 = false;
    public fromLinkLevel2 = false;
  <% } %>
  public criteriaDisabled = false;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly notificationService: NotificationsService,
    private readonly translate: TranslateService,
    private readonly contextService: ContextService,
    private readonly userService: UserService,
    private readonly <%= camelize(componentName) %>Service: <%= classify(componentName) %>Service,
    private readonly listeAideService: ListeAideService,
    private readonly inputsService: DsiaInputsService,
    private readonly liste<%= classify(principalModelName) %>Service: Liste<%= classify(principalModelName) %>Service,
    private readonly liste<%= classify(secondModelName) %>Service: Liste<%= classify(secondModelName) %>Service,
    private readonly menuNavigationService: MenuNavigationService,
    private readonly headerSelectorService: HeaderSelectorService,
    <% if (hasLinkTo) { %>private readonly navigationRetourService: NavigationRetourService,<% } %>
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.initComponent();
    <% if (principalModelCrud) { %>
    this.liste<%= classify(principalModelName) %>Service.create<%= classify(principalModelName) %>$.pipe(takeUntil(this.destroy$)).subscribe(() => this.create<%= classify(principalModelName) %>());
    <% } %>
    this.liste<%= classify(principalModelName) %>Service.closeDetail$.pipe(takeUntil(this.destroy$)).subscribe(() => this.closeDetail());
    this.liste<%= classify(principalModelName) %>Service.detailLigne<%= classify(principalModelName) %>Close$.pipe(takeUntil(this.destroy$)).subscribe(() => (this.liste<%= classify(principalModelName) %>Closed = true));
    this.liste<%= classify(principalModelName) %>Service.detailLigne<%= classify(principalModelName) %>Open$.pipe(takeUntil(this.destroy$)).subscribe(() => (this.liste<%= classify(principalModelName) %>Closed = false));
    this.<%= camelize(componentName) %>Service.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isLoading: boolean) => (this.isLoading = isLoading));

    /* clic sur le menu de la fonction pour réinitialiser l'écran */
    this.menuNavigationService.beforeNavigateToSource.pipe(takeUntil(this.destroy$)).subscribe((menuItem: MenuItem) => {
      <% if (hasLinkTo) { %>this.navigationRetourService.clearPileNavigationList();<% } %>
      if (this.router.url.startsWith(menuItem.link)) {
        this.initComponent(true);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.resizeContainer) {
      this.resizeContainer.stopListener();
    }

    this.destroy$.next();
    this.destroy$.complete();
  }

  private initComponent(clear = false): void {
    <% if (hasLinkFrom) { %>
    this.fromLinkLevel1 = false;
    this.fromLinkLevel2 = false;
    <% } %>
    this.isCriteriaLoaded = false;
    this.canBeLoaded = false;
    this.criteriaDisabled = false;
    this.modeDetail = false;
    <% if (principalModelCrud) { %>
      this.modeCreate = false;
    <% } %>
    this.criteriaControls = new Array<CriteriaFormControl>();
    <% if (hasLinkTo) { %>
    this.navigationRetourService.initPileNavigation(FONCTION_GENERIC);
    <% } %>
    this.route.queryParams.pipe(take(1)).subscribe((params: Params) => {
      <% if (hasLinkFrom) { %>
      if (!clear) {
        this.fromLinkLevel1 = !!params['fromLinkLevel1'];
        this.fromLinkLevel2 = !!params['fromLinkLevel2'];
        this.<%= camelize(principalModelKey) %> = params['<%= camelize(principalModelKey) %>'] || '';
      }
      <% } %>
      this.messageNotification = '<%= touppercase(underscore(moduleI18nName)) %>.<%= touppercase(underscore(componentName)) %>.NOTIFICATION.CURRENT_LOADING';
      this.isLoading = true;
      this.userService.getUserConnected().then((user: User) => {
        this.user = user;
        this.initList();
      });
    });
  }

  /* Initialisation des différentes listes de la fonction */
  private initList(): void {
    this.<%= camelize(componentName) %>Service
      .getInitData(this.headerSelectorService.getSelected('site'), this.headerSelectorService.getSelected('do'))
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        () => this.initContextualisation(),
        () => {
          this.isLoading = false;
          this.notificationService.push(
            '',
            this.translate.instant('<%= touppercase(underscore(moduleI18nName)) %>.<%= touppercase(underscore(componentName)) %>.NOTIFICATION.ERROR_INIT_DATA'),
            Level.ERROR,
            Type.FOOTER,
            null,
            TIMER_NOTIFICATION
          );
        }
      );
  }

  /* Chargement des critères, des entêtes de colonne et des onglets
     depuis les fichiers de contexte  */
  private initContextualisation(): void {
    this.contextService
      .getContext({
        userSite: this.headerSelectorService.getSelected('site'),
        userDo: this.headerSelectorService.getSelected('do'),
        contextPath: 'projects/<%= moduleGitName %>/src/assets/context',
        screen: '<%= camelize(componentName) %><%= classify(principalModelName) %>',
      })
      .then((context: TypeContext) => this.afterGetContext(context));

    this.contextService
      .getContext({
        userSite: this.headerSelectorService.getSelected('site'),
        userDo: this.headerSelectorService.getSelected('do'),
        contextPath: 'projects/<%= moduleGitName %>/src/assets/context',
        screen: '<%= camelize(componentName) %><%= classify(secondModelName) %>',
      })
      .then((context: TypeContext) => (this.liste<%= classify(secondModelName) %>Service.context = context));
  }

  private afterGetContext(context: TypeContext): void {
    this.initData(context);
    this.cdr.detectChanges();
  }

  /* Initialisation des critères, des entêtes de colonne et des onglets
     à partir de la contextualisation  */
  private initData(response: TypeContext): void {
    if (response && response.criteriaField?.length) {
      this.criteria = response.criteriaField;

      this.requiredCriteria = this.criteria.filter((criteria: Criteria) => !criteria.advanced);
      this.advancedCriteria = this.criteria.filter((criteria: Criteria) => criteria.advanced);

      <% if (hasLinkTo) { %>if (this.navigationRetourService.getCriteriaPileNavigation().length) {
        this.initPreviousCriteria();
      } else {<% } %>
        this.initDefautValue();
      <% if (hasLinkTo) { %>}<% } %>
    }

    if (response && response.tabs?.length) {
      const arrayTab = cloneDeep(response.tabs);
      this.tabs = arrayTab.sort((a, b) => a.order - b.order);
    }

    if (response && response.arrayHeader?.length) {
      const arrayHeader = cloneDeep(response.arrayHeader);
      this.arrayHeader = arrayHeader.sort((a, b) => a.order - b.order);
    }

    this.canBeLoaded = true;
    this.isLoading = false;

    this.initDataList();

    window.setTimeout(function () {
      const firstElement = document.getElementById('<%= camelize(principalModelKey) %>Criteria');
      if (firstElement) {
        firstElement.focus();
      }
    }, 0);

    <% if (hasLinkTo) { %>
    if (this.navigationRetourService.getCriteriaPileNavigation().length<% if (hasLinkFrom) { %> || this.fromLinkLevel1<% } %>) {
      this.search();
    }
    <% } %>
    this.cdr.detectChanges();
  }

  <% if (hasLinkTo) { %>
  private initPreviousCriteria(): void {
    this.navigationRetourService.getCriteriaPileNavigation().forEach(crit => {
      if (crit.value !== '' || crit.value.length) {
        this.setInputValue(crit.fieldId, crit.value);
      }
    });

    <% if (hasLinkFrom) { %> this.criteriaDisabled = this.fromLinkLevel1 || this.fromLinkLevel2;<% } %>
  }
  <% } %>
  /* Chargements des datas dans le différentes listes  */
  private initDataList(): void {
    /*this.setCriteriaDataList(this.<%= camelize(componentName) %>Service.listeMono, 'codeMono');
    this.setCriteriaDataList(this.<%= camelize(componentName) %>Service.listeMulti, 'codeMulti');*/

    this.cdr.detectChanges();
  }

  private setCriteriaDataList(dataList: any[], fieldId: string): void {
    const criteria = this.criteria.filter((element: Criteria) => element.fieldId === fieldId);
    if (criteria.length) {
      criteria[0].listOptions.data = dataList;
    }
  }

  /* Critères : initialisation des valeurs par défaut*/
  private initDefautValue(): void {
    <% if (hasLinkFrom) { %>
    if (this.fromLinkLevel1 || this.fromLinkLevel2) {
      this.criteriaControls = [];
      if (this.<%= camelize(principalModelKey) %>) {
        this.setInputValue('<%= camelize(principalModelKey) %>', this.<%= camelize(principalModelKey) %>);
      }
      this.criteriaDisabled = true;
    } else {<% } %>
      this.setInputValue('dateDebut', new Date());

      /*const defautValue = this.<%= camelize(componentName) %>Service.listeMono.find(mono => mono.default === true);
      if (defautValue) {
        this.setInputValue('codeMono', defautValue.codeMono);
      }*/
    <% if (hasLinkFrom) { %>}<% } %>
  }

  /* Reset du formulaire de critère : on remet les valeurs par défaut*/
  public onFormReset(): void {
    this.cdr.detectChanges();
    this.updateDefautValue('dateDebut', new Date());

    /*const defautValue = this.<%= camelize(componentName) %>Service.listeMono.find(mono => mono.default === true);
    if (defautValue) {
      this.updateDefautValue('codeMono', defautValue.codeMono);
    }*/
  }

  private setInputValue(fieldId: string, value: any): void {
    const criteria = this.criteria.filter((crit: Criteria) => crit.fieldId === fieldId);

    if (criteria.length) {
      this.criteriaControls.push({
        criteria: criteria[0],
        value: value,
      });
    }
  }

  private updateDefautValue(fieldId: string, value: any): void {
    const criteria = this.criteriaControls.find(control => control.criteria.fieldId === fieldId);

    if (criteria) {
      criteria.value = value;
    }
  }

  /*  Action suite au clic sur le bouton de recherche*/
  public onSearch(): void {
    <% if (hasLinkTo) { %>
    this.navigationRetourService.setCriteriaPileNavigation([]);
    this.navigationRetourService.removeLevelInfoListPileNavigation(1);
    this.navigationRetourService.removeLevelInfoListPileNavigation(2);
    <% } %>
    this.search();
  }

  private search(): void {
    this.liste<%= classify(secondModelName) %>Service.detailLigne<%= classify(secondModelName) %>Open = false;
    this.liste<%= classify(principalModelName) %>Closed = false;
    this.liste<%= classify(secondModelName) %>Service.detailLigne<%= classify(secondModelName) %>Close$.next();
    this.liste<%= classify(principalModelName) %>Service.selectedIndex = 0;
    this.liste<%= classify(secondModelName) %>Service.selectedIndex = 0;
    this.liste<%= classify(principalModelName) %>Service.closeDetail$.next(false);
    this.<%= camelize(componentName) %>Service.callSearch$.next();
  }

  /*  Action suite au clic sur un critère de type liste popin */
  public onDialogSearch(event): void {
    /*let service = null;
    if (event.fieldId === 'codePopinMono') {
      service = this.listeAideService.getPopinMono(this.headerSelectorService.getSelected('site'), this.headerSelectorService.getSelected('do'));
    }

    if (event.fieldId === 'codePopinMulti') {
      service = this.listeAideService.getPopinMulti(this.headerSelectorService.getSelected('site'), this.headerSelectorService.getSelected('do'));
    }

    this.callServiceList(service, event.fieldId);*/
  }

  /*  Appel du service correspondant au critère de type liste popin */
  private callServiceList(service: Observable<any>, fieldId: string): void {
    if (service) {
      service.pipe(takeUntil(this.destroy$)).subscribe(
        res => {
          this.setCriteriaDataList(res, fieldId);
          this.inputsService.isListDataLoaded.emit({ fieldId: fieldId, data: res as any });
        },
        () => {
          this.inputsService.isListDataLoaded.emit({ fieldId: fieldId, data: [] });
          this.notificationService.push(
            '',
            this.translate.instant('<%= touppercase(underscore(moduleI18nName)) %>.<%= touppercase(underscore(componentName)) %>.NOTIFICATION.ERROR_LOAD_LIST'),
            Level.ERROR,
            Type.FOOTER,
            null,
            TIMER_NOTIFICATION
          );
        }
      );
    }
  }

  /*  Evènement Suite à un changement de valeur d'un des critère  */
  public onCriteriaControlsChange(): void {
    // action à ajouter
  }

  /*  Affichage du détail N1 d'une ligne  */
  public showDetail(<%= camelize(principalModelKey) %>: string): void {
    this.<%= camelize(principalModelKey) %> = <%= camelize(principalModelKey) %>;
    this.modeDetail = true;
    this.liste<%= classify(principalModelName) %>Closed = false;
    this.resizeContainer = new ResizeContainer('drawerLeftListe<%= classify(principalModelName) %>', 'drawerRightDetailListe<%= classify(principalModelName) %>');
    this.resizeContainer.startListener();
  }

  /*  Fermeture du détail N1  */
  private closeDetail(): void {
    this.modeDetail = false;
    this.liste<%= classify(principalModelName) %>Closed = false;

    <% if (principalModelCrud) { %>
      if (this.modeCreate) {
        this.modeCreate = false;
        this.cdr.detectChanges();
      }
    <% } %>
  }

  <% if (principalModelCrud) { %>
  private create<%= classify(principalModelName) %>(): void {
    this.modeCreate = true;
    this.modeDetail = false;
    this.liste<%= classify(principalModelName) %>Closed = false;
  }
  <% } %>
}
