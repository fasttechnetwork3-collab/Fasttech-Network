const SUPABASE_URL = 'https://ojfessfzctevkwzcfzse.supabase.co/rest/v1/';
const SUPABASE_KEY = 'sb_publishable_FK_I6gvQDJChrgU5bNHrQ_acBR83um';

// সঠিক REST API ফেচ ক্লায়েন্ট (নতুন sb_publishable কী-এর জন্য প্রস্তুতকৃত)
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
const defaults = {
  name: 'FastTech Network',
  heroText: 'বাসা, অফিস ও ব্যবসার জন্য স্থিতিশীল ব্রডব্যান্ড ইন্টারনেট এবং প্রয়োজনের সময় পাশে থাকা সাপোর্ট।',
  phone: '+880 1622492004',
  whatsapp: '8801622492004',
  address: 'আমিরাবাদ, লোভাগড়া, চট্টগ্রাম',
  hours: 'প্রতিদিন ২৪ ঘণ্টা খোলা',
  packages: [
    {id:1,title:'Padma Pluse',speed:'25 Mbps',price:'৳525',desc:'দৈনন্দিন ব্রাউজিং ও অনলাইন ব্যবহারের জন্য',image:'assets/package-1.svg'},
    {id:2,title:'Meghna',speed:'35 Mbps',price:'৳600',desc:'পরিবারের একাধিক ডিভাইসের জন্য',image:'assets/package-2.svg'},
    {id:3,title:'Jamuna',speed:'40 Mbps',price:'৳700',desc:'স্ট্রিমিং ও অনলাইন কাজের জন্য',image:'assets/package-3.svg'},
    {id:4,title:'Turbo',speed:'50 Mbps',price:'৳800',desc:'দ্রুতগতির স্মুথ ইন্টারনেট অভিজ্ঞতা',image:'assets/package-4.svg'},
    {id:5,title:'Flash',speed:'100 Mbps',price:'৳1000',desc:'হাই-স্পিড ও ভারী ব্যবহারের জন্য',image:'assets/package-5.svg'}
  ],
  gallery: [],
  coverageLocations: [
    {id: 1, name: 'Amirabad'},
    {id: 2, name: 'Lohagara'}
  ]
};

const clone = x => JSON.parse(JSON.stringify(x));

async function loadPublicData() {
    let siteData = clone(defaults);
    try {
        if (dbClient) {
            const { data, error } = await dbClient
                .from('site_data')
                .select('content')
                .eq('id', 1)
                .single();
            
            if (!error && data && data.content) {
                siteData = { 
                    ...clone(defaults), 
                    ...data.content,
                    name: data.content.name || defaults.name,
                    packages: (data.content.packages && data.content.packages.length > 0) ? data.content.packages : clone(defaults.packages),
                    coverageLocations: (data.content.coverageLocations && data.content.coverageLocations.length > 0) ? data.content.coverageLocations : clone(defaults.coverageLocations)
                };
                render(siteData);
                return;
            }
        }
        const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
        siteData = { ...clone(defaults), ...saved };
    } catch (e) {
        const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
        siteData = { ...clone(defaults), ...saved };
    }
    render(siteData);
}

function getData(){
    try {
        const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
        return {...defaults, ...saved};
    } catch(e){return {...defaults}};
}

function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

function render(d){
    const heroText = document.getElementById('heroText');
    if(heroText) heroText.textContent = d.heroText;

    document.querySelectorAll('.brand img').forEach(img=>{if(d.logo)img.src=d.logo});
    document.querySelectorAll('.brand span').forEach(el=>{el.innerHTML=esc(d.name||'FastTech Network')+' <small>NETWORK</small>'});
    
    const topPhone = document.getElementById('topPhone');
    if(topPhone) {
        topPhone.textContent = d.phone;
        topPhone.href = 'tel:' + d.phone.replace(/[^+\d]/g,'');
    }

    const contactPhone = document.getElementById('contactPhone');
    if(contactPhone) contactPhone.textContent = d.phone;

    const contactAddress = document.getElementById('contactAddress');
    if(contactAddress) contactAddress.textContent = d.address;

    const contactHours = document.getElementById('contactHours');
    if(contactHours) contactHours.textContent = d.hours;
    
    const coverageEl = document.getElementById('coverageLocations');
    if(coverageEl){
        const locations = d.coverageLocations || [];
        coverageEl.innerHTML = locations.length ? '<ul>'+locations.map(x=>`<li>📍 ${esc(x.name)}</li>`).join('')+'</ul>' : '<p class="coverage-empty">বর্তমানে কভারেজ এলাকার তালিকা আপডেট করা হচ্ছে।</p>';
    }
    
    const packageGrid = document.getElementById('packageGrid');
    if(packageGrid) {
        packageGrid.innerHTML = d.packages.map((p,i)=>`<article class="package-card"><div class="package-body"><div class="package-price-circle"><strong>${esc(p.price)}</strong><small>/month</small></div><h3>${esc(p.title)}</h3><div class="package-speed-strip">⚡ <strong>${esc(String(p.speed).replace(/\s*Mbps/i,''))}</strong> <small>Mbps</small></div><ul class="package-benefits"><li>✓ YouTube</li><li>✓ Facebook</li><li>✓ BDIX</li></ul><a class="btn package-cta" href="#contact">Subscribe Now <b>→</b></a></div></article>`).join('');
    }
    
    const galleryGrid = document.getElementById('galleryGrid');
    if(galleryGrid) {
        const samples = ['Network installation','Fiber optic connectivity','FastTech team'];
        galleryGrid.innerHTML = (d.gallery.length ? d.gallery : samples.map((x,i)=>({title:x,image:'',sample:i}))).map((g,i)=>`<div class="gallery-item">${g.image?`<img src="${g.image}" alt="${esc(g.title)}">`:''}<span>${esc(g.title)}</span></div>`).join('');
    }

    const yearEl = document.getElementById('year');
    if(yearEl) yearEl.textContent = new Date().getFullYear();
}

document.addEventListener('DOMContentLoaded', () => {
    loadPublicData();

    const menuBtn = document.getElementById('menuBtn');
    if(menuBtn) {
        menuBtn.addEventListener('click',()=>document.getElementById('mainNav').classList.toggle('open'));
    }

    const contactForm = document.getElementById('contactForm');
    if(contactForm) {
        contactForm.addEventListener('submit',e=>{
            e.preventDefault();
            const d = getData();
            const f = new FormData(e.target);
            const msg = `নতুন সংযোগের অনুরোধ%0Aনাম: ${encodeURIComponent(f.get('name'))}%0Aমোবাইল: ${encodeURIComponent(f.get('phone'))}%0Aএলাকা: ${encodeURIComponent(f.get('area'))}%0Aবার্তা: ${encodeURIComponent(f.get('message'))}`;
            const number = (d.whatsapp||'8801622492004').replace(/\D/g,'');
            if(number.length>=10) window.open(`https://wa.me/${number}?text=${msg}`,'_blank');
            else alert('WhatsApp নম্বর সেট করা নেই।');
        });
    }
});
