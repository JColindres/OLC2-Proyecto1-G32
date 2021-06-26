//Clase que controla las intervenciones al C3D
export class Generador{
    private static instance: Generador;
    temporal: number;
    etiqueta: number;
    codigo: string[];
    cod_funcs: string[];
    cadxml: string[];
    tempsave: string[];
    ptrh: number;
    ptrs: number;
    
    /*Sección de inicio del generador*/
    private constructor()
    {
        this.temporal = 0;
        this.etiqueta = 0;
        this.codigo = [];
        this.cod_funcs = [];
        this.tempsave = [];
        this.cadxml = [];
        this.ptrh = 0;
        this.ptrs = 0;
    }

    public static GetInstance(): Generador
    {
        if (!Generador.instance) {
            Generador.instance = new Generador();
        }
        return Generador.instance;
    }

    public ResetGenerador()
    {
        this.temporal = 0;
        this.etiqueta = 0;
        this.codigo = [];
        this.cod_funcs = [];
        this.tempsave = [];
        this.cadxml = [];
        this.ptrh = 0;
        this.ptrs = 0;
    }

    /*Sección de creación de etiquetas, temporales, labels...*/
    public Creartemp(): string
    {
        //Se crea la cadena con estructura Tnum
        const temporal = 'T' + this.temporal;
        this.temporal++;

        //Se almacena el temporal en la lista de variables a declarar
        this.tempsave.push(temporal)

        return temporal;
    }

    public Crearetiqueta(): string
    {
        //Se crea la cadena con estructura Lnum
        const label = 'L' + this.etiqueta;
        this.etiqueta++;

        return label;
    }

    /*Sección para agregar elementos a las listas de código*/
    //Los métodos identados tienen un \t al inicio del texto
    public Addcodigo(texto: string)
    {
        this.codigo.push(texto);
    }

    public Addcodigoidentado(texto: string)
    {
        this.codigo.push(`\t${texto}`);
    }    

    public Addcomentario(texto: string) 
    {
        //Se agrega un comentario al código
        this.codigo.push(`/*********** ${texto} ***********/`);
    }

    public Addcomentarioidentado(texto: string)
    {
        //Se agrega un comentario al código
        this.codigo.push(`\t/*********** ${texto} ***********/`);
    }

    public Addxml(texto:string)
    {
        this.cadxml.push(`\t${texto}`);
    }
    
    public Addcomentarioxml(texto: string)
    {
        //Se agrega un comentario al código
        this.cadxml.push(`\t/*********** ${texto} ***********/`);
    }

    /*Sección para concatenar las listas a la cadena de código final*/
    public Jointemporales()
    {
        let cad = 'double ';
        //Se guarda el código de temporales declarados
        if(this.tempsave.length != 0)
        {
            //Se concatena de la forma T0, T1, ... Tn;
            cad = cad + this.tempsave.join(', ');
            cad = cad + ';\n';

            this.codigo.push(cad);
        }
    }

    public Joincodxml()
    {
        let cadena = this.cadxml.join('\n');

        //Se agrega al código inicial
        this.codigo.push(cadena);
    }

    /*Modificaciones de registros*/
    public Incph(cant: number)
    {
        this.ptrh = this.ptrh + cant;
    }

    public Incps(cant: number)
    {
        this.ptrs = this.ptrs + cant;
    }

    public Decps(cant: number)
    {
        this.ptrs = this.ptrs - cant;
    }

    /*Sección de retornos*/
    //Retornos de registros
    public GetHeappos(): number
    {
        return this.ptrh;
    }

    public GetStackpos(): number
    {
        return this.ptrs;
    }

    //Retorna el código ya completo
    public GetCodigo(): string
    {
        //El código almacenado en la lista se une con un salto de línea por cada elemento
        //Para ello la instrucción join
        /*
        let lista = ['a', 'b', 'c']
        let str = lista.join('. ');
        str ahora es "a. b. c"
        */
        const fullcodigo = this.codigo.join('\n');

        return fullcodigo;
    }

    public nuevoprint(cont:any): string
    {
        /*
        Para imprimir un ascii se utiliza el type: %c
        printf("%c", (char)64)  ->   Resultado de impresión: @
        */
        switch(cont){
            case 0:
                return ('printf(\"%c\", (char) )')
        }
    }
}