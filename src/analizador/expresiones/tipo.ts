import { Arreglo } from "./arreglo";


export const enum Tipo {
    STRING,
    INT,
    DOUBLE,
    BOOL,
    VOID,
    STRUCT,
    NULL,
    ATRIBUTO,
    ARRAY,
    getTipo
}

export function getTipo(valor: any): Tipo {
    if (typeof valor == 'string') return Tipo.STRING;
    if (typeof valor == 'number') return Tipo.INT;
    if (typeof valor == 'boolean') return Tipo.BOOL;
    if (valor instanceof Arreglo) return Tipo.ARRAY;
    if (valor == null) return null;
    return null;
  }