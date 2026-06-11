// ============================
// 百川巴西货盘 - 交互脚本
// ============================

// ---- Scroll-triggered header ----
const header = document.getElementById('header');
let lastScrollY = 0;

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    lastScrollY = scrollY;

    // Floating CTA visibility
    const floatCta = document.getElementById('floatCta');
    if (floatCta) {
        if (scrollY > 400) {
            floatCta.classList.add('visible');
        } else {
            floatCta.classList.remove('visible');
        }
    }
}, { passive: true });

// ---- Mobile menu toggle ----
const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');

if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
        nav.classList.toggle('open');
        menuToggle.classList.toggle('active');

        // Animate hamburger
        const spans = menuToggle.querySelectorAll('span');
        if (menuToggle.classList.contains('active')) {
            spans[0].style.transform = 'translateY(7px) rotate(45deg)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
        } else {
            spans[0].style.transform = '';
            spans[1].style.opacity = '';
            spans[2].style.transform = '';
        }
    });

    // Close on nav link click
    nav.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('open');
            menuToggle.classList.remove('active');
            const spans = menuToggle.querySelectorAll('span');
            spans[0].style.transform = '';
            spans[1].style.opacity = '';
            spans[2].style.transform = '';
        });
    });
}

// ---- Category tabs filter ----
const catTabs = document.querySelectorAll('.cat-tab');
const productCards = document.querySelectorAll('.product-card');

catTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const cat = tab.dataset.cat;

        // Update active tab
        catTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Filter cards
        productCards.forEach(card => {
            if (cat === 'all' || card.dataset.cat === cat) {
                card.classList.remove('hidden');
                card.style.animation = 'fadeIn 0.3s ease forwards';
            } else {
                card.classList.add('hidden');
            }
        });
    });
});

// ---- FAQ accordion ----
function toggleFaq(btn) {
    const answer = btn.nextElementSibling;
    const isOpen = answer.classList.contains('open');

    // Close all
    document.querySelectorAll('.faq-question').forEach(q => {
        q.classList.remove('open');
        q.nextElementSibling.classList.remove('open');
    });

    // Toggle current
    if (!isOpen) {
        btn.classList.add('open');
        answer.classList.add('open');
    }
}

// ---- Smooth scroll for anchor links ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
            e.preventDefault();
            const headerH = header ? header.offsetHeight : 64;
            const targetPos = target.getBoundingClientRect().top + window.scrollY - headerH - 16;
            window.scrollTo({ top: targetPos, behavior: 'smooth' });
        }
    });
});

// ---- Active nav link on scroll ----
const sections = document.querySelectorAll('section[id], div[id]');
const navLinks = document.querySelectorAll('.nav-link');

const observerOptions = {
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
};

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
            });
        }
    });
}, observerOptions);

sections.forEach(s => sectionObserver.observe(s));

// ---- Card entrance animation ----
const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, i * 60);
            cardObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.product-card, .adv-card, .platform-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease, box-shadow 0.22s ease, border-color 0.22s ease';
    cardObserver.observe(card);
});

// ---- CSS animation ----
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);

// ---- Product card click → detail page ----
document.querySelectorAll('.product-card[data-id]').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
        // Only navigate if click is not on the "查看详情" button
        if (e.target.closest('.btn-card')) return;
        const pid = card.dataset.id;
        if (pid) {
            window.location.href = `detail.html?p=${pid}`;
        }
    });
});

// ---- Replace placeholder with real images when available ----
if (typeof products !== 'undefined') {
    document.querySelectorAll('.product-card[data-id]').forEach(card => {
        const pid = parseInt(card.dataset.id);
        const product = products.find(p => p.id === pid);
        if (product && product.image) {
            const imgWrap = card.querySelector('.product-img-wrap');
            if (imgWrap) {
                imgWrap.innerHTML = '<img src="' + product.image + '" alt="' + product.name + '" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">';
            }
        }
    });
}
