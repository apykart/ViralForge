const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'YOUR_GEMINI_KEY';
const REPLICATE_KEY = import.meta.env.VITE_REPLICATE_API_KEY;

export async function callGemini(prompt) {
  if (GEMINI_KEY === 'YOUR_GEMINI_KEY') return mockAIResponse();
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'AI error';
}

export async function generateThumbnails(videoUrl, topic) {
  // This would call Replicate API – for demo we return placeholder URLs
  const styles = ['High CTR', 'Minimalist', 'Emotional', 'MrBeast'];
  return styles.map((style, i) => `https://placehold.co/400x225/8b5cf6/ffffff?text=Thumbnail+${i+1}`);
}

function mockAIResponse() {
  return `🔥 Viral Title 1\n🔥 Viral Title 2\nThis is a sample AI response. Replace API keys for real results.`;
}
