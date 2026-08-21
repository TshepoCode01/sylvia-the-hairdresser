const SUPABASE_URL =
    "https://qdzmqcxxaqhkweljzvkc.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_t1LkGkcvWcC0EJCn8NiUFQ_D1Qsq-Ug";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );