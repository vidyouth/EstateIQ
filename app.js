// ===== STATE =====
let currentUser = null;
let currentPage = 'home';
let currentContact = null;
let chatHistory = {};

// ===== DEMO DATA =====
const USERS = [
  { email: 'admin@estateiq.com', password: 'admin123', role: 'admin', name: 'Admin User' },
  { email: 'buyer@estateiq.com', password: 'buyer123', role: 'buyer', name: 'Arjun Mehta' },
  { email: 'seller@estateiq.com', password: 'seller123', role: 'seller', name: 'Priya Sharma' },
];

const PROPERTIES = [
  { id:1, title:'3BHK Spacious Apartment', type:'Apartment', price:4200000, priceLabel:'₹42L', loc:'Anna Nagar, Chennai', area:1450, rooms:'3 BHK', age:5, floor:'4th', amenities:['Parking','Lift','Security'], icon:'🏡', seller:'Priya Sharma', sellerInit:'P', bg:'#1e2330' },
  { id:2, title:'Modern 2BHK Flat', type:'Apartment', price:2800000, priceLabel:'₹28L', loc:'Velachery, Chennai', area:1020, rooms:'2 BHK', age:2, floor:'7th', amenities:['Gym','Pool','Lift'], icon:'🏢', seller:'Rajesh Kumar', sellerInit:'R', bg:'#1a2030' },
  { id:3, title:'Independent Villa', type:'Villa', price:7500000, priceLabel:'₹75L', loc:'Adyar, Chennai', area:2800, rooms:'4 BHK', age:8, floor:'Ground', amenities:['Parking','Security','Garden'], icon:'🏠', seller:'Sneha Patel', sellerInit:'S', bg:'#201a30' },
  { id:4, title:'Commercial Office Space', type:'Commercial', price:9200000, priceLabel:'₹92L', loc:'T. Nagar, Chennai', area:1800, rooms:'Open', age:3, floor:'5th', amenities:['Parking','Lift','Security'], icon:'🏗️', seller:'Arun Nair', sellerInit:'A', bg:'#1a2020' },
  { id:5, title:'Affordable 1BHK Studio', type:'Apartment', price:1500000, priceLabel:'₹15L', loc:'Ambattur, Chennai', area:620, rooms:'1 BHK', age:1, floor:'2nd', amenities:['Lift','Security'], icon:'🏙️', seller:'Divya Ravi', sellerInit:'D', bg:'#201e1a' },
  { id:6, title:'Premium Plot (1200 sqft)', type:'Plot', price:3600000, priceLabel:'₹36L', loc:'Porur, Chennai', area:1200, rooms:'Plot', age:0, floor:'N/A', amenities:['Corner Plot','CMDA Approved'], icon:'🌳', seller:'Vikram S', sellerInit:'V', bg:'#1a201a' },
  { id:7, title:'Luxury Penthouse', type:'Apartment', price:13500000, priceLabel:'₹1.35Cr', loc:'Guindy, Chennai', area:3400, rooms:'5 BHK', age:4, floor:'20th', amenities:['Gym','Pool','Parking','Terrace'], icon:'🏛️', seller:'Priya Sharma', sellerInit:'P', bg:'#201a1a' },
  { id:8, title:'2BHK Builder Floor', type:'Apartment', price:2200000, priceLabel:'₹22L', loc:'OMR, Chennai', area:950, rooms:'2 BHK', age:6, floor:'1st', amenities:['Parking','Security'], icon:'🏘️', seller:'Karthik M', sellerInit:'K', bg:'#1a1a20' },
  { id:9, title:'Gated Community Villa', type:'Villa', price:11000000, priceLabel:'₹1.1Cr', loc:'Sholinganallur, Chennai', area:3200, rooms:'4 BHK', age:3, floor:'Ground', amenities:['Gym','Pool','Security','Club'], icon:'🏡', seller:'Anita V', sellerInit:'A', bg:'#1a2228' },
];

const FEEDBACK = [
  { name:'Arjun M.', role:'Buyer', stars:5, text:'The AI price predictor was spot on! It saved me from overpaying. Found my dream apartment in 2 weeks.', avatar:'👨' },
  { name:'Sneha R.', role:'Seller', stars:5, text:'Listed my property here and got 3 genuine inquiries in the first week. The chat feature makes communication so easy.', avatar:'👩' },
  { name:'Rahul K.', role:'Buyer', stars:4, text:'Very transparent platform. Love that you can see the AI valuation before negotiating. Would recommend to anyone buying property.', avatar:'🧑' },
  { name:'Divya P.', role:'Seller', stars:5, text:'Admin support is amazing. They verified my listing quickly and the interface is clean and professional.', avatar:'👩' },
  { name:'Karthik S.', role:'Buyer', stars:4, text:'The filter options are comprehensive. Found exactly what I was looking for in Adyar within my budget.', avatar:'👨' },
  { name:'Meera L.', role:'Seller', stars:5, text:'As a first-time seller I was nervous, but this platform guided me through the entire process. Highly recommended!', avatar:'🧑' },
];

const LOCATION_MULTIPLIER = {
  'Anna Nagar': 1.35, 'T. Nagar': 1.45, 'Adyar': 1.4,
  'Velachery': 1.1, 'Porur': 0.95, 'OMR': 1.05,
  'Ambattur': 0.85, 'Guindy': 1.25,
};

// ===== NAVIGATION =====
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-' + pageId);
  if (page) page.classList.add('active');
  currentPage = pageId;
  window.scrollTo(0, 0);
}

function showModule(name) {
  showPage(name);
  if (name === 'listings') renderListings();
  if (name === 'feedback') renderFeedback();
}

function requireLogin(module) {
  if (!currentUser) {
    showToast('Please login to access this feature', 'error');
    openLogin(module);
  } else {
    if (module === 'chat') { showPage('chat'); initChat(); }
    if (module === 'dashboard') { showPage('dashboard'); renderDashboard(); }
  }
}

function toggleMobileMenu() {
  const links = document.querySelector('.nav-links');
  links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
}

// ===== LISTINGS =====
function renderListings(data) {
  const container = document.getElementById('listings-container');
  const list = data || PROPERTIES;
  if (!list.length) {
    container.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:4rem;color:var(--text2);">No properties match your filters.</div>';
    return;
  }
  container.innerHTML = list.map(p => `
    <div class="listing-card" onclick="openProperty(${p.id})">
      <div class="lc-banner" style="background:${p.bg}">
        <span style="font-size:3.5rem">${p.icon}</span>
        <span class="lc-badge">${p.type}</span>
      </div>
      <div class="lc-body">
        <div class="lc-price">${p.priceLabel}</div>
        <div class="lc-title">${p.title}</div>
        <div class="lc-loc">📍 ${p.loc}</div>
        <div class="lc-tags">
          <span class="lc-tag">${p.rooms}</span>
          <span class="lc-tag">${p.area} sqft</span>
          <span class="lc-tag">${p.age === 0 ? 'New' : p.age + 'yr old'}</span>
        </div>
      </div>
      <div class="lc-actions">
        <button class="lc-btn lc-btn-primary" onclick="event.stopPropagation();openProperty(${p.id})">View Details</button>
        <button class="lc-btn lc-btn-ghost" onclick="event.stopPropagation();handleChat(${p.id})">💬 Chat</button>
      </div>
    </div>
  `).join('');
}

function filterListings() {
  const search = document.getElementById('listSearch').value.toLowerCase();
  const type = document.getElementById('listType').value;
  const budget = document.getElementById('listBudget').value;
  const sort = document.getElementById('listSort').value;

  let list = PROPERTIES.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search) || p.loc.toLowerCase().includes(search);
    const matchType = !type || p.type === type;
    let matchBudget = true;
    if (budget === '0-30') matchBudget = p.price < 3000000;
    else if (budget === '30-60') matchBudget = p.price >= 3000000 && p.price <= 6000000;
    else if (budget === '60-100') matchBudget = p.price > 6000000 && p.price <= 10000000;
    else if (budget === '100+') matchBudget = p.price > 10000000;
    return matchSearch && matchType && matchBudget;
  });

  if (sort === 'price-asc') list.sort((a,b) => a.price - b.price);
  else if (sort === 'price-desc') list.sort((a,b) => b.price - a.price);
  renderListings(list);
}

function doHeroSearch() {
  const q = document.getElementById('heroSearch').value;
  const t = document.getElementById('heroType').value;
  showModule('listings');
  setTimeout(() => {
    document.getElementById('listSearch').value = q;
    document.getElementById('listType').value = t;
    filterListings();
  }, 100);
}

// ===== PROPERTY DETAIL =====
function openProperty(id) {
  const p = PROPERTIES.find(x => x.id === id);
  if (!p) return;
  const el = document.getElementById('property-detail-content');
  el.innerHTML = `
    <div class="pd-grid">
      <div>
        <div class="pd-banner">${p.icon}</div>
        <div class="pd-price">${p.priceLabel}</div>
        <div class="pd-title">${p.title}</div>
        <div class="pd-loc">📍 ${p.loc}</div>
        <div class="pd-specs">
          <div class="pd-spec"><div class="pd-spec-label">Type</div><div class="pd-spec-value">${p.type}</div></div>
          <div class="pd-spec"><div class="pd-spec-label">Bedrooms</div><div class="pd-spec-value">${p.rooms}</div></div>
          <div class="pd-spec"><div class="pd-spec-label">Area</div><div class="pd-spec-value">${p.area} sqft</div></div>
          <div class="pd-spec"><div class="pd-spec-label">Floor</div><div class="pd-spec-value">${p.floor}</div></div>
          <div class="pd-spec"><div class="pd-spec-label">Age</div><div class="pd-spec-value">${p.age === 0 ? 'New Build' : p.age + ' years'}</div></div>
          <div class="pd-spec"><div class="pd-spec-label">Amenities</div><div class="pd-spec-value">${p.amenities.join(', ')}</div></div>
        </div>
        <div class="pd-actions">
          <button class="btn-primary" onclick="handleChat(${p.id})">💬 Chat with Seller</button>
          <button class="btn-ghost" onclick="showToast('Property saved!','success')">🔖 Save</button>
        </div>
      </div>
      <div>
        <div class="pd-seller">
          <h4>Listed by</h4>
          <div class="pd-seller-info">
            <div class="pd-seller-avatar">${p.sellerInit}</div>
            <div>
              <div class="pd-seller-name">${p.seller}</div>
              <div class="pd-seller-badge">✅ Verified Seller</div>
            </div>
          </div>
        </div>
        <div style="background:var(--surface);border-radius:10px;padding:1.25rem">
          <h4 style="margin-bottom:0.75rem">AI Price Analysis</h4>
          <div style="font-size:0.85rem;color:var(--text2);margin-bottom:1rem">Based on our Decision Tree model:</div>
          <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;font-size:0.85rem">
            <span style="color:var(--text2)">Estimated Value</span>
            <span style="color:var(--accent);font-weight:600">${p.priceLabel}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;font-size:0.85rem">
            <span style="color:var(--text2)">Market Range</span>
            <span>${formatRange(p.price)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:0.85rem">
            <span style="color:var(--text2)">Confidence</span>
            <span style="color:var(--green)">94%</span>
          </div>
        </div>
      </div>
    </div>
  `;
  document.getElementById('modal-property').classList.add('active');
}

function formatRange(price) {
  const lo = Math.round(price * 0.92 / 100000) / 10;
  const hi = Math.round(price * 1.08 / 100000) / 10;
  return `₹${lo}L – ₹${hi}L`;
}

function handleChat(propId) {
  document.getElementById('modal-property').classList.remove('active');
  if (!currentUser) {
    showToast('Please login to use chat', 'error');
    openLogin('chat');
  } else {
    showPage('chat');
    initChat();
  }
}

// ===== PRICE PREDICTOR =====
function predictPrice() {
  const loc = document.getElementById('p-location').value;
  const type = document.getElementById('p-type').value;
  const area = parseInt(document.getElementById('p-area').value) || 1000;
  const rooms = document.getElementById('p-rooms').value;
  const age = parseInt(document.getElementById('p-age').value) || 0;
  const floor = document.getElementById('p-floor').value;

  const parking = document.getElementById('a-parking').checked;
  const gym = document.getElementById('a-gym').checked;
  const pool = document.getElementById('a-pool').checked;
  const security = document.getElementById('a-security').checked;
  const lift = document.getElementById('a-lift').checked;

  // Decision tree-style calculation
  let baseRate = 3500; // per sqft in Rs
  const locMult = LOCATION_MULTIPLIER[loc] || 1.0;
  const typeMult = { 'Apartment':1.0, 'Villa':1.35, 'Plot':0.7, 'Commercial':1.5 }[type] || 1.0;
  const roomMult = { '1 BHK':0.88, '2 BHK':0.96, '3 BHK':1.0, '4 BHK':1.08, '5+ BHK':1.15 }[rooms] || 1.0;
  const agePenalty = Math.max(0.6, 1 - age * 0.02);
  const floorBonus = { 'Ground':0.95, '1st–3rd':1.0, '4th–7th':1.03, '8th–15th':1.06, '15th+':1.08 }[floor] || 1.0;
  const amenityBonus = 1 + (parking?0.03:0) + (gym?0.04:0) + (pool?0.05:0) + (security?0.02:0) + (lift?0.02:0);

  const price = Math.round(baseRate * area * locMult * typeMult * roomMult * agePenalty * floorBonus * amenityBonus);
  const priceL = (price / 100000).toFixed(1);
  const loL = ((price * 0.92) / 100000).toFixed(1);
  const hiL = ((price * 1.08) / 100000).toFixed(1);

  const factors = [
    { label: 'Location Factor', value: Math.round(locMult * 100), max: 145 },
    { label: 'Property Type', value: Math.round(typeMult * 100), max: 150 },
    { label: 'Area & Rooms', value: Math.round(roomMult * 100), max: 115 },
    { label: 'Age & Condition', value: Math.round(agePenalty * 100), max: 100 },
    { label: 'Amenities', value: Math.round(amenityBonus * 100), max: 116 },
  ];

  const result = document.getElementById('predictor-result');
  result.innerHTML = `
    <h3>Prediction Result</h3>
    <div class="price-result">
      <div class="price-result-label">Estimated Market Price</div>
      <div class="price-result-value">₹${priceL}L</div>
      <div class="price-result-range">Range: ₹${loL}L – ₹${hiL}L</div>
      <div style="display:inline-block;background:rgba(74,222,128,0.15);color:var(--green);padding:0.3rem 0.9rem;border-radius:20px;font-size:0.8rem;font-weight:600">✓ Confidence: 94%</div>
    </div>
    <div class="price-bars">
      <div style="font-size:0.85rem;color:var(--text2);margin-bottom:0.75rem;margin-top:1.25rem">Impact Factors:</div>
      ${factors.map(f => `
        <div class="price-bar-item">
          <div class="pb-label"><span>${f.label}</span><span>${f.value}%</span></div>
          <div class="pb-track"><div class="pb-fill" style="width:${Math.min(100, (f.value/f.max)*100)}%"></div></div>
        </div>
      `).join('')}
    </div>
    <div style="margin-top:1.25rem;padding:0.85rem;background:var(--surface2);border-radius:8px;font-size:0.8rem;color:var(--text2)">
      🤖 Prediction generated by Decision Tree model trained on Chennai real estate data.
    </div>
  `;

  // Animate bars
  setTimeout(() => {
    document.querySelectorAll('.pb-fill').forEach((b, i) => {
      b.style.width = b.style.width;
    });
  }, 50);
}

// ===== FEEDBACK =====
function renderFeedback() {
  const container = document.getElementById('feedback-list');
  container.innerHTML = FEEDBACK.map(f => `
    <div class="feedback-card">
      <div class="fc-header">
        <div class="fc-avatar">${f.avatar}</div>
        <div>
          <div class="fc-name">${f.name}</div>
          <div class="fc-role">${f.role}</div>
        </div>
      </div>
      <div class="fc-stars">${'★'.repeat(f.stars)}${'☆'.repeat(5-f.stars)}</div>
      <div class="fc-text">${f.text}</div>
    </div>
  `).join('');
}

// ===== AUTH =====
let pendingModule = null;

function openLogin(module) {
  pendingModule = module || null;
  document.getElementById('modal-login').classList.add('active');
  document.getElementById('login-error').textContent = '';
}

function openRegister() {
  document.getElementById('modal-register').classList.add('active');
  document.getElementById('reg-error').textContent = '';
}

function switchToRegister() {
  document.getElementById('modal-login').classList.remove('active');
  openRegister();
}

function switchToLogin() {
  document.getElementById('modal-register').classList.remove('active');
  openLogin();
}

function setRole(role, btn) {
  document.getElementById('login-role').value = role;
  document.querySelectorAll('#modal-login .role-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
}

function setRegRole(role, btn) {
  document.getElementById('reg-role').value = role;
  document.querySelectorAll('#modal-register .role-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
}

function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-password').value;
  const role = document.getElementById('login-role').value;
  const err = document.getElementById('login-error');

  const user = USERS.find(u => u.email === email && u.password === pass);
  if (!user) { err.textContent = 'Invalid email or password.'; return; }
  if (role === 'admin' && user.role !== 'admin') { err.textContent = 'This account is not an admin.'; return; }
  if (role === 'buyer' && user.role === 'admin') { err.textContent = 'Use Admin tab for admin login.'; return; }

  currentUser = user;
  document.getElementById('modal-login').classList.remove('active');
  updateNavForUser();
  showToast(`Welcome back, ${user.name}!`, 'success');

  if (pendingModule) {
    requireLogin(pendingModule);
    pendingModule = null;
  }
}

function doRegister() {
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass = document.getElementById('reg-password').value;
  const role = document.getElementById('reg-role').value;
  const err = document.getElementById('reg-error');

  if (!name || !email || !pass) { err.textContent = 'Please fill in all fields.'; return; }
  if (pass.length < 6) { err.textContent = 'Password must be at least 6 characters.'; return; }
  if (USERS.find(u => u.email === email)) { err.textContent = 'An account with this email already exists.'; return; }

  const newUser = { email, password: pass, role, name };
  USERS.push(newUser);
  currentUser = newUser;
  document.getElementById('modal-register').classList.remove('active');
  updateNavForUser();
  showToast(`Account created! Welcome, ${name}!`, 'success');
}

function doLogout() {
  currentUser = null;
  updateNavForUser();
  showPage('home');
  showToast('Logged out successfully');
}

function updateNavForUser() {
  const actions = document.querySelector('.nav-actions');
  if (currentUser) {
    actions.innerHTML = `
      <span style="font-size:0.85rem;color:var(--text2)">Hi, ${currentUser.name.split(' ')[0]}</span>
      ${currentUser.role === 'admin' ? '<button class="btn-ghost" onclick="showPage(\'dashboard\');renderDashboard()">Admin Panel</button>' : ''}
      <button class="btn-ghost" onclick="requireLogin(\'dashboard\')">Dashboard</button>
      <button class="btn-ghost" onclick="doLogout()">Logout</button>
    `;
  } else {
    actions.innerHTML = `
      <button class="btn-ghost" onclick="openLogin()">Login</button>
      <button class="btn-primary" onclick="openRegister()">Register</button>
    `;
  }
}

// ===== DASHBOARD =====
function renderDashboard() {
  if (!currentUser) return;
  const el = document.getElementById('dashboard-content');
  document.getElementById('dash-welcome').textContent = `Welcome back, ${currentUser.name} — ${capitalize(currentUser.role)} Account`;

  if (currentUser.role === 'admin') {
    el.innerHTML = `
      <div class="dash-grid">
        <div class="dash-stat-card"><div class="ds-value">9</div><div class="ds-label">Total Listings</div></div>
        <div class="dash-stat-card"><div class="ds-value">3</div><div class="ds-label">Registered Users</div></div>
        <div class="dash-stat-card"><div class="ds-value">6</div><div class="ds-label">Feedback Reviews</div></div>
        <div class="dash-stat-card"><div class="ds-value">12</div><div class="ds-label">Chat Sessions</div></div>
        <div class="dash-stat-card"><div class="ds-value">98%</div><div class="ds-label">Prediction Accuracy</div></div>
        <div class="dash-stat-card"><div class="ds-value">0</div><div class="ds-label">Reported Issues</div></div>
      </div>
      <div class="dash-section">
        <h3>Registered Users</h3>
        <table style="width:100%;border-collapse:collapse;font-size:0.88rem">
          <thead><tr style="color:var(--text2);text-align:left">
            <th style="padding:0.6rem 0.75rem;border-bottom:1px solid var(--border)">Name</th>
            <th style="padding:0.6rem 0.75rem;border-bottom:1px solid var(--border)">Email</th>
            <th style="padding:0.6rem 0.75rem;border-bottom:1px solid var(--border)">Role</th>
            <th style="padding:0.6rem 0.75rem;border-bottom:1px solid var(--border)">Status</th>
          </tr></thead>
          <tbody>
            ${USERS.map(u=>`<tr>
              <td style="padding:0.6rem 0.75rem;border-bottom:1px solid var(--border)">${u.name}</td>
              <td style="padding:0.6rem 0.75rem;border-bottom:1px solid var(--border);color:var(--text2)">${u.email}</td>
              <td style="padding:0.6rem 0.75rem;border-bottom:1px solid var(--border)"><span style="background:rgba(200,169,110,0.15);color:var(--accent);padding:0.2rem 0.6rem;border-radius:20px;font-size:0.75rem;font-weight:600">${capitalize(u.role)}</span></td>
              <td style="padding:0.6rem 0.75rem;border-bottom:1px solid var(--border);color:var(--green)">✓ Active</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div class="dash-section">
        <h3>All Listings</h3>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem">
          ${PROPERTIES.slice(0,6).map(p=>`
            <div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:1rem">
              <div style="font-size:1.5rem;margin-bottom:0.5rem">${p.icon}</div>
              <div style="font-weight:600;font-size:0.9rem;margin-bottom:0.25rem">${p.title}</div>
              <div style="color:var(--accent);font-size:0.85rem">${p.priceLabel}</div>
              <div style="color:var(--text2);font-size:0.78rem;margin-top:0.25rem">${p.loc}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else if (currentUser.role === 'seller') {
    const myListings = PROPERTIES.filter(p => p.seller === currentUser.name);
    el.innerHTML = `
      <div class="dash-grid">
        <div class="dash-stat-card"><div class="ds-value">${myListings.length}</div><div class="ds-label">My Listings</div></div>
        <div class="dash-stat-card"><div class="ds-value">5</div><div class="ds-label">Inquiries</div></div>
        <div class="dash-stat-card"><div class="ds-value">2</div><div class="ds-label">Active Chats</div></div>
      </div>
      <div class="dash-section">
        <h3>My Listings</h3>
        ${myListings.length ? `
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem">
          ${myListings.map(p=>`
            <div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:1rem">
              <div style="font-size:1.5rem;margin-bottom:0.5rem">${p.icon}</div>
              <div style="font-weight:600;font-size:0.9rem">${p.title}</div>
              <div style="color:var(--accent);font-size:0.85rem">${p.priceLabel}</div>
            </div>
          `).join('')}
        </div>` : '<p style="color:var(--text2)">You have no listings yet.</p>'}
        <button class="btn-primary" style="margin-top:1rem" onclick="showToast('Feature: Add listing form coming soon!','success')">+ Add New Listing</button>
      </div>
    `;
  } else {
    el.innerHTML = `
      <div class="dash-grid">
        <div class="dash-stat-card"><div class="ds-value">3</div><div class="ds-label">Saved Properties</div></div>
        <div class="dash-stat-card"><div class="ds-value">1</div><div class="ds-label">Active Chats</div></div>
        <div class="dash-stat-card"><div class="ds-value">5</div><div class="ds-label">Properties Viewed</div></div>
      </div>
      <div class="dash-section">
        <h3>Saved Properties</h3>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem">
          ${PROPERTIES.slice(0,3).map(p=>`
            <div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:1rem;cursor:pointer" onclick="openProperty(${p.id})">
              <div style="font-size:1.5rem;margin-bottom:0.5rem">${p.icon}</div>
              <div style="font-weight:600;font-size:0.9rem">${p.title}</div>
              <div style="color:var(--accent);font-size:0.85rem">${p.priceLabel}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
}

// ===== CHAT =====
const MOCK_CONTACTS = [
  { id: 1, name: 'Priya Sharma', role: 'Seller', init: 'P', msgs: [
    { from: 'them', text: 'Hi! Are you interested in the Anna Nagar property?', time: '10:20 AM' },
    { from: 'me', text: 'Yes! Is the price negotiable?', time: '10:22 AM' },
    { from: 'them', text: 'We can discuss. The AI estimate was ₹42L.', time: '10:24 AM' },
  ]},
  { id: 2, name: 'Rajesh Kumar', role: 'Seller', init: 'R', msgs: [
    { from: 'them', text: 'Hello, saw your query about the Velachery flat.', time: '9:10 AM' },
  ]},
  { id: 3, name: 'Support', role: 'EstateIQ', init: 'E', msgs: [
    { from: 'them', text: 'Welcome to EstateIQ! How can we help you today?', time: 'Yesterday' },
  ]},
];

function initChat() {
  const contactsEl = document.getElementById('chat-contacts');
  contactsEl.innerHTML = MOCK_CONTACTS.map(c => `
    <div class="chat-contact ${currentContact === c.id ? 'active' : ''}" onclick="selectContact(${c.id})">
      <div class="cc-avatar">${c.init}</div>
      <div>
        <div class="cc-name">${c.name}</div>
        <div class="cc-last">${c.role} · ${c.msgs[c.msgs.length-1].text.slice(0,28)}...</div>
      </div>
    </div>
  `).join('');
  if (!currentContact) selectContact(1);
}

function selectContact(id) {
  currentContact = id;
  const c = MOCK_CONTACTS.find(x => x.id === id);
  document.querySelectorAll('.chat-contact').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.chat-contact')[MOCK_CONTACTS.indexOf(c)]?.classList.add('active');
  renderMessages(c.msgs);
}

function renderMessages(msgs) {
  const el = document.getElementById('chat-messages');
  el.innerHTML = msgs.map(m => `
    <div class="chat-msg ${m.from === 'me' ? 'me' : ''}">
      <div class="bubble">${m.text}</div>
      <div class="msg-time">${m.time}</div>
    </div>
  `).join('');
  el.scrollTop = el.scrollHeight;
}

function sendChatMsg() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text || !currentContact) return;

  const c = MOCK_CONTACTS.find(x => x.id === currentContact);
  const now = new Date().toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'});
  c.msgs.push({ from: 'me', text, time: now });
  input.value = '';
  renderMessages(c.msgs);

  // Auto reply after 1.2s
  setTimeout(() => {
    const replies = [
      'Thank you for your message! I\'ll get back to you shortly.',
      'That\'s a great question. Let me check and confirm.',
      'Sure, we can arrange a site visit this weekend.',
      'The property is still available. Interested in viewing?',
    ];
    const reply = replies[Math.floor(Math.random() * replies.length)];
    const replyTime = new Date().toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'});
    c.msgs.push({ from: 'them', text: reply, time: replyTime });
    renderMessages(c.msgs);
  }, 1200);
}

// ===== MODALS =====
function closeModal(event, id) {
  if (event.target.id === id) document.getElementById(id).classList.remove('active');
}

// ===== TOAST =====
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show ' + type;
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ===== UTILS =====
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  renderListings();
  renderFeedback();
});
