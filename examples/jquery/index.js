; (function () {
  $("#image").frogeye()
      .on("tap", function (event, frogeyeEvent) {
        console.log("tap: ", frogeyeEvent);
      })
      .on("doubletap", function (event, frogeyeEvent) {
        console.log("doubletap: ", frogeyeEvent);
      })
      .on("swipe", function (event, frogeyeEvent) {
          console.log("swipe: ", frogeyeEvent);
      });
})();