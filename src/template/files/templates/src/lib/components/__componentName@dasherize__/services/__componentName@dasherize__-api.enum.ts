export enum <%= touppercase(underscore(componentName)) %>_API {
    INIT_DATA = '/<%= dasherize(moduleLibName) %>/<%= dasherize(componentName) %>/initData',
    SEARCH = '/<%= dasherize(moduleLibName) %>/<%= dasherize(componentName) %>/search',
    DETAIL = '/<%= dasherize(moduleLibName) %>/<%= dasherize(componentName) %>/detail',
    CREATE = '/<%= dasherize(moduleLibName) %>/<%= dasherize(componentName) %>/create',
    UPDATE = '/<%= dasherize(moduleLibName) %>/<%= dasherize(componentName) %>/update',
    DELETE = '/<%= dasherize(moduleLibName) %>/<%= dasherize(componentName) %>/delete',
  }

  export enum <%= touppercase(underscore(componentName)) %>_<%= touppercase(underscore(secondModelName)) %>_API {
    SEARCH = '/<%= dasherize(moduleLibName) %>/<%= dasherize(componentName) %>/<%= dasherize(secondModelName) %>/search',
    DETAIL = '/<%= dasherize(moduleLibName) %>/<%= dasherize(componentName) %>/<%= dasherize(secondModelName) %>/detail',
    CREATE = '/<%= dasherize(moduleLibName) %>/<%= dasherize(componentName) %>/<%= dasherize(secondModelName) %>/create',
    UPDATE = '/<%= dasherize(moduleLibName) %>/<%= dasherize(componentName) %>/<%= dasherize(secondModelName) %>/update',
    DELETE = '/<%= dasherize(moduleLibName) %>/<%= dasherize(componentName) %>/<%= dasherize(secondModelName) %>/delete',
  }