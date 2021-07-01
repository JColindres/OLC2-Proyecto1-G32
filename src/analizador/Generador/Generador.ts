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
    ptrhxpath: number;
    ptrsxpath: number;
    
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
        this.ptrhxpath = 0;
        this.ptrsxpath = 0;
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
        this.ptrhxpath = 0;
        this.ptrsxpath = 0;
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

    public Addnumconsulta(num: number)
    {
        let cast = num.toString();

        /*
        Se introduce al heapxpath en la posición Hxpath la cadena ' -----(num_consulta)-----\n '
        */
        for(let i = 0; i<15; i++)
        {
            this.Addxml(`heapxpath[(int)Hxpath] = ${"-".charCodeAt(0)};`);
            this.Addxml('Hxpath = Hxpath + 1;');
            this.Incphxpath(1);
        }

        this.Addxml(`heapxpath[(int)Hxpath] = ${"(".charCodeAt(0)};`);
        this.Addxml('Hxpath = Hxpath + 1;');
        this.Incphxpath(1);

        this.Addxml(`heapxpath[(int)Hxpath] = ${cast.charCodeAt(0)};`);
        this.Addxml('Hxpath = Hxpath + 1;');
        this.Incphxpath(1);

        this.Addxml(`heapxpath[(int)Hxpath] = ${")".charCodeAt(0)};`);
        this.Addxml('Hxpath = Hxpath + 1;');
        this.Incphxpath(1);

        for(let i = 0; i<15; i++)
        {
            this.Addxml(`heapxpath[(int)Hxpath] = ${"-".charCodeAt(0)};`);
            this.Addxml('Hxpath = Hxpath + 1;');
            this.Incphxpath(1);
        }

        this.Addxml(`heapxpath[(int)Hxpath] = ${"\n".charCodeAt(0)};`);
        this.Addxml('Hxpath = Hxpath + 1;');
        this.Incphxpath(1);
    }

    public Addcodfunc(texto:string)
    {
        this.cod_funcs.push(`${texto}`);
    }

    public Addcodfuncidentado(texto:string)
    {
        this.cod_funcs.push(`\t${texto}`);
    }

    public Addcomentariofunc(texto:string)
    {
        //Se agrega un comentario al código
        this.cod_funcs.push(`\t/*********** ${texto} ***********/`);
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

    public Joinfunc()
    {
        let cadena = this.cod_funcs.join('\n');

        //Se agrega al código inicial
        this.Addcomentario('Funciones nativas');
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

    public Incphxpath(cant: number)
    {
        this.ptrhxpath = this.ptrhxpath + cant;
    }

    public Incpsxpath(cant: number)
    {
        this.ptrsxpath = this.ptrsxpath + cant;
    }

    public Decpsxpath(cant: number)
    {
        this.ptrsxpath = this.ptrsxpath - cant;
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

    public GetHeapposxpath(): number
    {
        return this.ptrhxpath;
    }

    public GetStackposxpath(): number
    {
        return this.ptrsxpath;
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

    //Funciones nativas
    public Printf()
    {
        //Temporal para almacenar la posición del stack con el contenido
        let temp_stack_cont = this.Creartemp();
        //Temporal para obtener la posición del contenido dentro de la función nativa
        let temp_sp_pos = this.Creartemp();
        //Temporal para el contenido referenciado por el puntero stack
        let temp_sp_cont = this.Creartemp();
        //Temporal de contenido del heap
        let temp_heap = this.Creartemp();
        //Temporal para el almacenamiento del cambio de ámbito
        let temp_entorno = this.Creartemp();
        //Temporal para el return
        let temp_return = this.Creartemp();

        //Etiquetas de control
        let lbl_init = this.Crearetiqueta();
        let lbl_cond = this.Crearetiqueta();

        this.Addcomentarioxml('Impresión de la consulta');
        this.Addcomentarioxml('Ajuste de punteros y estructuras');

        //Se obtiene la posición en el stackxpath donde está el contenido del heapxpath
        this.Addxml(`${temp_stack_cont} = stackxpath[(int)${this.GetStackposxpath()-1}];`);

        //Se realiza el cambio de entorno de acuerdo a la cantidad de elementos de la función
        this.Addxml(`${temp_entorno} = Sxpath + ${this.GetStackposxpath()};`);
        //Se deja una posición vacía para el retorno
        this.Addxml(`${temp_entorno} = ${temp_entorno} + 1;`)

        //Asignamos en el stackxpath en la nueva posición lo que se desea imprimir
        this.Addxml(`stackxpath[(int)${temp_entorno}] = ${temp_stack_cont};`);

        //Ajustamos el puntero
        this.Addxml(`Sxpath = Sxpath + ${this.GetStackposxpath()};`)

        //Llamado de función
        this.Addxml('Printconsulta();\n')

        this.Addcodfunc('void Printconsulta() {');

        //En la posición del puntero + 1 está el contenido a imprimir (colocado antes del llamado a la función)
        this.Addcodfuncidentado(`${temp_sp_pos} = Sxpath + 1;`);

        //Se obtiene el contenido referenciado por el puntero stack (posición del heap)
        this.Addcodfuncidentado(`${temp_sp_cont} = stackxpath[(int)${temp_sp_pos}];`);

        //Etiqueta de inicio
        this.Addcodfuncidentado(`${lbl_init}:\n`);
        
        //Se obtiene lo que hay en el heap en la posición que tiene el stack
        this.Addcodfuncidentado(`${temp_heap} = heapxpath[(int)${temp_sp_cont}];`);

        this.Addcodfuncidentado(`if(${temp_heap} == -1) goto ${lbl_cond};`);

        this.Addcodfuncidentado(`printf("%c", (char)${temp_heap});`);

        //Se aumenta el temp de la posición del heap
        this.Addcodfuncidentado(`${temp_sp_cont} = ${temp_sp_cont} + 1;`);

        this.Addcodfuncidentado(`goto ${lbl_init};`);
        this.Addcodfuncidentado(`${lbl_cond}:\n`);
        this.Addcodfuncidentado(`return;\n}\n`);

        //Parte final del llamado en el main
        this.Addcomentarioxml('Ajustes luego del llamado a la función');

        //Se obtiene el posible retorno
        this.Addxml(`${temp_return} = stackxpath[(int)Sxpath];`);

        //Se regresa el puntero
        this.Addxml(`Sxpath = Sxpath - ${this.GetStackposxpath()};`);

        //Imprimir un salto de linea
        this.Addxml(`printf("%c", (char)10);\n`)
    }
}