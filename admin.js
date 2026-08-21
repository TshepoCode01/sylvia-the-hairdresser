/* =========================================================
   SYLVIA THE HAIRDRESSER
   ADMIN DASHBOARD JAVASCRIPT
========================================================= */


/* =========================================================
   SUPABASE
========================================================= */

/*
   IMPORTANT:
   This file uses the supabaseClient from supabase.js.

   Your admin.html loads:
   1. Supabase library
   2. supabase.js
   3. admin.js

   So supabaseClient should already exist.
*/


/* =========================================================
   SETTINGS
========================================================= */

const GALLERY_BUCKET = "gallery";


/* =========================================================
   PAGE START
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    console.log("SYLVIA Admin JavaScript loaded.");

    setupAdmin();

});


/* =========================================================
   SETUP ADMIN
========================================================= */

async function setupAdmin() {

    try {

        /* Check logged-in administrator */

        const user = await checkAdmin();

        if (!user) {
            return;
        }


        /* Logout */

        const logoutButton =
            document.getElementById("logout-btn");

        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                adminLogout
            );

        }


        /* Service form */

        const serviceForm =
            document.getElementById("service-form");

        if (serviceForm) {

            serviceForm.addEventListener(
                "submit",
                addService
            );

        }


        /* Gallery form */

        const galleryForm =
            document.getElementById("gallery-form");

        if (galleryForm) {

            galleryForm.addEventListener(
                "submit",
                uploadGalleryPhoto
            );

        }


        /* Image preview */

        const galleryImage =
            document.getElementById("gallery-image");

        if (galleryImage) {

            galleryImage.addEventListener(
                "change",
                previewGalleryImage
            );

        }


        /* Load dashboard */

        await loadDashboard();


    } catch (error) {

        console.error(
            "ADMIN SETUP ERROR:",
            error
        );

    }

}


/* =========================================================
   CHECK ADMIN LOGIN
========================================================= */

async function checkAdmin() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .auth
                .getUser();


        if (error) {

            console.error(
                "AUTH ERROR:",
                error
            );

            window.location.href =
                "admin-login.html";

            return null;

        }


        if (!data.user) {

            window.location.href =
                "admin-login.html";

            return null;

        }


        return data.user;


    } catch (error) {

        console.error(
            "CHECK ADMIN ERROR:",
            error
        );

        window.location.href =
            "admin-login.html";

        return null;

    }

}


/* =========================================================
   LOAD DASHBOARD
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
        document.getElementById(
            "bookings-table"
        );


    if (!table) {
        return;
    }


    table.innerHTML = `
        <tr>
            <td colspan="7">
                Loading appointments...
            </td>
        </tr>
    `;


    try {

        const {
            data: bookings,
            error
        } =
            await supabaseClient
                .from("bookings")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                "BOOKINGS ERROR:",
                error
            );

            table.innerHTML = `
                <tr>
                    <td colspan="7">
                        ❌ ${escapeHTML(error.message)}
                    </td>
                </tr>
            `;

            return;

        }


        updateBookingStats(
            bookings || []
        );


        if (
            !bookings ||
            bookings.length === 0
        ) {

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


        bookings.forEach(
            booking => {

                const row =
                    document.createElement("tr");


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
                    booking.status ||
                    "pending";


                row.innerHTML = `

                    <td>
                        ${escapeHTML(customer)}
                    </td>

                    <td>
                        ${escapeHTML(phone)}
                    </td>

                    <td>
                        ${escapeHTML(service)}
                    </td>

                    <td>
                        ${escapeHTML(date)}
                    </td>

                    <td>
                        ${escapeHTML(time)}
                    </td>

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

            }
        );


    } catch (error) {

        console.error(
            "LOAD BOOKINGS ERROR:",
            error
        );

        table.innerHTML = `
            <tr>
                <td colspan="7">
                    ❌ ${escapeHTML(error.message)}
                </td>
            </tr>
        `;

    }

}


/* =========================================================
   BOOKING STATISTICS
========================================================= */

function updateBookingStats(bookings) {

    const total =
        document.getElementById(
            "total-bookings"
        );


    const pending =
        document.getElementById(
            "pending-bookings"
        );


    const confirmed =
        document.getElementById(
            "confirmed-bookings"
        );


    const totalBookings =
        bookings.length;


    const pendingBookings =
        bookings.filter(
            booking =>
                String(
                    booking.status || "pending"
                ).toLowerCase()
                === "pending"
        ).length;


    const confirmedBookings =
        bookings.filter(
            booking =>
                String(
                    booking.status || ""
                ).toLowerCase()
                === "confirmed"
        ).length;


    if (total) {

        total.innerText =
            totalBookings;

    }


    if (pending) {

        pending.innerText =
            pendingBookings;

    }


    if (confirmed) {

        confirmed.innerText =
            confirmedBookings;

    }

}


/* =========================================================
   UPDATE BOOKING STATUS
========================================================= */

async function updateBookingStatus(
    bookingId,
    status
) {

    try {

        const {
            error
        } =
            await supabaseClient
                .from("bookings")
                .update({
                    status: status
                })
                .eq(
                    "id",
                    bookingId
                );


        if (error) {

            console.error(
                error
            );

            alert(
                "❌ Could not update booking: "
                + error.message
            );

            return;

        }


        await loadBookings();


    } catch (error) {

        console.error(
            error
        );

        alert(
            "❌ "
            + error.message
        );

    }

}


/* =========================================================
   SERVICES
========================================================= */

async function loadServices() {

    const container =
        document.getElementById(
            "admin-services"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        "<p>Loading services...</p>";


    try {

        const {
            data: services,
            error
        } =
            await supabaseClient
                .from("services")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                "SERVICES ERROR:",
                error
            );

            container.innerHTML =
                `
                <p>
                    ❌ ${escapeHTML(
                        error.message
                    )}
                </p>
                `;

            return;

        }


        const counter =
            document.getElementById(
                "total-services"
            );


        if (counter) {

            counter.innerText =
                services
                    ? services.length
                    : 0;

        }


        if (
            !services ||
            services.length === 0
        ) {

            container.innerHTML =
                `
                <p>
                    No services added yet.
                </p>
                `;

            return;

        }


        container.innerHTML = "";


        services.forEach(
            service => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "admin-item";


                const name =
                    service.name ||
                    service.service_name ||
                    "Service";


                const price =
                    service.price ||
                    "0";


                const duration =
                    service.duration ||
                    "-";


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


                container.appendChild(
                    item
                );

            }
        );


    } catch (error) {

        console.error(
            "LOAD SERVICES ERROR:",
            error
        );

        container.innerHTML =
            `
            <p>
                ❌ ${escapeHTML(
                    error.message
                )}
            </p>
            `;

    }

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


    try {

        const {
            error
        } =
            await supabaseClient
                .from("services")
                .insert({
                    name: name,
                    price: Number(price),
                    duration: duration
                });


        if (error) {

            console.error(
                "ADD SERVICE ERROR:",
                error
            );

            alert(
                "❌ Could not add service: "
                + error.message
            );

            return;

        }


        document
            .getElementById(
                "service-form"
            )
            .reset();


        await loadServices();


    } catch (error) {

        console.error(
            error
        );

        alert(
            "❌ "
            + error.message
        );

    }

}


/* =========================================================
   DELETE SERVICE
========================================================= */

async function deleteService(
    serviceId
) {

    if (
        !confirm(
            "Delete this service?"
        )
    ) {

        return;

    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from("services")
                .delete()
                .eq(
                    "id",
                    serviceId
                );


        if (error) {

            alert(
                "❌ Could not delete service: "
                + error.message
            );

            return;

        }


        await loadServices();


    } catch (error) {

        console.error(
            error
        );

        alert(
            "❌ "
            + error.message
        );

    }

}


/* =========================================================
   GALLERY IMAGE PREVIEW
========================================================= */

function previewGalleryImage() {

    const input =
        document.getElementById(
            "gallery-image"
        );


    const previewContainer =
        document.getElementById(
            "image-preview-container"
        );


    const preview =
        document.getElementById(
            "image-preview"
        );


    if (
        !input ||
        !previewContainer ||
        !preview
    ) {

        return;

    }


    const file =
        input.files[0];


    if (!file) {

        previewContainer.style.display =
            "none";

        preview.src =
            "";

        return;

    }


    if (
        !file.type.startsWith(
            "image/"
        )
    ) {

        alert(
            "Please select an image file."
        );

        input.value = "";

        previewContainer.style.display =
            "none";

        return;

    }


    if (
        file.size >
        10 * 1024 * 1024
    ) {

        alert(
            "Image must be smaller than 10 MB."
        );

        input.value = "";

        previewContainer.style.display =
            "none";

        return;

    }


    const reader =
        new FileReader();


    reader.onload =
        function(event) {

            preview.src =
                event.target.result;

            previewContainer.style.display =
                "block";

        };


    reader.readAsDataURL(
        file
    );

}


/* =========================================================
   UPLOAD GALLERY PHOTO
========================================================= */

async function uploadGalleryPhoto(
    event
) {

    event.preventDefault();


    console.log(
        "Gallery upload function started."
    );


    const message =
        document.getElementById(
            "gallery-message"
        );


    const button =
        document.getElementById(
            "upload-gallery-btn"
        );


    const fileInput =
        document.getElementById(
            "gallery-image"
        );


    const titleInput =
        document.getElementById(
            "image-title"
        );


    if (!message || !fileInput) {

        console.error(
            "Gallery elements not found."
        );

        return;

    }


    const file =
        fileInput.files[0];


    const title =
        titleInput
            ? titleInput.value.trim()
            : "Hairstyle";


    message.innerText =
        "Uploading photo...";


    if (button) {

        button.disabled =
            true;

        button.innerText =
            "UPLOADING...";

    }


    try {

        /* =========================================
           CHECK ADMIN
        ========================================= */

        const user =
            await checkAdmin();


        if (!user) {

            return;

        }


        /* =========================================
           CHECK FILE
        ========================================= */

        if (!file) {

            message.innerText =
                "❌ Please choose a photo.";

            return;

        }


        /* =========================================
           CHECK IMAGE
        ========================================= */

        if (
            !file.type.startsWith(
                "image/"
            )
        ) {

            message.innerText =
                "❌ Please choose an image file.";

            return;

        }


        /* =========================================
           CHECK SIZE
        ========================================= */

        if (
            file.size >
            10 * 1024 * 1024
        ) {

            message.innerText =
                "❌ Image must be smaller than 10 MB.";

            return;

        }


        /* =========================================
           CREATE FILE NAME
        ========================================= */

        const cleanName =
            file.name
                .replace(
                    /[^a-zA-Z0-9._-]/g,
                    "_"
                );


        const timestamp =
            Date.now();


        const filePath =
            timestamp
            + "_"
            + cleanName;


        console.log(
            "Uploading to gallery:",
            filePath
        );


        /* =========================================
           UPLOAD TO SUPABASE STORAGE
        ========================================= */

        const {
            error: uploadError
        } =
            await supabaseClient
                .storage
                .from(
                    GALLERY_BUCKET
                )
                .upload(
                    filePath,
                    file,
                    {
                        cacheControl:
                            "3600",

                        contentType:
                            file.type,

                        upsert:
                            false
                    }
                );


        if (uploadError) {

            console.error(
                "GALLERY UPLOAD ERROR:",
                uploadError
            );

            message.innerText =
                "❌ Upload failed: "
                + uploadError.message;

            return;

        }


        /* =========================================
           GET PUBLIC URL
        ========================================= */

        const {
            data: publicData
        } =
            supabaseClient
                .storage
                .from(
                    GALLERY_BUCKET
                )
                .getPublicUrl(
                    filePath
                );


        const imageUrl =
            publicData.publicUrl;


        console.log(
            "Gallery image URL:",
            imageUrl
        );


        /* =========================================
           SUCCESS
        ========================================= */

        message.innerText =
            "✅ Photo uploaded successfully!";


        /* RESET FORM */

        document
            .getElementById(
                "gallery-form"
            )
            .reset();


        /* HIDE PREVIEW */

        const previewContainer =
            document.getElementById(
                "image-preview-container"
            );


        const preview =
            document.getElementById(
                "image-preview"
            );


        if (previewContainer) {

            previewContainer.style.display =
                "none";

        }


        if (preview) {

            preview.src =
                "";

        }


        /* RELOAD GALLERY */

        await loadGallery();


    } catch (error) {

        console.error(
            "GALLERY ERROR:",
            error
        );

        message.innerText =
            "❌ "
            + error.message;

    } finally {

        if (button) {

            button.disabled =
                false;

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
        `
        <p>
            Loading photos...
        </p>
        `;


    try {

        const {
            data: files,
            error
        } =
            await supabaseClient
                .storage
                .from(
                    GALLERY_BUCKET
                )
                .list(
                    "",
                    {
                        limit: 100,
                        sortBy: {
                            column:
                                "created_at",
                            order:
                                "desc"
                        }
                    }
                );


        if (error) {

            console.error(
                "LOAD GALLERY ERROR:",
                error
            );

            gallery.innerHTML =
                `
                <p>
                    ❌ ${escapeHTML(
                        error.message
                    )}
                </p>
                `;

            return;

        }


        if (
            !files ||
            files.length === 0
        ) {

            gallery.innerHTML =
                `
                <p>
                    No photos uploaded yet.
                </p>
                `;

            return;

        }


        gallery.innerHTML =
            "";


        files.forEach(
            file => {

                /*
                   Ignore folders if Supabase
                   returns any.
                */

                if (
                    !file.name ||
                    file.name.endsWith("/")
                ) {

                    return;

                }


                const {
                    data
                } =
                    supabaseClient
                        .storage
                        .from(
                            GALLERY_BUCKET
                        )
                        .getPublicUrl(
                            file.name
                        );


                const imageUrl =
                    data.publicUrl;


                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "admin-gallery-item";


                item.innerHTML = `

                    <img
                        src="${escapeHTML(
                            imageUrl
                        )}"
                        alt="Sylvia hairstyle">

                    <div
                        class="gallery-item-info">

                        <strong>
                            ${escapeHTML(
                                removeTimestamp(
                                    file.name
                                )
                            )}
                        </strong>

                        <button
                            type="button"
                            class="small-btn cancel-btn"
                            data-file="${escapeHTML(
                                file.name
                            )}">

                            DELETE PHOTO

                        </button>

                    </div>

                `;


                const deleteButton =
                    item.querySelector(
                        "button"
                    );


                deleteButton.addEventListener(
                    "click",
                    function() {

                        deleteGalleryPhoto(
                            file.name
                        );

                    }
                );


                gallery.appendChild(
                    item
                );

            }
        );


    } catch (error) {

        console.error(
            "GALLERY LOAD ERROR:",
            error
        );

        gallery.innerHTML =
            `
            <p>
                ❌ ${escapeHTML(
                    error.message
                )}
            </p>
            `;

    }

}


/* =========================================================
   DELETE GALLERY PHOTO
========================================================= */

async function deleteGalleryPhoto(
    fileName
) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this photo?"
        );


    if (!confirmed) {

        return;

    }


    try {

        const {
            error
        } =
            await supabaseClient
                .storage
                .from(
                    GALLERY_BUCKET
                )
                .remove([
                    fileName
                ]);


        if (error) {

            console.error(
                "DELETE PHOTO ERROR:",
                error
            );

            alert(
                "❌ Delete failed: "
                + error.message
            );

            return;

        }


        alert(
            "✅ Photo deleted."
        );


        await loadGallery();


    } catch (error) {

        console.error(
            error
        );

        alert(
            "❌ "
            + error.message
        );

    }

}


/* =========================================================
   LOGOUT
========================================================= */

async function adminLogout() {

    try {

        const {
            error
        } =
            await supabaseClient
                .auth
                .signOut();


        if (error) {

            console.error(
                error
            );

        }


        window.location.href =
            "admin-login.html";


    } catch (error) {

        console.error(
            error
        );

        window.location.href =
            "admin-login.html";

    }

}


/* =========================================================
   REMOVE TIMESTAMP FROM DISPLAY NAME
========================================================= */

function removeTimestamp(
    fileName
) {

    return fileName.replace(
        /^\d+_/,
        ""
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )

    .replace(
        /&/g,
        "&amp;"
    )

    .replace(
        /</g,
        "&lt;"
    )

    .replace(
        />/g,
        "&gt;"
    )

    .replace(
        /"/g,
        "&quot;"
    )

    .replace(
        /'/g,
        "&#039;"
    );

}


/* =========================================================
   ESCAPE JAVASCRIPT
========================================================= */

function escapeJS(
    value
) {

    return String(
        value ?? ""
    )

    .replace(
        /\\/g,
        "\\\\"
    )

    .replace(
        /'/g,
        "\\'"
    )

    .replace(
        /"/g,
        '\\"'
    )

    .replace(
        /\n/g,
        "\\n"
    )

    .replace(
        /\r/g,
        "\\r"
    );

}