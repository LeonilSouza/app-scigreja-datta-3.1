import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Calendar } from '../models/calendar.model';
import { Observable } from 'rxjs';
import { HttpClient, } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { EventInput } from '@fullcalendar/core';
import { API_CONFIG } from 'src/app/app-config';

@Injectable()

export class CalendarService {

  private apiPath: string = `${API_CONFIG.baseUrl}/eventos`;

  dataChange: BehaviorSubject<Calendar[]> = new BehaviorSubject<Calendar[]>([]);

  // Armazena temporariamente os dados das caixas de diálogo
  dialogData!: Calendar;

  constructor(
    private http: HttpClient
  ) { }

  get data(): Calendar[] {
    return this.dataChange.value;
  }

  getDialogData() {
    return this.dialogData;
  }

  getAllCalendars(igreja): Observable<EventInput[]> {
    return this.http.get<EventInput[]>(`${API_CONFIG.baseUrl}/eventos/?igreja=${igreja}`)
      .pipe(catchError(this.handleError));
  }


  updateCalendar(calendar) {
    const url = `${this.apiPath}/${calendar.id}`;
    return this.http.put(url, calendar)
      .pipe(
        catchError(this.handleError),
      )
  }

  addCalendar(calendar){
    return this.http.post(this.apiPath,
      calendar,
      {
        observe: 'response',
        responseType: 'text'
      }
    );
  }

  delete(id: number) {

    const url = `${this.apiPath}/${id}`;
    return this.http.delete(url).pipe(
      catchError(this.handleError),
      map(() => null)
    )
  }

  private handleError(error: any): Observable<any> {
    console.log("ERRO NA REQUISIÇÃO => ", error);
    return throwError(() => new Error('error'));
  }
}
