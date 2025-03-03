sap.ui.define(
  [
    "com/inv/sapfioriwebinvertions/controller/BaseController", // Controlador base con funciones comunes
    "sap/ui/model/json/JSONModel", // Modelo para manejar datos JSON
    "sap/ui/util/Storage", // Utilidad para manejo de almacenamiento (no se usa en este bloque)
    "sap/ui/core/BusyIndicator", // Indicador visual para procesos en curso
    "sap/m/MessageToast", // Componente para mostrar mensajes tipo toast
    "sap/base/Log", // Herramienta de logging (no se utiliza en el bloque actual)
    "sap/ui/core/library", // Biblioteca adicional de SAPUI5
  ],
  function (BaseController, JSONModel, Storage, BusyIndicator, MessageToast) {
    "use strict";

    return BaseController.extend(
      "com.inv.sapfioriwebinvertions.controller.pages.salesforecast.SalesForecastMainTable",
      {
        /**
         * @override
         * Método de inicialización de la vista.
         * Se adjunta el evento de coincidencia de ruta "RouteSalesForecast" para invocar _onRouteMatched.
         */
        onInit: function () {
          let oRouter = this.getRouter();
          oRouter
            .getRoute("RouteSalesForecast")
            .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: async function (oEvent) {
          // Mostrar el indicador de carga
          BusyIndicator.show(0);

          // Obtener la referencia a la tabla en la vista
          const oTable = this.byId("IdTable1SalesForecastMainTable");
          // Crear un modelo JSON vacío
          const oModel = new JSONModel();

          // Cargar datos desde el archivo local ubicado en "resources/jsons/salesforecast.json"
          oModel.loadData("resources/jsons/salesforecast.json"); //Esta es la parte donde obtienen los datos estáticos del JSON

          // Cuando la carga se complete exitosamente, se asigna el modelo a la tabla
          oModel.attachRequestCompleted((oEvent) => {
            if (oEvent.getParameter("success")) {
              oTable.setModel(oModel);
            } else {
              MessageToast.show("Error al cargar los datos.");
            }
            // Ocultar el indicador de carga
            BusyIndicator.hide();
          });

          // Si falla la carga del archivo, se muestra un mensaje de error y se oculta el indicador de carga
          oModel.attachRequestFailed(() => {
            MessageToast.show("No se pudo cargar el archivo JSON.");
            BusyIndicator.hide();
          });
        },

        //*FIC: Otros Controladores de Eventos
        // Aquí se podrían agregar otros métodos y eventos según se requiera
      }
    );
  }
);
