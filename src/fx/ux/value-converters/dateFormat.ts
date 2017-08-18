import moment from 'moment';

export class DateFormatValueConverter {
    public toView(value: Date) {
        return moment(value).format('M/D/YYYY');
    }
}
