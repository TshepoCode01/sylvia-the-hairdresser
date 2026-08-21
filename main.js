/* =========================================================
   SYLVIA THE HAIRDRESSER
   PUBLIC WEBSITE JAVASCRIPT
========================================================= */


/* =========================================================
   START
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    console.log("SYLVIA website loaded.");

    loadServices();

    loadGallery();

});


/* =========================================================
   SUPABASE STORAGE
========================================================= */

const GALLERY_BUCKET = "gallery";


/* =========================================================
   LOAD GALLERY
========================================================= */

async function loadGallery() {

    const gallery =
        document.getElementById(
            "gallery-container"
        );


    if (!gallery) {

        console.error(
            "Gallery container not found."
        );

        return;

    }


    gallery.innerHTML = `
        <div class="loading">
            Loading gallery...
        </div>
    `;


    try {

        console.log(
            "Loading photos from Supabase..."
        );


        /* GET FILES FROM GALLERY BUCKET */

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
                            column: "created_at",
                            order: "desc"
                        }
                    }
                );


        /* CHECK ERROR */

        if (error) {

            console.error(
                "GALLERY ERROR:",
                error
            );

            gallery.innerHTML = `
                <div class="loading">
                    Unable to load gallery.
                </div>
            `;

            return;

        }


        console.log(
            "Gallery files:",
            files
        );


        /* NO IMAGES */

        if (
            !files ||
            files.length === 0
        ) {

            gallery.innerHTML = `
                <div class="loading">
                    No hairstyle photos available yet.
                </div>
            `;

            return;

        }


        /* CLEAR LOADING */

        gallery.innerHTML = "";


        /* CREATE IMAGE CARDS */

        files.forEach(
            function (file) {

                /* Ignore folders */

                if (
                    !file.name ||
                    file.name.endsWith("/")
                ) {

                    return;

                }


                /* GET PUBLIC URL */

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


                /* CREATE CARD */

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "gallery-item";


                item.innerHTML = `

                    <img
                        src="${escapeHTML(imageUrl)}"
                        alt="Sylvia The Hairdresser hairstyle"
                        loading="lazy">

                `;


                gallery.appendChild(
                    item
                );

            }
        );


        console.log(
            "Gallery loaded successfully."
        );


    } catch (error) {

        console.error(
            "GALLERY LOAD FAILED:",
            error
        );


        gallery.innerHTML = `
            <div class="loading">
                Unable to load gallery.
            </div>
        `;

    }

}


/* =========================================================
   LOAD SERVICES
========================================================= */

async function loadServices() {

    const container =
        document.getElementById(
            "services-container"
        );


    if (!container) {

        return;

    }


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

            container.innerHTML = `
                <div class="loading">
                    Unable to load services.
                </div>
            `;

            return;

        }


        if (
            !services ||
            services.length === 0
        ) {

            container.innerHTML = `
                <div class="loading">
                    No services available yet.
                </div>
            `;

            return;

        }


        container.innerHTML = "";


        services.forEach(
            function (service) {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "card";


                const serviceName =
                    service.name ||
                    service.service_name ||
                    "Hair Service";


                const price =
                    service.price ||
                    "0";


                const duration =
                    service.duration ||
                    "";


                card.innerHTML = `

                    <h3>
                        ${escapeHTML(
                            serviceName
                        )}
                    </h3>

                    <p>
                        ${escapeHTML(
                            duration
                        )}
                    </p>

                    <strong>
                        R${escapeHTML(
                            price
                        )}
                    </strong>

                `;


                container.appendChild(
                    card
                );

            }
        );


    } catch (error) {

        console.error(
            "SERVICES LOAD FAILED:",
            error
        );

    }

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

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