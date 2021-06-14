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
    const errorGram = require("../arbol/error");
    const tablaErrores = require("../arbol/errores");
    const {Objeto} = require("../abstractas/objeto");
    const {Atributo} = require("../abstractas/atributo");
    const {Prologo} = require("../abstractas/prologo");

    const { NodoAST }= require('../arbol/nodoAST');

    /*const ValDesc = require("../Reportes/ValDescendente");
    const RepoGram = require("../Reportes/RepGramDescXML");*/
%}

/*********Asociación de operadores y precedencias*********/

%start INIT

%%
/*********Área de producciones*********/

INIT
    : PROLOGO NODORAICES  EOF            { return new NodoAST({label: 'INIT', hijos: [$1, $2], linea: yylineno}); }  
;

PROLOGO
    : ETABRE INTERR IDENTIFICADOR IDENTIFICADOR ASIGN CADENA IDENTIFICADOR ASIGN CADENA INTERR ETCIERRE { $$ = new NodoAST({label: 'PROLOGO', hijos: [$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11], linea: yylineno}); }
;  

NODORAICES
    : NODORAIZ NODORAICES_PRIM      { $$ = new NodoAST({label: 'NODORAICES', hijos: [$1, $2], linea: yylineno}); }
;

NODORAICES_PRIM
    : NODORAIZ NODORAICES_PRIM      { $$ = new NodoAST({label: 'NODORAICES_PRIM', hijos: [$1, $2], linea: yylineno}); }
    |                               { $$ = ' '; }
;

NODORAIZ
    : INICIO_ETI CONTETIQUETA       { $$ = new NodoAST({label: 'NODORAIZ', hijos: [$1, $2], linea: yylineno}); }
;

INICIO_ETI
    : ETABRE IDENTIFICADOR      { $$ = new NodoAST({label: 'INICIO_ETI', hijos: [$1, $2], linea: yylineno}); }
;

CONTETIQUETA
    : ETIQUETA              { $$ = new NodoAST({label: 'CONTETIQUETA', hijos: [$1], linea: yylineno}); }
;

ETIQUETA
    : ATRIBUTOS FIN_ETI     { $$ = new NodoAST({label: 'ETIQUETA', hijos: [$1, $2], linea: yylineno}); }
    | FIN_ETI               { $$ = new NodoAST({label: 'ETIQUETA', hijos: [$1], linea: yylineno}); }
;

FIN_ETI
    : ETCIERRE LISTA_IDS ETABRE BARRA IDENTIFICADOR ETCIERRE    { $$ = new NodoAST({label: 'FIN_ETI', hijos: [$1, $2, $3, $4, $5, $6], linea: yylineno}); }
    | ETCIERRE L_ETIQUETAS BARRA IDENTIFICADOR ETCIERRE         { $$ = new NodoAST({label: 'FIN_ETI', hijos: [$1, $2, $3, $4, $5], linea: yylineno}); }
    | ETCIERRE ETABRE BARRA IDENTIFICADOR ETCIERRE/*AQUÍ VA FINETIQUETA EN VEZ DE ETABRE...ETCIERRE*/{ $$ = new NodoAST({label: 'FIN_ETI', hijos: [$1, $2, $3, $4, $5], linea: yylineno}); }
    | BARRA ETCIERRE                                            { $$ = new NodoAST({label: 'FIN_ETI', hijos: [$1, $2], linea: yylineno}); }
;

L_ETIQUETAS
    : NUEVAETIQUETA L_ETIQUETAS_PRIM    { $$ = new NodoAST({label: 'L_ETIQUETAS', hijos: [$1, $2], linea: yylineno}); }
;

L_ETIQUETAS_PRIM
    : NUEVAETIQUETA L_ETIQUETAS_PRIM    { $$ = new NodoAST({label: 'L_ETIQUETAS_PRIM', hijos: [$1, $2], linea: yylineno}); }
    | ETABRE                            { $$ = new NodoAST({label: 'L_ETIQUETAS_PRIM', hijos: [$1], linea: yylineno}); }
    /*| FINETIQUETA L_ETIQUETAS_PRIM*/
    /*| error { }*/
;

NUEVAETIQUETA
    : INICIO_ETI CONTETIQUETA   { $$ = new NodoAST({label: 'NUEVAETIQUETA', hijos: [$1, $2], linea: yylineno}); }
;

/*FINETIQUETA
    : ETABRE BARRA IDENTIFICADOR ETCIERRE
;*/

ATRIBUTOS
    : ATRIBUTO ATRIBUTOS_PRIM   { $$ = new NodoAST({label: 'ATRIBUTOS', hijos: [$1, $2], linea: yylineno}); }
;

ATRIBUTOS_PRIM
    : ATRIBUTO ATRIBUTOS_PRIM   { $$ = new NodoAST({label: 'ATRIBUTOS_PRIM', hijos: [$1, $2], linea: yylineno}); }
    |                           { $$ = ' '; }
;

ATRIBUTO
    : IDENTIFICADOR ASIGN CADENA    { $$ = new NodoAST({label: 'ATRIBUTO', hijos: [$1, $2, $3], linea: yylineno}); }
;

LISTA_IDS
    : L_CONT LISTA_IDS_PRIM     { $$ = new NodoAST({label: 'LISTA_IDS', hijos: [$1, $2], linea: yylineno}); }
;

LISTA_IDS_PRIM
    : L_CONT LISTA_IDS_PRIM { $$ = new NodoAST({label: 'LISTA_IDS_PRIM', hijos: [$1, $2], linea: yylineno}); }
    |                       { $$ = ' '; }
;

L_CONT
    : IDENTIFICADOR   { $$ = new NodoAST({label: 'IDENTIFICADOR', hijos: [$1], linea: yylineno}); }
    | TEXTO           { $$ = new NodoAST({label: 'TEXTO', hijos: [$1], linea: yylineno}); }
    | HREF            { $$ = new NodoAST({label: 'HREF', hijos: [$1], linea: yylineno}); }
    | DIGITO          { $$ = new NodoAST({label: 'DIGITO', hijos: [$1], linea: yylineno}); }
    | INTERR          { $$ = new NodoAST({label: 'INTERR', hijos: [$1], linea: yylineno}); }
    | BARRA           { $$ = new NodoAST({label: 'BARRA', hijos: [$1], linea: yylineno}); }
;

HREF
    : LT        { /*RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'HREF -> LT', reglas:' HREF.val = LT;'})); $$ = $1;*/
                $$ = new NodoAST({label: 'LT', hijos: [$1], linea: yylineno});  }
    | GT        { /*RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'HREF -> GT', reglas:' HREF.val = GT;'})); $$ = $1;*/ 
                $$ = new NodoAST({label: 'GT', hijos: [$1], linea: yylineno}); }
    | AMP       { /*RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'HREF -> AMP', reglas:' HREF.val = AMP;'})); $$ = $1;*/ 
                $$ = new NodoAST({label: 'AMP', hijos: [$1], linea: yylineno}); }
    | APOS      { /*RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'HREF -> APOS', reglas:' HREF.val = APOS;'})); $$ = $1;*/ 
                $$ = new NodoAST({label: 'APOS', hijos: [$1], linea: yylineno}); }
    | QUOT      { /*RepoGram.RepGramAscXML.getInstance().push(new ValAsc.ValAscendente({produccion:'HREF -> QUOT', reglas:' HREF.val = QUOT;'})); $$ = $1;*/ 
                $$ = new NodoAST({label: 'QUOT', hijos: [$1], linea: yylineno}); }
;