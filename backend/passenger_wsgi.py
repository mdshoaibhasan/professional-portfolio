"""cPanel "Setup Python App" entry point (Phusion Passenger). Application root: backend/; startup file:
passenger_wsgi.py; entry point: application (docs/DEPLOYMENT.md, Part B)."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from config.wsgi import application  # noqa: E402, F401
