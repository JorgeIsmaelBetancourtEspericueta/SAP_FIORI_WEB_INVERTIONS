sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/BusyIndicator",
  ],
  function (Controller, MessageToast, MessageBox, JSONModel, BusyIndicator) {
    "use strict";

    return Controller.extend(
      "com.inv.sapfioriwebinvertions.controller.Prueba",
      {
        onInit: function () {
          var that = this;

          // Inicializar modelo "estado" si no está inicializado
          var oEstadoModel = this.getView().getModel("estado");
          if (!oEstadoModel) {
            oEstadoModel = new JSONModel({
              editando: false,
              usuarioSeleccionado: "", // Propiedad de usuarioSeleccionado
            });
            this.getView().setModel(oEstadoModel, "estado");
          }

          BusyIndicator.show(0);

          fetch("http://localhost:4004/api/security/crudUsers?action=get", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          })
            .then(function (response) {
              if (!response.ok) {
                throw new Error("Error en la respuesta del servidor");
              }
              return response.json();
            })
            .then(function (data) {
              BusyIndicator.hide();
              if (data.value && Array.isArray(data.value)) {
                var oUserModel = new JSONModel({ usuarios: data.value });
                that.getView().setModel(oUserModel, "usuarios");
              } else {
                MessageBox.error(
                  "La respuesta de la API no contiene los datos esperados."
                );
              }
            })
            .catch(function (err) {
              BusyIndicator.hide();
              MessageBox.error(
                "Error al cargar los datos del usuario desde la API."
              );
              console.error(err);
            });
        },
        onSearch: function (oEvt) {
          var sQuery = oEvt.getParameter("newValue");
          var oTable = this.getView().byId("tablaUsuarios");
          var oBinding = oTable.getBinding("items");
          var aFilters = [];

          if (sQuery) {
            // Filtrar por USERNAME o EMAIL
            aFilters.push(
              new sap.ui.model.Filter({
                filters: [
                  new sap.ui.model.Filter(
                    "USERNAME",
                    sap.ui.model.FilterOperator.Contains,
                    sQuery
                  ),
                  new sap.ui.model.Filter(
                    "EMAIL",
                    sap.ui.model.FilterOperator.Contains,
                    sQuery
                  ),
                ],
                and: false,
              })
            );
          }
          oBinding.filter(aFilters);
        },

        onSeleccionar: function (oEvent) {
          var oEstadoModel = this.getView().getModel("estado");
          if (!oEstadoModel) {
            console.error("Modelo 'estado' no encontrado.");
            return;
          }

          var oItem = oEvent.getParameter("listItem");
          var oBindingContext = oItem.getBindingContext("usuarios");
          if (!oBindingContext) {
            console.error(
              "No se puede obtener el contexto de la fila seleccionada."
            );
            return;
          }

          var sUserID = oBindingContext.getProperty("USERID");
          if (!sUserID) {
            console.error("No se pudo obtener el ID del usuario.");
            return;
          }

          oEstadoModel.setProperty("/usuarioSeleccionado", sUserID);
        },

        onCrear: function () {
          MessageToast.show("Crear nuevo usuario (simulado)");
        },

        onEditar: function () {
          var oEstadoModel = this.getView().getModel("estado");
          var sSelectedUser = oEstadoModel.getProperty("/usuarioSeleccionado");

          if (!sSelectedUser) {
            MessageToast.show("Selecciona un usuario para editar");
            return;
          }

          this.getView().getModel("estado").setProperty("/editando", true);
        },

        onEliminar: function () {
          var oEstadoModel = this.getView().getModel("estado");
          var sSelectedUser = oEstadoModel.getProperty("/usuarioSeleccionado");

          if (!sSelectedUser) {
            MessageToast.show("Selecciona un usuario para eliminar");
            return;
          }

          MessageToast.show("Eliminar usuario con ID: " + sSelectedUser);
        },

        onCancelar: function () {
          this.getView().getModel("estado").setProperty("/editando", false);
          MessageToast.show("Cambios cancelados");
        },

        onGuardar: async function () {
          var oView = this.getView();
          var oEstadoModel = oView.getModel("estado");
          var sSelectedUser = oEstadoModel.getProperty("/usuarioSeleccionado");

          if (!sSelectedUser) {
            MessageToast.show("Selecciona un usuario para guardar");
            return;
          }

          // Buscamos la fila seleccionada
          var oTable = oView.byId("tablaUsuarios");
          var aItems = oTable.getItems();
          var oSelectedItem = aItems.find(function (oItem) {
            return (
              oItem.getBindingContext("usuarios").getProperty("USERID") ===
              sSelectedUser
            );
          });
          if (!oSelectedItem) {
            MessageToast.show(
              "No se encontró el usuario seleccionado en la tabla"
            );
            return;
          }

          // Leemos los valores editados
          var aCells = oSelectedItem.getCells();
          var sUsername = aCells[0].getValue();
          var sAlias = aCells[1].getValue();
          var sEmail = aCells[2].getValue();

          // Construimos un objeto limpio para el envío
          var oPayload = {
            USERID: sSelectedUser,
            USERNAME: sUsername,
            ALIAS: sAlias,
            EMAIL: sEmail,
          };

          BusyIndicator.show(0);
          try {
            var oResponse = await fetch(
              "http://localhost:4004/api/security/crudUsers?action=update&userid=" +
                encodeURIComponent(sSelectedUser),
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ users: oPayload }),
              }
            );
            BusyIndicator.hide();

            if (!oResponse.ok) {
              var sError = await oResponse.text();
              throw new Error("Status " + oResponse.status + ": " + sError);
            }

            var oResult = await oResponse.json();
            console.log("API respuesta:", oResult);

            // Actualizamos el modelo local
            var oUserModel = oView.getModel("usuarios");
            var aUsers = oUserModel.getProperty("/usuarios");
            var oUser = aUsers.find((u) => u.USERID === sSelectedUser);
            oUser.USERNAME = sUsername;
            oUser.ALIAS = sAlias;
            oUser.EMAIL = sEmail;
            oUserModel.setProperty("/usuarios", aUsers);
            oUserModel.refresh();

            oEstadoModel.setProperty("/editando", false);
            MessageToast.show("Cambios guardados correctamente");
          } catch (oError) {
            BusyIndicator.hide();
            MessageBox.error(
              "Error al guardar los datos en la API:\n" + oError.message
            );
            console.error(oError);
          }
        },
        // Formatter para el binding de 'selected'
        esUsuarioSeleccionado: function (sUserId, sSelectedUserId) {
          return sUserId === sSelectedUserId;
        },
      }
    );
  }
);
