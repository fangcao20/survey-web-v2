document.addEventListener("DOMContentLoaded", function() {
    var form = document.querySelector("form");
    var email = document.querySelector("#email");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      handleInput();
      let success = document.querySelectorAll('.success');
      if (success.length === 1) {
          let formData = new FormData(form);
          $.ajax({
            url: '/quenmatkhau',
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
              console.log("OK");
            },
            error: function(xhr, status, error) {
              console.log(error)
            }
          });
      };
    });

    function handleInput() {
      let emailValue = email.value.trim();

      // Checking for email
      if (emailValue === "") {
        setErrorFor(email, "Email không được để trống");
      } else if (!isEmail(emailValue)) {
        setErrorFor(email, "Email không hợp lệ");
      } else {
        setSuccessFor(email);
      }
    }
});


// If there is some error, than what we want to do with input ?
function setErrorFor(input, message) {
  let formControl = input.parentElement;
  formControl.className = "form-floating error";
  let small = formControl.querySelector("small");
  small.innerText = message;
}

// If there is no error, than what we want to do with input ?
function setSuccessFor(input) {
  let formControl = input.parentElement;
  formControl.className = "form-floating success";
}

// To check if email is valid or not ?
function isEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}
