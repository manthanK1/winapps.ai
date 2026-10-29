---
title: Fleet management and route optimisation
order: 4
image: ../../assets/images/work/fleet-route-optimisation.jpg
imageAlt: Truck on an open highway
sector: Logistics
disciplines: [Platform, ML]
problem: Dispatch, drivers and customers needed one real-time view of a delivery fleet.
delivered: Real-time tracking, geofencing and ETA prediction, unifying dispatch, drivers and customers on one platform.
stack: [React, Go, Kafka, ML]
services: [product-engineering, data-analytics, ai-ml]
architecture:
  - layer: Apps
    nodes: [Dispatch (React), Drivers, Customers]
  - layer: Streaming
    nodes: [Kafka event stream]
  - layer: Services
    nodes: [Go services, Real-time tracking, Geofencing]
  - layer: Intelligence
    nodes: [ETA prediction (ML)]
results: null # TODO: client-approved outcome metrics
seoDescription: Case study. Real-time fleet tracking, geofencing and ML-based ETA prediction, unifying dispatch, drivers and customers on one platform.
---

## The challenge

A delivery business needed dispatch, drivers and customers to work from the same real-time picture of its fleet.

<!-- TODO: add client-approved detail (region, fleet size if permitted, previous tools). -->

## Our approach

We built a platform with real-time tracking, geofencing and machine-learning ETA prediction. A React front end serves dispatch, Go services handle tracking and geofencing, and Kafka streams events between them.

<!-- TODO: add approach detail you can stand behind on a reference call. -->
