import { Lancamento } from './lancamento-interface';

export interface Dia {
    label: string;
    lancamentos?: Lancamento[];
}
