export enum <%= touppercase(underscore(componentName)) %>_API {
    INIT_DATA = '/initData',
    SEARCH = '/search',
    DETAIL = '/detail',
    CREATE = '/create',
    UPDATE = '/update',
    DELETE = '/delete',
  }

  export enum <%= touppercase(underscore(componentName)) %>_<%= touppercase(underscore(secondModelName)) %>_API {
    SEARCH = '/search',
    DETAIL = '/detail',
    CREATE = '/create',
    UPDATE = '/update',
    DELETE = '/delete',
  }