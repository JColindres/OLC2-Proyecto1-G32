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
  /*const er = new errorGram.Error({ tipo: 'léxico', linea: `${yylineno + 1}`, descripcion: `El lexema "${yytext}" en la columna: ${yylloc.first_column + 1} no es válido.` });
  tablaErrores.Errores.getInstance().push(er);*/
}

<<EOF>>				        return 'EOF';

/lex

/********************************************* PARTE SINTÁCTICA *********************************************/
/*********Área declaraciones*********/
%{
    const errorGram = require("../arbol/error");
    const tablaErrores = require("../arbol/errores");
    const {Objeto} = require("../abstractas/objeto");
    const {Atributo} = require("../abstractas/atributo");
    const {Prologo} = require("../abstractas/prologo");

    const ValAsc = require("../Reportes/ValAscendente");
    const RepoGram = require("../Reportes/RepGramAscXML");
%}

/*********Asociación de operadores y precedencias*********/

/*No*/

%start INIT

%%
/*********Área de producciones*********/

INIT
    : PROLOGO NODORAICES EOF            { /*RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'INIT -> PROLOGO NODORAICES EOF', 
                                        reglas:'INIT.lista = NODORAICES.lista; return(prologo: PROLOGO.lista, cuerpo: INIT.lista);'}));*/
                                        /*$$ = $2; return { prologo: $1, cuerpo: $$};*/ }  
;

PROLOGO
    : ETABRE INTERR IDENTIFICADOR IDENTIFICADOR ASIGN CADENA IDENTIFICADOR ASIGN CADENA INTERR ETCIERRE     { /*RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'PROLOGO -> ETABRE INTERR IDENTIFICADOR IDENTIFICADOR ASIGN CADENA IDENTIFICADOR ASIGN CADENA INTERR ETCIERRE;', 
                                                                                                            reglas:'PROLOGO.Prolog = new Prologo(CADENA1.val, CADENA2.val);'}));*/
                                                                                                            /*$$ = new Prologo($6,$9);*/ }
;  

NODORAICES
    : NODORAIZ NODORAICES_PRIM  { }
;

NODORAICES_PRIM
    : NODORAIZ NODORAICES_PRIM  { }
    |       
;

NODORAIZ
    : OBJETO            { /*RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'NODORAIZ -> OBJETO', 
                        reglas:'NODORAIZ.lista = OBJETO.lista;'}));*/
                        /*$$ = $1;*/ }
;

OBJETO
    : ETABRE IDENTIFICADOR LISTAATRIBUTOS ETIQUETAFIN
;

ETIQUETAFIN
    : DOBLEMULTIPLE     { }
    | DOBLESIMPLE       { }
    | ETIQUETAUNARIA    { }
;

DOBLEMULTIPLE
    : ETCIERRE OBJETO ETABRE BARRA IDENTIFICADOR ETCIERRE  { }
;

DOBLESIMPLE
    : ETCIERRE LISTA_IDS ETABRE BARRA IDENTIFICADOR ETCIERRE    { }
;

ETIQUETAUNARIA
    : BARRA ETCIERRE                { }
;

/*OBJETOS
    : OBJETO OBJETOS_PRIM   { }
;

OBJETOS_PRIM
    : OBJETO OBJETOS_PRIM   { }
    |                       { }
;
*/
LISTAATRIBUTOS
    : ATRIBUTOS                 { /*RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'LISTAATRIBUTOS -> ATRIBUTOS',
                                reglas:'LISTAATRIBUTOS.lista = ATRIBUTOS.lista;'}));
                                $$ = $1;*/ }
    | /*ε*/                     { /*RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'LISTAATRIBUTOS -> ε',
                                reglas:'LISTAATRIBUTOS.lista = [];'}));
                                $$ = []; */}
;

ATRIBUTOS
    : ATRIBUTO ATRIBUTOS_PRIM   { }
;

ATRIBUTOS_PRIM
    : ATRIBUTO ATRIBUTOS_PRIM   { }
    | 
;

ATRIBUTO
    : IDENTIFICADOR ASIGN CADENA    { /*RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'ATRIBUTO -> IDENTIFICADOR ASIGN CADENA', 
                                    reglas:'ATRIBUTO.Atributo = new Atributo(IDENTIFICADOR.val, CADENA.val);'}));
                                    $$ = new Atributo($1, $3, @1.first_line, @1.first_column);*/ }
;

LISTA_IDS
    : IDENTIFICADOR LISTA_IDS_PRIM  { }
    | TEXTO LISTA_IDS_PRIM          { }
    | HREF LISTA_IDS_PRIM           { }
    | DIGITO LISTA_IDS_PRIM         { }
    | INTERR LISTA_IDS_PRIM         { }
    | BARRA LISTA_IDS_PRIM          { }
;

LISTA_IDS_PRIM
    : IDENTIFICADOR LISTA_IDS_PRIM  { }
    | TEXTO LISTA_IDS_PRIM          { }
    | HREF LISTA_IDS_PRIM           { }
    | DIGITO LISTA_IDS_PRIM         { }
    | INTERR LISTA_IDS_PRIM         { }
    | BARRA LISTA_IDS_PRIM          { }
    | 
;

HREF
    : LT        { /*RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'HREF -> LT', reglas:' HREF.val = LT;'})); $$ = $1;*/ }
    | GT        { /*RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'HREF -> GT', reglas:' HREF.val = GT;'})); $$ = $1;*/ }
    | AMP       { /*RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'HREF -> AMP', reglas:' HREF.val = AMP;'})); $$ = $1;*/ }
    | APOS      { /*RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'HREF -> APOS', reglas:' HREF.val = APOS;'})); $$ = $1;*/ }
    | QUOT      { /*RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'HREF -> QUOT', reglas:' HREF.val = QUOT;'})); $$ = $1;*/ }
;