import { ITapDataTableColumnConfiguration } from './tap-data-table';

import { DateFormatValueConverter } from '../../fx/ux/value-converters/dateFormat';
import { CurrencyFormatValueConverter } from '../../fx/ux/value-converters/currencyFormat';

export class FormatCellValueConverter {
    public toView(value, columnDefinition: ITapDataTableColumnConfiguration) {
        if (columnDefinition.filter === 'currency') {
            return new CurrencyFormatValueConverter().toView(value);
        }

        if (columnDefinition.filter === 'date') {
            return new DateFormatValueConverter().toView(value);
        }

        return value;
    }
}
