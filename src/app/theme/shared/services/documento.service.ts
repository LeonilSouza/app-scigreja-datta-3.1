import { Injectable } from "@angular/core";
import { HttpClient, HttpRequest } from "@angular/common/http";
import { API_CONFIG } from "../config/api-config";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { DocumentoDTO } from "../models/documento.dto";

@Injectable()
export class DocumentoService {

  private apiPath: string = `${API_CONFIG.baseUrl}/documentos`;

  constructor(
    public http: HttpClient
  ) {
  }

  findById(id: number): Observable<DocumentoDTO> {

    const url = `${this.apiPath}/${id}`;

    return this.http.get(url).pipe(
      catchError(this.handleError),
      map(this.jsonDataToDocumento)
    )
  }

  getDocumentos(igrejaId, pessoaId) {
    return this.http.get(`${API_CONFIG.baseUrl}/documentos/?igreja=${igrejaId}&pessoa=${pessoaId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  upload(files: Set<File>, igrejaId, pessoaId) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('file', file, file.name),
        formData.append('igreja', igrejaId),
        formData.append('pessoa', pessoaId)
    });
    const request = new HttpRequest('POST', this.apiPath, formData);
    return this.http.request((request));
  }

  download(documento) {
    const url = `${this.apiPath}/${documento.id}`;
    return this.http.get(url, {
      responseType: 'blob' as 'json'
    })
  }

  // Para Downlod de aquivos
  handleFile(res: any, fileName: string, documento) {
    const file = new Blob([res], {
      type: res.type
    });
    const blob = window.URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = blob;
    let ext = this.getFileExtension(res.type);

    if (ext === 'pdf') link.download = documento.nomeArquivo;
    if (ext === 'jpg') link.download = documento.nomeArquivo;
    if (ext === 'jpeg') link.download = documento.nomeArquivo;
    if (ext === 'png') link.download = documento.nomeArquivo;
    if (ext === 'doc') link.download = documento.nomeArquivo;
    if (ext === 'docx') link.download =documento.nomeArquivo;
    if (ext === 'xls') link.download = documento.nomeArquivo;
    if (ext === 'xlsx') link.download = documento.nomeArquivo;

    link.dispatchEvent(new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    }));

    setTimeout(() => { // Firefox
      window.URL.revokeObjectURL(blob);
      link.remove();
    }, 100);

  }

  getFileExtension(filename) {
    return filename.split('/').pop();
  }

  create(documento: DocumentoDTO) {
    return this.http.post(this.apiPath,
      documento,
      {
        observe: 'response',
        responseType: 'text'
      }
    );
  }

  update(documento: DocumentoDTO): Observable<DocumentoDTO> {
    const url = `${this.apiPath}/${documento.id}`;
    return this.http.put(url, documento)
      .pipe(
        map(this.jsonDataToDocumento),
        catchError(this.handleError),
        //map(this.jsonDataToDocumentoFuncao)
        map(() => documento)
      )
  }


  delete(id: number): Observable<any> {

    const url = `${this.apiPath}/${id}`;

    return this.http.delete(url).pipe(
      catchError(this.handleError),
      map(() => null)
    )
  }


  private jsonDataToDocumento(jsonData: any): DocumentoDTO {
    return (new DocumentoDTO(), jsonData);
  }

  private handleError(error: any): Observable<any> {
    console.log("ERRO NA REQUISIÇÃO => ", error);
    return throwError(error);
  }

}
