// Helper to calculate RSI (14-day)
function calculateRSI(prices, period = 14) {
  if (prices.length <= period) return null;
  let gains = 0;
  let losses = 0;
  
  // First RSI
  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }
  
  let avgGain = gains / period;
  let avgLoss = losses / period;
  
  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    avgGain = (avgGain * (period - 1) + (diff > 0 ? diff : 0)) / period;
    avgLoss = (avgLoss * (period - 1) + (diff < 0 ? -diff : 0)) / period;
  }
  
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

// Helper to calculate SMA
function calculateSMA(prices, period) {
  if (prices.length < period) return null;
  const slice = prices.slice(prices.length - period);
  return slice.reduce((sum, val) => sum + val, 0) / period;
}

// Naver News Search Scraper Parser
function parseNaverNews(html) {
  const articles = [];
  
  // 1. Try the new structure (using data-heatmap-target attributes)
  if (html.includes('data-heatmap-target=".tit"')) {
    let blocks = html.split('data-sds-comp="Profile"');
    if (blocks.length <= 1) {
      blocks = html.split('class="sds-comps-profile');
    }
    
    for (let i = 1; i < blocks.length; i++) {
      const block = blocks[i];
      
      const linkMatch = block.match(/href="([^"]+)"[^>]*data-heatmap-target="\.tit"/) || block.match(/data-heatmap-target="\.tit"[^>]*href="([^"]+)"/);
      const titleMatch = block.match(/data-heatmap-target="\.tit"[^>]*>([\s\S]*?)<\/a>/);
      
      const pressMatch = block.match(/data-heatmap-target="\.prof"[^>]*>([\s\S]*?)<\/a>/);
      const dscMatch = block.match(/data-heatmap-target="\.body"[^>]*>([\s\S]*?)<\/a>/);
      
      if (linkMatch && titleMatch) {
        const link = linkMatch[1];
        let title = titleMatch[1].replace(/<[^>]*>/g, '').trim();
        title = title.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
        
        let source = pressMatch ? pressMatch[1].replace(/<[^>]*>/g, '').trim() : '네이버 뉴스';
        source = source.replace(/언론사 선정/g, '').trim();
        if (!source) source = '네이버 뉴스';
        
        let summary = dscMatch ? dscMatch[1].replace(/<[^>]*>/g, '').trim() : '';
        summary = summary.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
        
        if (title.length > 5 && articles.findIndex(a => a.title === title) === -1) {
          articles.push({ title, link, summary, source });
        }
      }
    }
  }
  
  // 2. Fallback to the traditional structure
  if (articles.length === 0) {
    let blocks = html.split('<div class="news_wrap api_ani_send"');
    if (blocks.length <= 1) {
      blocks = html.split('<li class="bx"');
    }
    
    for (let i = 1; i < blocks.length; i++) {
      const block = blocks[i];
      
      const linkMatch = block.match(/href="([^"]+)"[^>]*class="news_tit"/) || block.match(/class="news_tit"[^>]*href="([^"]+)"/);
      const titleMatch = block.match(/class="news_tit"[^>]*title="([^"]+)"/) || block.match(/class="news_tit"[^>]*>([\s\S]*?)<\/a>/);
      
      const pressMatch = block.match(/class="info press"[^>]*>([\s\S]*?)<\/a>/) || block.match(/class="press"[^>]*>([\s\S]*?)<\/a>/) || block.match(/class="info"[^>]*>([\s\S]*?)<\/a>/);
      const dscMatch = block.match(/class="api_txt_lines dsc_txt_wrap"[^>]*>([\s\S]*?)<\/a>/) || block.match(/class="dsc_txt_wrap"[^>]*>([\s\S]*?)<\/a>/);
      
      if (linkMatch && titleMatch) {
        const link = linkMatch[1];
        let title = titleMatch[1].replace(/<[^>]*>/g, '').trim();
        title = title.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
        
        let source = pressMatch ? pressMatch[1].replace(/<[^>]*>/g, '').trim() : '네이버 뉴스';
        source = source.replace(/언론사 선정/g, '').trim();
        
        let summary = dscMatch ? dscMatch[1].replace(/<[^>]*>/g, '').trim() : '';
        summary = summary.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
        
        if (title.length > 5 && articles.findIndex(a => a.title === title) === -1) {
          articles.push({ title, link, summary, source });
        }
      }
    }
  }
  return articles.slice(0, 10); // Return top 10 articles
}

// Fetch helper with User-Agent
async function fetchWithUA(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  return response.text();
}

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    // Optional query parameter secret check (for security)
    const url = new URL(request.url);
    
    // 1. Get current date in KST (UTC+9)
    const nowKST = new Date(new Date().getTime() + 9 * 60 * 60 * 1000);
    const dateStr = nowKST.toISOString().split("T")[0];
    
    // Delete existing records for today to avoid duplicates on multiple crawls
    await env.DB.prepare("DELETE FROM news WHERE date = ?").bind(dateStr).run();
    await env.DB.prepare("DELETE FROM stocks WHERE date = ?").bind(dateStr).run();
    await env.DB.prepare("DELETE FROM coins WHERE date = ?").bind(dateStr).run();
    
    // --- PART 1: CRAWL NEWS ---
    // A. Morning News: Search for "주요뉴스" (breaking headlines)
    const morningNewsHTML = await fetchWithUA("https://search.naver.com/search.naver?where=news&query=%EC%A3%BC%EC%9A%94%EB%89%B4%EC%8A%A4");
    const morningArticles = parseNaverNews(morningNewsHTML);
    for (const art of morningArticles) {
      await env.DB.prepare(
        "INSERT INTO news (date, category, title, link, summary, source) VALUES (?, '아침 뉴스', ?, ?, ?, ?)"
      ).bind(dateStr, art.title, art.link, art.summary, art.source).run();
    }
    
    // B. Student News: Search for "교육 시사 청소년"
    const studentNewsHTML = await fetchWithUA("https://search.naver.com/search.naver?where=news&query=%EA%B5%90%EC%9C%A1%20%EC%8B%9C%EC%82%AC%20%EC%B2%AD%EC%86%8C%EB%85%84");
    const studentArticles = parseNaverNews(studentNewsHTML);
    for (const art of studentArticles) {
      await env.DB.prepare(
        "INSERT INTO news (date, category, title, link, summary, source) VALUES (?, '교사용 시사 뉴스', ?, ?, ?, ?)"
      ).bind(dateStr, art.title, art.link, art.summary, art.source).run();
    }
    
    // C. Custom RSS / News Feed menus
    // Find all custom menu items of type 'rss_news'
    const { results: customMenus } = await env.DB.prepare("SELECT title, config FROM menu_items WHERE type = 'rss_news' AND is_default = 0").all();
    for (const menu of customMenus) {
      const config = JSON.parse(menu.config);
      if (config && config.feed_url) {
        // Scrape search query if custom search query or RSS feed
        const query = config.feed_url;
        const customHTML = await fetchWithUA(`https://search.naver.com/search.naver?where=news&query=${encodeURIComponent(query)}`);
        const customArticles = parseNaverNews(customHTML);
        for (const art of customArticles) {
          await env.DB.prepare(
            "INSERT INTO news (date, category, title, link, summary, source) VALUES (?, ?, ?, ?, ?, ?)"
          ).bind(dateStr, menu.title, art.title, art.link, art.summary, art.source).run();
        }
      }
    }
    
    // --- PART 2: FETCH STOCK MARKET DATA ---
    const stockTickers = [
      { name: "삼성전자", ticker: "005930.KS" },
      { name: "SK하이닉스", ticker: "000660.KS" },
      { name: "Apple", ticker: "AAPL" },
      { name: "Microsoft", ticker: "MSFT" },
      { name: "NVIDIA", ticker: "NVDA" },
      { name: "Tesla", ticker: "TSLA" },
      { name: "코스피", ticker: "^KS11" },
      { name: "코스닥", ticker: "^KQ11" }
    ];
    
    for (const s of stockTickers) {
      try {
        const yahooRes = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${s.ticker}?interval=1d&range=30d`, {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const yahooData = await yahooRes.json();
        
        const result = yahooData.chart.result[0];
        const closePrices = result.indicators.quote[0].close.filter(p => p !== null && p !== undefined);
        const timestamps = result.timestamp;
        
        const currentPrice = result.meta.regularMarketPrice;
        const prevClose = closePrices.length >= 2 ? closePrices[closePrices.length - 2] : result.meta.chartPreviousClose;
        const changeVal = currentPrice - prevClose;
        const changePct = (changeVal / prevClose) * 100;
        
        // Calculate Technical Indicators
        const rsi = calculateRSI(closePrices, 14);
        const sma5 = calculateSMA(closePrices, 5);
        const sma10 = calculateSMA(closePrices, 10);
        
        // Prior SMAs (for cross checking)
        const priorClosePrices = closePrices.slice(0, closePrices.length - 1);
        const priorSma5 = calculateSMA(priorClosePrices, 5);
        const priorSma10 = calculateSMA(priorClosePrices, 10);
        
        let recommendation = "HOLD";
        let reason = "RSI 및 이평선 지표가 안정적인 보합 상태입니다.";
        
        if (rsi !== null && rsi < 30) {
          recommendation = "BUY";
          reason = `RSI 지표가 ${rsi.toFixed(1)}로 과매도(30 이하) 구간에 진입하여 기술적 반등이 기대됩니다.`;
        } else if (rsi !== null && rsi > 70) {
          recommendation = "SELL";
          reason = `RSI 지표가 ${rsi.toFixed(1)}로 과매수(70 이상) 구간에 진입하여 단기 과열 리스크가 있습니다.`;
        } else if (sma5 && sma10 && priorSma5 && priorSma10) {
          if (sma5 > sma10 && priorSma5 <= priorSma10) {
            recommendation = "BUY";
            reason = "5일 단기 이동평균선이 10일 이동평균선을 골든크로스(상향 돌파)하여 단기 상승 추세 전환을 예고합니다.";
          } else if (sma5 < sma10 && priorSma5 >= priorSma10) {
            recommendation = "SELL";
            reason = "5일 단기 이동평균선이 10일 이동평균선을 데드크로스(하향 돌파)하여 단기 하락 우려가 커졌습니다.";
          }
        }
        
        // Compile 7-day historical prices for charts
        const history = [];
        const daysToTake = Math.min(closePrices.length, 7);
        for (let idx = closePrices.length - daysToTake; idx < closePrices.length; idx++) {
          const date = new Date(timestamps[idx] * 1000 + 9 * 60 * 60 * 1000).toISOString().split("T")[0];
          history.push({ date, price: closePrices[idx] });
        }
        
        await env.DB.prepare(
          "INSERT INTO stocks (date, ticker, name, price, change_pct, change_val, rsi, recommendation, reason, chart_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        ).bind(
          dateStr, s.ticker, s.name, currentPrice, changePct, changeVal, rsi, recommendation, reason, JSON.stringify(history)
        ).run();
      } catch (err) {
        console.error(`Error fetching stock ${s.ticker}:`, err);
      }
    }
    
    // --- PART 3: FETCH COIN MARKET DATA ---
    const coinSymbols = [
      { name: "비트코인", symbol: "KRW-BTC" },
      { name: "이더리움", symbol: "KRW-ETH" },
      { name: "솔라나", symbol: "KRW-SOL" },
      { name: "리플", symbol: "KRW-XRP" },
      { name: "에이다", symbol: "KRW-ADA" }
    ];
    
    for (const c of coinSymbols) {
      try {
        const upbitRes = await fetch(`https://api.upbit.com/v1/candles/days?market=${c.symbol}&count=30`);
        const candles = await upbitRes.json();
        
        // Upbit returns candles in reverse order (latest first), so reverse them for calculations
        const sortedCandles = candles.reverse();
        const closePrices = sortedCandles.map(item => item.trade_price);
        
        // Current ticker values
        const tickerRes = await fetch(`https://api.upbit.com/v1/ticker?markets=${c.symbol}`);
        const tickerData = await tickerRes.json();
        const ticker = tickerData[0];
        
        const currentPrice = ticker.trade_price;
        const changePct = ticker.signed_change_rate * 100;
        const changeVal = ticker.signed_change_price * (ticker.change === "FALL" ? -1 : 1);
        
        // Calculate Technical Indicators
        const rsi = calculateRSI(closePrices, 14);
        const sma5 = calculateSMA(closePrices, 5);
        const sma10 = calculateSMA(closePrices, 10);
        
        // Prior SMAs (for cross checking)
        const priorClosePrices = closePrices.slice(0, closePrices.length - 1);
        const priorSma5 = calculateSMA(priorClosePrices, 5);
        const priorSma10 = calculateSMA(priorClosePrices, 10);
        
        let recommendation = "HOLD";
        let reason = "RSI 및 이평선 지표가 안정적인 보합 상태입니다.";
        
        if (rsi !== null && rsi < 30) {
          recommendation = "BUY";
          reason = `RSI 지표가 ${rsi.toFixed(1)}로 과매도(30 이하) 구간에 진입하여 과대낙폭에 따른 기술적 반등 시점입니다.`;
        } else if (rsi !== null && rsi > 70) {
          recommendation = "SELL";
          reason = `RSI 지표가 ${rsi.toFixed(1)}로 과매수(70 이상) 구간에 진입하여 과열 해소를 위한 단기 조정 리스크가 있습니다.`;
        } else if (sma5 && sma10 && priorSma5 && priorSma10) {
          if (sma5 > sma10 && priorSma5 <= priorSma10) {
            recommendation = "BUY";
            reason = "5일 이동평균선이 10일 이동평균선을 골든크로스(상향 돌파)하여 매수 심리가 활성화되고 단기 상승 추세를 지지합니다.";
          } else if (sma5 < sma10 && priorSma5 >= priorSma10) {
            recommendation = "SELL";
            reason = "5일 이동평균선이 10일 이동평균선을 데드크로스(하향 돌파)하여 하방 압력이 확대될 우려가 있습니다.";
          }
        }
        
        // Compile 7-day historical prices for charts
        const history = [];
        const daysToTake = Math.min(closePrices.length, 7);
        for (let idx = sortedCandles.length - daysToTake; idx < sortedCandles.length; idx++) {
          const date = sortedCandles[idx].candle_date_time_kst.split("T")[0];
          history.push({ date, price: sortedCandles[idx].trade_price });
        }
        
        await env.DB.prepare(
          "INSERT INTO coins (date, symbol, name, price, change_pct, change_val, rsi, recommendation, reason, chart_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        ).bind(
          dateStr, c.symbol, c.name, currentPrice, changePct, changeVal, rsi, recommendation, reason, JSON.stringify(history)
        ).run();
      } catch (err) {
        console.error(`Error fetching coin ${c.symbol}:`, err);
      }
    }
    
    // --- PART 4: DATA RETENTION (PRUNING OLD DATA > 7 DAYS) ---
    const thresholdDateKST = new Date(new Date().getTime() + 9 * 60 * 60 * 1000 - 7 * 24 * 60 * 60 * 1000);
    const thresholdDateStr = thresholdDateKST.toISOString().split("T")[0];
    
    await env.DB.prepare("DELETE FROM news WHERE date < ?").bind(thresholdDateStr).run();
    await env.DB.prepare("DELETE FROM stocks WHERE date < ?").bind(thresholdDateStr).run();
    await env.DB.prepare("DELETE FROM coins WHERE date < ?").bind(thresholdDateStr).run();
    
    return new Response(JSON.stringify({ success: true, date: dateStr }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
