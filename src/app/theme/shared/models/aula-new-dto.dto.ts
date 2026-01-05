import { FrequenciaItemDTO } from "./frequencia.dto";

export interface AulaNewDTO {
    id?: number;
    trimestre?: number;
    tema?: number;
    licao?: number;
    data?: string;
    igrejaId?: number;
    presencas: FrequenciaItemDTO[];
};