sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/ui/thirdparty/jquery",
    "sap/base/Log",
    "sap/ui/util/Storage",
  ],
  function (Controller, History, UIComponent, JSONModel, jQuery, Log, Storage) {
    "use strict";

    const urlBase = "https://inv.dnsalias.com:9101";

    return Controller.extend(
      "com.inv.sapfioriwebinvertions.controller.BaseController",
      {
        onInit: function () {}, // This executes only the first time

        getRouter: function () {
          return UIComponent.getRouterFor(this);
        },

        decryptDataFromStorage: function (key) {
          let storage = new Storage(Storage.Type.local);
          let encryptedData = storage.get(key);

          if (!encryptedData) {
            return null;
          }

          try {
            return atob(encryptedData); // Desencriptar base64 (ajusta según el cifrado real)
          } catch (e) {
            Log.error("Error al desencriptar datos:", e);
            return null;
          }
        },

        onNavBack: function () {
          let oHistory, sPreviousHash;
          oHistory = History.getInstance();
          sPreviousHash = oHistory.getPreviousHash();

          if (sPreviousHash !== undefined) {
            window.history.go(-1);
          } else {
            this.getRouter().navTo("RouteLogin", {}, true /* no history */);
          }
        },

        //----------------------------------------------------------------------------
        //*FIC: For Security
        //----------------------------------------------------------------------------

        //----------------------------------------------------------------------------
        //*FIC: For Executing APIs
        //----------------------------------------------------------------------------
        _fetchModel: function (endpoint, token, logContext) {
          return new Promise((resolve, reject) => {
            jQuery.ajax(endpoint, {
              dataType: "json",
              headers: AUTH_HEADER(token),
              success: function (oData) {
                if (oData.value && oData.value[0] && oData.value[0].success) {
                  Log.info(`Data fetched from: ${logContext}`);
                  resolve(new JSONModel(oData));
                } else {
                  const errorMessage =
                    oData.value && oData.value[0] && oData.value[0].messageUSR
                      ? oData.value[0].messageUSR
                      : `No data available from ${logContext}`;
                  reject(new Error(errorMessage));
                }
              },
              error: function (error) {
                const errorMessage =
                  "Ocurrió un error al intentar obtener los datos";
                Log.error(
                  `Error while trying to fetch data from ${logContext}: ${JSON.stringify(
                    error
                  )}`
                );
                reject(new Error(errorMessage));
              },
            });
          });
        },

        /**
         * Get the Sales Forecast by the given filter via API.
         * @param {*} params
         * @returns {Promise}
         */
        GetSalesForecastByFilter: function (params, token) {
          Log.info("Fetching data from: getSaleForecastByFilter");
          const endpoint = `${urlBase}/api/vta/salesforecast/crud?${new URLSearchParams(
            params
          ).toString()}`;
          return this._fetchModel(endpoint, token, "getSaleForecastByFilter");
        },

        /**
         * Carga un modelo JSON desde un archivo local.
         * @returns {Promise} Retorna un JSONModel con los datos locales.
         */
        _loadLocalModel: function () {
          return new Promise((resolve, reject) => {
            // Asegúrate de que la ruta sea correcta según la estructura de tu proyecto.
            jQuery
              .getJSON("resources/jsons/salesforecast.json", function (data) {
                resolve(new JSONModel(data));
              })
              .fail(function (jqXHR, textStatus, errorThrown) {
                reject(
                  new Error("Error al cargar el archivo local: " + textStatus)
                );
              });
          });
        },
      }
    );
  }
);
