import mimetypes
from pathlib import Path

from django.conf import settings
from django.http import FileResponse, Http404
from django.utils._os import safe_join
from django.core.exceptions import SuspiciousFileOperation


def serve_frontend(request, path=""):
    dist_dir = Path(getattr(settings, "FRONTEND_DIST_DIR", ""))
    index_file = Path(getattr(settings, "FRONTEND_INDEX_FILE", ""))

    if not dist_dir.exists():
        raise Http404("Frontend build not found. Run `npm run build` in crm_front.")

    if path:
        try:
            requested_path = Path(safe_join(str(dist_dir), path))
        except SuspiciousFileOperation as exc:
            raise Http404("Invalid file path.") from exc

        if requested_path.exists() and requested_path.is_file():
            content_type, _ = mimetypes.guess_type(str(requested_path))
            return FileResponse(
                requested_path.open("rb"),
                content_type=content_type or "application/octet-stream",
            )

    if not index_file.exists():
        raise Http404("Frontend entrypoint not found. Expected dist/index.html.")

    return FileResponse(index_file.open("rb"), content_type="text/html; charset=utf-8")
