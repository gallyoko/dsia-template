"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.touppercase = exports.tolowercase = exports.dsiaTemplate = void 0;
const schematics_1 = require("@angular-devkit/schematics");
const core_1 = require("@angular-devkit/core");
// You don't have to export the function as default. You can also have more than one rule factory
// per file.
function dsiaTemplate(_options) {
    return (tree, _context) => {
        const sourceTemplates = (0, schematics_1.url)('./files');
        const sourceParametrizedTemplates = (0, schematics_1.apply)(sourceTemplates, [
            (0, schematics_1.template)(Object.assign(Object.assign(Object.assign({}, _options), core_1.strings), { tolowercase,
                touppercase })),
        ]);
        // tree.create('example.js', `console.log('Hello ${name} !');`);
        return (0, schematics_1.mergeWith)(sourceParametrizedTemplates)(tree, _context);
    };
}
exports.dsiaTemplate = dsiaTemplate;
function tolowercase(value) {
    return value.toLowerCase();
}
exports.tolowercase = tolowercase;
function touppercase(value) {
    return value.toUpperCase();
}
exports.touppercase = touppercase;
//# sourceMappingURL=index.js.map