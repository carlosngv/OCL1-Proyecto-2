## Analizadores
---
### Servidor Python

Para el analizador léxico del servidor de python, se empleó el concepto de ir leyendo caracter por caracter la entrada. Ir concatenando las palabras y compararlas para verificar si se trata de una palabra reservad o ID. Asimismo, chequear si viene algún caracter no conocido por el lenguaje *Java*.

Para realizar el analizador sintáctico del traductor de Python, se utilizó el método de análisis sintáctico predictivo, realizandolo mediante Parea/Match.

Toma un simbolo de preanalisis y va realizando comparaciones con el tipo de token que corresponde y está definido en la grámatica. Como entrada recibe la lista de tokens, sin errores.

A continuación, se muestra la gramática de Java utilizada:

```

----------------------------------------------------------- CLASES E INTERFAZ -----------------------------------------------------------

INICIO := 'public' SENTENCIA_CLASE LISTA_CLASES INICIO
        | 'public' SENTENCIA_INTERFAZ LISTA_INTERFACES INICIO
        | 'ultimo'

SENTENCIA_CLASE :=  'class' id '{' LISTA_DECLARACION_METODOS_FUNCIONES '}'

LISTA_CLASES := SENTENCIA_CLASE LISTA_CLASES
              | EPSILON

SENTENCIA_INTERFAZ := 'interface' id '{' LISTA_DECLARACION_FUNCIONES '}'  

LISTA_INTERFACES := SENTENCIA_INTERFAZ LISTA_INTERFACES
                  | EPSILON


------------------------------------------------------- METODOS Y FUNCIONES ------------------------------------------------------------

LISTA_DECLARACION_METODOS_FUNCIONES := DECLARACION_METODOS_FUNCIONES LISTA_DECLARACION_METODOS_FUNCIONESP
                                     | EPSILON

LISTA_DECLARACION_METODOS_FUNCIONESP := DECLARACION_METODOS_FUNCIONES LISTA_DECLARACION_METODOS_FUNCIONESP                      
                                      | EPSILON


LISTA_DECLARACION_FUNCIONES := DECLARACION_FUNCION LISTA_DECLARACION_FUNCIONESP
                           | EPSILON

LISTA_DECLARACION_FUNCIONESP := DECLARACION_FUNCION LISTA_DECLARACION_FUNCIONESP
                            | EPSILON

DECLARACION_METODOS_FUNCIONES := 'public' 'void' id '(' DECLARACION_PARAMETROS 
                               | 'public' TIPO id '(' DECLARACION_PARAMETROS 

DECLARACION_FUNCION := 'public' 'void' id '(' DECLARACION_PARAMETROS_INTERFAZ
                     | 'public' TIPO id '(' DECLARACION_PARAMETROS_INTERFAZ


DECLARACION_PARAMETROS_INTERFAZ := TIPO id LISTA_PARAMETROS ')' ';'
                                 | ')' ';'
   
DECLARACION_PARAMETROS := TIPO id LISTA_PARAMETROS ')' LISTAINSTR_LLAVES
                        | ')' LISTAINSTR_LLAVES
                                
LISTA_PARAMETROS =: ',' TIPO id LISTA_PARAMETROS
                  | EPSILON  


---------------------------------------------------------- TIPO ------------------------------------------------------------------------------------------ 

TIPO := int 
      | double
      | char
      | String
      | boolean

-------------------------------------------------------  INSTRUCCIONES ------------------------------------------------------------------------------------------ 

INSTRUCCION  := DECLARACION_VARIABLE; 
                | SENTENCIA_WHILE 
                | SENTENCIA_IF_ELSE 
                | SENTENCIA_FOR 
                | SENTENCIA_DO_WHILE 
                | SENTENCIA_PRINT 
                | ASIGNACION_SIMPLE 
                | SENTENCIA_CONTINUE 
                | SENTENCIA_BREAK 
                | SENTENCIA_RETURN_FUNCIONES 
                | SENTENCIA_RETURN_METODOS 
                | LLAMADA_METODO 
                | SENTENCIA_MAIN 
                | EPSILON 


LISTA_INSTRUCCIONES := INSTRUCCION LISTA_INSTRUCCIONESP

LISTA_INSTRUCCIONESP := INSTRUCCION LISTA_INSTRUCCIONESP
                      | EPSILON

DECLARACION_VARIABLE := TIPO id DECLARACION_VARIABLEP

DECLARACION_VARIABLEP := LISTA_ID ASIGNACION ;

LISTA_ID := ',' id LISTA_ID
          | EPSILON

LISTAINSTR_LLAVES := '{' LISTA_INSTRUCCIONES '}'

-------------------------------------------------------  LLAMADA METODO ------------------------------------------------------------------------------------------ 

LLAMADA_METODO := id '(' LISTA_PARAMETROS ')' ';'

-------------------------------------------------------  ASIGNACIÓN ------------------------------------------------------------------------------------------ 

ASIGNACION := '=' E ';'
            | EPSILON

ASIGNACION_SIMPLE := id ASIGNACION_SIMPLEP

ASIGNACION_SIMPLEP := '=' E ';'

LLAMADA_METODO := 

------------------------------------------------------- SENTENCIA MAIN ------------------------------------------------------------------------------------------

SENTENCIA_MAIN := 'public' 'static' 'void' 'main' '(' 'String' '[' ']' 'args' ')' LISTAINSTR_LLAVES

------------------------------------------------------- SENTENCIA RETURN ------------------------------------------------------------------------------------------

SENTENCIA_RETURN_FUNCIONES := 'return' E ';'
                            
SENTENCIA_RETURN_METODOS := 'return' ';'


------------------------------------------------------- SENTENCIA CONTINUE ------------------------------------------------------------------------------------------

SENTENCIA_CONTINUE := 'continue' ';'

--------------------------------------------------------- SENTENCIA BREAK ------------------------------------------------------------------------------------------

SENTENCIA_BREAK := 'break' ';'

-------------------------------------------------------- SENTENCIA WHILE -------------------------------------------------------------------------------------------  

SENTENCIA_WHILE := 'while' '(' EXPRESION ')' LISTAINSTR_LLAVES

-------------------------------------------------------- SENTENCIA IF -------------------------------------------------------------------------------------------

SENTENCIA_IF := 'if' '(' EXPRESION ')' LISTAINSTR_LLAVES OPCION_ELSE

OPCION_ELSE := 'else' LISTA_IF 
             | EPSILON 

LISTA_IF := LISTAINSTR_LLAVES 
          | SENTENCIA_IF

--------------------------------------------------------- SENTENCIA FOR ------------------------------------------------------------------------------------------

SENTENCIA_FOR := 'for' '(' DECLARACION_FOR ';' EXPRESION ';' id DECREMENT_INCREMENT ')' LISTAINSTR_LLAVES

DECREMENT_INCREMENT := '++'
                     | '--'

DECLARACION_FOR := TIPO id '=' E 
                 | id '=' E

--------------------------------------------------------- SENTENCIA PRINT ------------------------------------------------------------------------------------------ 

SENTENCIA_PRINT := 'System' '.' 'out' '.' OPCION_PRINT '(' E ')' ';'
OPCION_PRINT := 'println'
              | 'print'

------------------------------------------------------------ CONDICIÓN ----------------------------------------------------------------------------------------------- 

EXPRESION := OPERADOR_NOT E CONDICION CONDICION_LOGICA

OPERADOR_NOT := '!'
               | EPSILON

CONDICION_LOGICA := '&&' EXPRESION
                   | '||' EXPRESION
                   | '^' EXPRESION
                   | EPSILON


CONDICION := '<=' E
           | '>=' EP
           | '>' E 
           | '<' E
           | '!=' E 

------------------------------------------------------- EXPRESIÓN ------------------------------------------------------------------------------------------ 

E := T EP

EP := + T EP
    | - T EP
    | EPSILON

T := F TP

TP := * F TP
    | / F TP
    | EPSILON

F := numero
   | decimal
   | true
   | false
   | id
   | '(' E ')'
   | string
```

Define el inicio, las clases e interfaces.

Para el método de *Parea/Match* cada terminal debe de hacer un match y cada no terminal es un método. Como se basa en la lista de tokens, al momento de realizar un match, se mueve hacia el siguiente token para realizar un análisis. Haciendolo así hasta llegar al utlimo token.

De existir un error, este se almacena en una lista de errores para ser desplegado en la terminal correspondiente del lado del cliente.

### Servidor JavaScript

Para realizar el análisis sintáctico, se utilizó la herramienta *Jison* para *nodejs*.

Jison toma una gramática libre de contexto como entrada y produce código JavaScript capaz de parsear el lenguaje descrito por dicha gramática. Una vez se tenga el script generado podemos usarlo para parsear la entrada y aceptarla, rechazarla o ejecutar acciones con base en la entrada. Si se está familiarizado con Bison, Yacc o algún otro similar ya se está listo para iniciar. Jison genera tanto el analizador léxico como el analizador sintáctico.


Para generar los reportes de errores y tokens, se extrae la lista de cada analizador y se escriben en un archivo *.html*. Obteniendo tablas con la información mencionada.



---
## Arbol de Análisis Sintáctico
#### Construcción del AST
---
#### AST JavaScript
Un árbol de análisis sintáctico o un árbol de derivación es un árbol ordenado y enraizado que representa la estructura sintáctica de una cadena de acuerdo con alguna gramática libre de contexto.

Para realizar el AST dentro del servidor de JavaScript, se definió un objeto *node*, que incluye el valor, tipo, nodos hijos y tradución correspondiente.

Como la estructura de *Jison* maneja un análisis sintáctico ascendente, quiere decir que el árbol se construye desde las hojas hasta la raíz.

```JavaScript
inicio: lista_clases EOF {
    $$ = new Node('INICIO', '');
    $$.setChild($1);
    $$.nodeList = nodeList;
    $$.traduction = $1.traduction;
    this.traduction = $$.traduction;
    $$.errorList = errorList;
    $$.tokenList = tokenList;
    return $$;
}

```

Como se ve en el código anterior, es el nodo de inicio. Cuando termina el análisis de la entrada el nodo de inicio contendrá todos los nodos que se analizaron de abajo hacia arriba, como sus hijos. E irán en cadena realizando la traducción. Es decir, se une la traducción de los hijos y su resultado será la traducción final del padre. Siempre cumpliendo con la sintáxis del lenguaje propuesto. 

Cuando se retorna *$$* se obtiene un objeto que contiene el nodo de inicio (con todos los hijos), la traducción, la lista de errores y la lista de tokens.

```JavaScript
    | error {
        newError = new Error(yytext, this._$.first_line, this._$.first_column);
        errorList.push(newError);
        console.log("4.Error sintáctico en línea: " + this._$.first_line + " y columna: " + this._$.first_column); 
    }
```

Los errores se manejaron de la forma anterior, con una producción de error en posibles lugares de la gramática que pueda suceder un error. Se captura la información del error y se ingresa a la lista de errores.

#### AST Python

El AST del servidor de python es un poco más complicado. Se realiza a mano, mientras se recorre la gramática se fue concatenando el texto del archivo *DOT*

```JavaScript 
    ListaClases() {
    this.Comentario();
    if (
      this.preAnalysis.type == "RESERVED_PUBLIC" &&
      this.tokenList[this.numPreAnalysis + 1].type == "RESERVED_CLASS"
    ) {
      if (!this.primeraListaClases) {
        this.astString += "n" + this.nodeCont + '[label="LISTA_CLASES"];\n';
        this.astString += "n0->n" + this.nodeCont + ";\n";
        this.padreListaClases = "n" + this.nodeCont;
        this.nodeCont++;
        this.primeraListaClases = true;
      }
      this.tabular();
      this.match("RESERVED_PUBLIC");
      this.astString += "n" + this.nodeCont + '[label="public"];\n';
      this.astString += this.padreListaClases + "->n" + this.nodeCont + ";\n";
      this.nodeCont++;
      this.SentenciaClase();
      this.ListaClases();
    }
  }

```

Este es un ejemplo que define los nodos y enlaza de forma manual. Generando así el archivo *DOT*.

Para generar la gráfica del AST, se utilizó la librería *node-graphviz* que puede descargarse del gestor de paquetes *NPM*. Primeramente debe importarse y al terminar de generar el dot, se utiliza el siguiente comando propio de la librería:

``` JavaScript
const { graphviz } = require("node-graphviz");

...

graphviz.dot(this.astString, 'svg').then((svg) => {
        // Write the SVG to file
        fs.writeFileSync('public/ast.svg', svg);
      });
      exec("dot -Tpdf ast.dot -o public/ast.pdf", (error, data, getter) => {
        if(error){
          console.log("error",error.message);
          return;
        }
        if(getter){
          console.log("data",data);
          return;
        }
        console.log("data",data);
      
      });


```

Como resultado es un archivo .svg, que puede visualizarse dentro de los navegadores e incluso dentro de *VSCode* gracias a una extensión previsualizadora.

Para que el cliente pueda descargar los AST y traducción resultante, se utilizaron las siguientes rutas dentro del servidor:

```
parserRouter.get("/downloadTranslation", (req, res) => {
  res.download("public/traduccion.js", "traduccion.js");
});

parserRouter.get("/downloadAST", (req, res) => {
  res.download("public/ast.svg", "ast.svg");
});
```

*res.download* permite al cliente descargar archivos que se encuentren almacenados dentro del servidor, aplica para ambos servidores.

Cabe mencionar que los archivos generados son guardados en una carpeta public dentro del servidor.

## Traducción

La traducción en ambos servidores se realizó de manera similar. 

Para *Python*, mientras se iba recorriendo la gramática, se iba concatenando la traducción, acorde a la sintáxis de *Python*, en una variable de tipo string declarada para toda la clase. Al parsear la entrada, se puede acceder al atributo *traduction* del analizador y así mismo escribir el archivo *.py* correspondiente, utilizando la librería *fs* de *nodejs*.

Para el analizador de *JavaScript*, se parte del mismo concepto de realizar el *AST*. El padre o raíz de la grámatica, obtiene la traducción que se va ligando a los hijos de sus hijos. Obteniendo finalmente la traducción  completa a *JavaScript*. De manera similar, se puede acceder al atributo *traduction* del parser, que devuelve como objeto el *AST*.

---

## Configuración de Contenedores
---

### Dockerfile

A continuación, un ejepmlo de lo que es configurar el Dockerfile de un servidor, en este caso el de JavaScript.

``` dockerfile

FROM node:14
RUN mkdir -p /usr/src/app/JSServer
WORKDIR /usr/src/app/JSServer
COPY package*.json ./
RUN npm install 
COPY . .
EXPOSE 3200

CMD ["npm", "run", "dev"]


```

Primeramente, se debe de obtener la imagen de node, que es en donde se realiza toda la lógica del traductor. Se define la ruta dentro del contenedor donde se trabajará el servidor, hay que dirigirse dentro de esa carpeta con *WORKDIR*, se copia el package json (Se coloca el asteristo para copiar todos los archivos con el prefijo package y extensión .json), se indica que debe ejecutarse la acción *npm install* que manda a traer los modulos necesarios y se copia la carpeta hacia la ruta dentro del contenedor.

Seguidamente, se indica o expone cuál puerto utilizar, cabe mencionar que este puerte es el que se utiliza dentro del contenedor, no en nuestra computadora física. Por último, de preferencia, se indica qué comando de la terminal ejecutar. En este caso, se tiene un script configurado en el *package.json* que ejecuta el servidor con *nodemon* (una dependencia de desarrollo).

Como último paso, para cada Dockerfile generado se debe de construir, es decir realizar un *build* con su respectivo comando en *docker*, esto nos permitirá generar la imagen y subirla a *Dockerhub*.

---
### Docker Compose

*Docker Compose* es una herramienta que nos permite definir y correr multiples servidores. Con Compose, se utilizan archivos *YAML* para configurar los servicios. Luego, con un solo comando se pueden iniciar estos servicios y hacer uso de la aplicación, ahora más compacta.

A continuación, se muestra el archivo *YAML* utilizado para configurar cada uno de los tres servidores.

``` yaml

version: "3"

services:
    Frontend:
        container_name: frontend
        image: goweb:v1
        restart: always
        build: ./Frontend 
        ports:
            - "3900:3900"
        volumes:
            - ./Frontend:/usr/src/app/Frontend
    python-server:
        container_name: pythonserver
        build: ./PythonServer
        ports:
            - "3000:3000"
        volumes:
            - ./PythonServer:/usr/src/app/PythonServer
    js-server:
        container_name: jsserver
        build: ./JSServer
        ports:
            - "3200:3200"
        volumes:
            - ./JSServer:/usr/src/app/JSServer
    


```

Primero que todo, se define la versión a utilizar. En este caso se optó por la tres, pero nunca está de más utilizar la más reciente. Seguido, los servicios. Se puede definir cualquier nombre para cada servicio. Dentro de cada servicio, se define el contenedor, la imagen (si es necesario), la propiedad build que indica en qué ruta se encuentra nuestro contenido para el contenedor, los puertos para el contenedor y local y los volumenes, que son los directorios fuente que son objetivo dentro de los directorios del contenedor.

Ya cuando se termina de configurar se ejecutan los siguientes comandos:
* docker-compose build .
* docker-compose up

Es importante estar ubicados en la misma ruta que el archivo *YML*. docker-compose build reliza las configuraciones necesarias. como descargar las imagenes, configurar puertos y demás. Docker-compose up levanta los servicios definidos.