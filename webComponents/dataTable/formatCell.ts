import {ITapDataTableColumnConfiguration} from './tap-data-table';
import {DateFormatValueConverter} from './../../tapFx/ux/valueConverters/dateFormat';
import {CurrencyFormatValueConverter} from './../../tapFx/ux/valueConverters/currencyFormat';

export class FormatCellValueConverter {
    toView(value, columnDefinition: ITapDataTableColumnConfiguration) {
        if (columnDefinition.filter === 'currency')
            return new CurrencyFormatValueConverter().toView(value);

        if (columnDefinition.filter === 'date')
            return new DateFormatValueConverter().toView(value);

        return value;
    }
}