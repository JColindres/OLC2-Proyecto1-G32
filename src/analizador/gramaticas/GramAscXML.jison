/********************************************* PARTE LÉXICA *********************************************/
/*********Área de definiciones*********/
%lex

%options case-insensitive

%s                          comment
%%
/*********Área de reglas léxicas*********/

/***ER***/ 
//<!--(([^-])|(-([^-])))*-->      return 'COMENTARIO';
//<!--(.*?)-->                    return 'COMENTARIO';
<comment>[<]!--[\s\S\n]*?-->      return 'COMENTARIO';


/***Palabras reservadas***/ 
/*  < > & ' "  */
"&lt;"                      return 'LT'
"&gt;"                      return 'GT'
"&amp;"                     return 'AMP'
"&apos;"                    return 'APOS'
"&quot;"                    return 'QUOT'

/***Caracteres del lenguaje***/
"="                         return 'ASIGN';
"/"                         return 'BARRA';
"<"                         return 'ETABRE';
">"                         return 'ETCIERRE';
"?"                         return 'INTERR'

/***Otras ER***/ 
([a-zA-Z_])[a-zA-ZñÑ0-9_-]*	    return 'IDENTIFICADOR';
["][^\"]*["]                    return 'CADENA';
([^ \r\t\na-zA-ZñÑ0-9_><\"\'&]) return 'TEXTO';
[0-9]                           return 'DIGITO'

[ \r\t]+                    {/*Ignorar espacios en blanco*/}
\n                          {/*Ignorar espacios en blanco*/}


. {
  const er = new errorGram.Error({ tipo: 'Léxico', linea: `${yylineno + 1}`, descripcion: `El lexema "${yytext}" en la columna: ${yylloc.first_column + 1} no es válido.` });
  tablaErrores.Errores.getInstance().push(er);
}

<<EOF>>				        return 'EOF';

/lex

/********************************************* PARTE SINTÁCTICA *********************************************/
/*********Área declaraciones*********/
%{
    //Req. para recopilación de errores
    const errorGram = require("../arbol/error");
    const tablaErrores = require("../arbol/errores");

    //Req. para el manejo de datos
    const {Objeto} = require("../abstractas/objeto");
    const {Atributo} = require("../abstractas/atributo");
    const {Prologo} = require("../abstractas/prologo");

    //Req. para elaborar el reporte gramatical
    const ValAsc = require("../Reportes/ValAscendente");
    const RepoGram = require("../Reportes/RepGramAscXML");
%}

/*********Asociación de operadores y precedencias*********/

/*No*/

%start INIT

%%
/*********Área de producciones*********/

INIT
    : PROLOGO NODORAICES EOF            { RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'INIT -> PROLOGO NODORAICES EOF', 
                                        reglas:'INIT.lista = NODORAICES.lista; return(prologo: PROLOGO.lista, cuerpo: INIT.lista);'}));
                                        $$ = $2; return { prologo: $1, cuerpo: $$}; }  
;

PROLOGO
    : ETABRE INTERR IDENTIFICADOR IDENTIFICADOR ASIGN CADENA IDENTIFICADOR ASIGN CADENA INTERR ETCIERRE     { RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'PROLOGO -> ETABRE INTERR IDENTIFICADOR IDENTIFICADOR ASIGN CADENA IDENTIFICADOR ASIGN CADENA INTERR ETCIERRE;', 
                                                                                                            reglas:'PROLOGO.Prolog = new Prologo(CADENA1.val, CADENA2.val);'}));
                                                                                                            $$ = new Prologo($6,$9); }
;  

NODORAICES
    : NODORAICES NODORAIZ       { RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'NODORAICES -> NODORAICES NODORAIZ', 
                                reglas:'NODORAICES.lista = NODORAICES1.lista; NODORAICES.lista.push(NODORAIZ);'}));
                                $1.push($2); $$ = $1; }
    | NODORAIZ                  { RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'NODORAICES -> NODORAIZ', 
                                reglas:'NODORAICES.lista = [NODORAIZ];'}));
                                $$ = [$1]; }
;

NODORAIZ
    : OBJETO            { RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'NODORAIZ -> OBJETO', 
                        reglas:'NODORAIZ.lista = OBJETO.lista;'}));
                        $$ = $1; }
;

OBJETO
    : ETABRE IDENTIFICADOR LISTAATRIBUTOS ETCIERRE OBJETOS ETABRE BARRA IDENTIFICADOR ETCIERRE      { RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'OBJETO -> ETABRE IDENTIFICADOR LISTAATRIBUTOS ETCIERRE OBJETOS ETABRE BARRA IDENTIFICADOR ETCIERRE', 
                                                                                                    reglas:'OBJETO.Objeto = new Objeto(IDENTIFICADOR.val, \'  \', linea.val, columna.val, LISTAATRIBUTOS.lista, OBJETOS.lista, true);'}));
                                                                                                    /*Validación de etiqueta de apertura y de cierre iguales*/
                                                                                                    if($2 != $8)
                                                                                                    {                                                                                                        
                                                                                                        tablaErrores.Errores.getInstance().push(new errorGram.Error({ tipo: 'Semántico', linea: `${yylineno + 1}`, descripcion: `Etiqueta de apertura "${$2}" y de cierre "${$8}" no coinciden. Columna: ${this._$.first_column + 1}.`}));
                                                                                                    };
                                                                                                    $$ = new Objeto($2,'',@1.first_line, @1.first_column,$3,$5,true); }
    | ETABRE IDENTIFICADOR LISTAATRIBUTOS ETCIERRE LISTA_IDS ETABRE BARRA IDENTIFICADOR ETCIERRE    { RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'OBJETO -> ETABRE IDENTIFICADOR LISTAATRIBUTOS ETCIERRE LISTA_IDS ETABRE BARRA IDENTIFICADOR ETCIERRE', 
                                                                                                    reglas:'OBJETO.Objeto = new Objeto(IDENTIFICADOR.val, LISTA_IDS.lista, linea.val, columna.val, LISTAATRIBUTOS.lista, [], true);'}));
                                                                                                    /*Validación de etiqueta de apertura y de cierre iguales*/
                                                                                                    if($2 != $8)
                                                                                                    {                                                                                                        
                                                                                                        tablaErrores.Errores.getInstance().push(new errorGram.Error({ tipo: 'Semántico', linea: `${yylineno + 1}`, descripcion: `Etiqueta de apertura "${$2}" y de cierre "${$8}" no coinciden. Columna: ${this._$.first_column + 1}.`}));
                                                                                                    };
                                                                                                    $$ = new Objeto($2,$5,@1.first_line, @1.first_column,$3,[],true); }
    | ETABRE IDENTIFICADOR LISTAATRIBUTOS BARRA ETCIERRE                                            { RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'OBJETO -> ETABRE IDENTIFICADOR LISTAATRIBUTOS BARRA ETCIERRE', 
                                                                                                    reglas:'OBJETO.Objeto = new Objeto(IDENTIFICADOR.val, \'  \', linea.val, columna.val, LISTAATRIBUTOS.lista, [], false);'}));
                                                                                                    $$ = new Objeto($2,'',@1.first_line, @1.first_column,$3,[],false); }
;

OBJETOS
    : OBJETOS OBJETO        { RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'OBJETOS -> OBJETOS OBJETO', 
                            reglas:'OBJETOS.lista = OBJETOS1.lista; OBJETOS.lista.push(OBJETO);'}));
                            $1.push($2); $$ = $1; }
    | OBJETO                { RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'OBJETOS -> OBJETOS OBJETO', 
                            reglas:'OBJETOS.lista = [OBJETO];'}));
                            $$ = [$1]; }
;

LISTAATRIBUTOS
    : ATRIBUTOS                 { RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'LISTAATRIBUTOS -> ATRIBUTOS',
                                reglas:'LISTAATRIBUTOS.lista = ATRIBUTOS.lista;'}));
                                $$ = $1; }
    | /*ε*/                     { RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'LISTAATRIBUTOS -> ε',
                                reglas:'LISTAATRIBUTOS.lista = [];'}));
                                $$ = []; }
;

ATRIBUTOS
    : ATRIBUTOS ATRIBUTO        { RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'ATRIBUTOS -> ATRIBUTOS ATRIBUTO', 
                                reglas:'ATRIBUTOS.lista = ATRIBUTOS1.lista; ATRIBUTOS.lista.push(ATRIBUTO)'}));
                                $1.push($2); $$ = $1; }
    | ATRIBUTO                  { RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'ATRIBUTOS -> ATRIBUTO', 
                                reglas:'ATRIBUTOS.lista = [ATRIBUTO];'}));
                                $$ = [$1]; }
;

ATRIBUTO
    : IDENTIFICADOR ASIGN CADENA    { RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'ATRIBUTO -> IDENTIFICADOR ASIGN CADENA', 
                                    reglas:'ATRIBUTO.Atributo = new Atributo(IDENTIFICADOR.val, CADENA.val, linea.val, columna.val);'}));
                                    $$ = new Atributo($1, $3, @1.first_line, @1.first_column); }
;

LISTA_IDS
    : LISTA_IDS IDENTIFICADOR   { RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'LISTA_IDS -> LISTA_IDS IDENTIFICADOR', 
                                reglas:'LISTA_IDS.lista = LISTA_IDS1.lista; LISTA_IDS.lista.push(IDENTIFICADOR.val);'})); 
                                $1.push($2); $$ = $1; }
    | LISTA_IDS TEXTO           { RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'LISTA_IDS -> LISTA_IDS TEXTO', 
                                reglas:'LISTA_IDS.lista = LISTA_IDS1.lista; LISTA_IDS.lista.push(TEXTO.val);'}));
                                $1.push($2); $$ = $1; }
    | LISTA_IDS HREF            { RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'LISTA_IDS -> LISTA_IDS HREF', 
                                reglas:'LISTA_IDS.lista = LISTA_IDS1.lista; LISTA_IDS.lista.push(HREF.val);'})); $1.push($2); 
                                $$ = $1; }
    | LISTA_IDS DIGITO          { RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'LISTA_IDS -> LISTA_IDS DIGITO', 
                                reglas:'LISTA_IDS.lista = LISTA_IDS1.lista; LISTA_IDS.lista.push(DIGITO.val);'})); $1.push($2);
                                $$ = $1; }
    | LISTA_IDS INTERR          { RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'LISTA_IDS -> LISTA_IDS INTERR', 
                                reglas:'LISTA_IDS.lista = LISTA_IDS1.lista; LISTA_IDS.lista.push(INTERR.val);'}));
                                $1.push($2); $$ = $1; }
    | LISTA_IDS BARRA           { RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'LISTA_IDS -> LISTA_IDS BARRA', 
                                reglas:'LISTA_IDS.lista = LISTA_IDS1.lista; LISTA_IDS.lista.push(BARRA.val);'}));
                                $1.push($2); $$ = $1; }
    | IDENTIFICADOR             { RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'LISTA_IDS -> IDENTIFICADOR', 
                                reglas:'LISTA_IDS.lista = [IDENTIFICADOR.val]'}));
                                $$ = [$1]; }
    | TEXTO                     { RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'LISTA_IDS -> TEXTO', 
                                reglas:'LISTA_IDS.lista = [TEXTO.val]'}));
                                $$ = [$1]; }
    | HREF                      { RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'LISTA_IDS -> HREF', 
                                reglas:'LISTA_IDS.lista = [HREF.val]'}));
                                $$ = [$1]; }
    | DIGITO                    { RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'LISTA_IDS -> DIGITO', 
                                reglas:'LISTA_IDS.lista = [DIGITO.val]'}));
                                $$ = [$1]; }
    | INTERR                    { RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'LISTA_IDS -> INTERR', 
                                reglas:'LISTA_IDS.lista = [INTERR.val]'}));
                                $$ = [$1]; }
    | BARRA                     { RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'LISTA_IDS -> BARRA', 
                                reglas:'LISTA_IDS.lista = [BARRA.val]'}));
                                $$ = [$1]; }
;

HREF
    : LT        { RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'HREF -> LT', reglas:' HREF.val = LT;'})); $$ = $1; }
    | GT        { RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'HREF -> GT', reglas:' HREF.val = GT;'})); $$ = $1; }
    | AMP       { RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'HREF -> AMP', reglas:' HREF.val = AMP;'})); $$ = $1; }
    | APOS      { RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'HREF -> APOS', reglas:' HREF.val = APOS;'})); $$ = $1; }
    | QUOT      { RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'HREF -> QUOT', reglas:' HREF.val = QUOT;'})); $$ = $1; }
;