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
//"Print"                        return 'RPRINT';

/***Caracteres del lenguaje***/

"="                         return 'ASIGN';
";"                         return 'PTCOMA';
"/"                         return 'BARRA';
"<"                         return 'ETABRE';
">"                         return 'ETCIERRE';
"&"                         return 'AMPERSAND';
"?"                         return 'INTERR'

/***Otras ER***/ 
[a-zA-Z_][a-zA-ZñÑ0-9_]*	return 'IDENTIFICADOR';
["][^\"]*["]                return 'CADENA';
//[^><\"\'&]*                 return 'TEXTO';

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
    : ETABRE IDENTIFICADOR LISTAATRIBUTOS ETCIERRE OBJETOS ETABRE BARRA IDENTIFICADOR ETCIERRE              { $$ = new Objeto($2,'',@1.first_line, @1.first_column,$3,$5); }
    | ETABRE IDENTIFICADOR LISTAATRIBUTOS ETCIERRE LISTA_IDS ETABRE BARRA IDENTIFICADOR ETCIERRE            { $$ = new Objeto($2,$5,@1.first_line, @1.first_column,$3,[]); }
    | ETABRE IDENTIFICADOR LISTAATRIBUTOS BARRA ETCIERRE                                                    { $$ = new Objeto($2,'',@1.first_line, @1.first_column,$3,[]); }
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
    | IDENTIFICADOR                     { $$ = [$1]; }
;