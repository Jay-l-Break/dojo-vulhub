# Vulhub benchmark

This benchmark ports vulnerable JavaScript and Python applications from a pinned Vulhub revision.

![Vulhub benchmark funnel](figure.svg)

## Source and selection

The source revision is [`8fd63916f7a8711e2e01dda0d27237e4d6175d38`](https://github.com/vulhub/vulhub/commit/8fd63916f7a8711e2e01dda0d27237e4d6175d38).
A case is one directory with a Docker Compose file at that revision.
The language decision uses the vulnerable application runtime and source code.
TypeScript source compiled to JavaScript counts when the deployed vulnerable runtime is JavaScript.
PoC scripts and container configuration do not determine the language.

## Version grouping

Each vulnerability keeps its own datapoint and source branch.
Cases in one application share the earliest published release on which every grouped exploit was reproduced.
A release joins a group only after a live exploit test confirms it.
Vulnerable development snapshots remain separate from released version groups.

## Current status

The count data comes from the manager ledger and was generated at `2026-10-09T16:17:48.593203+00:00`.
The inventory has 333 cases.
Language selection keeps 55 candidates and excludes 278 cases.
Passing datapoints: 54.
Failed cases: 0.
Blocked cases: 1.
Assigned cases: 0.
Cases awaiting assignment: 0.
Passing datapoints have 58 validated oracle occurrences.
Earlier version repins are pending for 0 passing datapoints.
The figure and [`counts.json`](counts.json) use these ledger totals.

## Local source deployment

Every published vulnerability branch needs a root Dockerfile that starts its application server on container port 80.
The local check builds that image, starts it, and requests the application through port 80.
Public support services can start alongside the image when the application requires them.
A root Compose file must start without private environment variables and publish host port 80 on all interfaces by default.
The local check also starts each root Compose stack and requests the application through port 80.
Root Dockerfiles present: 54 of 54.
Root Compose stacks tested: 20.
Images that reach HTTP readiness on their own: 49.
Images that need public Compose companions for HTTP readiness: 5.
Local checks: 54 passed, 0 failed, 0 blocked, 0 pending.
These local startup checks do not repeat the oracle tests against rebuilt source images.
Rocket.Chat and Vite use pinned published runtime artifacts alongside checked-in upstream source snapshots.
Per-branch results and source commits are in [`counts.json`](counts.json).

## Failure categories

- 1 blocked: Windows protocol handler unavailable on Linux

## Published source branches

- [`aiohttp-001`](https://github.com/Jay-l-Break/dojo-vulhub/tree/aiohttp-001) at `dcd372081cd73407b4a073861629f3be8368e1a9`
- [`airflow-001`](https://github.com/Jay-l-Break/dojo-vulhub/tree/airflow-001) at `b6fec8af1746b2dbde389baceca13517d16e250d`
- [`airflow-002`](https://github.com/Jay-l-Break/dojo-vulhub/tree/airflow-002) at `c9cc6d696853a7cf621ab2f286121d1166fe1954`
- [`airflow-003`](https://github.com/Jay-l-Break/dojo-vulhub/tree/airflow-003) at `cd00dbfaeb02787f08420243d610314d9059509a`
- [`budibase-001`](https://github.com/Jay-l-Break/dojo-vulhub/tree/budibase-001) at `34146b641ad79087975eb4ef9aad0644f0007821`
- [`celery-001`](https://github.com/Jay-l-Break/dojo-vulhub/tree/celery-001) at `48b0843fa1959fef84c6ffc61d86286e64c0b6a2`
- [`chartbrew-001`](https://github.com/Jay-l-Break/dojo-vulhub/tree/chartbrew-001) at `ac251bfbf7ddb17b7752aa419aee72ab9f2dbe84`
- [`comfyui-001`](https://github.com/Jay-l-Break/dojo-vulhub/tree/comfyui-001) at `47583a37764375bb9b5851e5ac46a1d838f954cb`
- [`comfyui-002`](https://github.com/Jay-l-Break/dojo-vulhub/tree/comfyui-002) at `400d76691c0911930f8ed17ea3d7cdf20a3020cd`
- [`django-001`](https://github.com/Jay-l-Break/dojo-vulhub/tree/django-001) at `7783c150e0c3a447c8aafe59096a697ce7e0d227`
- [`django-002`](https://github.com/Jay-l-Break/dojo-vulhub/tree/django-002) at `4548e9ddf7cec911afff42df58943ee83345aec2`
- [`django-003`](https://github.com/Jay-l-Break/dojo-vulhub/tree/django-003) at `fb845e626c877a5ef344d03a2c12a934073eba80`
- [`django-004`](https://github.com/Jay-l-Break/dojo-vulhub/tree/django-004) at `999341bb316479d832be298fcd41b53602addc5e`
- [`django-005`](https://github.com/Jay-l-Break/dojo-vulhub/tree/django-005) at `e54832e5e24ac118d988a47e12776894b2ac4e59`
- [`django-006`](https://github.com/Jay-l-Break/dojo-vulhub/tree/django-006) at `80c137c2feff99e66f7a03adf27688d8d19aa2e4`
- [`electron-002`](https://github.com/Jay-l-Break/dojo-vulhub/tree/electron-002) at `47b47565c0579395296151f0152709585f74909c`
- [`flask-001`](https://github.com/Jay-l-Break/dojo-vulhub/tree/flask-001) at `e0ceb3478f58ef78b6f03d5582a2c3ba6bfaf1f4`
- [`gradio-001`](https://github.com/Jay-l-Break/dojo-vulhub/tree/gradio-001) at `9cba549d3ae8ddcd114b4ccafd4677e979e5716e`
- [`gradio-002`](https://github.com/Jay-l-Break/dojo-vulhub/tree/gradio-002) at `1590df3c5b7228bb397c49b4dcd7e39fa732e875`
- [`jumpserver-001`](https://github.com/Jay-l-Break/dojo-vulhub/tree/jumpserver-001) at `023014f02d28845def03c642157062e6af319280`
- [`jupyter-001`](https://github.com/Jay-l-Break/dojo-vulhub/tree/jupyter-001) at `d9a964619e38dfeb18631b4be0c222c8303b8d47`
- [`kibana-001`](https://github.com/Jay-l-Break/dojo-vulhub/tree/kibana-001) at `7cd539769d56be013d7c79785016df613a247536`
- [`kibana-002`](https://github.com/Jay-l-Break/dojo-vulhub/tree/kibana-002) at `22f3d633a7ac19b4d7927abafdc45352f3744367`
- [`kibana-003`](https://github.com/Jay-l-Break/dojo-vulhub/tree/kibana-003) at `162dbeae721117f4d70fd4f2057744941c242c95`
- [`langflow-001`](https://github.com/Jay-l-Break/dojo-vulhub/tree/langflow-001) at `84e809571be617fb73957f455cc3ad2c28a87f79`
- [`langflow-002`](https://github.com/Jay-l-Break/dojo-vulhub/tree/langflow-002) at `3aa8578a462d5730e3f9f28923452a282d4159c8`
- [`mongo-express-001`](https://github.com/Jay-l-Break/dojo-vulhub/tree/mongo-express-001) at `f6c794e9dcd52cf13694a948e586f1628ce52c82`
- [`n8n-001`](https://github.com/Jay-l-Break/dojo-vulhub/tree/n8n-001) at `82990738a51e41b4cfe0fca3253b62b8c2ebe120`
- [`n8n-002`](https://github.com/Jay-l-Break/dojo-vulhub/tree/n8n-002) at `e0b17b240f948e89bc763aa2618512ba0bef0221`
- [`next-js-001`](https://github.com/Jay-l-Break/dojo-vulhub/tree/next-js-001) at `b32ab19d4038205af7fd197c4a0c8fc16a278d0f`
- [`node-001`](https://github.com/Jay-l-Break/dojo-vulhub/tree/node-001) at `94cf10e8056d3b8fca2ca3ec02b62cb2e74ecd3b`
- [`node-002`](https://github.com/Jay-l-Break/dojo-vulhub/tree/node-002) at `8776b75f3900d8d8e4ba6caf79fcf8e0c80487c4`
- [`openclaw-001`](https://github.com/Jay-l-Break/dojo-vulhub/tree/openclaw-001) at `afe31a9eb82fdc1b9c7a5fe6c0ac76cbcd5981c6`
- [`pdfjs-001`](https://github.com/Jay-l-Break/dojo-vulhub/tree/pdfjs-001) at `5f9866da22d4d54a61749f3af195e30bc9a6c667`
- [`pgadmin-001`](https://github.com/Jay-l-Break/dojo-vulhub/tree/pgadmin-001) at `17ba5abc9d676b98881881d5711e4c865a0a4cc9`
- [`pgadmin-002`](https://github.com/Jay-l-Break/dojo-vulhub/tree/pgadmin-002) at `6cf1e04144b7e1cce3350015eb28b2c044df4a27`
- [`pgadmin-003`](https://github.com/Jay-l-Break/dojo-vulhub/tree/pgadmin-003) at `e54411038963845a2221e85d3609ac14a9b31101`
- [`pgadmin-004`](https://github.com/Jay-l-Break/dojo-vulhub/tree/pgadmin-004) at `a4a4dc33ddb474c2b9a7594645abdcae42121c20`
- [`pickle-001`](https://github.com/Jay-l-Break/dojo-vulhub/tree/pickle-001) at `33dc04c61746339cfa42c9251e41607ff664a783`
- [`react-001`](https://github.com/Jay-l-Break/dojo-vulhub/tree/react-001) at `589d15dcf7b882828a0c34890874eabd249da8e2`
- [`rocketchat-001`](https://github.com/Jay-l-Break/dojo-vulhub/tree/rocketchat-001) at `be75bc5f59fe2617313bedd2980c8cc904253a73`
- [`saltstack-001`](https://github.com/Jay-l-Break/dojo-vulhub/tree/saltstack-001) at `42e9560f7c85bfdf70f116f6b9c73c48e5596323`
- [`saltstack-002`](https://github.com/Jay-l-Break/dojo-vulhub/tree/saltstack-002) at `33b3327c30553b63419c44941fc4f1d7a83ab080`
- [`saltstack-003`](https://github.com/Jay-l-Break/dojo-vulhub/tree/saltstack-003) at `31d2d5b1eb55242bb79739f1234097c69e5e2002`
- [`scrapyd-001`](https://github.com/Jay-l-Break/dojo-vulhub/tree/scrapyd-001) at `460e5840d4d43f4ab28acd29bec51b538ecad3a1`
- [`superset-001`](https://github.com/Jay-l-Break/dojo-vulhub/tree/superset-001) at `a36ed960e98d116ad4ce843768d8edf12bb3c77c`
- [`superset-002`](https://github.com/Jay-l-Break/dojo-vulhub/tree/superset-002) at `9c970b50a0a2d0eb8bd5a61cdf1c12131d4e3bbb`
- [`supervisor-001`](https://github.com/Jay-l-Break/dojo-vulhub/tree/supervisor-001) at `f578c933315c55034b900a78a4550e3def694d0c`
- [`vite-001`](https://github.com/Jay-l-Break/dojo-vulhub/tree/vite-001) at `f9e4e44b37e2dbd909b97840c9be928af0282970`
- [`vite-002`](https://github.com/Jay-l-Break/dojo-vulhub/tree/vite-002) at `40aa0cf10fe8afc5ee68a5c1031c8aa67cc11acf`
- [`vite-003`](https://github.com/Jay-l-Break/dojo-vulhub/tree/vite-003) at `4ccc4cc77e48e61d9479971fb39a71d744b9a17d`
- [`vite-004`](https://github.com/Jay-l-Break/dojo-vulhub/tree/vite-004) at `12cc2c16cdc601c4af543a8b2fff46a5f2678b2b`
- [`yapi-001`](https://github.com/Jay-l-Break/dojo-vulhub/tree/yapi-001) at `59864738899596a592e755a109650628b1b20578`
- [`yapi-002`](https://github.com/Jay-l-Break/dojo-vulhub/tree/yapi-002) at `4431652d402ff5f6e837ab8c923aebb129b69b68`

## Validation

A datapoint passes only when a fresh deployment, its mapped PoC, and every claimed validation server oracle pass the programmatic checker.
Private flags, verifier settings, and deployment credentials stay outside source branches and this publication.
