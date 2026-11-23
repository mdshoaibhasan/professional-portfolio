"""Validation for images uploaded through the admin (profile photo, project covers)."""

from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator

MAX_IMAGE_BYTES = 2 * 1024 * 1024
IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"]


def validate_image_size(file) -> None:
    # Django has no per-file upload cap (FILE_UPLOAD_MAX_MEMORY_SIZE only decides memory vs temp file).
    if file.size > MAX_IMAGE_BYTES:
        raise ValidationError(
            f"Images must be {MAX_IMAGE_BYTES // (1024 * 1024)} MB or smaller "
            f"(this one is {file.size / (1024 * 1024):.1f} MB)."
        )


IMAGE_VALIDATORS = [FileExtensionValidator(IMAGE_EXTENSIONS), validate_image_size]
IMAGE_HELP = "JPG, PNG or WebP, up to 2 MB."
