// ==========================================
// SYLVIA THE HAIRDRESSER - ADMIN LOGIN
// ==========================================

const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");


// Check whether an admin is already logged in
async function checkSession() {

    const { data, error } =
        await supabaseClient.auth.getSession();

    if (error) {
        console.error(error);
        return;
    }

    if (data.session) {

        window.location.href = "admin.html";

    }

}


// Login
loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();


    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;


    loginMessage.textContent =
        "Logging in...";

    loginMessage.style.color =
        "#c9a66b";


    const { data, error } =
        await supabaseClient.auth.signInWithPassword({

            email: email,

            password: password

        });


    if (error) {

        console.error(error);


        loginMessage.textContent =
            "Incorrect email or password.";

        loginMessage.style.color =
            "red";

        return;

    }


    if (data.session) {

        loginMessage.textContent =
            "Login successful. Opening dashboard...";

        loginMessage.style.color =
            "green";


        setTimeout(function () {

            window.location.href =
                "admin.html";

        }, 500);

    }

});


// Check session when page opens
checkSession();