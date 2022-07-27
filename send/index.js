
$("*").ready(
    () => {
        let ts_wss = new WebSocket("wss://transactions.stackion.net/");
        ts_wss.onclose = () => {
            swal("Opps!","Disconected from server, check network connection","warning",{
                button : "Okay"
            })
            .then(value => setTimeout(() => ts_wss = new WebSocket("wss://transactions.stackion.net/") , 5000));
        };

        const arrayOfInputFields = Array.from($("input"));
        const formSubmitionBtn = arrayOfInputFields[arrayOfInputFields.length -1];
        const omcInput = $("#amount-to-send-in-omc");
        const usdInput = $("#amount-to-send-in-usd");
        const maximum = $("#not-enough-balance-notifiyer");
        const walletAddressInput = $("#wallet-address");
        const transaction_fee_cont = $(".transaction-fee-cont");

        const stock_balance_cont = $(".stock-balance-in-usd-cont");
        const stock_balance_in_omc = $(".stock-balance-in-omc-cont");

        let stockBalanceInOmc = 0;
        
        if(!localStorage) {
            swal("Session canceled" , "Your browser does not support cookies or it has been disabled. Try enabling all cookies and try again" , "warning");
        }

        let credentials;
        if(localStorage.getItem("credentials")) {
            credentials = JSON.parse(localStorage.getItem("credentials"));
            if(JSON.parse(localStorage.getItem("credentials")).verified_email === 0) {
                location.assign("../verify");
            }
        }
        else {
            location.assign("../login");
        }
        
        formSubmitionBtn.addEventListener("click" , e => {
            e.preventDefault();
            swal("Type password" , {
                content : {
                    element : "input",
                    attributes : {
                        type : "password",
                        placeholder : "*******"
                    }
                },
                button : "Continue"
            })
            .then(password => {
                $(".loader-box-cont").css("display","flex");
                ts_wss.send(JSON.stringify({
                    req_name : "transfer-of-omc",
                    omc_amount : omcInput.val().trim(),
                    receiver_wallet_address : walletAddressInput.val().trim(),
                    transaction_fee : ((omcInput.val() * 10) / 100),
                    email_address : credentials.email_address,
                    password : `${password}`.trim()
                }));
            });
        });

        ts_wss.onmessage = msg => {
            let message = JSON.parse(msg.data);
            if((message.auth.email_address === credentials.email_address && message.auth.password === credentials.password) || message.auth.email_address === credentials.email_address) {
                if(message.server_res === true) {
                    swal("Transaction successful","Your transfer of stocks was successful","success");
                }
                if(message.server_res === "insufficient-funds") {
                    swal("Insufficient funds","You do not have sufficient funds in your stock balance for this transaction","warning");
                }
                if(message.server_res === "wrong-receiver") {
                    swal("Transaction error" , "Check if the wallet address of the receiver is correct" , "error");
                }
                if(message.server_res === "incorrect-credentials") {
                    swal("Incorrect password" , "Try again" , "error");
                }
                $(".loader-box-cont").css("display","none");
            }
            fetch_user_data();
        };
        const xmlHttp = new XMLHttpRequest();

        function fetch_user_data() {
            xmlHttp.onload = () => {
                let response = xmlHttp.responseText , parsed_response;
                if(response !== "incorrect-credentials") {
                    parsed_response = JSON.parse(response);
                    //handling data
                    stock_balance_in_omc.text(parsed_response.stock_balance);
                    stock_balance_cont.text(parsed_response.stock_balance * omcPrice);

                    stockBalanceInOmc = parsed_response.stock_balance;
                    let stockBalanceInUsd = omcPrice * stockBalanceInOmc;
                    let maxUsdValue = stockBalanceInUsd - ((stockBalanceInUsd * 10) / 100);
                    let omcMax = stockBalanceInOmc - ((stockBalanceInOmc * 10) / 100);

                    let omcInputIsEmpty = true , usdInputIsEmpty = true , usdIsNotExceedingUsdMax = true , omcIsNotExceedingomcMax = true , numbersAreValidNumbers = false  , walletAddressIsValid = false;

                    arrayOfInputFields.forEach( e => e.addEventListener("input" , e => validateFormData(e.target.id)) );

                    function validateFormData(inputFieldId) {
                        transaction_fee_cont.text("$ " + ((usdInput.val() * 10) / 100));
                        omcInput.val() != "" ? omcInputIsEmpty = false : omcInputIsEmpty = true;
                        usdInput.val() != "" ? usdInputIsEmpty = false : usdInputIsEmpty = true;

                        usdInput.val() >= maxUsdValue ? usdIsNotExceedingUsdMax = false : usdIsNotExceedingUsdMax = true;
                        omcInput.val() >= omcMax ? omcIsNotExceedingomcMax = false : omcIsNotExceedingomcMax = true;
                        walletAddressInput.val().trim() !== "" && walletAddressInput.val().trim().length === 52 ? walletAddressIsValid = true : walletAddressIsValid = false;

                        inputFieldId == "amount-to-send-in-usd" ? processBasedOnUsdMax() : 1 + 1;
                        inputFieldId == "amount-to-send-in-omc" ? processBasedOnOmcMax() : 1 + 1;

                        !isNaN(Number(omcInput.val())) && !isNaN(usdInput.val()) ? numbersAreValidNumbers = true : numbersAreValidNumbers = false;
                        
                        (numbersAreValidNumbers && !omcInputIsEmpty && !usdInputIsEmpty && walletAddressIsValid) ? formSubmitionBtn.disabled = false : formSubmitionBtn.disabled = true;
                        omcInput.val(Math.abs(Number(omcInput.val())));
                        usdInput.val(Math.abs(Number(usdInput.val())));
                    }
                    function processBasedOnUsdMax() {
                        if(!usdIsNotExceedingUsdMax) {
                            usdInput.val(maxUsdValue);
                            omcInput.val(eval(usdInput.val()) / omcPrice);
                            maximum.css("display","list-item");
                        } else {
                            omcInput.val(eval(usdInput.val()) / omcPrice);
                            maximum.css("display","none");
                        }
                    }
                    function processBasedOnOmcMax() {
                        if(!omcIsNotExceedingomcMax) {
                            omcInput.val(omcMax);
                            usdInput.val(eval(omcInput.val()) * omcPrice);
                            maximum.css("display","list-item");
                        } else {
                            usdInput.val(eval(omcInput.val()) * omcPrice);
                            maximum.css("display","none");
                        }
                    }
                }
                else {
                    //create pop up menu to warn client about this using sweetalert.js
                }
            };
            xmlHttp.open("POST" , "https://user-data-api.stackion.net/", true);
            xmlHttp.setRequestHeader("Content-type" , "application/x-www-form-urlencoded");
            xmlHttp.send(`email_address=${credentials.email_address}&password=${credentials.password}&request_name=user-data`)
        }
        fetch_user_data();
    }
)