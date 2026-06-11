// ============================
// 百川巴西货盘 - 详情页脚本
// ============================

document.addEventListener('DOMContentLoaded', () => {
    // Parse product ID from URL
    const params = new URLSearchParams(window.location.search);
    const productId = parseInt(params.get('p'));
    const product = getProductById(productId);

    if (!product) {
        renderNotFound();
        return;
    }

    // Update page title
    document.title = product.name + ' - 百川巴西货盘';

    // Breadcrumb
    document.getElementById('breadCategory').textContent = product.categoryName;
    document.getElementById('breadName').textContent = product.name;

    // Badge
    const badgeEl = document.getElementById('detailBadge');
    if (product.badge === 'hot') {
        badgeEl.innerHTML = '<span class="badge-tag hot">热销</span>';
    } else if (product.badge === 'new') {
        badgeEl.innerHTML = '<span class="badge-tag new">新品</span>';
    } else {
        badgeEl.style.display = 'none';
    }

    // Platform tag
    const isMl = product.platform === 'ml';
    document.getElementById('detailPlatformTag').innerHTML =
        '<span class="platform-tag ' + (isMl ? 'ml' : 'sh') + '">' + product.platformName + '</span>';

    // Name & Description
    document.getElementById('detailName').textContent = product.name;
    document.getElementById('detailShortDesc').textContent = product.shortDesc;
    document.getElementById('detailFullDesc').textContent = product.fullDesc;

    // Price
    document.getElementById('detailPrice').textContent = product.price.toFixed(2);
    document.getElementById('detailMoq').textContent = 'MOQ: ' + product.moq + '件';

    // Image - show uploaded image if available, otherwise use gradient
    var detailImageEl = document.getElementById('detailImage');
    if (product.image) {
        detailImageEl.style.background = 'none';
        detailImageEl.innerHTML = '<img src="' + product.image + '" alt="' + product.name + '" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">';
    } else {
        detailImageEl.style.background = product.gradient;
    }

    // Specs table
    const specsTable = document.getElementById('detailSpecsTable');
    product.specs.forEach(function(spec) {
        var row = document.createElement('tr');
        row.innerHTML = '<td>' + spec.label + '</td><td>' + spec.value + '</td>';
        specsTable.appendChild(row);
    });

    // Features
    const featuresGrid = document.getElementById('detailFeaturesGrid');
    product.features.forEach(function(feature) {
        var item = document.createElement('div');
        item.className = 'detail-feature-item';
        item.innerHTML = '<div class="detail-feature-dot"></div><span class="detail-feature-text">' + feature + '</span>';
        featuresGrid.appendChild(item);
    });

    // CTA button text
    var ctaBtn = document.getElementById('detailCtaBtn');
    ctaBtn.innerHTML = '<svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/><path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"/></svg> 立即对接「' + product.name + '」货源';

    // Related products (same category)
    var related = products.filter(function(p) {
        return p.category === product.category && p.id !== product.id;
    });
    var relatedGrid = document.getElementById('detailRelatedGrid');

    if (related.length === 0) {
        var others = products.filter(function(p) {
            return p.id !== product.id;
        }).slice(0, 4);
        others.forEach(function(p) {
            renderRelatedCard(p, relatedGrid);
        });
    } else {
        related.forEach(function(p) {
            renderRelatedCard(p, relatedGrid);
        });
    }

    // Mobile menu
    setupMobileMenu();
});

function renderNotFound() {
    var main = document.querySelector('.detail-main');
    main.innerHTML = '<div class="detail-not-found">' +
        '<svg viewBox="0 0 80 80" fill="none" width="80" height="80">' +
        '<circle cx="40" cy="40" r="32" stroke="#ccc" stroke-width="2"/>' +
        '<path d="M28 28l24 24M52 28l-24 24" stroke="#ccc" stroke-width="2" stroke-linecap="round"/>' +
        '</svg>' +
        '<h2>商品未找到</h2>' +
        '<p>抱歉，您访问的商品不存在或已下架。</p>' +
        '<a href="index.html#categories" class="btn btn-detail-primary">返回货盘列表</a>' +
        '</div>';
}

function renderRelatedCard(product, container) {
    var card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-cat', product.category);
    card.style.opacity = '1';
    card.style.transform = 'translateY(0)';

    var badgeHTML = '';
    if (product.badge === 'hot') {
        badgeHTML = '<div class="product-badge hot">热销</div>';
    } else if (product.badge === 'new') {
        badgeHTML = '<div class="product-badge new">新品</div>';
    }

    var isMl = product.platform === 'ml';
    var imageHTML = '';
    if (product.image) {
        imageHTML = '<div class="product-img-wrap"><img src="' + product.image + '" alt="' + product.name + '" style="width:100%;height:100%;object-fit:cover;border-radius:8px;"></div>';
    } else {
        imageHTML = '<div class="product-img-wrap">' +
            '<div class="product-img-placeholder" style="background:' + product.gradient + ';">' +
                '<svg viewBox="0 0 64 64" fill="none" width="40" height="40">' +
                    '<rect x="16" y="16" width="32" height="32" rx="8" fill="rgba(255,255,255,0.25)"/>' +
                    '<path d="M28 32h8M32 28v8" stroke="rgba(255,255,255,0.5)" stroke-width="2"/>' +
                '</svg>' +
            '</div>' +
        '</div>';
    }

    card.innerHTML = '' +
        badgeHTML +
        imageHTML +
        '<div class="product-info">' +
            '<div class="product-platform">' +
                '<span class="platform-tag ' + (isMl ? 'ml' : 'sh') + '">' + product.platformName + '</span>' +
            '</div>' +
            '<h3 class="product-name">' + product.name + '</h3>' +
            '<p class="product-desc">' + product.shortDesc + '</p>' +
            '<div class="product-meta">' +
                '<div class="product-price-wrap">' +
                    '<span class="product-price">￥' + product.price.toFixed(2) + '</span>' +
                    '<span class="product-price-label">/件</span>' +
                '</div>' +
                '<span class="product-moq">MOQ: ' + product.moq + '件</span>' +
            '</div>' +
            '<a href="detail.html?p=' + product.id + '" class="btn btn-card">查看详情</a>' +
        '</div>';

    card.style.cursor = 'pointer';
    card.addEventListener('click', function(e) {
        if (e.target.tagName === 'A' || e.target.closest('a')) return;
        window.location.href = 'detail.html?p=' + product.id;
    });

    container.appendChild(card);
}

function setupMobileMenu() {
    var menuToggle = document.getElementById('menuToggle');
    var nav = document.getElementById('nav');

    if (!menuToggle || !nav) return;

    menuToggle.addEventListener('click', function() {
        nav.classList.toggle('open');
        menuToggle.classList.toggle('active');
        var spans = menuToggle.querySelectorAll('span');
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

    nav.querySelectorAll('.nav-link').forEach(function(link) {
        link.addEventListener('click', function() {
            nav.classList.remove('open');
            menuToggle.classList.remove('active');
            var spans = menuToggle.querySelectorAll('span');
            spans[0].style.transform = '';
            spans[1].style.opacity = '';
            spans[2].style.transform = '';
        });
    });
}
