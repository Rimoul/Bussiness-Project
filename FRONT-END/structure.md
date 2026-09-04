/my-ecommerce-project
│
├── /css
│   ├── global.css        (Master styles: fonts, colors, buttons, nav)
│   ├── product.css       (Specific to product detail pages)
│   └── auth.css          (Specific to login/register pages)
│
├── /js
│   ├── /core
│   │   ├── api.js        (Base URLs, fetch wrappers)
│   │   ├── auth.js       (Login, logout, session management)
│   │   └── layout.js     (Injects header/footer, dropdowns)
│   │
│   └── /pages
│       ├── home.js       (Fetches and renders the main product grid)
│       ├── product.js    (Handles the single product detail view)
│       └── cart.js       (Handles shopping cart calculations)
│
├── /components
│   ├── header.html       
│   └── footer.html       
│
├── index.html            (Home page)
├── product-detail.html   (Single product view)
├── cart.html             (Shopping cart view)
└── log.html              (Authentication view)