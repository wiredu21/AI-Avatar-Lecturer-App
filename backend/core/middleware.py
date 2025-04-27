from django.utils.deprecation import MiddlewareMixin

class JWTCSRFExemptMiddleware(MiddlewareMixin):
    """
    Middleware that exempts requests with JWT Bearer tokens from CSRF protection.
    
    This middleware checks if the request contains an Authorization header with a 
    Bearer token. If it does, the request is marked as exempt from CSRF validation.
    
    JWT tokens in Authorization headers are not vulnerable to CSRF attacks since
    browsers cannot set custom headers in cross-origin requests unless explicitly
    allowed by CORS, so it's safe to bypass CSRF checks for these requests.
    """
    
    def process_request(self, request):
        # Check if the request has an Authorization header with a Bearer token
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header.startswith('Bearer '):
            # Mark this request as not requiring CSRF validation
            request._dont_enforce_csrf_checks = True 