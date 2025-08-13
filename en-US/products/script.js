
document.addEventListener('DOMContentLoaded', () => {
    // --- Main containers from your template ---
    const productInfoContainer = document.querySelector('.app__product__info');
    const carouselContainer = document.querySelector('.app__product__images__wrapper');
    const tabsListContainer = document.getElementById('product-tabs');
    const tabContentContainer = document.querySelector('.g-tabs-bar__content');

    let currentProduct = null;

    const loadProductData = async () => {
        try {
            // Using a specific product ID for the demo, as requested
            const response = await fetch('test.json'); 
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const products = await response.json();
            
            // Find our specific demo product
            currentProduct = products.find(p => p.id === '010-02784-01'); 

            if (currentProduct) {
                renderProductDetails();
                renderTabs();
                // Load overview content by default
                loadTabContent('overview');
            } else {
                 throw new Error("Demo product not found in test.json");
            }
        } catch (error) {
            console.error("Failed to load product data:", error);
            if (productInfoContainer) {
                productInfoContainer.innerHTML = `<p>Error loading product data. Please run the scraper.</p>`;
            }
        }
    };

    const renderProductDetails = () => {
        if (!currentProduct || !productInfoContainer || !carouselContainer) return;

        // --- Render Carousel ---
        let carouselHtml = `
            <div id="cloudinary-product-gallery">
                <div class="main-image-container">
                    <img id="main-product-image" src="../..${currentProduct.carousel_images[0]}" alt="${currentProduct.name}">
                </div>
                <div id="thumbnail-container" class="thumbnail-list">
                    ${currentProduct.carousel_images.map((imgSrc, index) => `
                        <img src="../..${imgSrc}" alt="Thumbnail ${index + 1}" class="${index === 0 ? 'active' : ''}" data-index="${index}">
                    `).join('')}
                </div>
            </div>`;
        carouselContainer.innerHTML = carouselHtml;

        // --- Render Product Info ---
        let infoHtml = `
            <h1 class="product-name" id="product-name">${currentProduct.name}</h1>
            <div class="product-short-description" id="product-info-content">${currentProduct.info}</div>
            <div id="product-variants-container">
                ${renderVariants()}
            </div>
        `;
        productInfoContainer.innerHTML = infoHtml;
        
        // --- Add Carousel Event Listeners ---
        const mainImage = document.getElementById('main-product-image');
        const thumbnails = carouselContainer.querySelectorAll('#thumbnail-container img');
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                mainImage.src = `../..${currentProduct.carousel_images[index]}`;
                
                thumbnails.forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    };

    const renderVariants = () => {
        let html = '';
        const variantTypes = ['color', 'case_material', 'edition', 'voice_control', 'version', 'cap_size', 'models'];
        
        variantTypes.forEach(type => {
            if (currentProduct[type] && currentProduct[type].length > 0) {
                const title = type.replace(/_/g, ' ').toUpperCase();
                html += `<div class="app__color__picker__title"><h3>${title}</h3></div><ul class="app__color__picker__list">`;
                currentProduct[type].forEach((variant, index) => {
                    html += `<li class="app__color__picker__item ${index === 0 ? 'active' : ''}" data-url="${variant.url}">${variant.name}</li>`;
                });
                html += '</ul>';
            }
        });
        return html;
    };

    const renderTabs = () => {
        if (!tabsListContainer) return;
        const tabs = ['overview', 'specs', 'in_the_box', 'accessories', 'compatible_devices'];
        let tabsHtml = '';
        tabs.forEach(tab => {
            const tabName = tab.replace(/_/g, ' ');
            tabsHtml += `<li class="g-tabs-bar__list-item" data-tab="${tab}">${tabName.toUpperCase()}</li>`;
        });
        tabsListContainer.innerHTML = tabsHtml;

        tabsListContainer.querySelectorAll('.g-tabs-bar__list-item').forEach(button => {
            button.addEventListener('click', (e) => {
                const tabId = e.target.dataset.tab;
                loadTabContent(tabId);
            });
        });
    };

    const loadTabContent = async (tabId) => {
        if (!currentProduct || !tabContentContainer) return;

        // Update active tab class
        tabsListContainer.querySelectorAll('.g-tabs-bar__list-item').forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tabId);
        });
        
        const filePath = `content/${currentProduct.id}_${tabId}.html`;
        
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                tabContentContainer.innerHTML = `<p>Content for this section is not available.</p>`;
                return;
            }
            const html = await response.text();
            tabContentContainer.innerHTML = html;
        } catch (error) {
            console.error("Failed to load tab content:", error);
            tabContentContainer.innerHTML = `<p>Error loading content.</p>`;
        }
    };

    loadProductData();
});
