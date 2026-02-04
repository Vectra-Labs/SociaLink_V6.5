// Supabase is disabled for local version
// import { createClient } from "@supabase/supabase-js";
// export const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_SERVICE_ROLE_KEY
// );

export const supabase = {
    storage: {
        from: () => ({
            upload: async () => { throw new Error("Supabase Disabled"); },
            getPublicUrl: () => ({ data: { publicUrl: "" } })
        })
    }
};