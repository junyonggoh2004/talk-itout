import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const users = [
      { email: "student@talkitout.test", password: "Student123!", role: "student" as const },
      { email: "counsellor@talkitout.test", password: "Counsellor123!", role: "counsellor" as const },
    ];

    const results = [];

    for (const user of users) {
      // Check if user already exists
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(u => u.email === user.email);

      if (existingUser) {
        // If counsellor, ensure role is set
        if (user.role === "counsellor") {
          const { data: existingRole } = await supabaseAdmin
            .from("user_roles")
            .select("role")
            .eq("user_id", existingUser.id)
            .eq("role", "counsellor")
            .maybeSingle();

          if (!existingRole) {
            await supabaseAdmin.from("user_roles").insert({
              user_id: existingUser.id,
              role: "counsellor",
            });
          }
        }
        results.push({ email: user.email, status: "already exists" });
        continue;
      }

      // Create user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
      });

      if (createError) {
        results.push({ email: user.email, status: "error", error: createError.message });
        continue;
      }

      // If counsellor, add counsellor role (student role is added by trigger)
      if (user.role === "counsellor" && newUser.user) {
        await supabaseAdmin.from("user_roles").insert({
          user_id: newUser.user.id,
          role: "counsellor",
        });
      }

      results.push({ email: user.email, status: "created" });
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
