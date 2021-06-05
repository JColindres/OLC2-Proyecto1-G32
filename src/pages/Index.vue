<template>
  <q-page class="constrain q-pa-lg" style="border:0px;margin-right:0;margin-left:0;max-width:100%;">
    <div class="row">
      <div class="col-12">
        <q-btn-group push spread>
        </q-btn-group>

        <q-dialog
          v-model="darkDialog"
          persistent
          :maximized="maximizedToggle"
          transition-show="slide-up"
          transition-hide="slide-down"
        >
          <q-card class="bg-primary text-white">
            <q-bar>
              <div>AST</div>

              <q-space />

              <q-btn dense flat icon="minimize" @click="maximizedToggle = false" :disable="!maximizedToggle">
                <q-tooltip v-if="maximizedToggle" content-class="bg-white text-primary">Minimize</q-tooltip>
              </q-btn>
              <q-btn dense flat icon="crop_square" @click="maximizedToggle = true" :disable="maximizedToggle">
                <q-tooltip v-if="!maximizedToggle" content-class="bg-white text-primary">Maximize</q-tooltip>
              </q-btn>
              <q-btn dense flat icon="close" v-close-popup>
                <q-tooltip content-class="bg-white text-primary">Close</q-tooltip>
              </q-btn>
            </q-bar>

            <q-card-section class="q-pt-none">
              <ast :dot="dot" />
            </q-card-section>
          </q-card>
        </q-dialog>

      </div>
    </div>

    <!-- Editor de codigo -->
    
    <div class="row justify-content-center q-ma-lg">
      <div class="col-12">
        <div class="row">
          <div class="col-md-12" style="width:100%">
          <q-card class="editorXML" style="width:auto">
            <q-bar class="bg-black text-white" style="width:auto">
              <q-btn push label="Ejecutar" icon="play_arrow"/>
            </q-bar>              
            <codemirror v-model="codeXP" :options="cmOptionsXP" />              
          </q-card>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6" style="width:50%">
            <q-card class="editorXML" style="width:auto">
              <q-bar class="bg-black text-white" style="width:auto">
                <q-btn push label="Ejecutar" icon="play_arrow" @click="ejecutar" />
                <q-btn push label="AST" @click="darkDialog = true" />
                <q-space />
                <q-btn push label="Limpiar" icon="cleaning_services" @click="limpiar" />
              </q-bar>              
              <codemirror v-model="code" :options="cmOptions" @input="codigoEditado" />              
            </q-card>
          </div>
          <div class="col-md-6" style="width:50%">
            <q-card class="salidaXML" style="width:auto">
              <q-bar class="text-white" style="background-color: #008803; width:auto">           
                <q-btn push label="Salida" icon="thumb_up_alt"/>
              </q-bar>              
              <codemirror v-model="codeS" :options="cmOptionsS" />              
            </q-card>
          </div>
        </div>
        <q-card class="my-card2">
          <q-splitter
            v-model="splitterModel"
            style="height: auto"
          >

            <template v-slot:before>
              <q-tabs
                v-model="tab"
                vertical
                class="bg-black text-white"
                align="justify"
              >
                <q-tab label="Consola" name="consola" />
                <q-tab label="Errores" name="errores" />
                <q-tab
                  label="Tabla de Símbolos"
                  name="tabla_de_simbolos"
                />
              </q-tabs>
            </template>

            <template v-slot:after>
              <q-tab-panels
                v-model="tab"
                animated
                swipeable
                vertical
                transition-prev="jump-up"
                transition-next="jump-up"
              >
                <q-tab-panel name="consola" class="bg-grey-10 text-white">
                  <q-list dark bordered separator dense>
                    <q-item
                      clickable
                      v-ripple
                      v-for="(item, index) in salida"
                      :key="index"
                    >
                      <q-item-section>{{ item }}</q-item-section>
                    </q-item>
                  </q-list>
                </q-tab-panel>

                <q-tab-panel name="errores" v-if="errores != null && errores.length > 0">
                  <div class="q-pa-md">
                    <q-table
                      title="Lista de Errores Obtenidos"
                      :data="errores"
                      :columns="columns"
                      row-key="name"
                      dark
                      color="amber"
                      dense
                      :pagination="{ rowsPerPage: 0 }"
                      rows-per-page-label="Errores por página"
                    />
                  </div>
                </q-tab-panel>

                <q-tab-panel name="tabla_de_simbolos" v-if="entornos != null && entornos.length > 0">
                  <tabla-simbolos :entornos="entornos" />
                </q-tab-panel>
                
              </q-tab-panels>
            </template>

          </q-splitter>
        </q-card>
      </div>
    </div>

  </q-page>
</template>

<script>
//JS-Beautify
var beautify_js = require('js-beautify').js_beautify
// CodeMirror
import { codemirror } from "vue-codemirror";
// import base style
import "codemirror/lib/codemirror.css";
// import theme style
import "codemirror/theme/abcdef.css";
import "codemirror/theme/the-matrix.css";
import "codemirror/theme/paraiso-dark.css";
// import language js
import "codemirror/mode/xml/xml.js";
import "codemirror/mode/xquery/xquery.js";
// Analizador
import AXml from '../analizador/gramaticas/GramAscXML';
//import AXpath from '../analizador/gramaticas/gramatica_ASC_XPATH';
//Traduccion
import { Errores } from "../analizador/arbol/errores";
import { Error as InstanciaError } from "../analizador/arbol/error";
//import { Entornos } from "../ejecucion/entornos";

export default {
  components: {
    codemirror,
    ast: require("../components/Ast").default,
    tablaSimbolos: require("../components/TablaSimbolos").default,
  },
  data() {
    return {
      splitterModel: 20, // start at 50%
      insideModel: 50,
      darkDialog: false,
      maximizedToggle: true,
      codeXP: "",
      cmOptionsXP: {
        tabSize: 4,
        matchBrackets: true,
        styleActiveLine: true,
        mode: "xquery",
        theme: "paraiso-dark",
        lineNumbers: true,
        line: false,
        indentWithTabs: true,
        lineWrapping: true,
        fixedGutter: true,
      },
      code: "",
      cmOptions: {
        tabSize: 4,
        matchBrackets: true,
        styleActiveLine: true,
        mode: "text/xml",
        theme: "abcdef",
        lineNumbers: true,
        line: false,
        indentWithTabs: true,
        lineWrapping: true,
        fixedGutter: true,     
      },
      codeS: "",
      cmOptionsS: {
        tabSize: 4,
        matchBrackets: true,
        styleActiveLine: true,
        mode: "text/xml",
        theme: "the-matrix",
        lineNumbers: true,
        line: false,
        indentWithTabs: true,
        lineWrapping: true,
        fixedGutter: false,
      },
      output: "salida de ejemplo",
      tab: "editor",
      dot: "",
      salida: [],
      errores: [],
      columns: [
        { name: "tipo", label: "Tipo", field: "tipo", align: "left" },
        { name: "linea", label: "Linea", field: "linea", align: "left" },
        {
          name: "descripcion",
          label: "Descripcion",
          field: "descripcion",
          align: "left",
        },
      ],
      entornos: [],
    };
  },
  methods: {
    notificar(variant, message) {
      this.$q.notify({
        message: message,
        color: variant,
        multiLine: true,
        actions: [
          {
            label: "Aceptar",
            color: "yellow",
            handler: () => {
              /* ... */
            },
          },
        ],
      });
    },
    ejecutar() {
      if (this.code.trim() == "") {
        this.notificar("primary", `El editor está vacío, escriba algo.`);
        return;
      }
      this.inicializarValores();
      try {
        const raiz = AXml.parse(this.code);
        //Validacion de raiz
        if (raiz == null) {
          this.notificar(
            "negative",
            "No se pudo ejecutar"
          );
          return;
        }
        //let ejecucion = new Ejecucion(raiz);
        //this.dot = ejecucion.getDot();
        //Valido si puedo ejecutar (no deben existir funciones anidadas)
        /*if(!ejecucion.puedoEjecutar(raiz)){
          this.notificar("primary", "No se puede realizar una ejecución con funciones anidadas");
          return;
        }*/
        //ejecucion.ejecutar();
        // ejecucion.imprimirErrores();
        //this.salida = ejecucion.getSalida();
        console.log(raiz);
        this.notificar("primary", "Ejecución realizada con éxito");
      } catch (error) {
        this.validarError(error);
      }
      this.errores = Errores.getInstance().lista;
      //this.entornos = Entornos.getInstance().lista;
    },
    inicializarValores() {
      Errores.getInstance().clear();
      //Entornos.getInstance().clear();
      this.errores = [];
      this.entornos = [];
      this.salida = [];
      this.dot = '';
    },
    validarError(error) {
      const json = JSON.stringify(error);
      this.notificar(
        "negative",
        `Se encontraron errores sintácticos, revise el apartado de errores.`
      );
      const objeto = JSON.parse(json);

      if (
        objeto != null &&
        objeto instanceof Object &&
        objeto.hasOwnProperty("hash")
      ) {
        Errores.getInstance().push(
          new InstanciaError({
            tipo: "sintáctico",
            linea: objeto.hash.loc.first_line,
            descripcion: `Se encontró el token ${objeto.hash.token} en lugar de ${objeto.hash.expected} en la columna ${objeto.hash.loc.last_column}.`,
          })
        );
      }
    },
    codigoEditado(codigo){
      this.inicializarValores();
    },
    limpiar(){
      this.code = '';
      this.inicializarValores();
    }
  },
};
</script>

<style lang="css">
.CodeMirror {
  height: auto;
}
</style>