import { Injectable } from "@angular/core";
import { API_CONFIG } from "../config/api-config";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { FilhoDTO } from "../models/filho.dto";



@Injectable({
    providedIn: 'root'
  })
export class FilhoService {


    private apiPath: string = `${API_CONFIG.baseUrl}/filhos`;


    constructor(
        public http: HttpClient
        ) {
    }

    findAll(): Observable<FilhoDTO[]> {
      return this.http.get<FilhoDTO>(this.apiPath).pipe(
        catchError(this.handleError),
        map(this.jsonDataToFilhos)
      )
    }


    findById(id: number): Observable<FilhoDTO> {

        const url = `${this.apiPath}/${id}`;

        return this.http.get(url).pipe(
          catchError(this.handleError),
          map(this.jsonDataToFilho)
        )
      }

     create(filho : FilhoDTO) {
      return this.http.post(this.apiPath,
        filho,
          {
              observe: 'response',
              responseType: 'text'
          }
        );
     }


      delete(id: number): Observable<any> {

        const url = `${this.apiPath}/${id}`;

        return this.http.delete(url).pipe(
          catchError(this.handleError),
          map(() => null)
        )
      }



      // PRIVATE METHODS

      private jsonDataToFilhos(jsonData: any[]): FilhoDTO[] {
        const filhos: FilhoDTO[] = [];

        jsonData.forEach(element => {
          const filho = (new FilhoDTO(), element);
          filhos.push(filho);
        });

        return filhos;
      }


      private jsonDataToFilho(jsonData: any): FilhoDTO {
        return (new FilhoDTO(), jsonData);
      }

      private handleError(error: any): Observable<any>{
        console.log("ERRO NA REQUISIÇÃO => ", error);
        return throwError(error);
      }

    }
