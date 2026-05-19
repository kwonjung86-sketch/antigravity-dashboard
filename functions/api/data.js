export async function onRequestGet(context) {
  const { request, env } = context;
  try {
    const url = new URL(request.url);
    const datesOnly = url.searchParams.get("dates_only") === "true";
    
    if (datesOnly) {
      // Get unique dates available in the last 7 days from all tables combined
      const query = `
        SELECT date FROM (
          SELECT DISTINCT date FROM news
          UNION
          SELECT DISTINCT date FROM stocks
          UNION
          SELECT DISTINCT date FROM coins
        ) ORDER BY date DESC LIMIT 7
      `;
      const { results } = await env.DB.prepare(query).all();
      const dates = results.map(r => r.date);
      return new Response(JSON.stringify({ dates }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    
    // Fetch data for a specific date
    let date = url.searchParams.get("date");
    if (!date) {
      // Default to today's date in KST (UTC+9)
      const nowKST = new Date(new Date().getTime() + 9 * 60 * 60 * 1000);
      date = nowKST.toISOString().split("T")[0];
    }
    
    // Query news, stocks, and coins
    const newsPromise = env.DB.prepare("SELECT * FROM news WHERE date = ?").bind(date).all();
    const stocksPromise = env.DB.prepare("SELECT * FROM stocks WHERE date = ?").bind(date).all();
    const coinsPromise = env.DB.prepare("SELECT * FROM coins WHERE date = ?").bind(date).all();
    
    const [newsRes, stocksRes, coinsRes] = await Promise.all([newsPromise, stocksPromise, coinsPromise]);
    
    // Parse chart_data for stocks and coins
    const stocks = newsRes.results ? stocksRes.results.map(s => ({
      ...s,
      chart_data: s.chart_data ? JSON.parse(s.chart_data) : []
    })) : [];
    
    const coins = coinsRes.results ? coinsRes.results.map(c => ({
      ...c,
      chart_data: c.chart_data ? JSON.parse(c.chart_data) : []
    })) : [];
    
    return new Response(JSON.stringify({
      date,
      news: newsRes.results || [],
      stocks,
      coins
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
