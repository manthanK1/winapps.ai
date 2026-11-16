---
title: Direct-to-viewer OTT streaming platform
order: 11
image: ../../assets/images/industries/media.jpg
imageAlt: Cinema camera rigged for an outdoor shoot
sector: Media & entertainment
region: Global
domains: [entertainment, mobile]
disciplines: [Video streaming, Mobile, Cloud]
problem: A media company relied on third-party platforms, with little control over its brand, its audience data or its revenue.
delivered: Its own OTT service with adaptive streaming, live and on-demand content, subscriptions and ads, recommendations and DRM protection.
stack: [Adaptive streaming, DRM, CDN, iOS, Android]
services: [product-engineering, cloud-platform]
architecture:
  - layer: Viewers
    nodes: [Web, iOS, Android, Smart TV]
  - layer: Delivery
    nodes: [Adaptive bitrate streaming, CDN, DRM]
  - layer: Services
    nodes: [Content management, Subscriptions and ads, Recommendations]
  - layer: Insight
    nodes: [Viewer analytics, Multi-language catalogue]
results: null # TODO: client-approved outcome metrics
seoDescription: Case study. A direct-to-viewer OTT platform for a media company, with adaptive streaming, subscriptions, recommendations and DRM.
---

## The challenge

A media production company wanted to distribute content directly to its audience instead of through third-party platforms that controlled the branding, the data and much of the revenue. The service had to stream live events and on-demand titles in high quality on many devices and networks, and protect content against piracy.

<!-- TODO: add client-approved detail (catalogue size, markets). -->

## Our approach

We built a full OTT stack: content management and categorisation, adaptive bitrate streaming over a CDN, DRM, and apps for web, mobile and TV. Subscription and advertising models sit side by side, and recommendations are based on viewing habits.

Viewer analytics feed the content strategy, and multi-language support opens the catalogue to international audiences.

<!-- TODO: add approach detail you can stand behind on a reference call. -->
