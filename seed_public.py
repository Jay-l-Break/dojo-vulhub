"""Seed the public playground flow used by the vulnerability case."""

import asyncio
import os
import time
import urllib.error
import urllib.request
from uuid import UUID

from sqlmodel import select

from langflow.services.database.models.flow.model import AccessTypeEnum, Flow
from langflow.services.database.models.user.crud import get_user_by_username
from langflow.services.deps import session_scope


PUBLIC_FLOW_ID = UUID("e8b4f8c2-7a1d-4e5f-9b3c-2a6d8f0e1b4a")


async def seed_public_flow() -> None:
    async with session_scope() as session:
        username = os.environ.get("LANGFLOW_SUPERUSER", "administrator")
        user = await get_user_by_username(session, username)
        if user is None:
            raise RuntimeError("Application superuser is not initialized")
        existing = (await session.exec(select(Flow).where(Flow.id == PUBLIC_FLOW_ID))).first()
        if existing is not None:
            if existing.access_type is not AccessTypeEnum.PUBLIC:
                raise RuntimeError("Public flow ID belongs to a private flow")
            return
        session.add(
            Flow(
                id=PUBLIC_FLOW_ID,
                name="Shared Playground",
                description="Public flow shared with visitors",
                user_id=user.id,
                access_type=AccessTypeEnum.PUBLIC,
                data={"nodes": [], "edges": []},
            )
        )
        await session.commit()


def main() -> None:
    deadline = time.monotonic() + 180
    while time.monotonic() < deadline:
        try:
            with urllib.request.urlopen("http://127.0.0.1:80/health_check", timeout=3) as response:
                if response.status != 200:
                    raise RuntimeError("Application is not ready")
            asyncio.run(seed_public_flow())
            print(f"Public flow ready: {PUBLIC_FLOW_ID}", flush=True)
            return
        except (OSError, RuntimeError, urllib.error.URLError) as error:
            print(f"Waiting to seed public flow: {type(error).__name__}", flush=True)
            time.sleep(2)
    raise RuntimeError("Public flow was not seeded before the startup deadline")


if __name__ == "__main__":
    main()
