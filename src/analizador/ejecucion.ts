import { Objeto } from "./abstractas/objeto";

export class Ejecucion {
    prologoXml: JSON;
    cuerpoXml: Array<Objeto>;
    cadena: string; 

    version: string;
    encoding: string;

    constructor(prologo: JSON, cuerpo:Array<Objeto>, cadena: string){
        this.prologoXml = prologo;
        this.cuerpoXml = cuerpo;
        this.cadena = cadena;
    }

    verObjetos(){
        this.cuerpoXml.forEach(element => {
            console.log(element);
        });
    }
}