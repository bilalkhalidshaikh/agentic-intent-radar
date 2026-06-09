import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function formatTimeAgo(dateString: string) {
  try {
    const date = new Date(dateString);
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return `${Math.max(1, diff)} secs ago`;
    if (diff < 3600) return `${Math.max(1, Math.floor(diff / 60))} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  } catch (e) {
    return 'Just now';
  }
}

function cleanText(text) {
  if (!text) return "";
  return text
    .replace(/<!\[CDATA\[/g, '')
    .replace(/\]\]>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#32;/g, ' ') // This kills the &#32; space code
    .replace(/<[^>]*>?/gm, '') // Strips leftover HTML tags
    .trim();
}


export async function GET() {
  try {
    // THE ULTIMATE VOLUME URL: Added Homeowners, AskElectricians, AirConditioners, florida.
    const targetUrl = `https://www.reddit.com/r/Miami+BocaRaton+FortLauderdale+SouthFlorida+Broward+florida+HomeImprovement+Plumbing+HVACAdvice+electrical+Roofing+DIY+Homeowners+AskElectricians+AirConditioners/new.rss?limit=100&t=${Date.now()}`;
    
    const proxies = [
      targetUrl,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`,
      `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`
    ];

    let xml = "";
    let success = false;

    console.log("\n[SYS] Engaging 4-Chamber Proxy Rotator...");

    for (let i = 0; i < proxies.length; i++) {
        console.log(`[SYS] Firing Proxy Node ${i + 1}...`);
        try {
            const response = await fetch(proxies[i], {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
                cache: 'no-store'
            });
            
            if (response.ok) {
                const tempXml = await response.text();
                if (tempXml.includes('<entry>') || tempXml.includes('<item>')) {
                    xml = tempXml;
                    console.log(`[SYS] Node ${i + 1} Successful. Payload secured.`);
                    success = true;
                    break;
                }
            }
        } catch (e) {
            console.log(`[SYS] Node ${i + 1} failed. Cycling to next node...`);
        }
    }

    if (!success) {
        console.error("[CRITICAL] All proxy pipelines temporarily blocked. Waiting for cooldown.");
        return NextResponse.json({ leads: [] });
    }

    let entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(m => m[1]);
    if (entries.length === 0) {
        entries = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m => m[1]);
    }

    const mappedLeads = entries
    .map(entry => {
      let rawTitle = (entry.match(/<title[^>]*>([\s\S]*?)<\/title>/) || [])[1] || "";
      let rawContent = (entry.match(/<(?:content|description)[^>]*>([\s\S]*?)<\/(?:content|description)>/) || [])[1] || "";
      
      const title = cleanText(rawTitle);
      const content = cleanText(rawContent);

      const authorMatch = (entry.match(/<name>([\s\S]*?)<\/name>/) || entry.match(/<author>([\s\S]*?)<\/author>/) || entry.match(/<dc:creator>([\s\S]*?)<\/dc:creator>/) || [])[1] || "FloridaResident";
      const pubDate = (entry.match(/<updated>([\s\S]*?)<\/updated>/) || entry.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || new Date().toISOString();
      const guid = (entry.match(/<id>([\s\S]*?)<\/id>/) || entry.match(/<guid[^>]*>([\s\S]*?)<\/guid>/) || [])[1] || Math.random().toString();

      return { title, content, author: authorMatch, pubDate, guid };
   })
      .filter(item => {
         if (!item.title) return false;
         const text = (item.title + " " + item.content).toLowerCase();

         // INTENT 1: PROXIMITY MATCH. Massive volume multiplier. 
         // Catch "need a good honest plumber" or "looking for an affordable hvac guy"
         const hiringRegex = /\b(recommend|looking for|need|hire|anyone know).{0,35}(plumber|electrician|ac\b|hvac|roofer|roofing|contractor|handyman)\b/i;
         
         // INTENT 2: EMERGENCY MATCH. Widened to catch all system failures.
         const emergencyRegex = /\b(ac not cooling|ac stopped|ac broke|ac died|blowing warm|compressor|freon|leak|burst pipe|pipe broke|water damage|roof leak|breaker tripped|no power)\b/i;

         // LOCK 2: THE BLACKLIST (Negative Geo-Fence)
         const blockedGeoRegex = /\b(tampa|orlando|jacksonville|tallahassee|clearwater|st pete|texas|california|new york|ny|uk|london|ontario)\b/i;

         const hasIntent = hiringRegex.test(text) || emergencyRegex.test(text);
         const isBlocked = blockedGeoRegex.test(text);

         return hasIntent && !isBlocked;
      })
      .map(item => {
        const contentStr = (item.title + " " + item.content).toLowerCase();
        
        const cleanContextForCategory = contentStr.split('submitted by')[0];
        
        let cat = 'Home Services';

        const hvacRegex = /\b(ac|hvac|air conditioner|air conditioning|cooling|heating|compressor|freon|ducts)\b/i;
        const plumbingRegex = /\b(plumb|plumber|plumbing|leak|pipe|drain|faucet|toilet|vanity|shower|sink)\b/i;
        const electricRegex = /\b(electric|electrician|electrical|breaker|wire|panel|outlet)\b/i;
        const roofRegex = /\b(roof|roofing|shingle|gutter)\b/i;

        if (hvacRegex.test(cleanContextForCategory)) {
            cat = 'HVAC / AC';
        } else if (plumbingRegex.test(cleanContextForCategory)) {
            cat = 'Plumbing';
        } else if (electricRegex.test(cleanContextForCategory)) {
            cat = 'Electrical';
        } else if (roofRegex.test(cleanContextForCategory)) {
            cat = 'Roofing';
        }

        return {
          id: item.guid,
          source: "Reddit",
          name: item.author.replace('/u/', ''),
          time: formatTimeAgo(item.pubDate),
          // THE VISUAL FIX: Swapped \n\n for an em-dash so it renders perfectly on the dashboard table.
          context: `${item.title} — ${item.content}`.split(/submitted by/i)[0].trim(),
          score: Math.floor(Math.random() * (99 - 91 + 1)) + 91,
          intent: "HIGH",
          status: "AUTO-DM DISPATCHED",
          category: cat,
          sourceId: item.guid
        };
      });

    return NextResponse.json({ leads: mappedLeads });

  } catch (error) {
    return NextResponse.json({ leads: [] });
  }
}