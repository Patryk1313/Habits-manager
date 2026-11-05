const DAY_MS = 24 * 60 * 60 * 1000;

export function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function parseDateKey(value: string) {
  return startOfDay(new Date(`${value}T00:00:00`));
}

export function parseDateTime(value: string) {
  return startOfDay(new Date(value));
}

export function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function addDays(date: Date, amount: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return startOfDay(result);
}

export function addDaysToDateKey(dateKey: string, amount: number) {
  return getDateKey(addDays(parseDateKey(dateKey), amount));
}

export function differenceInDays(later: Date, earlier: Date) {
  const laterUtc = Date.UTC(
    later.getFullYear(),
    later.getMonth(),
    later.getDate()
  );
  const earlierUtc = Date.UTC(
    earlier.getFullYear(),
    earlier.getMonth(),
    earlier.getDate()
  );

  return Math.round((laterUtc - earlierUtc) / DAY_MS);
}

export function maxDate(first: Date, second: Date) {
  return first > second ? first : second;
}

export function minDate(first: Date, second: Date) {
  return first < second ? first : second;
}

export function startOfWeekMonday(date: Date) {
  const result = startOfDay(date);
  const day = result.getDay();

  return addDays(result, day === 0 ? -6 : 1 - day);
}

export function eachDay(start: Date, end: Date) {
  const result: Date[] = [];
  let current = startOfDay(start);
  const last = startOfDay(end);

  while (current <= last) {
    result.push(current);
    current = addDays(current, 1);
  }

  return result;
}
