# Vulhub benchmark

This benchmark ports vulnerable JavaScript and Python applications from a pinned Vulhub revision.

![Vulhub benchmark funnel](figure.svg)

## Source and selection

The source revision is [`8fd63916f7a8711e2e01dda0d27237e4d6175d38`](https://github.com/vulhub/vulhub/commit/8fd63916f7a8711e2e01dda0d27237e4d6175d38).
A case is one directory with a Docker Compose file at that revision.
The language decision uses the vulnerable application runtime and source code.
PoC scripts and container configuration do not determine the language.

## Version grouping

Each vulnerability keeps its own datapoint and source branch.
Cases in one application share the earliest version on which every grouped exploit was reproduced.
A version joins a group only after a live exploit test confirms it.

## Current status

The count data comes from the manager ledger and was generated at `2026-10-09T07:50:35.086754+00:00`.
The inventory has 333 cases.
Language selection keeps 55 candidates and excludes 278 cases.
There are 0 passing datapoints, 0 failed cases, 0 blocked cases, and 55 cases still in progress.
Passing datapoints have 0 validated oracle occurrences.
The figure and [`counts.json`](counts.json) use these ledger totals.

## Failure categories

No cases have a confirmed failure or blocker yet.

## Published source branches

- [`django-006`](https://github.com/Jay-l-Break/dojo-vulhub/tree/django-006) at `45facb0cd2d5c3bf7bec88a2fb02bdeb878f620a`
- [`gradio-001`](https://github.com/Jay-l-Break/dojo-vulhub/tree/gradio-001) at `8f689400725fbe6470c05d2e2ccd9a5b2398797d`
- [`node-002`](https://github.com/Jay-l-Break/dojo-vulhub/tree/node-002) at `4e5f7a6f97b330128d7a88352043ed4127315a1a`

## Validation

A datapoint passes only when a fresh deployment, its mapped PoC, and every claimed validation server oracle pass the programmatic checker.
Private flags, verifier settings, and deployment credentials stay outside source branches and this publication.
