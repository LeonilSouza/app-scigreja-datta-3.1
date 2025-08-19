import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { API_CONFIG } from "../config/api-config";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { ModeloDocumentoDTO } from "../models/modelo-documento.dto";

@Injectable()
export class ModeloDocumentoService {

    private apiPath: string = `${API_CONFIG.baseUrl}/modelodocumentos`;

    constructor(public http: HttpClient) {
    }

    findAll(): Observable<ModeloDocumentoDTO> {
        return this.http.get<ModeloDocumentoDTO>(this.apiPath)
        .pipe(
          catchError(this.handleError));
      }

    findById(id: number): Observable<ModeloDocumentoDTO> {

        const url = `${this.apiPath}/${id}`;

        return this.http.get(url).pipe(
          catchError(this.handleError),
          map(this.jsonDataToModeloDocumento)
        )
      }

      upload(modeloDocumento: ModeloDocumentoDTO, formData: FormData) : Observable<any>{
        const url = `${this.apiPath}/${modeloDocumento.id}/logo`;
        return this.http.put(url, formData, { responseType : 'blob' });
      }

      getByPageModeloDocumentoFromIgreja(igrejaId, nome: any, tipo: any, page: any, linesPerPage: any) {

        return this.http.get(`${API_CONFIG.baseUrl}/modelodocumentos/page/?igreja=${igrejaId}&nome=${nome}&tipo=${tipo}&page=${page}&linesPerPage=${linesPerPage}`)
          .pipe(
            catchError(this.handleError)
        );
      }
      

      getByListModeloDocumentoFromIgreja(igrejaId, nome)  {//Lista por Igreja e tipoDocumento

        return this.http.get(`${API_CONFIG.baseUrl}/modelodocumentos/list/?igreja=${igrejaId}&nome=${nome}`)
          .pipe(
            catchError(this.handleError)
        );
      }

     create(modeloDocumento : ModeloDocumentoDTO) {
      return this.http.post(this.apiPath,
        modeloDocumento,
          {
              observe: 'response',
              responseType: 'text'
          }
        );
     }

      update(modeloDocumento: ModeloDocumentoDTO): Observable<ModeloDocumentoDTO> {
        const url = `${this.apiPath}/${modeloDocumento.id}`;
        return this.http.put(url, modeloDocumento)
          .pipe(
           map(this.jsonDataToModeloDocumento),
           catchError(this.handleError),
           //map(this.jsonDataToDocumentoFuncao)
           map(() => modeloDocumento)
        )
      }


      delete(id: number): Observable<any> {

        const url = `${this.apiPath}/${id}`;

        return this.http.delete(url).pipe(
          catchError(this.handleError),
          map(() => null)
        )
      }


      private jsonDataToModeloDocumento(jsonData: any): ModeloDocumentoDTO {
        return (new ModeloDocumentoDTO(), jsonData);
      }

      private handleError(error: any): Observable<any>{
        console.log("ERRO NA REQUISIÇÃO => ", error);
        return throwError(error);
      }

}
