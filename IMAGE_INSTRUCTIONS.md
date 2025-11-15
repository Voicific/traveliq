# IMAGE INTEGRATION INSTRUCTIONS

## Required Images for Blog Thumbnails

The updated posts.tsx file now references these images:

1. **Voice AI Blog** (new): `/imgs/blog_thumbnails_service_2.webp`
2. **Secret AI Playbook**: `/imgs/blog_thumbnails_playbook_1.jpg`
3. **AI Assistant**: `/imgs/blog_thumbnails_ai_5.webp`
4. **Why TravelIQ**: `/imgs/blog_thumbnails_innovation_3.webp`
5. **UK Travel Trends**: `/imgs/blog_thumbnails_business_9.png`

## Image Sources

All images are available in the workspace at: `/workspace/imgs/`

Copy the entire `imgs/` folder to your traveliq project root:
```
traveliq/
├── public/
│   └── imgs/           ← Copy this entire folder
└── src/
    └── blog/
        └── posts.tsx   ← Updated with new content
```

## Supplier Logos (Bonus Enhancement)

Also available for future supplier logo improvements:
- Airlines: `/workspace/imgs/supplier_logos_airlines_*`
- Hotels: `/workspace/imgs/supplier_logos_hotels_*`
- Tours: `/workspace/imgs/supplier_logos_tours_*`
- Agencies: `/workspace/imgs/supplier_logos_agencies_*`

These can be integrated later for better visual branding.