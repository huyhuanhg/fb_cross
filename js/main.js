console.log('start :>> ');

window.addEventListener("beforeunload", function (e) {
  var confirmationMessage = "\o/";

  (e || window.event).returnValue = confirmationMessage;
  return confirmationMessage;
});
