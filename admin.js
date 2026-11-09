const ADMIN_PASSWORD = "775481"; 

// পেজ লোড হলে চেক করবে আগে লগইন করা আছে কিনা
document.addEventListener("DOMContentLoaded", () => {
    if (sessionStorage.getItem("isAdminAuthenticated") === "true") {
        showAdminPanel();
    }
    loadAdminDataFromSupabase();
});

// পাসওয়ার্ড যাচাই করার ফংশন (HTML এর onsubmit="checkAdminPassword(event)" এর জন্য)
function checkAdminPassword(e) {
    if (e) e.preventDefault();
    const inputField = document.getElementById("adminPassInput");
    if (!inputField) return;
    
    const enteredPass = inputField.value.trim();
    if (enteredPass === ADMIN_PASSWORD) {
        sessionStorage.setItem("isAdminAuthenticated", "true");
        showAdminPanel();
    } else {
        const errEl = document.getElementById("loginError");
        if (errEl) errEl.style.display = "block";
    }
}

// অ্যাডমিন প্যানেল দেখানোর ফংশন
function showAdminPanel() {
    const loginSec = document.getElementById("loginSection");
    const adminCont = document.getElementById("adminContent");
    if (loginSec) loginSec.style.display = "none";
    if (adminCont) adminCont.style.display = "block";
}

// লগআউট ফংশন
function logoutAdmin() {
    sessionStorage.removeItem("isAdminAuthenticated");
    location.reload();
}

// -------------------------------------------------------------
// SUPABASE কনফিগারেশন এবং ক্লায়েন্ট
// -------------------------------------------------------------
const SUPABASE_URL = 'https://ojfessfzctevkwzcfzse.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qZmVzc2Z6Y3Rldmt3emNmenNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQxMDU1MDgsImV4cCI6MjEwOTY4MTUwOH0.LAThwMaMDNL3JOUvYkQctCtT9u2FnsaM2vtPWUWtky8';

const dbClient = {
    from: (table) => ({
        select: (columns) => ({
            eq: (col, val) => ({
                single: async () => {
                    try {
                        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${columns}&${col}=eq.${val}`, {
                            method: 'GET',
                            headers: {
                                'apikey': SUPABASE_KEY,
                                'Content-Type': 'application/json'
                            }
                        });
                        if (!res.ok) return { error: await res.json() };
                        const data = await res.json();
                        return { data: Array.isArray(data) ? data[0] : data, error: null };
                    } catch (err) {
                        return { error: err };
                    }
                }
            })
        }),
        upsert: async (payload) => {
            try {
                const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
                    method: 'POST',
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Content-Type': 'application/json',
                        'Prefer': 'resolution=merge-duplicates'
                    },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) {
                    const errText = await res.text();
                    console.error('Save error details:', errText);
                    return { error: { message: errText } };
                }
                return { error: null };
            } catch (err) {
                return { error: err };
            }
        }
    })
};

const KEY = 'fasttechPremiumData';
const base = {
  name: 'FastTech Network',
  heroText: 'বাসা, অফিস ও ব্যবসার জন্য স্থিতিশীল ব্রডব্যান্ড ইন্টারনেট এবং প্রয়োজনের সময় পাশে থাকা সাপোর্ট।',
  phone: '+880 1622492004',
  whatsapp: '8801622492004',
  address: 'আমিরাবাদ, লোভাগড়া, চট্টগ্রাম',
  hours: 'প্রতিদিন ২৪ ঘণ্টা খোলা',
  logo: '',
  heroImage: '',
  coverageLocations: [
    {id: 1, name: 'Amirabad'},
    {id: 2, name: 'Lohagara'}
  ],
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
        if (!dbClient) return;
        const { data, error } = await dbClient
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
        if (dbClient) {
            const { error } = await dbClient.from('site_data').upsert({ id: 1, content: d });
            if (error) console.error('Supabase save error:', error.message);
        }
    } catch (err) {
        console.error('Supabase sync error:', err);
    }
}

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function fileData(file) {
    return new Promise((res, rej) => {
        if (!file) return res('');
        if (file.size > 2000000) return rej(Error('প্রতি ছবির সাইজ ২ MB-এর কম রাখুন।'));
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.onerror = rej;
        r.readAsDataURL(file);
    });
}

function draw() {
    const d = get();
    
    const f = document.getElementById('settingsForm');
    if (f) {
        ['name','heroText','phone','whatsapp','address','hours'].forEach(k => {
            if (f.elements[k] && document.activeElement !== f.elements[k]) {
                f.elements[k].value = d[k] || '';
            }
        });
    }

    const adminLogoEl = document.getElementById('adminLogo');
    if (adminLogoEl && d.logo) adminLogoEl.src = d.logo;
    
    const previews = document.getElementById('brandPreviews');
    if (previews) {
        previews.innerHTML = `${d.logo ? `<img class="preview-img" src="${d.logo}" alt="Logo">` : ''}`;
    }

    const pList = document.getElementById('packageList');
    if (pList) {
        pList.innerHTML = (d.packages && d.packages.length > 0) 
            ? d.packages.map(p => `
                <div class="admin-item" style="display:flex; justify-content:space-between; align-items:center; background:#050b14; border:1px solid rgba(38,92,148,0.3); padding:15px; border-radius:14px; margin-top:12px;">
                    <div>
                        <b>${esc(p.title)}</b><br>
                        <small style="color:var(--cyan);">${esc(p.speed)} · ${esc(p.price)}</small>
                    </div>
                    <div style="display:flex; gap:8px;">
                        <button type="button" class="btn btn-small" data-edit-package="${p.id}">Edit</button>
                        <button type="button" class="danger" data-del-package="${p.id}">মুছুন</button>
                    </div>
                </div>`).join('') 
            : '<p style="color:var(--muted); margin-top:10px;">এখনো কোনো প্যাকেজ নেই।</p>';
    }

    const cList = document.getElementById('coverageList');
    if (cList) {
        cList.innerHTML = (d.coverageLocations && d.coverageLocations.length > 0) 
            ? d.coverageLocations.map(loc => `
                <div class="admin-item" style="display:flex; justify-content:space-between; align-items:center; background:#050b14; border:1px solid rgba(38,92,148,0.3); padding:15px; border-radius:14px; margin-top:12px;">
                    <div><b>${esc(loc.name)}</b></div>
                    <div style="display:flex; gap:8px;">
                        <button type="button" class="btn btn-small" data-edit-coverage="${loc.id}">Edit</button>
                        <button type="button" class="danger" data-del-coverage="${loc.id}">Delete</button>
                    </div>
                </div>`).join('') 
            : '<p style="color:var(--muted); margin-top:10px;">কোনো কভারেজ এলাকা নেই।</p>';
    }

    const gList = document.getElementById('galleryList');
    if (gList) {
        gList.innerHTML = (d.gallery && d.gallery.length > 0) 
            ? d.gallery.map(g => `
                <div class="admin-item" style="display:flex; justify-content:space-between; align-items:center; background:#050b14; border:1px solid rgba(38,92,148,0.3); padding:15px; border-radius:14px; margin-top:12px;">
                    <b>${esc(g.title)}</b>
                    <button type="button" class="danger" data-del-gallery="${g.id}">মুছুন</button>
                </div>`).join('') 
            : '<p style="color:var(--muted); margin-top:10px;">গ্যালারিতে কোনো ছবি নেই।</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const sf = document.getElementById('settingsForm');
    if (sf) {
        sf.onsubmit = async e => {
            e.preventDefault();
            try {
                const d = get();
                ['name','heroText','phone','whatsapp','address','hours'].forEach(k => {
                    if (sf.elements[k]) d[k] = sf.elements[k].value.trim();
                });
                if (sf.logo.files[0]) d.logo = await fileData(sf.logo.files[0]);
                if (sf.heroImage.files[0]) d.heroImage = await fileData(sf.heroImage.files[0]);
                
                await put(d);
                sf.logo.value = ''; 
                sf.heroImage.value = '';
                draw();
                alert('তথ্য সফলভাবে সংরক্ষিত ও ক্লাউডে সিঙ্ক হয়েছে!');
            } catch (err) { alert(err.message); }
        };
    }

    const pf = document.getElementById('packageForm');
    function clearPackage() {
        if (!pf) return;
        pf.reset();
        pf.elements.id.value = '';
        const pTitle = document.getElementById('packageFormTitle');
        if(pTitle) pTitle.textContent = 'নতুন প্যাকেজ যোগ করুন';
        const pSave = document.getElementById('packageSave');
        if(pSave) pSave.textContent = 'প্যাকেজ যোগ করুন';
        const cancelBtn = document.getElementById('cancelEdit');
        if (cancelBtn) cancelBtn.hidden = true;
    }

    if (pf) {
        pf.onsubmit = async e => {
            e.preventDefault();
            try {
                const d = get();
                const id = pf.elements.id.value;
                const old = d.packages.find(p => p.id == id);
                const image = pf.image.files[0] ? await fileData(pf.image.files[0]) : (old?.image || '');
                
                const pObj = { 
                    id: id ? Number(id) : Date.now(), 
                    title: pf.title.value.trim(), 
                    speed: pf.speed.value.trim(), 
                    price: pf.price.value.trim(), 
                    desc: pf.desc.value.trim(), 
                    image 
                };

                if (id) {
                    d.packages = d.packages.map(x => x.id == id ? pObj : x);
                } else {
                    d.packages.push(pObj);
                }

                await put(d);
                clearPackage();
                draw();
                alert('প্যাকেজ সফলভাবে সংরক্ষিত হয়েছে!');
            } catch (err) { alert(err.message); }
        };
    }

    const cancelEditBtn = document.getElementById('cancelEdit');
    if (cancelEditBtn) cancelEditBtn.onclick = clearPackage;

    const cf = document.getElementById('coverageForm');
    function clearCoverage() {
        if (!cf) return;
        cf.reset();
        cf.elements.id.value = '';
        const cSave = document.getElementById('coverageSave');
        if(cSave) cSave.textContent = 'Add Location';
        const cancelBtn = document.getElementById('coverageCancel');
        if (cancelBtn) cancelBtn.hidden = true;
    }

    if (cf) {
        cf.onsubmit = async e => {
            e.preventDefault();
            const d = get();
            const id = cf.elements.id.value;
            const name = cf.elements.name.value.trim();
            if (!name) return;

            d.coverageLocations = d.coverageLocations || [];
            if (id) {
                d.coverageLocations = d.coverageLocations.map(x => String(x.id) === String(id) ? {...x, name} : x);
            } else {
                d.coverageLocations.push({ id: Date.now(), name });
            }

            await put(d);
            clearCoverage();
            draw();
            alert('কভারেজ এলাকা সফলভাবে সংরক্ষিত হয়েছে!');
        };
    }

    const coverageCancel = document.getElementById('coverageCancel');
    if (coverageCancel) coverageCancel.onclick = clearCoverage;

    const gf = document.getElementById('galleryForm');
    if (gf) {
        gf.onsubmit = async e => {
            e.preventDefault();
            try {
                const d = get();
                const files = [...gf.images.files];
                d.gallery = d.gallery || [];
                for (const file of files) {
                    d.gallery.push({ id: Date.now() + Math.random(), title: gf.title.value, image: await fileData(file) });
                }
                await put(d);
                gf.reset();
                draw();
                alert('গ্যালারিতে ছবি সফলভাবে যুক্ত হয়েছে!');
            } catch (err) { alert(err.message); }
        };
    }

    // -------------------------------------------------------------
    // নতুন কাস্টমার ডাটাবেজে যুক্ত করার ফর্ম সাবমিট লজিক
    // -------------------------------------------------------------
    const addCustomerForm = document.getElementById('addCustomerForm');
    if (addCustomerForm) {
        addCustomerForm.onsubmit = async function(e) {
            e.preventDefault();

            const newCustomer = {
                id: document.getElementById('newCustId').value.trim(),
                phone: document.getElementById('newCustPhone').value.trim(),
                name: document.getElementById('newCustName').value.trim(),
                last_name: document.getElementById('newCustLastName').value.trim().toLowerCase(),
                package: document.getElementById('newCustPackage').value.trim(),
                bill: document.getElementById('newCustBill').value.trim(),
                address: document.getElementById('newCustAddress').value.trim(),
                status: "Active"
            };

            try {
                const response = await fetch(`${SUPABASE_URL}/rest/v1/customers`, {
                    method: 'POST',
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify(newCustomer)
                });

                if (response.ok) {
                    alert('সফলভাবে নতুন কাস্টমার ডাটাবেজে যুক্ত করা হয়েছে!');
                    addCustomerForm.reset();
                } else {
                    const errData = await response.json();
                    alert('সংরক্ষণ করতে সমস্যা হয়েছে: এই আইডি বা মোবাইল নম্বর ইতিমধ্যে থাকতে পারে।');
                }
            } catch (err) {
                console.error(err);
                alert('সার্ভারে সংযোগ স্থাপন করা সম্ভব হয়নি।');
            }
        };
    }

    const backupBtn = document.getElementById('backup');
    if (backupBtn) {
        backupBtn.onclick = () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(get(), null, 2));
            const dlAnchor = document.createElement('a');
            dlAnchor.setAttribute("href", dataStr);
            dlAnchor.setAttribute("download", "fasttech_backup_" + Date.now() + ".json");
            document.body.appendChild(dlAnchor);
            dlAnchor.click();
            dlAnchor.remove();
        };
    }

    const restoreInput = document.getElementById('restore');
    if (restoreInput) {
        restoreInput.onchange = e => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async event => {
                try {
                    const parsed = JSON.parse(event.target.result);
                    await put(parsed);
                    draw();
                    alert('ব্যাকআপ সফলভাবে রিস্টোর করা হয়েছে!');
                } catch (err) {
                    alert('রিস্টোর করতে সমস্যা হয়েছে: সঠিক JSON ফাইল দিন।');
                }
            };
            reader.readAsText(file);
        };
    }

    const resetBtn = document.getElementById('reset');
    if (resetBtn) {
        resetBtn.onclick = async () => {
            if (confirm('আপনি কি নিশ্চিতভাবে সব ডেটা রিসেট করে ডিফল্টে ফিরিয়ে নিতে চান?')) {
                await put(clone(base));
                draw();
                alert('ডেমো ডেটা রিসেট করা হয়েছে!');
            }
        };
    }

    document.addEventListener('click', async e => {
        const t = e.target;
        const d = get();

        if (t.dataset.editPackage) {
            const p = d.packages.find(x => x.id == t.dataset.editPackage);
            if (!p || !pf) return;
            pf.elements.id.value = p.id;
            pf.elements.title.value = p.title;
            pf.elements.speed.value = p.speed;
            pf.elements.price.value = p.price;
            pf.elements.desc.value = p.desc || '';
            const pTitle = document.getElementById('packageFormTitle');
            if(pTitle) pTitle.textContent = 'প্যাকেজ সম্পাদনা করুন';
            const pSave = document.getElementById('packageSave');
            if(pSave) pSave.textContent = 'পরিবর্তন সংরক্ষণ';
            const cancelBtn = document.getElementById('cancelEdit');
            if (cancelBtn) cancelBtn.hidden = false;
            window.scrollTo({ top: pf.offsetTop - 50, behavior: 'smooth' });
        }

        if (t.dataset.delPackage) {
            if (confirm('প্যাকেজটি মুছে ফেলতে চান?')) {
                d.packages = d.packages.packages.filter(p => p.id != t.dataset.delPackage); // নিরাপদ ফিল্টারিং
                await put(d);
                draw();
            }
        }

        if (t.dataset.editCoverage) {
            const loc = (d.coverageLocations || []).find(x => String(x.id) === String(t.dataset.editCoverage));
            if (!loc || !cf) return;
            cf.elements.id.value = loc.id;
            cf.elements.name.value = loc.name;
            const cSave = document.getElementById('coverageSave');
            if(cSave) cSave.textContent = 'Update Location';
            const cancelBtn = document.getElementById('coverageCancel');
            if (cancelBtn) cancelBtn.hidden = false;
            window.scrollTo({ top: cf.offsetTop - 50, behavior: 'smooth' });
        }

        if (t.dataset.delCoverage) {
            if (confirm('এলাকাটি মুছে ফেলতে চান?')) {
                d.coverageLocations = (d.coverageLocations || []).filter(x => String(x.id) !== String(t.dataset.delCoverage));
                await put(d);
                draw();
            }
        }

        if (t.dataset.delGallery) {
            if (confirm('ছবিটি মুছে ফেলতে চান?')) {
                d.gallery = d.gallery.filter(g => g.id != t.dataset.delGallery);
                await put(d);
                draw();
            }
        }
    });
});
