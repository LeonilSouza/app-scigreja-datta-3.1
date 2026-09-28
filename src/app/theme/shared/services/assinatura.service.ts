import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { API_CONFIG } from "src/app/app-config";
import { AssinaturaDigital } from "../models/assinatura-digital.dto";

@Injectable()
export class AssinaturaService {
  constructor(
    public http: HttpClient
  ) {
  }

  // service
  listarAssinaturas(igrejaId: number): Observable<AssinaturaDigital[]> {
    return this.http.get<AssinaturaDigital[]>(
      `${API_CONFIG.baseUrl}/assinaturas-digitais/igreja/${igrejaId}`
    );
  }

  cadastrarAssinatura(igrejaId: number, nome: string, cargo: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('nome', nome);
    formData.append('cargo', cargo);
    formData.append('igrejaId', igrejaId.toString());
    formData.append('file', file);
    return this.http.post(`${API_CONFIG.baseUrl}/assinaturas-digitais`, formData);
  }


  // desativarAssinatura(id: number): Observable<void> {
  //   return this.http.delete<void>(`${API_CONFIG.baseUrl}/assinaturas-digitais/${id}`);
  // }

  excluir(id: number): Observable<void> {
  return this.http.delete<void>(`${API_CONFIG.baseUrl}/assinaturas-digitais/${id}`);
}

}
