"""Vulhub aiohttp static file server for CVE-2024-23334."""

from aiohttp import web


async def index(request: web.Request) -> web.Response:
    return web.Response(text="Hello, World!")


app = web.Application()
app.router.add_static("/static", "static/", follow_symlinks=True)
app.router.add_get("/", index)


if __name__ == "__main__":
    web.run_app(app, host="0.0.0.0", port=80)
