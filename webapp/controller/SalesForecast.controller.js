sap.ui.define(
  [
    "com/inv/sapfioriwebinvertions/controller/BaseController",
    "sap/ui/model/json/JSONModel",
  ],
  function (BaseController, JSONModel) {
    "use strict";

    return BaseController.extend(
      "com.inv.sapfioriwebinvertions.controller.salesforecast.SalesForecast",
      {
        onInit: function () {
          var oModel = new JSONModel();
          oModel.loadData("./resources/jsons/salesforecastNavItems.json");
          this.getView().setModel(oModel, "salesForecastNavModel");
        },
        onMenuButtonPress: function () {
          let toolPage = this.byId("IdToolPage1SalesForecast");
          toolPage.setSideExpanded(!toolPage.getSideExpanded());
        },
        onAvatarPress: function () {
          console.log("Avatar pressed");
          let oMyAvatar = this.getView().byId("IdAvatar1SalesForecast");

          oMyAvatar.setActive(!oMyAvatar.getActive());

          // Create a popover with the menu
          let oPopover = new sap.m.Popover({
            title: "Opciones",
            placement: sap.m.PlacementType.Bottom,
            afterClose: function () {
              oMyAvatar.setActive(false);
            },
            content: new sap.m.List({
              items: [
                new sap.m.StandardListItem({
                  title: "Cerrar sesión",
                  icon: "sap-icon://log",
                  type: sap.m.ListType.Active,
                  press: function () {
                    this.clearSession();
                    oPopover.close();
                    oMyAvatar.setActive(false);
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

          // Open the popover
          oPopover.openBy(oMyAvatar);
        },
      }
    );
  }
);
