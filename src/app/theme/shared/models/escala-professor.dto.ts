export interface EscalaProfessorDTO {
    trimestre: string;
    nomeClasse: string;
    ano: number;
    itens: EscalaItemDTO[]; // Esta é a lista que deve bater com o Java
};

export interface EscalaItemDTO {
  data: string;     // Ex: "04/01/2026"
  professor: string;
  suplente: string;
  nomeClasse: string;
  trimestre: string;
  isHeader: boolean;
}