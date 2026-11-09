const SUPABASE_URL = 'https://ojfessfzctevkwzcfzse.supabase.co';
const SUPABASE_KEY = 'sb_publishable_FK_I6gvQDJChrgU5bNHrQ_acBR83um';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const KEY = 'fasttechPremiumData';

// ডিফল্ট বেস ডেটা (যাতে কোনো অবস্থাতেই ডিজাইন বা প্যাকেজ মিসিং না হয়)
const base = {
  name: 'FastTech Network',
  heroText: 'বাসা, অফিস ও ব্যবসার জন্য স্থিতিশীল ব্রডব্যান্ড ইন্টারনেট এবং প্রয়োজনের সময় পাশে থাকা সাপোর্ট।',
  phone: '+880 1622492004',
  whatsapp: '8801622492004',
  address: 'আপনার অফিসের ঠিকানা যুক্ত করুন',
  hours: 'প্রতিদিন — সময় নিশ্চিত করুন',
  logo: '',
  heroImage: '',
  coverageLocations: [
    {id: 1, name: 'Amirabad'},
    {id: 2, name: 'Lohagara'}
  ],
  packages: [
    {id:1, title:'Padma Pluse', speed:'25 Mbps', price:'৳525', desc:'দৈনন্দিন ব্রাউজিং ও অনলাইন ব্যবহারের জন্য', image:'assets/package-1.svg'},
    {id:2, title:'Meghna', speed:'35 Mbps', price:'৳600', desc:'পরিবারের একাধিক ডিভাইসের জন্য', image:'assets/package-2.svg'},
    {id:3, title:'Jamuna', speed:'40 Mbps', price:'৳700', desc:'স্ট্রিমিং ও অনলাইন কাজের জন্য', image:'assets/package-3.svg'},
    {id:4, title:'Turbo', speed:'50 Mbps', price:'৳800', desc:'দ্রুতগতির স্মুথ ইন্টারনেট অভিজ্ঞতা', image:'assets/package-4.svg'},
    {id:5, title:'Flash', speed:'100 Mbps', price:'৳1000', desc:'হাই-স্পিড ও ভারী ব্যবহারের জন্য', image:'assets/package-5.svg'}
  ],
  gallery: []
};

const clone = x => JSON.parse(JSON.stringify(x));

// ওয়েবসাইট লোড করার সময় Supabase থেকে ডেটা আনা
async function loadSiteData() {
    let siteData = clone(base);
    try {
        const { data, error } = await supabase
            .from('site_data')
            .select('content')
            .eq('id', 1)
            .single();
        
        if (!error && data && data.content) {
            // যদি Supabase-এ প্যাকেজ বা কভারেজ খালি থাকে, তবে বেস ডেটা থেকে নিয়ে নেবে
            siteData = { 
                ...clone(base), 
                ...data.content,
                packages: (data.content.packages && data.content.packages.length > 0) ? data.content.packages : clone(base.packages),
                coverageLocations: (data.content.coverageLocations && data.content.coverageLocations.length > 0) ? data.content.coverageLocations : clone(base.coverageLocations)
            };
        } else {
            const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
            siteData = { ...clone(base), ...saved };
        }
    } catch (e) {
        const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
        siteData = { ...clone(base), ...saved };
    }
    
    renderWebsite(siteData);
}

// ওয়েবসাইটে ডেটা সুন্দরভাবে রেন্ডার করার ফাংশন
function renderWebsite(d) {
    // ব্র্যান্ড নাম ও টেক্সট
    const nameEls = document.querySelectorAll('#siteName, .brand-name');
    nameEls.forEach(el => { if(el) el.textContent = d.name; });

    const heroTextEl = document.getElementById('heroText');
    if (heroTextEl) heroTextEl.textContent = d.heroText;

    // লোগো
    const logoEls = document.querySelectorAll('#siteLogo, .site-logo');
    logoEls.forEach(el => {
        if(el) el.src = d.logo || 'assets/fasttech-logo.jpg';
    });

    // প্যাকেজ লিস্ট রেন্ডার (আগের মতো চমৎকার ডিজাইনসহ)
    const packageContainer = document.getElementById('publicPackageList');
    if (packageContainer) {
        packageContainer.innerHTML = d.packages.map(p => `
            <div class="package-card">
                <div class="package-price-badge">${p.price}<span>/month</span></div>
                <h3>${p.title}</h3>
                <div class="package-speed">⚡ ${p.speed}</div>
                <p>${p.desc || 'আপনার প্রয়োজন অনুযায়ী ইন্টারনেট প্যাকেজ।'}</p>
                <div class="package-features">✓ YouTube ✓ Facebook ✓ BDIX</div>
            </div>
        `).join('');
    }

    // কভারেজ লোকেশন রেন্ডার
    const coverageContainer = document.getElementById('publicCoverageList');
    if (coverageContainer) {
        coverageContainer.innerHTML = (d.coverageLocations || []).map(loc => `
            <div class="coverage-badge" style="background: rgba(255,255,255,0.05); padding: 10px 20px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); margin: 5px; display: inline-block;">📍 ${loc.name}</div>
        `).join('') || '<p>শীঘ্রই আরও এলাকায় কভারেজ আসছে।</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadSiteData();
});
