sap.ui.define([], function () {
  "use strict";

  return {
    // Formateador para mostrar u ocultar botones de edición
    isEditingVisible: function (isEditing) {
      return isEditing; // Si isEditing es true, el botón será visible
    },

    // Formateador para decidir si una celda es editable
    isEditable: function (isEditing, selectedIndex, rowIndex) {
      return isEditing && selectedIndex === rowIndex; // Lógica para decidir si una celda es editable
    },
  };
});
