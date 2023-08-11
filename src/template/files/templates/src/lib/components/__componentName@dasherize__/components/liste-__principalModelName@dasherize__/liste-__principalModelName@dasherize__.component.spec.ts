import { ComponentFixture, TestBed } from '@angular/core/testing';

import { APP_BASE_HREF } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DsiaCriteriaService } from '@dsia/criteria';
import { MenuNavigationService } from '@dsia/menu-navigation';
import { ContextService, GlobalVariableService } from '@dsia/wms-common';
import { User, UserService } from '@lap';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { AppModule } from 'src/app/app.module';
import { <%= classify(moduleLibName) %>Module } from '../../../../<%= dasherize(moduleLibName) %>.module';
import { Mock } from '../../../../mock';
import { USER_SERVICE_OPTIONS, defaultUserServiceOptions } from '../../../../mocks/services-utils.mock';
import { UserServiceMock } from '../../../../mocks/user-service.mock';
import { <%= classify(componentName) %>Module } from '../../<%= dasherize(componentName) %>.module';
import { Liste<%= classify(principalModelName) %>Component } from './liste-<%= dasherize(principalModelName) %>.component';

const context = {
  criteriaField: [],
  tabs: [],
  arrayHeader: [],
  detailLabels: [],
  criteria: [],
};

const spyContextService = jasmine.createSpyObj('ContextService', ['getContext']);
spyContextService.getContext.and.returnValue(Promise.resolve(context));

const user = new User();
user.context = {
  idsite: 'idsite',
};
user.language = 'fr';
user['authorities'] = [
  {
    authority: 'ROLE_CONFIGURATOR',
  },
];

const spyDsiaCriteriaService = jasmine.createSpyObj('DsiaCriteriaService', [
  'defineIsKeyFieldSearch',
  'checkFormValidity',
]);
spyDsiaCriteriaService.defineIsKeyFieldSearch.and.returnValue(false);
spyDsiaCriteriaService.checkFormValidity.and.returnValue(true);

describe('Liste<%= classify(principalModelName) %>Component', () => {
  let component: Liste<%= classify(principalModelName) %>Component;
  let fixture: ComponentFixture<Liste<%= classify(principalModelName) %>Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Liste<%= classify(principalModelName) %>Component],
      imports: [AppModule, <%= classify(moduleLibName) %>Module, TranslateModule.forChild(), <%= classify(componentName) %>Module],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: APP_BASE_HREF, useValue: '/' },
        { provide: MenuNavigationService },
        { provide: UserService, useValue: Mock.getSpyUserService() },
        { provide: ContextService, useValue: spyContextService },
        { provide: DsiaCriteriaService, useValue: spyDsiaCriteriaService },
        { provide: GlobalVariableService, useValue: Mock.getSpyVariableGlobaleService() },
        { provide: USER_SERVICE_OPTIONS, useValue: defaultUserServiceOptions },
        { provide: UserService, useClass: UserServiceMock },
        TranslateService,
        TranslateStore,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Liste<%= classify(principalModelName) %>Component);
    component = fixture.componentInstance;
    component.user = user;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
