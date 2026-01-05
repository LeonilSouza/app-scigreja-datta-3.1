import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { API_CONFIG } from "src/app/app-config";
import { AulaNewDTO } from "../models/aula-new-dto.dto";
import { EscalaProfessorDTO } from "../models/escala-professor.dto";


@Injectable()
export class EscalaService {

  private apiPathAula: string = `${API_CONFIG.baseUrl}/aulas`;
  private apiPathEscala: string = `${API_CONFIG.baseUrl}/relatorios/escalas`;

  constructor(public http: HttpClient) {
  }

  createAulaComFrequencias(dto: AulaNewDTO): Observable<string> {
    return this.http.post(`${this.apiPathAula}`, dto, {
      // Como o seu Controller no Java retorna ResponseEntity.ok("Mensagem"),
      // precisamos avisar o Angular para tratar a resposta como texto, não JSON.
      responseType: 'text' 
    });
  }

  /**
   * Envia a escala calculada no Angular para o JasperReports no Java gerar o PDF.
   */
  gerarEscalaProfessorPdf(payload: EscalaProfessorDTO): Observable<Blob> {
    return this.http.post(`${this.apiPathEscala}`, payload, {
      // OBRIGATÓRIO para arquivos binários (PDF, Excel, etc)
      responseType: 'blob' 
    });
  }

}
