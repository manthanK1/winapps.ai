---
title: AI vision quality control on high-speed electronics lines
order: 7
image: ../../assets/images/work/ai-visual-inspection.jpg
imageAlt: Close-up of machined metal engine components and gears
sector: Consumer electronics
region: Global
domains: [ai, manufacturing]
disciplines: [Computer vision, Edge AI, MLOps]
problem: Manual inspection couldn't keep up with high-speed lines for precision smartphone components, so defects escaped and good parts were rejected.
delivered: Multi-camera computer vision that classifies defects at line speed, flags novel defects for review and quarantines suspect supplier lots.
stack: [PyTorch, Vision transformers, Edge inference, MLOps]
services: [ai-ml]
architecture:
  - layer: Line
    nodes: [Multi-camera image capture, Smart reject conveyor]
  - layer: Edge
    nodes: [Defect classification, Novel-defect (anomaly) detection]
  - layer: Learning loop
    nodes: [Human review of flagged parts, Retraining across sites, Model versioning]
  - layer: Integration
    nodes: [MES rejects, Supplier quality scorecards, Lot quarantine]
results: null # TODO: client-approved outcome metrics
seoDescription: Case study. Line-speed AI vision inspection for precision smartphone components, with novel-defect detection and supplier lot quarantine.
---

## The challenge

A manufacturer of precision smartphone components needed inspection that could run at full line speed. Human inspectors missed defects at that pace, while traditional machine vision struggled with new defect types, lighting changes and material variation, rejecting good parts and stopping lines.

<!-- TODO: add client-approved detail (line speeds, defect classes, sites). -->

## Our approach

We deployed vision-transformer models on edge hardware beside each line, classifying defects such as micro-cracks, contamination and assembly errors frame by frame. An anomaly detector flags defects the model hasn't seen before for human review, and verified rejects feed retraining without stopping production.

Inspection results go to the MES, which diverts defective parts and quarantines suspect supplier lots, and supplier scorecards push root-cause fixes upstream.

<!-- TODO: add approach detail you can stand behind on a reference call. -->
