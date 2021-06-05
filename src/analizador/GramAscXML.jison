/********************************************* PARTE LÉXICA *********************************************/
/*********Área de definiciones*********/
%lex

%%
/*********Área de reglas léxicas*********/

/***ER***/ 
//<!--(([^-])|(-([^-])))*-->      return 'COMENTARIO';
//<!--(.*?)-->                    return 'COMENTARIO';
[<]!--[\s\S\n]*?-->               return 'COMENTARIO';

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
[^><\"\'&]*                 return 'TEXTO';

// [ \r\t]+                    {/*Ignorar espacios en blanco*/}
// \n                          {/*Ignorar espacios en blanco*/}


.					        { console.error('Error léxico: ' + yytext + ', en linea: ' + yylloc.first_line + ', columna: ' + yylloc.first_column); }

<<EOF>>				        return 'EOF';

/lex

/********************************************* PARTE SINTÁCTICA *********************************************/
/*********Área declaraciones*********/
%{
    //Declarar funciones de recopilación de tokens y errores léxicos
    //Exportar funciones para recopilar el ast y formar el archivo de salida
    

%}

/*********Asociación de operadores y precedencias*********/

/*No*/

%start INIT

%%
/*********Área de producciones*********/

INIT
    : PROLOGO NODORAICES EOF                { $$ = $1; }  
;

PROLOGO
    : ETABRE INTERR IDENTIFICADOR ASIGN CADENA IDENTIFICADOR ASIGN CADENA INTERR ETCIERRE       { $$ = $5; $$ = $8; }
;   

NODORAICES
    : NODORAICES NODORAIZ           { $$ = $1; }
    | NODORAIZ                      { $$ = $1; }
;

NODORAIZ
    : OBJETO                        { $$ = $1; }
;

OBJETO
    : ETABRE IDENTIFICADOR LISTAATRIBUTOS ETCIERRE OBJETOS ETABRE BARRA IDENTIFICADOR ETCIERRE                   {  }
    | ETABRE IDENTIFICADOR LISTAATRIBUTOS ETCIERRE LISTA_IDS ETABRE BARRA IDENTIFICADOR ETCIERRE                {  }
    | ETABRE IDENTIFICADOR LISTAATRIBUTOS BARRA ETCIERRE                                                    {  }
;

OBJETOS
    : OBJETOS OBJETO            {  }
    | OBJETO                    {  }
;

LISTAATRIBUTOS
    : ATRIBUTOS                     {  }
    |
;

ATRIBUTOS
    : ATRIBUTOS ATRIBUTO            {  }
    | ATRIBUTO                      {  }
;

ATRIBUTO
    : IDENTIFICADOR ASIGN CADENA        {  }
;

LISTA_IDS
    : LISTA_IDS IDENTIFICADOR           {  }
    | IDENTIFICADOR                     {  }
;