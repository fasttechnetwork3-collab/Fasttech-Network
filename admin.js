const SUPABASE_URL = 'https://ojfessfzctevkwzcfzse.supabase.co';
const SUPABASE_KEY = 'sb_publishable_FK_I6gvQDJChrgU5bNHrQ_acBR83um';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const KEY = 'fasttechPremiumData';
const ADMIN_PASS = '775481';

const base = {
  name: 'FastTech Network',
  heroText: 'বাসা, অফিস ও ব্যবসার জন্য স্থিতিশীল ব্রডব্যান্ড ইন্টারনেট এবং প্রয়োজনের সময় পাশে থাকা সাপোর্ট।',
  phone: '+880 1XXXXXXXXX',
  whatsapp: '8801XXXXXXXXX',
  address: 'আপনার অফিসের ঠিকানা যুক্ত করুন',
  hours: 'প্রতিদিন — সময় নিশ্চিত করুন',
  logo: '',
  heroImage: '',
  coverageLocations: [],
  packages: [
    {id:1,title:'Padma Pluse',speed:'25 Mbps',price:'৳525',desc:'দৈনন্দিন ব্রাউজিং ও অনলাইন ব্যবহারের জন্য',image:'assets/package-1.svg'},
    {id:2,title:'Meghna',speed:'35 Mbps',price:'৳600',desc:'পরিবারের একাধিক ডিভাইসের জন্য',image:'assets/package-2.svg'},
    {id:3,title:'Jamuna',speed:'40 Mbps',price:'৳700',desc:'স্ট্রিমিং ও অনলাইন কাজের জন্য',image:'assets/package-3.svg'},
    {id:4,title:'Turbo',speed:'50 Mbps',price:'৳800',desc:'দ্রুতগতির স্মুথ ইন্টারনেট অভিজ্ঞতা',image:'assets/package-4.svg'},
    {id:5,title:'Flash',speed:'100 Mbps',price:'৳1000',desc:'হাই-স্পিড ও ভারী ব্যবহারের জন্য',image:'assets/package-5.svg'}
  ],
  gallery: []
};

const clone = x => JSON.parse(JSON.stringify(x));
let adminDataState = clone(base);

async function loadAdminDataFromSupabase() {
    try {
        const { data, error } = await supabase
            .from('site_data')
            .select('content')
            .eq('id', 1)
            .single();
        
        if (error || !data || !data.content) {
            const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
            adminDataState = {...clone(base), ...saved};
        } else {
            adminDataState = {...clone(base), ...data.content};
        }
    } catch (e) {
        const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
        adminDataState = {...clone(base), ...saved};
    }
    draw();
}

function get() { return adminDataState; }

async function put(d) {
    adminDataState = d;
    localStorage.setItem(KEY, JSON.stringify(d));
    try {
        await supabase.from('site_data').upsert({ id: 1, content: d });
    } catch (err) {
        console.error('Supabase error:', err);
    }
}

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function fileData(file) {
    return new Promise((res, rej) => {
        if (!file) return res('');
        if (file.size > 1500000) return rej(Error('প্রতি ছবির সাইজ ১.৫ MB-এর কম রাখুন।'));
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.onerror = rej;
        r.readAsDataURL(file);
    });
}

function draw() {
    const d = get(), f = document.getElementById('settingsForm');
    if (f) {
        ['name','heroText','phone','whatsapp','address','hours'].forEach(k => {
            if (f.elements[k] && document.activeElement !== f.elements[k]) f.elements[k].value = d[k] || '';
        });
    }
    const logoEl = document.getElementById('adminLogo');
    if (logoEl) logoEl.src = d.logo || 'assets/fasttech-logo.jpg';
    
    const previews = document.getElementById('brandPreviews');
    if (previews) previews.innerHTML = `${d.logo ? `<img class="preview-img" src="${d.logo}" alt="Logo preview">` : ''}${d.heroImage ? `<img class="preview-img" src="${d.heroImage}" alt="Banner preview">` : ''}`;

    const pList = document.getElementById('packageList');
    if (pList) pList.innerHTML = d.packages.map(p => `<div class="admin-item">${p.image ? `<img class="preview-img" src="${p.image}" alt="">` : ''}<div class="admin-item-info"><b>${esc(p.title)}</b><br><small>${esc(p.speed)} · ${esc(p.price)}</small></div><div class="admin-actions"><button type="button" data-edit-package="${p.id}">Edit</button><button type="button" data-del-package="${p.id}">মুছুন</button></div></div>`).join('') || '<p class="muted">এখনো কোনো প্যাকেজ নেই।</p>';

    const cList = document.getElementById('coverageList');
    if (cList) cList.innerHTML = (d.coverageLocations || []).map(loc => `<div class="admin-item"><div class="admin-item-info"><b>${esc(loc.name)}</b></div><div class="admin-actions"><button type="button" data-edit-coverage="${loc.id}">Edit</button><button type="button" data-del-coverage="${loc.id}">Delete</button></div></div>`).join('') || '<p class="muted">এখনো কোনো Coverage Location যোগ করা হয়নি।</p>';

    const gList = document.getElementById('galleryList');
    if (gList) gList.innerHTML = d.gallery.map(g => `<div class="admin-item">${g.image ? `<img class="preview-img" src="${g.image}" alt="">` : ''}<b>${esc(g.title)}</b><button type="button" data-del-gallery="${g.id}">মুছুন</button></div>`).join('') || '<p class="muted">গ্যালারিতে এখনো ছবি নেই।</p>';
}

function checkAdminAuth() {
    const isAuth = sessionStorage.getItem('fasttech_auth') === 'true';
    const loginPanel = document.getElementById('adminLoginPanel');
    const mainContent = document.getElementById('adminMainContent');

    if (isAuth) {
        if (loginPanel) loginPanel.style.display = 'none';
        if (mainContent) {
            mainContent.hidden = false;
            mainContent.style.display = 'grid';
            mainContent.style.setProperty('display', 'grid', 'important');
        }
        loadAdminDataFromSupabase();
    } else {
        if (loginPanel) loginPanel.style.display = 'block';
        if (mainContent) {
            mainContent.hidden = true;
            mainContent.style.display = 'none';
            mainContent.style.setProperty('display', 'none', 'important');
        }
    }
}

function setupActions() {
    const sf = document.getElementById('settingsForm');
    if (sf) sf.onsubmit = async e => {
        e.preventDefault();
        try {
            const d = get(), f = e.target;
            ['name','heroText','phone','whatsapp','address','hours'].forEach(k => d[k] = f.elements[k].value.trim());
            if (f.logo.files[0]) d.logo = await fileData(f.logo.files[0]);
            if (f.heroImage.files[0]) d.heroImage = await fileData(f.heroImage.files[0]);
            await put(d);
            f.logo.value = ''; f.heroImage.value = '';
            draw();
            alert('তথ্য সফলভাবে সংরক্ষিত হয়েছে।');
        } catch (err) { alert(err.message); }
    };

    const pf = document.getElementById('packageForm');
    function clearPackage() {
        if (!
