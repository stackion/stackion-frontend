const date = new Date();
let currentYear = date.getFullYear();
const $only = e => document.querySelector(e);
const $all = e => document.querySelectorAll(e);


$("*").ready(
    () => {
        const sideMenuVisibilityToggleBtn = $(".menu-or-menu-btn-toggle");
        const sideMenu = $(".side-menu");

        let menuIsDisplayed = false;
        sideMenuVisibilityToggleBtn.click(
            () => {
                if(menuIsDisplayed) {
                    sideMenu.css("left","100vw");
                    menuIsDisplayed = false;
                } else {
                    sideMenu.css("left","0");
                    menuIsDisplayed = true;
                }
            }
        )

        let modalState = false;

        class Modal {
            constructor(type,text) {
                // supported types are alert and confirm
                this.mode = "";
            }
            show(a,b,c) {
                $(c + " p").text(a);
                this.mode = b;
        
                this.mode == "alert" ? $(".modal-toggle").html(`
                    <p class="modal-toggle-btn text-default-blue-color centered-text bold">
                        Exit
                    </p>
                `) : null;
        
                if(this.mode == "confirm") {
                    $(c).html(`
                        <p class="modal-toggle-btn text-default-blue-color bold" id="yes">
                            Yes
                        </p>
                        <p class="modal-toggle-btn text-reddish-purple-color bold" id="no">
                            No
                        </p>
                    `);
        
                    $(".modal-toggle-btn").click( function(e) {
                        e.target.id == "yes" ? modalState = true : modalState = false;
                    } )
                }
            }
        }
        
        const modal = new Modal();
        //params text,type,element
        
        modal.show("Are you sure you want to logout ?",".logout-confirmatory .modal-content-text");
        
        $(".modal-toggle-btn").click(() => {
            $(".modal-box-cont").css("display","none");
        })
        
        $(".logout-btn").click(() => {
            $(".logout-confirmatory").css("display","flex");
            $(".logout-confirmatory").addClass(["animate__animated","animate__fadeIn"])
        });

        const loaderBalls = Array.from($(".loader-ball"));
        
        $("*").ready(
            () => {
                setTimeout(
                    () => $(".loader-box-cont").css("display","none") , 700
                );
            }
        )

        const randomLoaderBallIndex = () => Math.floor(Math.random() * loaderBalls.length);
        const randomPercentage = () => Math.floor(Math.random() * 100 + 1);
        
        $(".loader-box-cont").css("display") == "flex" ? function () {
            window.setInterval(
                () => {
                    loaderBalls[randomLoaderBallIndex()].style.height = randomPercentage() + "%";
                }, 10
            );
        }() : null ;/*
        $("body").on("load",
            () => $("body").addClass(["animate__animated" , "animate__slideInRight"])
        )*/
        document.body.onbeforeunload = () => {
            $("body").addClass(["animate__animated" , "animate__fadeOut"])
        }
        if($("input[type='submit']")) {
            $("input[type='submit']").click(
                event => {
                    event.preventDefault();
                }
            )
        }
    }
);