import { Address } from './address';
import { getTapFx, ViewModels } from 'tap-fx';
import * as tapc from '../../fx/ux/tapcModules';

export interface ISchoolConfig {
    name?: string;
    grades?: number[];
    address?: Address;
    address2?: Address;
    hasPool?: boolean;
}

export class School extends ViewModels.ComposedView {
    private _tapFx: ITapFx;
    public name: string;
    public grades: number[];
    public address: Address;
    public address2: Address;
    public hasPool: boolean;

    constructor(config?: ISchoolConfig) {
        super();
        this.viewName = 'schoolTemplate.html';
        if (config === void 0) { 
            config = {}; 
        }
        this.name = config.name || '';
        this.grades = config.grades || [];
        this.address = config.address || new Address();
        this.address2 = config.address2 || this.address; 
        this.hasPool = config.hasPool || false;
        this._tapFx = getTapFx();
        this.onChangeGradesClick();
        this._buildContent();
    }

    private onChangeGradesClick() {
        while (this.grades.length < 4) {
            this.onAddGradeClick();
        }
        const newGrades: number[] = [];
        this.grades.forEach((value: number, index: number, theArray: number[]) => {
            newGrades.push(value + 1);
        });
        this.grades = newGrades;
    }

    public onAddGradeClick(): void {
        let maxGrade = 1;
        if (this.grades.length > 0) {
            maxGrade = this.grades[this.grades.length - 1];
        }
        this.grades.push(maxGrade + 1);
    }

    public onRemoveGradeClick(): void {
        this.grades.pop();
    }

    public onReplaceGradeClick(): void {
        const index = this._tapFx.Utilities.getRandomInt(0, this.grades.length - 1);
        this.grades.splice(index, 1,  this._tapFx.Utilities.getRandomInt(12, 100));
    }

    private _buildContent(): void {
        this.content.push(
            new tapc.Content().addText('${grades}').addToContainer(
            new tapc.Button({name: 'addGrade', click: 'onAddGradeClick()'}).addText('Add a grade'),
            new tapc.Button({name: 'removeGrade', click: 'onRemoveGradeClick()'}).addText('Remove a grade'),
            new tapc.Button({name: 'replaceGrade', click: 'onReplaceGradeClick()'}).addText('Replace a grade element'),
            new tapc.Button({name: 'changeGrades', click: 'onChangeGradesClick()'}).addText('Change grade array'),
            )
        );
    }
}
