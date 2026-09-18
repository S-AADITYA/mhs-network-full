const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const body = await request.json();
    const required = ["brand", "service", "city", "name", "phone"];
    if (required.some((field) => !String(body[field] ?? "").trim())) {
      return new Response("Missing required field", {
        status: 400,
        headers: corsHeaders,
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response("Supabase environment is not configured", {
        status: 500,
        headers: corsHeaders,
      });
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/leads`, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        brand: String(body.brand).trim(),
        service: String(body.service).trim(),
        city: String(body.city).trim(),
        source_url: String(body.source_url ?? "").trim(),
        name: String(body.name).trim(),
        phone: String(body.phone).trim(),
        message: String(body.message ?? "").trim(),
      }),
    });

    if (!response.ok) {
      return new Response("Could not save lead", {
        status: 502,
        headers: corsHeaders,
      });
    }

    return new Response("Lead received", {
      status: 201,
      headers: corsHeaders,
    });
  } catch {
    return new Response("Invalid request", {
      status: 400,
      headers: corsHeaders,
    });
  }
});
