const SUPABASE_URL = 'https://ojfessfzctevkwzcfzse.supabase.co';
const SUPABASE_KEY = 'sb_publishable_FK_I6gvQDJChrgU5bNHrQ_acBR83um'; // আপনার সঠিক Publishable Key এখানে বসানো হয়েছে
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

function initLoginForm() {
    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) {
        loginForm.onsubmit = function(e) {
            e.preventDefault();
            const passInput = document.getElementById('adminPassword');
            if (passInput && passInput.value === ADMIN_PASS) {
                sessionStorage.setItem('fasttech_auth', 'true');
                checkAdminAuth();
            } else {
                alert('ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিন।');
            }
        };
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
        if (!pf) return;
        pf.reset();
        pf.elements.id.value = '';
        document.getElementById('packageFormTitle').textContent = 'নতুন প্যাকেজ যোগ করুন';
        document.getElementById('packageSave').textContent = 'প্যাকেজ যোগ করুন';
        document.getElementById('cancelEdit').hidden = true;
    }
    if (pf) pf.onsubmit = async e => {
        e.preventDefault();
        try {
            const d = get(), f = e.target, id = f.elements.id.value, old = d.packages.find(p => p.id == id), image = f.image.files[0] ? await fileData(f.image.files[0]) : (old?.image || '');
            const p = { id: id ? Number(id) : Date.now(), title: f.title.value.trim(), speed: f.speed.value.trim(), price: f.price.value.trim(), desc: f.desc.value.trim(), image };
            if (id) d.packages = d.packages.map(x => x.id == id ? p : x);
            else d.packages.push(p);
            await put(d);
            clearPackage();
            draw();
        } catch (err) { alert(err.message); }
    };
    const cancelEditBtn = document.getElementById('cancelEdit');
    if (cancelEditBtn) cancelEditBtn.onclick = clearPackage;

    const cf = document.getElementById('coverageForm');
    function clearCoverage() {
        if (!cf) return;
        cf.reset();
        cf.elements.id.value = '';
        document.getElementById('coverageSave').textContent = 'Add Location';
        document.getElementById('coverageCancel').hidden = true;
    }
    if (cf) cf.onsubmit = async e => {
        e.preventDefault();
        const d = get(), id = cf.elements.id.value, name = cf.elements.name.value.trim();
        if (!name) return;
        d.coverageLocations = d.coverageLocations || [];
        if (id) {
            d.coverageLocations = d.coverageLocations.map(x => String(x.id) === String(id) ? {...x, name} : x);
        } else {
            if (d.coverageLocations.some(x => x.name.toLowerCase() === name.toLowerCase())) {
                alert('এই এলাকার নাম আগে থেকেই আছে।');
                return;
            }
            d.coverageLocations.push({ id: Date.now(), name });
        }
        await put(d);
        clearCoverage();
        draw();
    };
    const coverageCancelBtn = document.getElementById('coverageCancel');
    if (coverageCancelBtn) coverageCancelBtn.onclick = clearCoverage;

    const gf = document.getElementById('galleryForm');
    if (gf) gf.onsubmit = async e => {
        e.preventDefault();
        try {
            const f = e.target, d = get(), files = [...f.images.files];
            for (const file of files) d.gallery.push({ id: Date.now() + Math.random(), title: files.length > 1 ? `${f.title.value} (${file.name})` : f.title.value, image: await fileData(file) });
            await put(d);
            f.reset();
            draw();
        } catch (err) { alert(err.message); }
    };

    document.addEventListener('click', async e => {
        const t = e.target, d = get();
        if (t.dataset.editCoverage) {
            const loc = (d.coverageLocations || []).find(x => String(x.id) === String(t.dataset.editCoverage));
            if (loc && cf) {
                cf.elements.id.value = loc.id;
                cf.elements.name.value = loc.name;
                document.getElementById('coverageSave').textContent = 'পরিবর্তন সংরক্ষণ';
                document.getElementById('coverageCancel').hidden = false;
                cf.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
        if (t.dataset.delCoverage) {
            if (confirm('এই Coverage Location মুছে ফেলবেন?')) {
                d.coverageLocations = (d.coverageLocations || []).filter(x => String(x.id) !== String(t.dataset.delCoverage));
                await put(d);
                draw();
            }
        }
        if (t.dataset.editPackage) {
            const p = d.packages.find(x => x.id == t.dataset.editPackage);
            if (!p || !pf) return;
            pf.elements.id.value = p.id;
            pf.elements.title.value = p.title;
            pf.elements.speed.value = p.speed;
            pf.elements.price.value = p.price;
            pf.elements.desc.value = p.desc;
            document.getElementById('packageFormTitle').textContent = 'প্যাকেজ সম্পাদনা করুন';
            document.getElementById('packageSave').textContent = 'পরিবর্তন সংরক্ষণ';
            document.getElementById('cancelEdit').hidden = false;
            pf.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        if (t.dataset.delPackage) {
            if (confirm('এই প্যাকেজটি মুছে ফেলবেন?')) {
                d.packages = d.packages.filter(p => p.id != t.dataset.delPackage);
                await put(d);
                draw();
            }
        }
        if (t.dataset.delGallery) {
            d.gallery = d.gallery.filter(g => g.id != t.dataset.delGallery);
            await put(d);
            draw();
        }
    });

    const backupBtn = document.getElementById('backup');
    if (backupBtn) backupBtn.onclick = () => {
        const b = new Blob([JSON.stringify(get(), null, 2)], { type: 'application/json' }), a = document.createElement('a');
        a.href = URL.createObjectURL(b);
        a.download = 'fasttech-network-backup.json';
        a.click();
        URL.revokeObjectURL(a.href);
    };

    const restoreInput = document.getElementById('restore');
    if (restoreInput) restoreInput.onchange = async e => {
        try {
            const d = JSON.parse(await e.target.files[0].text());
            if (!Array.isArray(d.packages) || !Array.isArray(d.gallery)) throw Error();
            await put({...clone(base), ...d});
            draw();
            alert('Backup restore হয়েছে।');
        } catch { alert('সঠিক FastTech JSON backup নির্বাচন করুন।'); }
        e.target.value = '';
    };

    const resetBtn = document.getElementById('reset');
    if (resetBtn) resetBtn.onclick = async () => {
        if (confirm('সব ডেটা রিসেট করবেন?')) {
            await put(clone(base));
            if (typeof clearPackage === 'function') clearPackage();
            draw();
        }
    };
	}
document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
    setupActions();

    // সরাসরি ফর্ম সাবমিট হ্যান্ডলার যুক্ত করা হলো
    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const passInput = document.getElementById('adminPassword');
            if (passInput && passInput.value === ADMIN_PASS) {
                sessionStorage.setItem('fasttech_auth', 'true');
                checkAdminAuth(); // প্যানেল ওপেন করবে এবং ডেটা লোড করবে
            } else {
                alert('ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিন।');
            }
        });
    }
});
