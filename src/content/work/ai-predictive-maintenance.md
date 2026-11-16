---
title: AI predictive maintenance across multi-plant manufacturing
order: 5
image: ../../assets/images/industries/manufacturing.jpg
imageAlt: Precision milling and drilling tools
sector: Automotive components
region: India
domains: [ai, manufacturing]
disciplines: [Machine learning, IoT, Mobile]
problem: Unplanned breakdowns on bottleneck CNC machines, presses and robotic lines kept stopping production and putting OEM delivery schedules at risk.
delivered: A hybrid edge-cloud platform that scores asset health, predicts failures days ahead with explainable causes, and raises work orders in SAP PM.
stack: [XGBoost, LSTM, React Native, Power BI, SAP PM, MQTT]
services: [ai-ml, data-analytics]
architecture:
  - layer: Shop floor
    nodes: [CNC machines, Presses, Robotic lines, Sensors (OPC UA, Modbus, MQTT)]
  - layer: Edge
    nodes: [Edge gateways, Feature extraction, First-pass anomaly detection]
  - layer: Cloud ML
    nodes: [Ensemble failure models, Explainable root cause (SHAP), Weekly retraining]
  - layer: People and systems
    nodes: [Technician mobile app, SAP PM work orders, Power BI dashboards]
results: null # TODO: client-approved outcome metrics (the V1 page quoted downtime, OEE and savings figures)
seoDescription: Case study. Edge-cloud AI predictive maintenance for a multi-plant automotive supplier in India, with explainable alerts and SAP PM integration.
---

## The challenge

A Tier-1 automotive components supplier with several plants in India was losing production to unplanned breakdowns, most painfully on bottleneck machines such as 5-axis machining centres and robotic welders. Fixed-interval preventive maintenance didn't fit machines that wear differently under different loads and materials, and sensor data sat in separate PLCs, SCADA systems and vibration analysers.

The client wanted failure warnings with enough lead time to plan around, a clear reason for every alert, and an interface technicians would actually use on the floor.

<!-- TODO: add client-approved detail (plant count, machine count, downtime baseline). -->

## Our approach

We built a hybrid edge-cloud platform. Edge gateways read machine data over OPC UA, Modbus and MQTT, extract features and flag critical faults locally, so alerts still work when the connection drops. In the cloud, an ensemble of time-series and gradient-boosting models trained on historical failures produces a health score, a failure-probability timeline and the parameters driving each prediction.

Technicians get a mobile app with prioritised alerts and one-tap work orders that flow into SAP PM. Leadership sees asset health in Power BI. Verified repairs feed back into weekly retraining, with drift monitoring on every model.

<!-- TODO: add approach detail you can stand behind on a reference call. -->
