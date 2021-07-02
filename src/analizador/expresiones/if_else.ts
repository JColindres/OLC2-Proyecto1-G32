import { Entorno } from "../interfaces/entorno";
import { Instruccion } from "../interfaces/instruccion";
import { Retorno } from "./retorno";

export class If_Else extends Instruccion {
    condicionIF: Instruccion;
    instruccionIF: Instruccion;
    condicionELSEIF: Instruccion;
    instruccionELSEIF: Instruccion;
    instruccionELSE: Instruccion;

    constructor(linea: string, condicionIF: Instruccion, instruccionIF: Instruccion, instruccionELSE: Instruccion, condicionELSEIF?: Instruccion, instruccionELSEIF?: Instruccion) {
        super(linea);
        Object.assign(this, { condicionIF, instruccionIF, instruccionELSE, condicionELSEIF, instruccionELSEIF });
    }

    ejecutar(e: Entorno) {
        if (this.condicionELSEIF) {
            if (this.condicionIF.ejecutar(e)) {
                const entorno = new Entorno(e);
                const resp = this.instruccionIF.ejecutar(entorno);
                if (this.instruccionIF instanceof Retorno) {
                    return this.instruccionIF;
                }
                //return;
            }
            else if (this.condicionELSEIF.ejecutar(e)) {
                const entorno = new Entorno(e);
                const resp = this.instruccionELSEIF.ejecutar(entorno);
                if (this.instruccionELSEIF instanceof Retorno) {
                    return this.instruccionELSEIF;
                }
                //return;
            }
            else {
                const entorno = new Entorno(e);
                const resp = this.instruccionELSE.ejecutar(entorno);
                if (this.instruccionELSE instanceof Retorno) {
                    return this.instruccionELSE;
                }
                //return;
            }
        }
        if (this.condicionIF.ejecutar(e)) {
            const entorno = new Entorno(e);
            const resp = this.instruccionIF.ejecutar(entorno);
            if (this.instruccionIF instanceof Retorno) {
                //console.log(this.instruccionIF)
                return this.instruccionIF;
            }
            //return resp;
        }
        else {
            const entorno = new Entorno(e);
            const resp = this.instruccionELSE.ejecutar(entorno);
            if (this.instruccionELSE instanceof Retorno) {
                return this.instruccionELSE;
            }
            //return resp;
        }
    }

}