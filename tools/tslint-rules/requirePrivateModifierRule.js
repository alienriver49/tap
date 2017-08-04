const TsLint = require('tslint');
const ts = require('typescript');

class Rule extends TsLint.Rules.AbstractRule {
    apply(sourceFile) {
        return this.applyWithWalker(new RequirePrivateModifierWalker(sourceFile, this.getOptions()));
    }
}

class RequirePrivateModifierWalker extends TsLint.RuleWalker {
    visitMethodDeclaration(node) {
        if (this.check(node)) {
            const failureString = 'Methods starting with an underscore must be marked as private: ' + this.getFailureCodeSnippet(node);
            this.addFailureAt(node.getStart(), node.getWidth(), failureString);
        }
        super.visitMethodDeclaration(node);
    }

    visitPropertyDeclaration(node) {
        if (this.check(node)) {
            const failureString = 'Properties starting with an underscore must be marked as private: ' + this.getFailureCodeSnippet(node);
            this.addFailureAt(node.getStart(), node.getWidth(), failureString);
        }
        super.visitPropertyDeclaration(node);
    }

    getFailureCodeSnippet(node) {
        const message = node.getText();
        if (message.indexOf('\n') > 0) {
            return message.substr(0, message.indexOf('\n'));
        }
        return message;
    }

    check(node) {
        return node.name && node.name.text && node.name.text.startsWith('_') && !TsLint.hasModifier(node.modifiers, ts.SyntaxKind.PrivateKeyword);
    }
}

exports.Rule = Rule;
