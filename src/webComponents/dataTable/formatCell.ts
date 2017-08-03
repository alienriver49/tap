import { ITapDataTableColumnConfiguration } from './tap-data-table';

import { DateFormatValueConverter } from '../../fx/ux/valueConverters/dateFormat';
import { CurrencyFormatValueConverter } from '../../fx/ux/valueConverters/currencyFormat';

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
