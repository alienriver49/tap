var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Extension1;
(function (Extension1) {
    var MainBlade = (function (_super) {
        __extends(MainBlade, _super);
        function MainBlade() {
            _super.call(this);
            console.log('MAIN BLADE WAS CONSTRUCTED');
        }
        MainBlade.prototype.onInitialize = function () {
            this.title = 'EXTENSION 1';
            this.subtitle = 'EXTENSION 1 SUBTITLE';
            console.log('calling an intialize');
        };
        return MainBlade;
    }(TapFx.Ux.ViewModels.Blade));
    Extension1.MainBlade = MainBlade;
})(Extension1 || (Extension1 = {}));
