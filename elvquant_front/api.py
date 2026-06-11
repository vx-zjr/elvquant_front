"""FastAPI application for the elvquant React cockpit."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from elvquant_front import __version__
from elvquant_front.core_bridge import (
    artifact_payload,
    core_root,
    load_core_state,
    read_artifact,
    run_workflow,
    stooq_status,
    workflow_summaries,
)


class RunRequest(BaseModel):
    workflow_id: str


class ArtifactRequest(BaseModel):
    path: str


def create_app() -> FastAPI:
    app = FastAPI(title="elvquant_front", version=__version__)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/api/health")
    def health() -> dict[str, Any]:
        state = load_core_state()
        return {
            "service": "elvquant_front",
            "version": __version__,
            "frontend": "react",
            "core_available": state.available,
            "core_root": str(state.core_root),
            "message": state.message,
        }

    @app.get("/api/workflows")
    def workflows() -> dict[str, Any]:
        return workflow_summaries()

    @app.post("/api/run")
    def run(request: RunRequest) -> dict[str, Any]:
        return run_workflow(request.workflow_id)

    @app.get("/api/stooq/status")
    def stooq() -> dict[str, Any]:
        return stooq_status()

    @app.get("/api/artifacts")
    def artifacts() -> dict[str, Any]:
        return {"artifacts": artifact_payload()}

    @app.post("/api/artifacts/read")
    def read(request: ArtifactRequest) -> dict[str, Any]:
        payload = read_artifact(request.path)
        if not payload["ok"]:
            raise HTTPException(status_code=404, detail=payload["text"])
        return payload

    mount_static_app(app)
    return app


def mount_static_app(app: FastAPI) -> None:
    dist_dir = Path(__file__).resolve().parents[1] / "web" / "dist"
    assets_dir = dist_dir / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}", response_model=None)
    def spa(full_path: str) -> Any:
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API route not found")
        index = dist_dir / "index.html"
        if index.exists():
            return FileResponse(index)
        return {
            "message": (
                "React build not found. Run npm run build, "
                "or use Vite dev server with /api proxy."
            ),
            "core_root": str(core_root()),
        }


app = create_app()


def main() -> None:
    uvicorn.run("elvquant_front.api:app", host="127.0.0.1", port=8000, reload=False)


if __name__ == "__main__":
    main()
