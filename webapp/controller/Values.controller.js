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
  
      return Controller.extend("com.inv.sapfioriwebinvertions.controller.Values", {
        onInit: function () {
          var that = this;
  
          var oEstadoModel = this.getView().getModel("estado");
          if (!oEstadoModel) {
            oEstadoModel = new JSONModel({
              editando: false,
              valorSeleccionado: "",
            });
            this.getView().setModel(oEstadoModel, "estado");

           // this.cargarValores();

          }
  
          
    

          BusyIndicator.show(0);
          fetch("http://localhost:4004/api/security/crudValues?action=get", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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
                var oValuesModel = new JSONModel({ valores: data.value });
                that.getView().setModel(oValuesModel, "valores");
              } else {
                MessageBox.error("La respuesta de la API no contiene los datos esperados.");
              }
            })
            .catch(function (err) {
              BusyIndicator.hide();
              MessageBox.error("Error al cargar los datos de valores desde la API.");
              console.error(err);
            });
        },

        // cargarValores: function () {
        //   var that = this;
        //   BusyIndicator.show(0);
  
        //   fetch("http://localhost:4004/api/security/crudValues?action=get", {
        //     method: "POST",
        //     headers: { "Content-Type": "application/json" },
        //   })
        //     .then(function (response) {
        //       if (!response.ok) {
        //         throw new Error("Error en la respuesta del servidor");
        //       }
        //       return response.json();
        //     })
        //     .then(function (data) {
        //       BusyIndicator.hide();
        //       var oValuesModel = new JSONModel({ valores: data });
        //       that.getView().setModel(oValuesModel, "valores");
        //     })
        //     .catch(function (err) {
        //       BusyIndicator.hide();
        //       MessageBox.error("Error al cargar los datos de valores desde la API.");
        //       console.error(err);
        //     });
        // },
  
        onSeleccionar: function (oEvent) {
          var oEstadoModel = this.getView().getModel("estado");
          var oItem = oEvent.getParameter("listItem");
          var oBindingContext = oItem.getBindingContext("valores");
  
          if (!oBindingContext) {
            return;
          }
  
          var sValueID = oBindingContext.getProperty("VALUEID");
          oEstadoModel.setProperty("/valorSeleccionado", sValueID);
        },
  
        onCrear: function () {
          var that = this;
        
          // Crear modelo para manejar los datos del formulario
          var oEstadoModel = this.getView().getModel("estado");
          oEstadoModel.setProperty("/nuevoValor", {
            COMPANYID: "",
            CEDIID: "",
            LABELID: "",
            VALUEPAID: "",
            VALUEID: "",
            VALUE: "",
            ALIAS: "",
            SEQUENCE: "",
            IMAGE: "",
            VALUESAPID: "",
            DESCRIPTION: "",
            ROUTE: ""
          });
        
          // Crear ventana modal con mejor diseño
          var oDialog = new sap.m.Dialog({
            title: "Crear Nuevo Valor",
            icon: "sap-icon://add",
            content: [
              new sap.ui.layout.form.SimpleForm({
                editable: true,
                layout: "ResponsiveGridLayout",
                content: [
                  new sap.m.MessageStrip({
                    text: "Todos los campos son obligatorios.",
                    type: "Warning",
                    showCloseButton: false,
                  }),

                  new sap.m.Label({ text: "Company ID" }),
                  new sap.m.Input({ value: "{estado>/nuevoValor/COMPANYID}", required: true }),

                  new sap.m.Label({ text: "CEDI ID" }),
                  new sap.m.Input({ value: "{estado>/nuevoValor/CEDIID}", required: true }),

                  new sap.m.Label({ text: "Etiqueta (LABELID)" }),
                  new sap.m.Input({ value: "{estado>/nuevoValor/LABELID}", required: true }),

                  new sap.m.Label({ text: "ID Padre (VALUEPAID)" }),
                  new sap.m.Input({ value: "{estado>/nuevoValor/VALUEPAID}" }),

                  new sap.m.Label({ text: "ID del Valor (VALUEID)" }),
                  new sap.m.Input({ value: "{estado>/nuevoValor/VALUEID}", required: true }),

                  new sap.m.Label({ text: "Valor" }),
                  new sap.m.Input({ value: "{estado>/nuevoValor/VALUE}", required: true }),

                  new sap.m.Label({ text: "Alias" }),
                  new sap.m.Input({ value: "{estado>/nuevoValor/ALIAS}" }),

                  new sap.m.Label({ text: "Descripción" }),
                  new sap.m.Input({ value: "{estado>/nuevoValor/DESCRIPTION}" }),

                  new sap.m.Label({ text: "Ruta" }),
                  new sap.m.Input({ value: "{estado>/nuevoValor/ROUTE}" }),

                  new sap.m.Label({ text: "Imagen URL" }),
                  new sap.m.Input({ value: "{estado>/nuevoValor/IMAGE}" }),

                  new sap.m.Label({ text: "Secuencia" }),
                  new sap.m.Input({ value: "{estado>/nuevoValor/SEQUENCE}", type: "Number", required: true }),

                  new sap.m.Label({ text: "SAP ID" }),
                  new sap.m.Input({ value: "{estado>/nuevoValor/VALUESAPID}" }),
                ],
              }),
            ],
            beginButton: new sap.m.Button({
              text: "Guardar",
              type: "Emphasized",
              press: function () {
                that._guardarNuevoValor(oDialog);
              },
            }),
            endButton: new sap.m.Button({
              text: "Cancelar",
              press: function () {
                oDialog.close();
              },
            }),
          });

          this.getView().addDependent(oDialog);
          oDialog.open();
        },

        _guardarNuevoValor: async function (oDialog) {
          var oEstadoModel = this.getView().getModel("estado");
          var oNuevoValor = oEstadoModel.getProperty("/nuevoValor");

          // Validaciones: Mensaje claro sin detalles técnicos
          var camposFaltantes = [];

          if (!oNuevoValor.COMPANYID) camposFaltantes.push("Company ID");
          if (!oNuevoValor.CEDIID) camposFaltantes.push("CEDI ID");
          if (!oNuevoValor.LABELID) camposFaltantes.push("Etiqueta (LABELID)");
          if (!oNuevoValor.VALUEID) camposFaltantes.push("ID del Valor (VALUEID)");
          if (!oNuevoValor.VALUE) camposFaltantes.push("Valor");
          if (!oNuevoValor.SEQUENCE) camposFaltantes.push("Secuencia");

          if (camposFaltantes.length > 0) {
            var mensajeError = "Los siguientes campos son obligatorios:\n• " + camposFaltantes.join("\n• ");
            sap.m.MessageBox.error(mensajeError);
            return;
          }


          sap.ui.core.BusyIndicator.show(0);

          try {
            var oResponse = await fetch("http://localhost:4004/api/security/crudValues?action=create", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ values: oNuevoValor }),
            });

            sap.ui.core.BusyIndicator.hide();

            if (!oResponse.ok) {
              var sError = await oResponse.text();
              throw new Error("Error: " + sError);
            }


            sap.m.MessageToast.show("Valor creado exitosamente.");
            //this.cargarValores();
            oDialog.close();
          } catch (oError) {
            sap.ui.core.BusyIndicator.hide();
            // Verifica si el error tiene un mensaje específico
            sap.m.MessageBox.error("Error al crear el valor: " + oError.message);
          }
        },

  
        onEditar: function () {
          var oEstadoModel = this.getView().getModel("estado");
          var sSelectedValue = oEstadoModel.getProperty("/valorSeleccionado");
  
          if (!sSelectedValue) {
            MessageToast.show("Selecciona un valor para editar");
            return;
          }
  
          this.getView().getModel("estado").setProperty("/editando", true);
        },
  
        onEliminar: function () {
          var oEstadoModel = this.getView().getModel("estado");
          var sSelectedValue = oEstadoModel.getProperty("/valorSeleccionado");
  
          if (!sSelectedValue) {
            MessageToast.show("Selecciona un valor para eliminar");
            return;
          }
  
          MessageToast.show("Eliminar valor con ID: " + sSelectedValue);
        },
  
        onGuardar: async function () {
          var oView = this.getView();
          var oEstadoModel = oView.getModel("estado");
          var sSelectedValue = oEstadoModel.getProperty("/valorSeleccionado");
  
          if (!sSelectedValue) {
            MessageToast.show("Selecciona un valor para guardar");
            return;
          }
  
          var oTable = oView.byId("tablaValores");
          var aItems = oTable.getItems();
          var oSelectedItem = aItems.find(function (oItem) {
            return oItem.getBindingContext("valores").getProperty("VALUEID") === sSelectedValue;
          });
  
          var aCells = oSelectedItem.getCells();
          var sLabel = aCells[0].getValue();
          var sValuePaid = aCells[1].getValue();
          var sValue = aCells[2].getValue();
          var sAlias = aCells[3].getValue();
          var sDescription = aCells[4].getValue();
  
          var oPayload = {
            VALUEID: sSelectedValue,
            LABELID: sLabel,
            VALUEPAID: sValuePaid,
            VALUE: sValue,
            ALIAS: sAlias,
            DESCRIPTION: sDescription,
          };
  
          console.log("Payload enviado al backend:", oPayload);
  
          BusyIndicator.show(0);
  
          try {
            var oResponse = await fetch(
              "http://localhost:4004/api/security/crudValues?action=update&valueid=" +
                encodeURIComponent(sSelectedValue),
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ values: oPayload }),
              }
            );
  
            BusyIndicator.hide();
  
            if (!oResponse.ok) {
              var sError = await oResponse.text();
              throw new Error("Error en la actualización: " + sError);
            }
  
            MessageToast.show("Valor actualizado correctamente.");
            //this.cargarValores(); // Actualizar la tabla con los datos corregidos
          } catch (oError) {
            BusyIndicator.hide();
            MessageBox.error("Error al actualizar el valor: " + oError.message);
          }
        },  
      });
    }
  );