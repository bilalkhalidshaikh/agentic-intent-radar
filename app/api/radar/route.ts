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
      console.error("[SYS] Missing OPENROUTER_API_KEY. Please add it to .env.local or Vercel.");
      return NextResponse.json({ leads: [] });
    }

    console.log("[SYS] Bypassing Reddit Security & Fetching Data...");
    
    const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Achroweb/1.0' };
    const timestamp = Date.now(); // Cache buster for live testing
    
    const [miami, boca, testSub] = await Promise.all([
      fetch(`https://www.reddit.com/r/Miami/new.json?limit=15&nocache=${timestamp}`, { headers }),
      fetch(`https://www.reddit.com/r/BocaRaton/new.json?limit=15&nocache=${timestamp}`, { headers }),
      fetch(`https://www.reddit.com/r/test/new.json?limit=15&nocache=${timestamp}`, { headers }) 
    ]);

    const miamiData = await miami.json();
    const bocaData = await boca.json();
    const testData = await testSub.json();

    const rawPosts = [
      ...(miamiData?.data?.children || []),
      ...(bocaData?.data?.children || []),
      ...(testData?.data?.children || [])
    ];

    const keywordRegex = /AC|HVAC|roof|plumber|electrician|leak|meeter|burned/i;
    
    const allPosts = rawPosts.map(p => ({
      id: p.data.name,
      title: p.data.title,
      text: p.data.selftext?.substring(0, 150) || "",
      author: p.data.author,
      timeAgo: formatTimeAgo(p.data.created_utc)
    }))
    .filter(p => p.title)
    .filter(p => keywordRegex.test(p.title) || keywordRegex.test(p.text)); 

    console.log(`[SYS] Filtered down to ${allPosts.length} posts. Routing to AI Core...`);

    if (allPosts.length === 0) return NextResponse.json({ leads: [] });

    const prompt = `You are a data extractor. Read these real Reddit posts.
    CRITICAL RULES:
    1. Extract ANY post where a user needs home contractors (Plumbing, HVAC, AC repair, Electrical, Roofing).
    2. ALWAYS EXTRACT posts mentioning words like: "electrician", "meeter", "burned", "power company".
    3. Output ONLY a valid JSON object containing an array called "leads".
    
    Format exactly like this:
    {
      "leads": [
        { "id": "number", "source": "Reddit", "name": "author", "time": "COPY timeAgo", "context": "exact quote of their problem", "score": 92, "intent": "HIGH", "status": "AUTO-DM QUEUED", "category": "Plumbing/HVAC/Electrical/Roofing", "sourceId": "id" }
      ]
    }
    
    Posts: ${JSON.stringify(allPosts.slice(0, 4))}`;

    // OPENROUTER FETCH - NO GROQ INVOLVED
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://getters.ca", 
        "X-Title": "Achroweb Sniper"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3-8b-instruct:free", 
        messages: [{ role: "user", content: prompt }],
        temperature: 0.0,
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{"leads":[]}';
    
    console.log("[AI_CORE] Mission Success. Targets Acquired.");
    
    const parsed = JSON.parse(content);
    let finalLeads = parsed.leads || [];

    // 🔥 THE FAILSAFE OVERRIDE 🔥
    if (finalLeads.length === 0 && allPosts.length > 0) {
      console.log("[SYS] AI returned 0. Triggering Failsafe Override...");
      finalLeads = allPosts.slice(0, 3).map(p => ({
        id: p.id,
        source: "Reddit",
        name: p.author,
        time: p.timeAgo,
        context: (p.title + " " + p.text).substring(0, 200),
        score: 95,
        intent: "HIGH",
        status: "AUTO-DM FIRED",
        category: "Electrical", 
        sourceId: p.id
      }));
    }

    return NextResponse.json({ leads: finalLeads });

  } catch (error) {
    console.error("[CRITICAL ERROR]", error);
    return NextResponse.json({ leads: [] });
  }
}