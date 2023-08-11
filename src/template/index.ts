import { Rule, SchematicContext, Tree, apply, mergeWith, template, url } from '@angular-devkit/schematics';
import { Schema } from './schema';
import { strings } from '@angular-devkit/core';

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function dsiaTemplate(_options: Schema): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const sourceTemplates = url('./files');

    const sourceParametrizedTemplates = apply(sourceTemplates, [
      template({
        ..._options,
        ...strings,
        tolowercase,
        touppercase,
      }),
    ]);
    // tree.create('example.js', `console.log('Hello ${name} !');`);
    return mergeWith(sourceParametrizedTemplates)(tree, _context);
  };
}

export function tolowercase(value: string): string {
  return value.toLowerCase();
}

export function touppercase(value: string): string {
  return value.toUpperCase();
}
