import { formatDate } from '@angular/common';
export class Calendar {
  id: number;
  igrajaId: number;
  title: string;
  category: string;
  startDate: string;
  endDate: string;
  details: string;

  constructor(
    calendar: Calendar
    ) {
    {
      this.id = calendar.id || null;
      this.title = calendar.title || '';
      this.category = calendar.category || '';
      this.startDate = formatDate(new Date(), 'yyyy-MM-dd', 'en') || '';
      this.endDate = formatDate(new Date(), 'yyyy-MM-dd', 'en') || '';
      this.details = calendar.details || '';
    }
  }
}
