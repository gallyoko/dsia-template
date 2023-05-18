# Getting Started With DsiaTemplate

Ce dépôt permet de générer des écrans en répondant à quelques question ^^

### Auto build

```bash
npm run build:watch
```

### Launch

```bash
schematics .:dsiaTemplate --debug=false
```

### Testing

To test locally, install `@angular-devkit/schematics-cli` globally and use the `schematics` command line tool. That tool
acts the same as the `generate` command of the Angular CLI, but also has a debug mode.

Check the documentation with

```bash
schematics --help
```

### Unit Testing

`npm run test` will run the unit tests, using Jasmine as a runner and test framework.

### Publishing

To publish, simply do:

```bash
npm run build
npm publish
```

That's it!
