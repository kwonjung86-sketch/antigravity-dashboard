export async function onRequestGet(context) {
  const { env } = context;
  try {
    const { results } = await env.DB.prepare(
      "SELECT id, title, type, config, is_default FROM menu_items ORDER BY is_default DESC, id ASC"
    ).all();
    
    // Parse configs from JSON string to object
    const parsedResults = results.map(item => ({
      ...item,
      config: item.config ? JSON.parse(item.config) : null
    }));
    
    return new Response(JSON.stringify({ menus: parsedResults }), {
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
    const { title, type, config } = data;
    
    if (!title || !type) {
      return new Response(JSON.stringify({ error: "Missing title or type" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    const configStr = config ? JSON.stringify(config) : null;
    
    await env.DB.prepare(
      "INSERT INTO menu_items (title, type, config, is_default) VALUES (?, ?, ?, 0)"
    ).bind(title, type, configStr).run();
    
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

export async function onRequestDelete(context) {
  const { request, env } = context;
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    
    if (!id) {
      return new Response(JSON.stringify({ error: "Missing menu ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    // Delete from menu items (cannot delete default menus)
    const result = await env.DB.prepare(
      "DELETE FROM menu_items WHERE id = ? AND is_default = 0"
    ).bind(id).run();
    
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

export async function onRequestPut(context) {
  const { request, env } = context;
  try {
    const data = await request.json();
    const { id, title, config } = data;
    
    if (!id || !title) {
      return new Response(JSON.stringify({ error: "Missing id or title" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    const configStr = config ? JSON.stringify(config) : null;
    
    await env.DB.prepare(
      "UPDATE menu_items SET title = ?, config = ? WHERE id = ? AND is_default = 0"
    ).bind(title, configStr, id).run();
    
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
