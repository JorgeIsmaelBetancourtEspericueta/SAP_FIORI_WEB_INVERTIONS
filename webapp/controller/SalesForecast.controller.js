sap.ui.define(
  [
    "com/inv/sapfioriwebinvertions/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/Popover",
    "sap/m/List",
    "sap/m/StandardListItem",
    "sap/m/PlacementType",
  ],
  function (
    BaseController,
    JSONModel,
    Popover,
    List,
    StandardListItem,
    PlacementType
  ) {
    "use strict";

    return BaseController.extend(
      "com.inv.sapfioriwebinvertions.controller.SalesForecast",
      {
        onInit: function () {
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
                      {},
                      true /*no history*/
                    );
                  }.bind(this),
                }),
              ],
            }),
          });
        },

        //* FIC: On Menu (hamburguer) Button Press
        onMenuButtonPress: function () {
          let toolPage = this.byId("IdToolPage1SalesForecast");
          toolPage.setSideExpanded(!toolPage.getSideExpanded());
        },

        //* Avatar Press
        onAvatarPress: function (oEvent) {
          console.log("Avatar pressed");

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
