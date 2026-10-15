from fastapi import HTTPException, status

class DigitalSaathiException(HTTPException):
    def __init__(self, status_code: int, detail: str, error_code: str = "ERROR"):
        super().__init__(status_code=status_code, detail={"message": detail, "code": error_code})

class AuthenticationError(DigitalSaathiException):
    def __init__(self, detail: str = "Invalid credentials"):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail, error_code="AUTH_FAILED")

class PermissionDeniedError(DigitalSaathiException):
    def __init__(self, detail: str = "Permission denied"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail, error_code="PERMISSION_DENIED")

class NotFoundError(DigitalSaathiException):
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail, error_code="NOT_FOUND")

class FileProcessingError(DigitalSaathiException):
    def __init__(self, detail: str = "Error processing document"):
        super().__init__(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=detail, error_code="DOCUMENT_PROCESSING_FAILED")

class ProviderUnavailableError(DigitalSaathiException):
    def __init__(self, detail: str = "AI service provider temporarily unavailable"):
        super().__init__(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=detail, error_code="PROVIDER_UNAVAILABLE")
