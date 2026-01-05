// src/app/models/page.model.ts
export interface PageResponse<T> {
  content: T[];          // Aqui é onde fica lista de presenças 
  totalPages: number;    // Total de páginas no banco
  totalElements: number; // Total de registros no banco
  linesPerPage: number;          // Tamanho da página atual
  number: number;        // Número da página atual (0, 1, 2...)
}