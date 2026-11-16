---
title: Digital loan management platform for an Indian NBFC
order: 19
image: ../../assets/images/industries/fintech.jpg
imageAlt: Glass office towers in a financial district
sector: Lending (NBFC)
region: India
domains: [fintech, mobile]
disciplines: [Mobile, Platform, Machine learning]
problem: Paper applications, manual verification and disconnected systems made loan approvals slow and couldn't scale with the business.
delivered: An end-to-end digital lending platform with eKYC, ML credit scoring, workflow approvals and UPI/IMPS disbursal, plus a field-agent app.
stack: [React Native, Node.js, PostgreSQL, MongoDB, AWS, TensorFlow, Docker, Jenkins]
services: [product-engineering, ai-ml, cloud-platform]
architecture:
  - layer: Apps
    nodes: [Borrower app (React Native), Field-agent app, Operations dashboard]
  - layer: Onboarding
    nodes: [Automated KYC / eKYC, Document capture]
  - layer: Lending services
    nodes: [Node.js microservices, Workflow engine and e-signatures, Credit scoring and fraud models (TensorFlow)]
  - layer: Integrations
    nodes: [Credit bureau, Payment gateway, UPI / IMPS disbursal]
  - layer: Cloud
    nodes: [AWS, PostgreSQL, MongoDB, Audit logs]
results: null # TODO: client-approved outcome metrics (the V1 page quoted processing time and portfolio growth)
seoDescription: Case study. Digital loan platform for an Indian NBFC, with eKYC, ML credit scoring, workflow approvals and UPI disbursal on AWS.
---

## The challenge

A large non-banking financial company in India lends to SMEs and individuals in cities and rural areas. Its growth had outpaced its loan processing: paper applications, manual verification and disconnected systems made approvals slow, customers dropped off mid-application, and tighter regulation demanded stronger security and audit trails.

<!-- TODO: add client-approved detail (loan products, volumes). -->

## Our approach

We built a cloud platform on AWS with Node.js microservices, PostgreSQL and MongoDB. Borrowers and field agents use a React Native app to apply, upload documents and track status. Automated eKYC and machine-learning credit scoring handle eligibility, a workflow engine routes approvals with e-signatures, and approved loans are paid out over UPI and IMPS.

Operations teams see portfolio performance and compliance reports on a dashboard. Biometric login, end-to-end encryption, role-based access and tamper-evident audit logs protect the data. The rollout started with personal loans and expanded to SME lending.

<!-- TODO: add approach detail you can stand behind on a reference call. -->
