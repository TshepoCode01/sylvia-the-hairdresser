/* =========================================================
   SYLVIA THE HAIRDRESSER
   SIMPLE ADMIN DASHBOARD
========================================================= */

const GALLERY_BUCKET = "gallery";


document.addEventListener("DOMContentLoaded", () => {
    setupAdmin();
});


/* =========================================================
   START ADMIN
========================================================= */

async function setupAdmin() {

    const user = await checkAdmin();

    if (!user) {
        return;
    }

    /* Logout */
    const logoutBtn = document.getElementById("logout-btn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", adminLogout);
    }


    /* Service form */
    const serviceForm = document.getElementById("service-form");

    if (serviceForm) {
        serviceForm.addEventListener("submit", addService);
    }


    /* Gallery form */
    const galleryForm = document.getElementById("gallery-form");

    if (galleryForm) {
        galleryForm.addEventListener(
            "submit",
            uploadGalleryPhoto
        );
    }


    /* Image preview */
    const galleryImage = document.getElementById("gallery-image");

    if (galleryImage) {
        galleryImage.addEventListener(
            "change",
            previewGalleryImage
        );
    }


    /* Load everything */
    await loadDashboard();
}


/* =========================================================
   CHECK ADMIN
========================================================= */

async function checkAdmin() {

    const { data, error } =
        await supabaseClient.auth.getUser();

    if (error || !data.user) {

        window.location.href = "admin-login.html";

        return null;
    }

    return data.user;
}


/* =========================================================
   DASHBOARD
========================================================= */

async function loadDashboard() {

    await Promise.all([
        loadBookings(),
        loadServices(),
        loadGallery()
    ]);
}


/* =========================================================
   BOOKINGS
========================================================= */

async function loadBookings() {

    const table =
        document.getElementById("bookings-table");

    if (!table) return;

    table.innerHTML = `
        <tr>
            <td colspan="7">
                Loading appointments...
            </td>
        </tr>
    `;

    const { data: bookings, error } =
        await supabaseClient
            .from("bookings")
            .select("*")
            .order("created_at", {
                ascending: false
            });

    if (error) {

        table.innerHTML = `
            <tr>
                <td colspan="7">
                    ❌ ${escapeHTML(error.message)}
                </td>
            </tr>
        `;

        return;
    }

    updateBookingStats(bookings || []);

    if (!bookings || bookings.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="7">
                    No appointments yet.
                </td>
            </tr>
        `;

        return;
    }

    table.innerHTML = "";

    bookings.forEach(booking => {

        const row = document.createElement("tr");

        const customer =
            booking.customer_name ||
            booking.name ||
            booking.full_name ||
            "Unknown";

        const phone =
            booking.phone ||
            booking.contact ||
            booking.contact_number ||
            "-";

        const service =
            booking.service ||
            booking.service_name ||
            "-";

        const date =
            booking.date ||
            booking.booking_date ||
            "-";

        const time =
            booking.time ||
            booking.booking_time ||
            "-";

        const status =
            booking.status || "pending";


        row.innerHTML = `

            <td>${escapeHTML(customer)}</td>

            <td>
                <a href="https://wa.me/27${escapeHTML(
                    cleanPhone(phone)
                )}"
                   target="_blank">
                    ${escapeHTML(phone)}
                </a>
            </td>

            <td>${escapeHTML(service)}</td>

            <td>${escapeHTML(date)}</td>

            <td>${escapeHTML(time)}</td>

            <td>
                <span class="status status-${escapeHTML(
                    String(status).toLowerCase()
                )}">
                    ${escapeHTML(status)}
                </span>
            </td>

            <td>

                <button
                    class="small-btn"
                    onclick="updateBookingStatus(
                        '${escapeJS(booking.id)}',
                        'confirmed'
                    )">
                    Confirm
                </button>

                <button
                    class="small-btn cancel-btn"
                    onclick="updateBookingStatus(
                        '${escapeJS(booking.id)}',
                        'cancelled'
                    )">
                    Cancel
                </button>

            </td>
        `;

        table.appendChild(row);
    });
}


/* =========================================================
   BOOKING STATS
========================================================= */

function updateBookingStats(bookings) {

    const total =
        document.getElementById("total-bookings");

    const pending =
        document.getElementById("pending-bookings");

    const confirmed =
        document.getElementById("confirmed-bookings");


    if (total) {
        total.innerText = bookings.length;
    }


    if (pending) {

        pending.innerText =
            bookings.filter(
                booking =>
                    String(
                        booking.status || "pending"
                    ).toLowerCase() === "pending"
            ).length;
    }


    if (confirmed) {

        confirmed.innerText =
            bookings.filter(
                booking =>
                    String(
                        booking.status || ""
                    ).toLowerCase() === "confirmed"
            ).length;
    }
}


/* =========================================================
   UPDATE BOOKING
========================================================= */

async function updateBookingStatus(
    bookingId,
    status
) {

    const { error } =
        await supabaseClient
            .from("bookings")
            .update({
                status: status
            })
            .eq("id", bookingId);


    if (error) {

        alert(
            "❌ Could not update booking:\n" +
            error.message
        );

        return;
    }


    await loadBookings();
}


/* =========================================================
   SERVICES
========================================================= */

async function loadServices() {

    const container =
        document.getElementById("admin-services");

    if (!container) return;

    container.innerHTML =
        "<p>Loading services...</p>";


    const { data: services, error } =
        await supabaseClient
            .from("services")
            .select("*")
            .order("created_at", {
                ascending: false
            });


    if (error) {

        container.innerHTML =
            `<p>❌ ${escapeHTML(error.message)}</p>`;

        return;
    }


    const counter =
        document.getElementById("total-services");

    if (counter) {
        counter.innerText =
            services ? services.length : 0;
    }


    if (!services || services.length === 0) {

        container.innerHTML =
            "<p>No services added yet.</p>";

        return;
    }


    container.innerHTML = "";


    services.forEach(service => {

        const item =
            document.createElement("div");

        item.className = "admin-item";


        const name =
            service.name ||
            service.service_name ||
            "Service";


        const price =
            service.price || "0";


        const duration =
            service.duration || "-";


        item.innerHTML = `

            <div>

                <h3>
                    ${escapeHTML(name)}
                </h3>

                <p>
                    R${escapeHTML(price)}
                </p>

                <small>
                    ${escapeHTML(duration)}
                </small>

            </div>

            <button
                class="small-btn cancel-btn"
                onclick="deleteService(
                    '${escapeJS(service.id)}'
                )">
                Delete
            </button>

        `;


        container.appendChild(item);
    });
}


/* =========================================================
   ADD SERVICE
========================================================= */

async function addService(event) {

    event.preventDefault();


    const name =
        document.getElementById(
            "service-name"
        ).value.trim();


    const price =
        document.getElementById(
            "service-price"
        ).value;


    const duration =
        document.getElementById(
            "service-duration"
        ).value.trim();


    if (!name || !price || !duration) {

        alert(
            "Please complete all service fields."
        );

        return;
    }


    const { error } =
        await supabaseClient
            .from("services")
            .insert({
                name: name,
                price: Number(price),
                duration: duration
            });


    if (error) {

        alert(
            "❌ Could not add service:\n" +
            error.message
        );

        return;
    }


    document
        .getElementById("service-form")
        .reset();


    await loadServices();
}


/* =========================================================
   DELETE SERVICE
========================================================= */

async function deleteService(serviceId) {

    if (!confirm("Delete this service?")) {
        return;
    }


    const { error } =
        await supabaseClient
            .from("services")
            .delete()
            .eq("id", serviceId);


    if (error) {

        alert(
            "❌ Could not delete service:\n" +
            error.message
        );

        return;
    }


    await loadServices();
}


/* =========================================================
   IMAGE PREVIEW
========================================================= */

function previewGalleryImage() {

    const input =
        document.getElementById("gallery-image");

    const preview =
        document.getElementById("image-preview");

    const container =
        document.getElementById(
            "image-preview-container"
        );


    if (!input || !preview || !container) {
        return;
    }


    const file = input.files[0];


    if (!file) {

        container.style.display = "none";

        preview.src = "";

        return;
    }


    if (!file.type.startsWith("image/")) {

        alert("Please choose an image.");

        input.value = "";

        container.style.display = "none";

        return;
    }


    /* 10 MB limit */
    if (file.size > 10 * 1024 * 1024) {

        alert(
            "Image must be smaller than 10 MB."
        );

        input.value = "";

        container.style.display = "none";

        return;
    }


    const reader = new FileReader();


    reader.onload = function(event) {

        preview.src =
            event.target.result;

        container.style.display =
            "block";
    };


    reader.readAsDataURL(file);
}


/* =========================================================
   UPLOAD GALLERY PHOTO
========================================================= */

async function uploadGalleryPhoto(event) {

    event.preventDefault();


    const message =
        document.getElementById(
            "gallery-message"
        );


    const button =
        document.getElementById(
            "upload-gallery-btn"
        );


    const input =
        document.getElementById(
            "gallery-image"
        );


    if (!input || !message) {
        return;
    }


    const file = input.files[0];


    /* No photo */
    if (!file) {

        message.innerText =
            "❌ Please choose a photo.";

        return;
    }


    /* Image check */
    if (!file.type.startsWith("image/")) {

        message.innerText =
            "❌ Please choose an image.";

        return;
    }


    /* 10 MB maximum */
    if (file.size > 10 * 1024 * 1024) {

        message.innerText =
            "❌ Image must be smaller than 10 MB.";

        return;
    }


    try {

        /* Check login */
        const user = await checkAdmin();

        if (!user) {
            return;
        }


        message.innerText =
            "Uploading photo...";


        if (button) {

            button.disabled = true;

            button.innerText =
                "UPLOADING...";
        }


        /*
           Create a simple unique filename
        */

        const extension =
            file.name
                .split(".")
                .pop()
                .toLowerCase();


        const filePath =
            Date.now() +
            "." +
            extension;


        console.log(
            "Uploading:",
            filePath
        );


        /*
           Upload directly to
           Supabase Storage
        */

        const { error } =
            await supabaseClient
                .storage
                .from(GALLERY_BUCKET)
                .upload(
                    filePath,
                    file,
                    {
                        contentType: file.type,
                        cacheControl: "3600",
                        upsert: false
                    }
                );


        if (error) {

            console.error(
                "UPLOAD ERROR:",
                error
            );

            message.innerText =
                "❌ Upload failed: " +
                error.message;

            return;
        }


        /*
           SUCCESS
        */

        message.innerText =
            "✅ Photo uploaded successfully!";


        /* Reset */
        document
            .getElementById("gallery-form")
            .reset();


        const preview =
            document.getElementById(
                "image-preview"
            );


        const previewContainer =
            document.getElementById(
                "image-preview-container"
            );


        if (preview) {
            preview.src = "";
        }


        if (previewContainer) {
            previewContainer.style.display =
                "none";
        }


        /* Reload gallery */
        await loadGallery();


    } catch (error) {

        console.error(
            "GALLERY ERROR:",
            error
        );

        message.innerText =
            "❌ Upload failed: " +
            error.message;

    } finally {

        if (button) {

            button.disabled = false;

            button.innerText =
                "UPLOAD PHOTO";
        }
    }
}


/* =========================================================
   LOAD GALLERY
========================================================= */

async function loadGallery() {

    const gallery =
        document.getElementById(
            "admin-gallery"
        );


    if (!gallery) {
        return;
    }


    gallery.innerHTML =
        "<p>Loading photos...</p>";


    const { data: files, error } =
        await supabaseClient
            .storage
            .from(GALLERY_BUCKET)
            .list("", {
                limit: 100,
                sortBy: {
                    column: "created_at",
                    order: "desc"
                }
            });


    if (error) {

        gallery.innerHTML =
            `<p>❌ ${escapeHTML(
                error.message
            )}</p>`;

        return;
    }


    if (!files || files.length === 0) {

        gallery.innerHTML =
            "<p>No photos uploaded yet.</p>";

        return;
    }


    gallery.innerHTML = "";


    files.forEach(file => {

        if (!file.name) {
            return;
        }


        const { data } =
            supabaseClient
                .storage
                .from(GALLERY_BUCKET)
                .getPublicUrl(file.name);


        const imageUrl =
            data.publicUrl;


        const item =
            document.createElement("div");


        item.className =
            "admin-gallery-item";


        item.innerHTML = `

            <img
                src="${escapeHTML(imageUrl)}"
                alt="Sylvia hairstyle"
            >

            <div class="gallery-item-info">

                <strong>
                    ${escapeHTML(file.name)}
                </strong>

                <button
                    type="button"
                    class="small-btn cancel-btn"
                >
                    DELETE PHOTO
                </button>

            </div>

        `;


        const deleteButton =
            item.querySelector("button");


        deleteButton.addEventListener(
            "click",
            () => {
                deleteGalleryPhoto(file.name);
            }
        );


        gallery.appendChild(item);
    });
}


/* =========================================================
   DELETE PHOTO
========================================================= */

async function deleteGalleryPhoto(fileName) {

    if (
        !confirm(
            "Are you sure you want to delete this photo?"
        )
    ) {
        return;
    }


    const { error } =
        await supabaseClient
            .storage
            .from(GALLERY_BUCKET)
            .remove([fileName]);


    if (error) {

        alert(
            "❌ Delete failed:\n" +
            error.message
        );

        return;
    }


    alert("✅ Photo deleted.");

    await loadGallery();
}


/* =========================================================
   LOGOUT
========================================================= */

async function adminLogout() {

    await supabaseClient.auth.signOut();

    window.location.href =
        "admin-login.html";
}


/* =========================================================
   PHONE NUMBER
========================================================= */

function cleanPhone(phone) {

    return String(phone)
        .replace(/\D/g, "")
        .replace(/^27/, "")
        .replace(/^0/, "");
}


/* =========================================================
   SECURITY
========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function escapeJS(value) {

    return String(value ?? "")
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r");
}
