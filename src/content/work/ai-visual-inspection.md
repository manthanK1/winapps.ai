---
title: AI visual quality inspection on the production line
order: 3
image: ../../assets/images/work/ai-visual-inspection.jpg
imageAlt: Close-up of machined metal engine components and gears
sector: Manufacturing
region: India
disciplines: [Computer vision, MLOps]
problem: Castings and machined parts needed consistent, traceable visual quality inspection on the line.
delivered: Deep-learning inspection where every decision is linked to its images, model version and confidence score.
stack: [PyTorch, Edge inference, MLOps]
services: [ai-ml]
architecture:
  - layer: Production line
    nodes: [Images of castings and machined parts]
  - layer: Edge
    nodes: [Deep-learning model (PyTorch), Edge inference]
  - layer: Traceability
    nodes: [Decision record, Images, Model version, Confidence score]
  - layer: MLOps
    nodes: [Model training and versioning]
results: null # TODO: client-approved outcome metrics
seoDescription: Case study. Deep-learning visual inspection for castings and machined parts in India, with edge inference and full decision traceability.
---

## The challenge

A manufacturer in India needed visual quality inspection for castings and machined parts on its production line, with a clear record of why each part passed or failed.

<!-- TODO: add client-approved detail on the previous inspection process. -->

## Our approach

We built deep-learning inspection in PyTorch, running at the edge on the line. Every decision is traceable: it is linked to its images, the model version that made it and its confidence score. An MLOps pipeline manages training and versioning of the models.

<!-- TODO: add approach detail you can stand behind on a reference call. -->
