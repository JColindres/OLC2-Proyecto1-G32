export class ValAscendente
{
    produccion: string;
    reglas: string;

    constructor({produccion, reglas} : {produccion: string, reglas: string})
    {
        Object.assign(this, {produccion, reglas});
    }
}
  