sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  "use strict";

  return Controller.extend(
    "com.inv.sapfioriwebinvertions.controller.AudioCapture",
    {
      _mediaRecorder: null,
      _audioChunks: [],
      _audioBlob: null,
      _audioURL: null,

      onStartRecording: function () {
        var oView = this.getView();
        var that = this;

        oView.byId("startRecording").setEnabled(false);
        oView.byId("stopRecording").setEnabled(true);

        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then(function (stream) {
            that._audioChunks = []; // Reiniciar los chunks

            that._mediaRecorder = new MediaRecorder(stream);

            that._mediaRecorder.ondataavailable = function (event) {
              that._audioChunks.push(event.data);
            };

            that._mediaRecorder.onstop = function () {
              that._audioBlob = new Blob(that._audioChunks, {
                type: "audio/wav",
              });
              that._audioURL = URL.createObjectURL(that._audioBlob);

              oView.byId("playAudio").setEnabled(true);

              // Mostrar el reproductor y asignar la URL
              var htmlControl = oView.byId("audioPlayer");
              htmlControl.setVisible(true);

              // Agregar el contenido HTML dinámicamente
              var audioElement =
                "<audio id='audioElement' controls src='" +
                that._audioURL +
                "'></audio>";
              htmlControl.setContent(audioElement);
            };

            that._mediaRecorder.start();
          })
          .catch(function (err) {
            alert("Error al acceder al micrófono: " + err);
            // Restaurar botones
            oView.byId("startRecording").setEnabled(true);
            oView.byId("stopRecording").setEnabled(false);
          });
      },

      onStopRecording: function () {
        var oView = this.getView();

        if (this._mediaRecorder && this._mediaRecorder.state === "recording") {
          this._mediaRecorder.stop();

          oView.byId("startRecording").setEnabled(true);
          oView.byId("stopRecording").setEnabled(false);
        }
      },

      onPlayAudio: function () {
        var audioElement = document.getElementById("audioElement");

        if (audioElement && this._audioURL) {
          audioElement.play();
        } else {
          alert("No hay audio disponible para reproducir.");
        }
      },
    }
  );
});
