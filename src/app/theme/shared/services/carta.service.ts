import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { API_CONFIG } from "../config/api-config";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { CartaDTO } from "../models/carta.dto";

@Injectable()
export class CartaService {

    private apiPath: string = `${API_CONFIG.baseUrl}/cartas`;

    constructor(public http: HttpClient) {
    }

    findAll(): Observable<CartaDTO> {
        return this.http.get<CartaDTO>(this.apiPath)
        .pipe(
          catchError(this.handleError));
      }

    findById(id: number): Observable<CartaDTO> {
        const url = `${this.apiPath}/${id}`;
        return this.http.get(url).pipe(
          catchError(this.handleError),
          map(this.jsonDataToCarta)
        )
      }

      countEntradasFromIgreja(igrejaId, tipoCarta) {
        return this.http.get(`${API_CONFIG.baseUrl}/pessoas/count/?igreja=${igrejaId}&tipoCarta=${tipoCarta}`)
          .pipe(
            catchError(this.handleError)
        );
      }

      countSaidasFromIgreja(igrejaId, tipoCarta) {
        return this.http.get(`${API_CONFIG.baseUrl}/pessoas/count/?igreja=${igrejaId}&tipoCarta=${tipoCarta}`)
          .pipe(
            catchError(this.handleError)
        );
      }
    

      getByPageCartaFromIgreja(igrejaId, nomeMembro, page, linesPerPage) {
        return this.http.get(`${API_CONFIG.baseUrl}/cartas/?igreja=${igrejaId}&nomeMembro=${nomeMembro}&page=${page}&linesPerPage=${linesPerPage}`)
          .pipe(
            catchError(this.handleError)
        );
      }

     create(carta : CartaDTO) {
      return this.http.post(this.apiPath,
        carta,
          {
              observe: 'response',
              responseType: 'text'
          }
        );
     }

      update(carta: CartaDTO): Observable<CartaDTO> {
        const url = `${this.apiPath}/${carta.id}`;

        return this.http.put(url, carta)
          .pipe(
           map(this.jsonDataToCarta),
           catchError(this.handleError),
           //map(this.jsonDataToCartaFuncao)
           map(() => carta)
        )
      }


      delete(id: number): Observable<any> {

        const url = `${this.apiPath}/${id}`;

        return this.http.delete(url).pipe(
          catchError(this.handleError),
          map(() => null)
        )
      }


      private jsonDataToCarta(jsonData: any): CartaDTO {
        return (new CartaDTO(), jsonData);
      }

      private handleError(error: any): Observable<any>{
        console.log("ERRO NA REQUISIÇÃO => ", error);
        return throwError(error);
      }

}
