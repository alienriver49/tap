import numeral from 'numeral';

export class CurrencyFormatValueConverter {
    public toView(value: number) {
        return numeral(value).format('($0,0.00)');
    }
}
