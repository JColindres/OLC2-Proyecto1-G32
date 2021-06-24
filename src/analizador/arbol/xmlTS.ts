export class XmlTS {
    tabla: any[][];

    constructor(){
        this.tabla = [];
    }

    public agregar(identificador: String, valor:string, ambito: String, tipo: String, linea: any, columna: any, nodo: any, direccion: any){
        this.tabla.push([identificador, valor, ambito, tipo, linea, columna, nodo, direccion]);
    }
}