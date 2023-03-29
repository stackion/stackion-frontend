$("*").ready(
    () => {
        const arrayOfInputFields = Array.from($("input"));
        const passwordInput = $("#password");
        const passwordConfirmation = $("#retyped-password");
        const emailInput = $("#email");
        const formSubmitionBtn = arrayOfInputFields[arrayOfInputFields.length -1];
        const passwordLengthNotifyer = $("#password-length");
        const passwordCharacterNotifyer = $("#password-special-characters");
        const passwordsMatchNotifyer = $("#password-match");
        const code_input = $("#verification-code-input");
        
        let passwordIsLongEnough = false , passwordsMatch = false , passwordContainsNumbers = false , passwordContainsAlpha = false , passwordContainsSpecialCharacters = false;

        const numberValues = /[0-9]/;
        const alphaValues = /[a-z]/i;
        const characterValues = /[!@#$%&()]/;
        
        let emailIsEmpty = true ,  stage = 1;

        arrayOfInputFields.forEach( e => e.addEventListener("input" , validateFormData) );
        arrayOfInputFields.forEach( e => e.addEventListener("blur" , validateFormData) );
        arrayOfInputFields.forEach( e => e.addEventListener("focus" , validateFormData) );
        arrayOfInputFields.forEach( e => e.addEventListener("change" , validateFormData) );
        arrayOfInputFields.forEach( e => e.addEventListener("keyup" , validateFormData) );
        
        function validateFormData() {
            passwordInput.val().trim().length >= 8 ? passwordIsLongEnough = true : passwordIsLongEnough = false;

            passwordInput.val().trim() === passwordConfirmation.val().trim() && passwordInput.val().trim() !== "" ? passwordsMatch = true : passwordsMatch = false;
            numberValues.test(passwordInput.val().trim()) ? passwordContainsNumbers = true : passwordContainsNumbers = false;
            alphaValues.test(passwordInput.val().trim()) ? passwordContainsAlpha = true : passwordContainsAlpha = false;

            characterValues.test(passwordInput.val().trim()) ? passwordContainsSpecialCharacters = true : passwordContainsSpecialCharacters = false;

            if(passwordIsLongEnough) {
                passwordLengthNotifyer.css("color","#00aa00");
            } else {
                passwordLengthNotifyer.css("color","#c44500");
            }

            if(passwordContainsNumbers && passwordContainsAlpha && passwordContainsSpecialCharacters) {
                passwordCharacterNotifyer.css("color","#00aa00");
            } else {
                passwordCharacterNotifyer.css("color","#c44500");
            }

            if(passwordsMatch) {
                passwordsMatchNotifyer.css("color","#00aa00");
            } else {
                passwordsMatchNotifyer.css("color","#c44500");
            }

            emailInput.val().trim() ==="" ? emailIsEmpty = true : emailIsEmpty = false;
            
            if(!emailIsEmpty && stage === 1) {
                formSubmitionBtn.disabled = false;
            }
            else if (code_input.val().length === 5 && stage === 2) {
                formSubmitionBtn.disabled = false;
            } 
            else if( passwordsMatch && passwordContainsNumbers && passwordContainsAlpha && passwordContainsSpecialCharacters && stage === 3) {
                formSubmitionBtn.disabled = false;
            }
            else {
                formSubmitionBtn.disabled = true;
            }
        }
        function send_data(data, path, callback) {
            const xhttp = new XMLHttpRequest();
            xhttp.onload = function() {
                $(".loader-box-cont").css("display","none");
                let response = this.responseText;
                callback(response);
            };
            xhttp.open("POST","https://user-authentication.stackion.net/" + path,true);
            xhttp.setRequestHeader("Content-type","application/json");
            xhttp.send(data);
        }
        formSubmitionBtn.addEventListener("click",
            (event) => {
                event.preventDefault();
                $(".loader-box-cont").css("display","flex");

                //send form data
                if(stage === 1) {
                    send_data(JSON.stringify({
                            email : emailInput.val().trim()
                        }), "check-user-email", response => {
                        let parsedRes = JSON.parse(response);
                        if(parsedRes.status === "success") {
                            //continue process
                            $(".stage-1").css("display","none");
                            stage = 2;
                            $(".user-guide").text("A verification code was set to your email address");
                            //show verification input
                            $(".stage-2").css("display","block");
                        }
                        else {
                            swal("Sorry", "An account does not exist for this email address", "error");
                        }
                    });
                }
                else if (stage === 2) {
                    send_data(JSON.stringify({
                        email : emailInput.val().trim(),
                        verification_code : code_input.val().trim()
                    }), "check-verification-code" , response => {
                        let parsed_response = JSON.parse(response);
                        if(parsed_response.status === "success") {
                            //continue process
                            $(".stage-2").css("display","none");
                            stage = 3;
                            $(".user-guide").text("Set your new password");
                            //show passwor input
                            $(".stage-3").css("display","block");
                        }
                        else {
                            swal("Opps!", "Incorrect verification code", "error");
                        }
                    });
                }
                else {
                    send_data(JSON.stringify({
                        email : emailInput.val().trim(),
                        verification_code : code_input.val().trim(),
                        password : passwordInput.val().trim()
                    }), "set-new-password" , response => {
                        let parsed_response = JSON.parse(response);
                        if(parsed_response.status === "success") {
                            swal("Password Reset" , "Your password has been reset. You can now login via the app using your new password." , "success")
                            .then(() => {
                                location.assign(".");
                            })
                        }
                        else {
                            swal("Error" , "Your password has not been reset due to incorrect values you passed." , "warning");
                        }
                    });
                }
            }
        );
    }
);