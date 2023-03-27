window.addEventListener("beforeunload", function (e) {
  var confirmationMessage = "\o/";

  (e || window.event).returnValue = confirmationMessage;
  return confirmationMessage;
});

setInterval(() => {
  console.log('123123123 :>> ', 123123123);
}, 2000);
