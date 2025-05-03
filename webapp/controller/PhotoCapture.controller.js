sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  "use strict";

  return Controller.extend(
    "com.inv.sapfioriwebinvertions.controller.PhotoCapture",
    {
      onOpenCamera: function () {
        const video = document.getElementById("videoStream");
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: false })
          .then(function (stream) {
            video.srcObject = stream;
          })
          .catch(function (err) {
            console.error("Error al acceder a la cámara: ", err);
          });
      },

      onTakePhoto: function () {
        const video = document.getElementById("videoStream");
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext("2d");
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageDataURL = canvas.toDataURL("image/png");

        const image = this.byId("capturedImage");
        image.setSrc(imageDataURL);
        image.setVisible(true);
      },
    }
  );
});
