export async function onRequestGet(context) {
  const { env } = context;
  try {
    const { results } = await env.DB.prepare(
      "SELECT name, birth_date, birth_time, calendar_type, gender FROM user_profile LIMIT 1"
    ).all();
    
    if (results.length === 0) {
      return new Response(JSON.stringify({ profile: null }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    
    return new Response(JSON.stringify({ profile: results[0] }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const data = await request.json();
    const { name, birth_date, birth_time, calendar_type, gender } = data;
    
    if (!name || !birth_date || !birth_time || !calendar_type || !gender) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    // Clear old profiles (only keep 1 profile)
    await env.DB.prepare("DELETE FROM user_profile").run();
    
    // Insert new profile
    await env.DB.prepare(
      "INSERT INTO user_profile (name, birth_date, birth_time, calendar_type, gender) VALUES (?, ?, ?, ?, ?)"
    ).bind(name, birth_date, birth_time, calendar_type, gender).run();
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
