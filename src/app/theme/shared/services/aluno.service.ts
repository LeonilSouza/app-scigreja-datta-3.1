import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { API_CONFIG } from "src/app/app-config";
import { AlunoDTO } from "../models/aluno.dto";


@Injectable()
export class AlunoService {

  private apiPath: string = `${API_CONFIG.baseUrl}/alunos`;

  constructor(public http: HttpClient) {
  }

  findAll(): Observable<AlunoDTO> {
    return this.http.get<AlunoDTO>(this.apiPath)
      .pipe(
        catchError(this.handleError));
  }

   getById(id: number): Observable<AlunoDTO> {
    const url = `${this.apiPath}/${id}`;

    return this.http.get(url).pipe(
      catchError(this.handleError),
       map(this.jsonDataToAluno)
    )
  }

  getByPageAlunoFromIgreja(igrejaId, classeId, nome, page, linesPerPage) {

    return this.http.get(`${API_CONFIG.baseUrl}/alunos/page/?igreja=${igrejaId}&classe=${classeId}&nome=${nome}&page=${page}&linesPerPage=${linesPerPage}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getByPageAlunoFromTipo(igrejaId, nome, page, linesPerPage) {

    return this.http.get(`${API_CONFIG.baseUrl}/alunos/page/?igreja=${igrejaId}&nome=${nome}&page=${page}&linesPerPage=${linesPerPage}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getListAlunoFromIgreja(igrejaId) {

    return this.http.get(`${API_CONFIG.baseUrl}/alunos/list/?igreja=${igrejaId}`)
      .pipe(
        catchError(this.handleError)
      );
  }


  create(aluno: AlunoDTO) {
    return this.http.post(this.apiPath,
      aluno,
      {
        observe: 'response',
        responseType: 'text'
      }
    );
  }

  update(aluno: AlunoDTO): Observable<AlunoDTO> {
    const url = `${this.apiPath}/${aluno.id}`;

    return this.http.put(url, aluno)
      .pipe(
        map(this.jsonDataToAluno),
        catchError(this.handleError),
        //map(this.jsonDataToAlunoFuncao)
        map(() => aluno)
      )
  }

    // Método para atualizar status
  atualizarStatus(id: number, statusAtual: boolean) {
    // Converte o booleano do componente para a string do banco
    const statusString = statusAtual ? 'Ativo' : 'Inativo';
    
    return this.http.put(`${this.apiPath}/${id}`, { status: statusString });
}


  delete(id: number): Observable<any> {

    const url = `${this.apiPath}/${id}`;

    return this.http.delete(url).pipe(
      catchError(this.handleError),
      map(() => null)
    )
  }


  private jsonDataToAluno(jsonData: any): AlunoDTO {
    return (new AlunoDTO(), jsonData);
  }

  private handleError(error: any): Observable<any> {
    console.log("ERRO NA REQUISIÇÃO => ", error);
    return throwError(error);
  }

}
