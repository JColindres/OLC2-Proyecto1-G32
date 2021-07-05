export class TablaS {
    tabla: any[][];

    constructor() {
        this.tabla = [];
    }

    public agregar(identificador: String, valor: any, ambito: String, tipo: any, rol: String, tam: any, direccion: any) {
        this.tabla.push([identificador, valor, ambito, tipo, rol, tam, direccion]);
    }

    public concatenar(nueva: any[][]) {
        this.tabla = this.tabla.concat(nueva);
    }

    public mod_size(identificador: String, tam:any)
    {
        this.tabla.forEach(element => {
            if(element[0] === identificador && element[4] === 'Función')
            {
                let tama = tam + element[5];
                element[5] = tama;
            }
        });
    }
}