import dayjs from 'dayjs';
import localizedformat from 'dayjs/plugin/localizedFormat';

dayjs.extend(localizedformat);

export { dayjs };