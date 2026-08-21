const bookingForm =
    document.getElementById("booking-form");


const serviceSelect =
    document.getElementById("service");


// ===============================
// LOAD SERVICES
// ===============================

async function loadBookingServices() {

    serviceSelect.innerHTML =
        `<option value="">
            Loading services...
        </option>`;


    const { data, error } =
        await supabaseClient
            .from("services")
            .select("id, name, price")
            .order("name");


    if (error) {

        console.error(
            "Error loading services:",
            error
        );

        serviceSelect.innerHTML =
            `<option value="">
                Unable to load services
            </option>`;

        return;
    }


    if (!data || data.length === 0) {

        serviceSelect.innerHTML =
            `<option value="">
                No services available
            </option>`;

        return;
    }


    serviceSelect.innerHTML =
        `<option value="">
            Select a service
        </option>`;


    data.forEach(service => {

        const option =
            document.createElement("option");


        option.value =
            service.name;


        option.textContent =
            `${service.name} - R${Number(service.price).toFixed(2)}`;


        serviceSelect.appendChild(option);

    });

}


// ===============================
// SUBMIT BOOKING
// ===============================

bookingForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const message =
            document.getElementById(
                "booking-message"
            );


        message.style.color = "";

        message.textContent =
            "Submitting your booking...";


        // ===============================
        // GET FORM VALUES
        // ===============================

        const name =
            document
                .getElementById("name")
                .value
                .trim();


        const phone =
            document
                .getElementById("phone")
                .value
                .trim();


        const email =
            document
                .getElementById("email")
                .value
                .trim();


        const service =
            document
                .getElementById("service")
                .value;


        const date =
            document
                .getElementById("date")
                .value;


        const time =
            document
                .getElementById("time")
                .value;


        const additionalMessage =
            document
                .getElementById("message")
                .value
                .trim();


        // ===============================
        // VALIDATION
        // ===============================

        if (
            !name ||
            !phone ||
            !service ||
            !date ||
            !time
        ) {

            message.style.color =
                "red";


            message.textContent =
                "Please complete all required fields.";


            return;
        }


        // ===============================
        // SAVE BOOKING
        // ===============================

        const { error } =
            await supabaseClient
                .from("bookings")
                .insert({

                    name: name,

                    phone: phone,

                    email: email || null,

                    service: service,

                    appointment_date: date,

                    appointment_time: time,

                    message:
                        additionalMessage || null,

                    status: "pending"

                });


        // ===============================
        // HANDLE ERROR
        // ===============================

        if (error) {

            console.error(
                "Booking error:",
                error
            );


            message.style.color =
                "red";


            message.textContent =
                "Booking failed. Please try again.";


            return;
        }


        // ===============================
        // SUCCESS
        // ===============================

        message.style.color =
            "green";


        message.textContent =
        "Booking submitted successfully! Sylvia will approve your appointment via WhatsApp or email.";

        bookingForm.reset();

    }
);


// ===============================
// START
// ===============================

loadBookingServices();