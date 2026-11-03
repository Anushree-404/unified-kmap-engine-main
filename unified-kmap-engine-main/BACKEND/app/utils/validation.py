"""
Shared validation helpers used across controllers.
"""
from typing import Any


def clamp(value: float, lo: float, hi: float) -> float:
    """Clamp a float value between lo and hi."""
    return max(lo, min(hi, value))


def assert_finite(value: Any, name: str) -> float:
    """Raise ValueError if value is not a finite number."""
    import math

    if not isinstance(value, (int, float)) or math.isnan(value) or math.isinf(value):
        raise ValueError(f"{name} must be a finite number, got {value!r}")
    return float(value)
