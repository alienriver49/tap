const TsLint = require('tslint');
const ts = require('typescript');

class Rule extends TsLint.Rules.AbstractRule {
    apply(sourceFile) {
        return this.applyWithWalker(new InvalidRelativeImportPrefixWalker(sourceFile, this.getOptions()));
    }
}

class InvalidRelativeImportPrefixWalker extends TsLint.RuleWalker {
    visitImportDeclaration(node) {
        if (this.check(node)) {
            const failureString = 'Relative import statements cannot start with "./../": ' + this.getFailureCodeSnippet(node);
            this.addFailureAt(node.getStart(), node.getWidth(), failureString);
        }
        super.visitImportDeclaration(node);
    }

    getFailureCodeSnippet(node) {
        const message = node.getText();
        if (message.indexOf('\n') > 0) {
            return message.substr(0, message.indexOf('\n'));
        }
        return message;
    }

    check(node) {
        if (!node || !node.moduleSpecifier) {
            return false;
        }

        const path = node.moduleSpecifier.getText();
        return path && /^['"]\.\/\.\.\/(.*)/.test(path);
    }
}

exports.Rule = Rule;
