import { initAuth, loginWithEmail, signupWithEmail, loginWithGoogle, resetPassword, logout } from './auth.js';
import { initDashboard } from './dashboard.js';
import { loadAdminPanel } from './admin.js';
import { db } from './firebase.js';

let currentUser = null;

// Page router
window.showPage = (pageId) => {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId + 'Page').classList.add('active');
  if (pageId === 'dashboard' && currentUser) initDashboard(currentUser);
  if (pageId === 'admin') loadAdminPanel(currentUser);
  if (pageId === 'profile') renderProfile();
};

function renderProfile() {
  if (!currentUser) return;
  document.getElementById('profilePage').innerHTML = `
    <div class="glass-card" style="max-width:500px; margin:0 auto; text-align:center;">
      <div style="font-size:64px;">👤</div>
      <h3>${currentUser.displayName || currentUser.email}</h3>
      <p>${currentUser.email}</p>
      <p>Plan: Free</p>
      <button class="btn-primary" onclick="logout()">Sign Out</button>
    </div>
  `;
}

// Auth modal helpers
window.showAuthModal = () => document.getElementById('authModal').style.display = 'flex';
window.closeAuthModal = () => document.getElementById('authModal').style.display = 'none';
window.switchAuthTab = (tab) => {
  document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('signupForm').style.display = tab === 'signup' ? 'block' : 'none';
};
window.handleLogin = async () => {
  const email = document.getElementById('loginEmail').value;
  const pass = document.getElementById('loginPass').value;
  try { await loginWithEmail(email, pass); closeAuthModal(); } catch(e) { alert(e.message); }
};
window.handleSignup = async () => {
  const email = document.getElementById('signupEmail').value;
  const pass = document.getElementById('signupPass').value;
  try { await signupWithEmail(email, pass); closeAuthModal(); } catch(e) { alert(e.message); }
};
window.googleLogin = async () => { try { await loginWithGoogle(); closeAuthModal(); } catch(e) { alert(e.message); } };
window.resetPassword = async () => {
  const email = prompt("Enter your email");
  if (email) { await resetPassword(email); alert("Reset link sent"); }
};
window.logout = () => { logout(); window.location.reload(); };

// Initialize app
initAuth((user) => {
  currentUser = user;
  const authBtn = document.getElementById('authBtn');
  const userAvatar = document.getElementById('userAvatar');
  const dashboardLink = document.getElementById('dashboardLink');
  const adminLink = document.getElementById('adminLink');
  if (user) {
    authBtn.style.display = 'none';
    userAvatar.style.display = 'inline-block';
    dashboardLink.style.display = 'inline-block';
    if (user.email === 'dailyway@gmail.com') adminLink.style.display = 'inline-block';
    showPage('dashboard');
  } else {
    authBtn.style.display = 'inline-block';
    userAvatar.style.display = 'none';
    dashboardLink.style.display = 'none';
    adminLink.style.display = 'none';
    showPage('landing');
  }
});

// Landing page content
document.getElementById('landingPage').innerHTML = `
  <div style="text-align:center; max-width:800px; margin:60px auto;">
    <h1 style="font-size:56px; font-weight:800; background:linear-gradient(135deg,#a855f7,#3b82f6); -webkit-background-clip:text; background-clip:text; color:transparent;">Turn Videos Into Viral Content</h1>
    <p style="font-size:18px; margin:20px 0;">Upload once, get AI-powered thumbnails, titles, SEO and growth suggestions.</p>
    <button class="btn-primary" onclick="showAuthModal()">Start Free →</button>
  </div>
  <div class="grid-3">
    <div class="glass-card"><div style="font-size:32px;">🎨</div><h3>AI Thumbnail Generator</h3><p>4 viral styles: High CTR, Minimal, Emotional, MrBeast style.</p></div>
    <div class="glass-card"><div style="font-size:32px;">📈</div><h3>Viral SEO Engine</h3><p>10 SEO-optimized titles + descriptions that rank.</p></div>
    <div class="glass-card"><div style="font-size:32px;">🏷️</div><h3>Smart Hashtags & Tags</h3><p>Trending hashtags & tags based on competitor analysis.</p></div>
  </div>
  <div style="display:flex; flex-wrap:wrap; justify-content:center; gap:2rem; margin:60px 0;">
    <div class="glass-card" style="width:260px; text-align:center;"><h3>Free</h3><p style="font-size:32px; font-weight:800;">$0</p><p>5 generations/day</p><button class="btn-primary" onclick="showAuthModal()">Get Started</button></div>
    <div class="glass-card" style="width:260px; text-align:center; border:1px solid #8b5cf6;"><h3>Pro</h3><p style="font-size:32px; font-weight:800;">$19</p><p>Unlimited generations</p><button class="btn-primary" onclick="showAuthModal()">Upgrade</button></div>
  </div>
  <footer style="text-align:center; padding:2rem; color:#64748b;">© 2025 ViralForge AI — AI-powered creator economy</footer>
`;
