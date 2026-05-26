import { db } from './firebase.js';

export async function loadAdminPanel(user) {
  if (!user || user.email !== 'dailyway@gmail.com') {
    document.getElementById('adminPage').innerHTML = '<div class="glass-card">Access denied.</div>';
    return;
  }
  const usersSnap = await db.collection('users').get();
  let html = `<div class="glass-card"><h2>Admin Control</h2><table style="width:100%;"><thead><tr><th>User</th><th>Email</th><th>Plan</th><th>Projects</th></tr></thead><tbody>`;
  for (const doc of usersSnap.docs) {
    const u = doc.data();
    const projCount = (await db.collection('projects').where('userId', '==', doc.id).get()).size;
    html += `<tr><td>${u.name || '-'}</td><td>${u.email}</td><td>${u.plan}</td><td>${projCount}</td></tr>`;
  }
  html += `</tbody></table><button class="btn-primary" onclick="window.resetAllCredits()">Reset Daily Credits</button></div>`;
  document.getElementById('adminPage').innerHTML = html;
}
window.resetAllCredits = async () => {
  const users = await db.collection('users').get();
  users.forEach(async u => await u.ref.update({ creditsUsed: 0 }));
  alert('Credits reset');
};
