export class XmlTS {
    tabla: String[][];

    constructor(){
        this.tabla = [];
    }

    public agregar(identificador: String, valor:string, ambito: String, tipo: String, linea: any, columna: any){
        this.tabla.push([identificador, valor, ambito, tipo, linea, columna]);
    }
}