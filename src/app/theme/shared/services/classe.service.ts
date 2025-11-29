import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { ClasseDTO } from "../models/classe.dto";
import { API_CONFIG } from "src/app/app-config";

@Injectable()
export class ClasseService {

    private apiPath: string = `${API_CONFIG.baseUrl}/classes`;

    constructor(public http: HttpClient) {
    }

    findAll(): Observable<ClasseDTO> {
        return this.http.get<ClasseDTO>(this.apiPath)
        .pipe(
          catchError(this.handleError));
      }

    findById(id: number): Observable<ClasseDTO> {

        const url = `${this.apiPath}/${id}`;

        return this.http.get(url).pipe(
          catchError(this.handleError),
          map(this.jsonDataToClasse)
        )
      }

      getByPageClasseFromIgreja(igrejaId, nome, page, linesPerPage) {

        return this.http.get(`${API_CONFIG.baseUrl}/classes/page/?igreja=${igrejaId}&nome=${nome}&page=${page}&linesPerPage=${linesPerPage}`)
          .pipe(
            catchError(this.handleError)
        );
      }

      getByPageClasseFromTipo(igrejaId, nome, page, linesPerPage) {

        return this.http.get(`${API_CONFIG.baseUrl}/classes/page/?igreja=${igrejaId}&nome=${nome}&page=${page}&linesPerPage=${linesPerPage}`)
          .pipe(
            catchError(this.handleError)
        );
      }

      getListClasseFromIgreja(igrejaId) {

        return this.http.get(`${API_CONFIG.baseUrl}/classes/list/?igreja=${igrejaId}`)
          .pipe(
            catchError(this.handleError)
        );
      }


     create(classe : ClasseDTO) {
      return this.http.post(this.apiPath,
        classe,
          {
              observe: 'response',
              responseType: 'text'
          }
        );
     }

      update(classe: ClasseDTO): Observable<ClasseDTO> {
        const url = `${this.apiPath}/${classe.id}`;

        return this.http.put(url, classe)
          .pipe(
           map(this.jsonDataToClasse),
           catchError(this.handleError),
           //map(this.jsonDataToClasseFuncao)
           map(() => classe)
        )
      }


      delete(id: number): Observable<any> {

        const url = `${this.apiPath}/${id}`;

        return this.http.delete(url).pipe(
          catchError(this.handleError),
          map(() => null)
        )
      }


      private jsonDataToClasse(jsonData: any): ClasseDTO {
        return (new ClasseDTO(), jsonData);
      }

      private handleError(error: any): Observable<any>{
        console.log("ERRO NA REQUISIÇÃO => ", error);
        return throwError(error);
      }

}
