import { db, storage } from './firebase.js';
import { callGemini, generateThumbnails } from './api.js';

let currentUser = null;

export async function initDashboard(user) {
  currentUser = user;
  const container = document.getElementById('dashboardPage');
  container.innerHTML = `
    <div class="glass-card" style="margin-bottom: 2rem;">
      <h2>🚀 Upload Video</h2>
      <div id="uploadZone" class="upload-area">
        <div style="font-size: 48px;">📤</div>
        <p>Drag & drop or click to upload MP4 / MOV</p>
        <input type="file" id="videoFile" accept="video/*" style="display: none;">
        <div id="uploadProgress" style="display:none; margin-top: 1rem;"><progress id="progressBar" value="0" max="100" style="width:100%"></progress></div>
      </div>
      <div id="analysisStatus"></div>
    </div>
    <div id="thumbnailsSection" style="display:none;"><h3>🎨 AI Thumbnail Generations</h3><div class="thumbnail-grid" id="thumbnailsGrid"></div></div>
    <div class="grid-3" id="seoGrid">
      <div class="glass-card"><h4>🔥 SEO Titles</h4><div id="titlesList"></div></div>
      <div class="glass-card"><h4>📄 Description</h4><div id="descriptionBox"></div><button class="btn-primary" onclick="copyToClipboard('descriptionBox')">Copy</button></div>
      <div class="glass-card"><h4>🏷️ Tags</h4><div id="tagsList"></div><button onclick="copyToClipboard('tagsList')">Copy</button></div>
      <div class="glass-card"><h4>📢 Hashtags</h4><div id="hashtagsList"></div><button onclick="copyToClipboard('hashtagsList')">Copy</button></div>
      <div class="glass-card"><h4>🎣 Hook Ideas</h4><div id="hooksList"></div></div>
      <div class="glass-card"><h4>📱 Shorts Captions</h4><div id="captionsList"></div></div>
      <div class="glass-card"><h4>🎯 Viral Score</h4><div class="viral-meter" id="viralScoreCircle"><span>--</span></div></div>
      <div class="glass-card"><h4>📊 Growth Insights</h4><div id="insightsList"></div></div>
    </div>
    <div class="glass-card"><canvas id="analyticsChart" width="400" height="200"></canvas></div>
  `;
  attachUploadHandlers();
}

function attachUploadHandlers() {
  const dropZone = document.getElementById('uploadZone');
  const fileInput = document.getElementById('videoFile');
  dropZone.addEventListener('click', () => fileInput.click());
  dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag'));
  dropZone.addEventListener('drop', async (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) handleVideoUpload(file);
  });
  fileInput.addEventListener('change', (e) => { if (e.target.files[0]) handleVideoUpload(e.target.files[0]); });
}

async function handleVideoUpload(file) {
  const progressDiv = document.getElementById('uploadProgress');
  const progressBar = document.getElementById('progressBar');
  progressDiv.style.display = 'block';
  const storageRef = storage.ref(`videos/${currentUser.uid}/${Date.now()}_${file.name}`);
  const uploadTask = storageRef.put(file);
  uploadTask.on('state_changed', (snap) => {
    progressBar.value = (snap.bytesTransferred / snap.totalBytes) * 100;
  }, (err) => alert(err.message), async () => {
    const videoUrl = await storageRef.getDownloadURL();
    document.getElementById('analysisStatus').innerHTML = '<div class="loader"></div><p>AI analyzing video...</p>';
    await runAIPipeline(videoUrl, file.name);
  });
}

async function runAIPipeline(videoUrl, filename) {
  const topic = filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  const titles = await callGemini(`Generate 10 high-CTR YouTube titles for "${topic}". One per line.`);
  const description = await callGemini(`Write SEO description (200 words) for "${topic}".`);
  const tags = await callGemini(`Generate 20 tags for "${topic}" comma separated.`);
  const hashtags = await callGemini(`Generate 15 trending hashtags for "${topic}".`);
  const hooks = await callGemini(`Generate 5 viral hook sentences for "${topic}". One per line.`);
  const captions = await callGemini(`Generate 10 short captions (max 60 chars) for "${topic}".`);
  const insights = await callGemini(`Give 3 growth insights for "${topic}" (competitor, timing, thumbnail).`);
  const score = Math.floor(Math.random() * 40) + 60; // Replace with real analysis
  displayResults(titles, description, tags, hashtags, hooks, captions, insights, score);
  const thumbUrls = await generateThumbnails(videoUrl, topic);
  displayThumbnails(thumbUrls);
  await db.collection('projects').add({ userId: currentUser.uid, videoUrl, topic, titles, description, tags, hashtags, score, createdAt: new Date() });
}

function displayResults(titles, desc, tags, hashtags, hooks, captions, insights, score) {
  document.getElementById('titlesList').innerHTML = titles.split('\n').map(t => `<li>🔥 ${t}</li>`).join('');
  document.getElementById('descriptionBox').innerHTML = `<p>${desc}</p>`;
  document.getElementById('tagsList').innerText = tags;
  document.getElementById('hashtagsList').innerText = hashtags;
  document.getElementById('hooksList').innerHTML = hooks.split('\n').map(h => `<li>🎣 ${h}</li>`).join('');
  document.getElementById('captionsList').innerHTML = captions.split('\n').map(c => `<li>📱 ${c}</li>`).join('');
  document.getElementById('insightsList').innerHTML = insights.split('\n').map(i => `<li>💡 ${i}</li>`).join('');
  const meterSpan = document.querySelector('#viralScoreCircle span');
  meterSpan.innerText = score;
}
function displayThumbnails(urls) {
  const section = document.getElementById('thumbnailsSection');
  const grid = document.getElementById('thumbnailsGrid');
  grid.innerHTML = urls.map((url, i) => `
    <div class="thumbnail-card">
      <img src="${url}" alt="thumb">
      <div style="padding:12px;">
        <b>Version ${i+1}</b>
        <button class="btn-primary" style="padding:4px 12px;" onclick="window.downloadThumb('${url}')">Download</button>
      </div>
    </div>
  `).join('');
  section.style.display = 'block';
}
window.downloadThumb = (url) => { const a = document.createElement('a'); a.href = url; a.download = 'thumbnail.png'; a.click(); };
window.copyToClipboard = (id) => { const text = document.getElementById(id).innerText; navigator.clipboard.writeText(text); alert('Copied!'); };
