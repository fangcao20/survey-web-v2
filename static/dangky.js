document.addEventListener("DOMContentLoaded", function() {
    var form = document.querySelector("form");
    var userName = document.querySelector("#name");
    var email = document.querySelector("#email");
    var password = document.querySelector("#password");
    var confirmPassword = document.querySelector("#confirmpassword");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      handleInput();
      let success = document.querySelectorAll('.success');
      if (success.length === 4) {
          let formData = new FormData(form);
          $.ajax({
            url: '/dangky',
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
              if (response.message === 'Đăng ký thành công') {
                window.location.href = '/dangnhap';
              } else {
                alert(response.message);
              }
            },
            error: function(xhr, status, error) {
              console.log(error)
            }
          });
      };
    });

    function handleInput() {
      // Values from dom elements ( input )
      let userNameValue = userName.value.trim();
      let emailValue = email.value.trim();
      let passwordValue = password.value.trim();
      let confirmPasswordValue = confirmPassword.value.trim();

      //  Checking for username
      if (userNameValue === "") {
        setErrorFor(userName, "Tên không được để trống");
      } else {
        setSuccessFor(userName);
      }

      // Checking for email
      if (emailValue === "") {
        setErrorFor(email, "Email không được để trống");
      } else if (!isEmail(emailValue)) {
        setErrorFor(email, "Email không hợp lệ");
      } else {
        setSuccessFor(email);
      }

      // Checking for password
      if (passwordValue === "") {
        setErrorFor(password, "Mật khẩu không được để trống");
      } else if (passwordValue.length < 6 || passwordValue.length > 30) {
        setErrorFor(password, "Mật khẩu phải có độ dài từ 6 - 30 ký tự");
      } else {
        setSuccessFor(password);
      }

      // Checking for confirm password
      if (confirmPasswordValue === "") {
        setErrorFor(confirmPassword, "Xác nhận mật khẩu không được để trống");
      } else if (confirmPasswordValue !== passwordValue) {
        setErrorFor(confirmPassword, "Xác nhận mật khẩu không giống với mật khẩu ở trên");
      } else {
        setSuccessFor(confirmPassword);
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
