import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function formatTimeAgo(utcSeconds: number) {
  const diff = Math.floor(Date.now() / 1000) - utcSeconds;
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

export async function GET() {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY; 
    if (!apiKey) {
      return NextResponse.json({ leads: [] });
    }

    console.log("[SYS] Bypassing Reddit Security & Fetching Data...");
    
    const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Achroweb/2.0' };
    
    // 🔥 THE FIX: ONE single request. Combining cities into one URL so Reddit doesn't IP ban the server for spamming.
    // const query = "HVAC OR plumber OR electrician OR roofing OR leak OR breaker";
    // const url = `https://www.reddit.com/r/Miami+BocaRaton+FortLauderdale+Orlando+Florida/search.json?q=${encodeURIComponent(query)}&restrict_sr=on&sort=new&limit=25`;
    
    // 🔥 THE FIX: Tapped the LIVE FIREHOSE to bypass Reddit's 20-minute search lag.
    const url = `https://www.reddit.com/r/Miami+BocaRaton+FortLauderdale+Orlando+Florida/new.json?limit=25`;

    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      console.error("[SYS] Reddit API blocked the request. Status:", response.status);
      return NextResponse.json({ leads: [] });
    }

    const redditData = await response.json();
    const rawPosts = redditData?.data?.children || [];

    const keywordRegex = /\b(AC|HVAC|roof|roofing|plumber|plumbing|electrician|electrical|leak|meter|breaker)\b/i;
    
    const allPosts = rawPosts.map((p: any) => ({
      id: p.data?.name || Math.random().toString(),
      title: p.data?.title || "",
      text: p.data?.selftext?.substring(0, 150) || "",
      author: p.data?.author || "unknown",
      timeAgo: p.data?.created_utc ? formatTimeAgo(p.data.created_utc) : "Just now"
    }))
    .filter((p: any) => p.title)
    .filter((p: any) => keywordRegex.test(p.title) || keywordRegex.test(p.text)); 

    console.log(`[SYS] Filtered down to ${allPosts.length} real posts. Routing to AI...`);

    if (allPosts.length === 0) return NextResponse.json({ leads: [] });

    const prompt = `You are a data extractor. Read these real Reddit posts.
    CRITICAL RULES:
    1. Extract ANY post where a user needs home contractors (Plumbing, HVAC, AC repair, Electrical, Roofing).
    2. Output ONLY a valid JSON object containing an array called "leads".
    3. DO NOT include markdown blocks like \`\`\`json. Output raw JSON only.
    
    Format exactly like this:
    {
      "leads": [
        { "id": "number", "source": "Reddit", "name": "author", "time": "COPY timeAgo", "context": "exact quote of their problem", "score": 92, "intent": "HIGH", "status": "AUTO-DM QUEUED", "category": "Plumbing/HVAC/Electrical/Roofing", "sourceId": "id" }
      ]
    }
    
    Posts: ${JSON.stringify(allPosts.slice(0, 6))}`;

    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://achrowebsolutions.com", 
        "X-Title": "Achroweb Sniper"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3-8b-instruct:free", 
        messages: [{ role: "user", content: prompt }],
        temperature: 0.0
      })
    });

    const aiData = await aiResponse.json();
    let content = aiData.choices?.[0]?.message?.content || '{"leads":[]}';
    
    console.log("[AI_CORE] Mission Success. Targets Acquired.");
    
    // JSON Stripper to prevent parse crashes
    content = content.replace(/```json/gi, '').replace(/```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (parseError) {
      return NextResponse.json({ leads: [] });
    }

    return NextResponse.json({ leads: parsed.leads || [] });

  } catch (error) {
    return NextResponse.json({ leads: [] });
  }
}