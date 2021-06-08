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
  const er = new errorGram.Error({ tipo: 'léxico', linea: `${yylineno + 1}`, descripcion: `El lexema "${yytext}" en la columna: ${yylloc.first_column + 1} no es válido.` });
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
%}

/*********Asociación de operadores y precedencias*********/

/*No*/

%start INIT

%%
/*********Área de producciones*********/

INIT
    : PROLOGO NODORAICES EOF                { $$ = $2; return { prologo: $1, cuerpo: $$}; }  
;

PROLOGO
    : ETABRE INTERR IDENTIFICADOR IDENTIFICADOR ASIGN CADENA IDENTIFICADOR ASIGN CADENA INTERR ETCIERRE       { $$ = new Prologo($6,$9); }
;  

NODORAICES
    : NODORAICES NODORAIZ           { $1.push($2); $$ = $1; }
    | NODORAIZ                      { $$ = [$1]; }
;

NODORAIZ
    : OBJETO                        { $$ = $1; }
;

OBJETO
    : ETABRE IDENTIFICADOR LISTAATRIBUTOS ETCIERRE OBJETOS ETABRE BARRA IDENTIFICADOR ETCIERRE              { $$ = new Objeto($2,'',@1.first_line, @1.first_column,$3,$5,true); }
    | ETABRE IDENTIFICADOR LISTAATRIBUTOS ETCIERRE LISTA_IDS ETABRE BARRA IDENTIFICADOR ETCIERRE            { $$ = new Objeto($2,$5,@1.first_line, @1.first_column,$3,[],true); }
    | ETABRE IDENTIFICADOR LISTAATRIBUTOS BARRA ETCIERRE                                                    { $$ = new Objeto($2,'',@1.first_line, @1.first_column,$3,[],false); }
;

OBJETOS
    : OBJETOS OBJETO            { $1.push($2); $$ = $1; }
    | OBJETO                    { $$ = [$1]; }
;

LISTAATRIBUTOS
    : ATRIBUTOS                     { $$ = $1; }
    |                               { $$ = []; }
;

ATRIBUTOS
    : ATRIBUTOS ATRIBUTO            { $1.push($2); $$ = $1; }
    | ATRIBUTO                      { $$ = [$1]; }
;

ATRIBUTO
    : IDENTIFICADOR ASIGN CADENA        { $$ = new Atributo($1, $3, @1.first_line, @1.first_column); }
;

LISTA_IDS
    : LISTA_IDS IDENTIFICADOR           { $1.push($2); $$ = $1; }
    | LISTA_IDS TEXTO                   { $1.push($2); $$ = $1; }
    | LISTA_IDS HREF                    { $1.push($2); $$ = $1; }
    | LISTA_IDS DIGITO                  { $1.push($2); $$ = $1; }
    | LISTA_IDS INTERR                  { $1.push($2); $$ = $1; }
    | LISTA_IDS BARRA                   { $1.push($2); $$ = $1; }
    | IDENTIFICADOR                     { $$ = [$1]; }
    | TEXTO                             { $$ = [$1]; }
    | HREF                              { $$ = [$1]; }
    | DIGITO                            { $$ = [$1]; }
    | INTERR                            { $$ = [$1]; }
    | BARRA                             { $$ = [$1]; }
;

HREF
    : LT          { $$ = $1; }
    | GT          { $$ = $1; }
    | AMP         { $$ = $1; }
    | APOS        { $$ = $1; }
    | QUOT        { $$ = $1; }
;