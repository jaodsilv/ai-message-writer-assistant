"""Custom exceptions for the application."""

from typing import Any, Dict, Optional


class AppException(Exception):
    """Base exception for application errors."""

    def __init__(
        self,
        message: str,
        status_code: int = 500,
        error_type: str = "INTERNAL_ERROR",
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Initialize the exception.

        Args:
            message: Human-readable error message
            status_code: HTTP status code
            error_type: Error type identifier
            details: Additional error details
        """
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.error_type = error_type
        self.details = details or {}


class NotFoundError(AppException):
    """Resource not found error."""

    def __init__(
        self,
        message: str = "Resource not found",
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(
            message=message,
            status_code=404,
            error_type="NOT_FOUND",
            details=details,
        )


class ValidationError(AppException):
    """Validation error."""

    def __init__(
        self,
        message: str = "Validation failed",
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(
            message=message,
            status_code=422,
            error_type="VALIDATION_ERROR",
            details=details,
        )


class ConflictError(AppException):
    """Resource conflict error."""

    def __init__(
        self,
        message: str = "Resource conflict",
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(
            message=message,
            status_code=409,
            error_type="CONFLICT",
            details=details,
        )


class AgentError(AppException):
    """AI agent error."""

    def __init__(
        self,
        message: str = "Agent execution failed",
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(
            message=message,
            status_code=500,
            error_type="AGENT_ERROR",
            details=details,
        )


class ConfigurationError(AppException):
    """Configuration error."""

    def __init__(
        self,
        message: str = "Configuration error",
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(
            message=message,
            status_code=500,
            error_type="CONFIGURATION_ERROR",
            details=details,
        )


class ExternalServiceError(AppException):
    """External service error (e.g., Anthropic API)."""

    def __init__(
        self,
        message: str = "External service error",
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(
            message=message,
            status_code=502,
            error_type="EXTERNAL_SERVICE_ERROR",
            details=details,
        )
