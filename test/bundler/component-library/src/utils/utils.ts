export function format(first: string, middle: string, last: string): string {
  console.log('RYAN::format');
  return (first || '') + (middle ? ` ${middle}` : '') + (last ? ` ${last}` : '');
}
