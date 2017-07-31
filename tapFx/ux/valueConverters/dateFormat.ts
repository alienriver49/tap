import moment from 'moment';

export class DateFormatValueConverter {
    toView(value: Date) {
        return moment(value).format('M/D/YYYY');
    }
}