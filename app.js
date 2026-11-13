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
        })
    })
};

const KEY = 'fasttechPremiumData';
const defaults = {
  name: 'FastTech Network',
  heroText: 'হাই-স্পিড ফাইবার ইন্টারনেট ও নিরবচ্ছিন্ন ২৪/৭ ডিজিটাল সংযোগ',
  phone: '+880 1622492004',
  whatsapp: '8801622492004',
  address: 'আমিরাবাদ, লোহাগাড়া, চট্টগ্রাম',
  hours: 'প্রতিদিন ২৪ ঘণ্টা খোলা',
  packages: [
    {id:1,title:'Padma Pluse',speed:'25 Mbps',price:'৳525',desc:'দৈনন্দিন ব্রাউজিং ও অনলাইন ব্যবহারের জন্য'},
    {id:2,title:'Meghna',speed:'35 Mbps',price:'৳600',desc:'পরিবারের একাধিক ডিভাইসের জন্য'},
    {id:3,title:'Jamuna',speed:'40 Mbps',price:'৳700',desc:'স্ট্রিমিং ও অনলাইন কাজের জন্য'},
    {id:4,title:'Turbo',speed:'50 Mbps',price:'৳800',desc:'দ্রুতগতির স্মুথ ইন্টারনেট অভিজ্ঞতা'},
    {id:5,title:'Flash',speed:'100 Mbps',price:'৳1000',desc:'হাই-স্পিড ও ভারী ব্যবহারের জন্য'}
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

    document.querySelectorAll('.brand img').forEach(img => {
        if(d.logo) img.src = d.logo;
    });
    
    document.querySelectorAll('.brand span').forEach(el => {
        el.innerHTML = esc(d.name || 'FastTech Network');
    });
    
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
        const locations = (d.coverageLocations && d.coverageLocations.length > 0) ? d.coverageLocations : defaults.coverageLocations;
        coverageEl.innerHTML = '<ul>' + locations.map(x =>
