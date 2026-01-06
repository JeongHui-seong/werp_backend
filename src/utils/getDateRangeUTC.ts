export function getDateRangeUTC(start: Date, end: Date): Date[] {
    const dates: Date[] = [];
    const currentDate = new Date(start);

    while (currentDate.getTime() <= end.getTime()) {
        dates.push(new Date(currentDate));
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    return dates;
}