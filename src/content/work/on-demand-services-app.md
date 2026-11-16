---
title: Multi-service on-demand marketplace app
order: 15
image: ../../assets/images/industries/retail.jpg
imageAlt: Covered shopping arcade lined with shops
sector: Local services marketplace
domains: [mobile]
disciplines: [Mobile, Marketplace, Payments]
problem: Finding a reliable plumber, cleaner or electrician quickly was hard, and local providers had no easy way to be found or manage jobs.
delivered: A cross-platform marketplace app with service search, live provider availability and tracking, in-app chat, payments and ratings.
stack: [Cross-platform mobile, Geolocation, Payment gateway]
services: [product-engineering]
architecture:
  - layer: Apps
    nodes: [Customer app, Provider app, Admin console]
  - layer: Marketplace
    nodes: [Service catalogue, Matching and availability, Booking]
  - layer: Trust
    nodes: [Ratings and reviews, Dispute resolution]
  - layer: Services
    nodes: [Geolocation and tracking, In-app messaging, Payments and commissions]
results: null # TODO: client-approved outcome metrics
seoDescription: Case study. Cross-platform on-demand marketplace app connecting customers with local service providers, with tracking, payments and ratings.
---

## The challenge

A start-up wanted to bring a fragmented local-services market (plumbing, cleaning, repairs and more) into one app. Customers needed to find trustworthy help fast, and providers needed visibility and simple tools to manage their bookings.

<!-- TODO: add client-approved detail (cities, launch timeline). -->

## Our approach

We built customer and provider apps on one cross-platform codebase for iOS and Android. Customers browse categories, see who's available nearby, book, chat with the provider, track their arrival and pay in the app. Ratings and reviews keep quality visible.

An admin console handles oversight and dispute resolution, and new service categories can be added without app changes. The marketplace earns through commissions on completed jobs.

<!-- TODO: add approach detail you can stand behind on a reference call. -->
