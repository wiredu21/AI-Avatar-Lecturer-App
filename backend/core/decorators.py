from functools import wraps
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

def jwt_csrf_exempt(view_func):
    """
    Decorator that exempts JWT-authenticated views from CSRF protection.
    This should be used for API endpoints that are protected by JWT tokens.
    
    JWT tokens in Authorization headers are not vulnerable to CSRF attacks
    in the same way as cookie-based session authentication.
    """
    return csrf_exempt(view_func)

def jwt_view_csrf_exempt(view_class):
    """
    Class decorator to exempt all methods in a Django REST Framework class-based view
    from CSRF protection when using JWT authentication.
    """
    view_class.dispatch = method_decorator(csrf_exempt)(view_class.dispatch)
    return view_class 