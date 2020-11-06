## Analizadores
---
### Servidor Python

Para el analizador léxico del servidor de python, se empleó el concepto de ir leyendo caracter por caracter la entrada. Ir concatenando las palabras y compararlas para verificar si se trata de una palabra reservad o ID. Asimismo, chequear si viene algún caracter no conocido por el lenguaje *Java*.

Para realizar el analizador sintáctico del traductor de Python, se utilizó el método de análisis sintáctico predictivo, realizandolo mediante Parea/Match.

Toma un simbolo de preanalisis y va realizando comparaciones con el tipo de token que corresponde y está definido en la grámatica. Como entrada recibe la lista de tokens, sin errores.

Por cuestión de espacio, se muestra una porción de la gramática de Java utilizado.

```
INICIO := 'public' SENTENCIA_CLASE LISTA_CLASES INICIO
        | 'public' SENTENCIA_INTERFAZ LISTA_INTERFACES INICIO
        | 'ultimo'

SENTENCIA_CLASE :=  'class' id '{' LISTA_DECLARACION_METODOS_FUNCIONES '}'

LISTA_CLASES := SENTENCIA_CLASE LISTA_CLASES
              | EPSILON

SENTENCIA_INTERFAZ := 'interface' id '{' LISTA_DECLARACION_FUNCIONES '}'  

LISTA_INTERFACES := SENTENCIA_INTERFAZ LISTA_INTERFACES
                  | EPSILON
```

Define el inicio, las clases e interfaces.

Para el método de *Parea/Match* cada terminal debe de hacer un match y cada no terminal es un método. Como se basa en la lista de tokens, al momento de realizar un match, se mueve hacia el siguiente token para realizar un análisis. Haciendolo así hasta llegar al utlimo token.

De existir un error, este se almacena en una lista de errores para ser desplegado en la terminal correspondiente del lado del cliente.

### Servidor JavaScript

Para realizar el análisis sintáctico, se utilizó la herramienta *Jison* para *nodejs*.

Jison toma una gramática libre de contexto como entrada y produce código JavaScript capaz de parsear el lenguaje descrito por dicha gramática. Una vez se tenga el script generado podemos usarlo para parsear la entrada y aceptarla, rechazarla o ejecutar acciones con base en la entrada. Si se está familiarizado con Bison, Yacc o algún otro similar ya se está listo para iniciar. Jison genera tanto el analizador léxico como el analizador sintáctico.



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
* *docker-compose build .* 

* docker-compose up

Es importante estar ubicados en la misma ruta que el archivo *YML*. docker-compose build reliza las configuraciones necesarias. como descargar las imagenes, configurar puertos y demás. Docker-compose up levanta los servicios definidos.