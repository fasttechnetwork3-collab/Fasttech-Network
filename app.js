// মূল ওয়েবসাইটে কভারেজ লোকেশন রেন্ডার করার ফাংশন
function renderCoverageLocations() {
    const coverageContainer = document.getElementById('coverage-list'); // আপনার index.html-এর কন্টেইনার আইডি
    if (!coverageContainer) return;

    try {
        const savedData = JSON.parse(localStorage.getItem('fasttechPremiumData') || '{}');
        const locations = savedData.coverageLocations || [];

        if (locations.length === 0) {
            coverageContainer.innerHTML = '<p class="muted">এখনো কোনো কভারেজ লোকেশন যোগ করা হয়নি।</p>';
            return;
        }

        coverageContainer.innerHTML = locations.map(loc => `
            <div class="coverage-badge">
                <span>📍 ${esc(loc.name)}</span>
            </div>
        `).join('');
    } catch (err) {
        console.error('Coverage load error:', err);
    }
}

// পেজ লোড হওয়ার সাথে সাথে কভারেজ দেখানোর জন্য কল করুন
document.addEventListener('DOMContentLoaded', renderCoverageLocations);
