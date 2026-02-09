"""Direct unit tests for validators module.

These tests validate the validate_path_in_data_dir function directly,
covering backslash normalization, path traversal prevention, and
cross-platform security.
"""

import tempfile
from typing import Any, Generator
from unittest.mock import patch

import pytest

from app.models.validators import validate_attachment_paths, validate_path_in_data_dir


@pytest.mark.unit
class TestValidatePathInDataDir:
    """Test suite for validate_path_in_data_dir function."""

    @pytest.fixture
    def temp_data_dir(self) -> Generator[str, None, None]:
        """Create a temporary data directory for testing."""
        with tempfile.TemporaryDirectory() as tmpdir:
            yield tmpdir

    @pytest.fixture
    def mock_settings(self, temp_data_dir: str) -> Generator[Any, None, None]:
        """Mock get_settings to use temporary data directory."""

        class MockSettings:
            data_dir = temp_data_dir

        with patch("app.models.validators.get_settings", return_value=MockSettings()):
            yield MockSettings()

    def test_none_returns_none(self, mock_settings: Any) -> None:
        """None input returns None without validation."""
        result = validate_path_in_data_dir(None)
        assert result is None

    def test_valid_relative_path(self, mock_settings: Any) -> None:
        """Valid relative path within data dir passes validation."""
        result = validate_path_in_data_dir("conversations/thread-123/message.txt")
        assert result == "conversations/thread-123/message.txt"

    def test_valid_simple_filename(self, mock_settings: Any) -> None:
        """Simple filename passes validation."""
        result = validate_path_in_data_dir("resume.pdf")
        assert result == "resume.pdf"

    def test_normalizes_backslashes(self, mock_settings: Any) -> None:
        """Backslashes are normalized to forward slashes for validation."""
        result = validate_path_in_data_dir("subdir\\file.txt")
        assert result == "subdir\\file.txt"  # Returns original path

    def test_blocks_backslash_traversal(self, mock_settings: Any) -> None:
        """Backslash traversal attempts are blocked after normalization."""
        with pytest.raises(ValueError) as exc_info:
            validate_path_in_data_dir("subdir\\..\\..\\etc\\passwd")
        assert "outside allowed directory" in str(exc_info.value).lower()

    def test_blocks_forward_slash_traversal(self, mock_settings: Any) -> None:
        """Forward slash traversal attempts are blocked."""
        with pytest.raises(ValueError) as exc_info:
            validate_path_in_data_dir("../etc/passwd")
        assert "outside allowed directory" in str(exc_info.value).lower()

    def test_blocks_mixed_slash_traversal(self, mock_settings: Any) -> None:
        """Mixed forward/backslash traversal attempts are blocked."""
        with pytest.raises(ValueError) as exc_info:
            validate_path_in_data_dir("subdir/..\\..\\secret.txt")
        assert "outside allowed directory" in str(exc_info.value).lower()

    def test_blocks_deep_traversal(self, mock_settings: Any) -> None:
        """Deep path traversal with multiple levels is blocked."""
        with pytest.raises(ValueError) as exc_info:
            validate_path_in_data_dir("a/b/c/../../../../../etc/passwd")
        assert "outside allowed directory" in str(exc_info.value).lower()

    def test_current_dir_reference_accepted(self, mock_settings: Any) -> None:
        """Paths with current directory reference (./) are accepted."""
        result = validate_path_in_data_dir("./resume.pdf")
        assert result == "./resume.pdf"

    def test_returns_original_path_not_normalized(self, mock_settings: Any) -> None:
        """Returns the original path string, not the normalized version."""
        original = "subdir\\file.txt"
        result = validate_path_in_data_dir(original)
        assert result == original


@pytest.mark.unit
class TestValidateAttachmentPaths:
    """Test suite for validate_attachment_paths function."""

    @pytest.fixture
    def temp_data_dir(self) -> Generator[str, None, None]:
        """Create a temporary data directory for testing."""
        with tempfile.TemporaryDirectory() as tmpdir:
            yield tmpdir

    @pytest.fixture
    def mock_settings(self, temp_data_dir: str) -> Generator[Any, None, None]:
        """Mock get_settings to use temporary data directory."""

        class MockSettings:
            data_dir = temp_data_dir

        with patch("app.models.validators.get_settings", return_value=MockSettings()):
            yield MockSettings()

    def test_valid_attachment_list(self, mock_settings: Any) -> None:
        """List of valid paths passes validation."""
        paths = ["file1.pdf", "docs/file2.txt"]
        result = validate_attachment_paths(paths)
        assert result == paths

    def test_empty_list(self, mock_settings: Any) -> None:
        """Empty list passes validation."""
        result = validate_attachment_paths([])
        assert result == []

    def test_rejects_any_unsafe_path(self, mock_settings: Any) -> None:
        """Rejects entire list if any path is unsafe."""
        with pytest.raises(ValueError):
            validate_attachment_paths(["safe.pdf", "../../../etc/passwd", "also_safe.txt"])
