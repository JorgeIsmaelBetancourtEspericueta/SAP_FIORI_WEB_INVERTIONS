sap.ui.define(
  [
    "com/inv/sapfioriwebinvertions/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/Popover",
    "sap/m/List",
    "sap/m/StandardListItem",
    "sap/m/PlacementType",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageToast",
  ],
  function (
    BaseController,
    JSONModel,
    Popover,
    List,
    StandardListItem,
    PlacementType,
    BusyIndicator,
    MessageToast
  ) {
    "use strict";

    return BaseController.extend(
      "com.inv.sapfioriwebinvertions.controller.SalesForecastMainTable",
      {
        onInit: function () {
          let oRouter = this.getRouter();
          oRouter
            .getRoute("RouteSalesForecast")
            .attachPatternMatched(this._onRouteMatched, this);

          let oNavigationModel = new JSONModel({
            selectedKey: "inicio",
            navigation: [
              {
                key: "inicio",
                title: "Inicio",
                icon: "sap-icon://home",
                enabled: true,
                expanded: false,
                items: [],
              },
              {
                id: "02",
                key: "page02",
                title: "Cerrar sesión",
                icon: "sap-icon://system-exit",
              },
              {
                key: "page03",
                title: "Login (Cambiar usuario)",
                icon: "sap-icon://user-edit",
              },
              {
                key: "ventas",
                title: "Pronóstico de Ventas",
                icon: "sap-icon://business-objects-experience",
                enabled: true,
                expanded: true,
                items: [
                  {
                    key: "ventas-historico",
                    title: "Historial de Ventas",
                    icon: "sap-icon://calendar",
                    enabled: true,
                  },
                ],
              },
              {
                id: "50",
                key: "page50",
                title: "Ajustes",
                icon: "sap-icon://action-settings",
              },
            ],
          });
          this.getView().setModel(oNavigationModel);

          this.oPopover = new Popover({
            title: "Opciones",
            placement: PlacementType.Bottom,
            content: new List({
              items: [
                new StandardListItem({
                  title: "Cerrar sesión",
                  icon: "sap-icon://log",
                  type: "Active",
                  press: function () {
                    this.clearSession();
                    this.oPopover.close();
                    this.getRouter().navTo(
                      "RouteLogin",
                      {} /* sin historial */
                    );
                  }.bind(this),
                }),
              ],
            }),
          });
        },

        //* Carga de datos al cambiar de ruta
        // _onRouteMatched: async function () {
        //   BusyIndicator.show(0);
        //   const oTable = this.byId("IdTable1SalesForecastMainTable");
        //   const token = this.decryptDataFromStorage("token");

        //   if (!token) {
        //     BusyIndicator.hide();
        //     return;
        //   }

        //   oTable.setModel(new JSONModel([]));

        //   try {
        //     const response = await this.GetSalesForecastByFilter(
        //       { ProcessType: "get", dbServer: "PRD" },
        //       token
        //     );

        //     if (typeof response === "string") {
        //       throw new Error(response);
        //     }

        //     oTable.setModel(new JSONModel(response));
        //   } catch (error) {
        //     MessageToast.show(error);
        //     oTable.setModel(new JSONModel());
        //   } finally {
        //     BusyIndicator.hide();
        //   }
        // },

        _onRouteMatched: async function () {
          BusyIndicator.show(0);
          const oTable = this.byId("IdTable1SalesForecastMainTable");

          // Inicialmente, limpia el modelo de la tabla
          oTable.setModel(new JSONModel([]));

          try {
            // Carga el modelo JSON desde el archivo
            const oModel = await this._loadLocalModel();
            oTable.setModel(oModel); // Asigna el modelo a la tabla
          } catch (error) {
            MessageToast.show(error.message);
            oTable.setModel(new JSONModel());
          } finally {
            BusyIndicator.hide();
          }
        },

        _loadLocalModel: function () {
          return new Promise((resolve, reject) => {
            // Carga los datos del archivo JSON
            jQuery.sap.require("sap.ui.core.util.File");
            jQuery.ajax({
              url: "resources/jsons/salesforecast.json", // Ruta al archivo JSON
              dataType: "json",
              success: function (data) {
                // Verifica si los datos están presentes
                if (
                  data &&
                  data.value &&
                  data.value[0] &&
                  data.value[0].data[0] &&
                  data.value[0].data[0].dataRes
                ) {
                  // Resuelve el modelo con los datos correctos
                  resolve(new JSONModel(data.value[0].data[0].dataRes));
                } else {
                  reject(new Error("Datos no encontrados en el archivo JSON"));
                }
              },
              error: function () {
                reject(new Error("Error al cargar el archivo JSON"));
              },
            });
          });
        },

        //* Alternar menú lateral
        onMenuButtonPress: function () {
          let toolPage = this.byId("IdToolPage1SalesForecast");
          toolPage.setSideExpanded(!toolPage.getSideExpanded());
        },

        //* Mostrar opciones en el avatar
        onAvatarPress: function (oEvent) {
          let oMyAvatar = oEvent.getSource();
          if (!this.oPopover.isOpen()) {
            this.oPopover.openBy(oMyAvatar);
          } else {
            this.oPopover.close();
          }
        },
      }
    );
  }
);
