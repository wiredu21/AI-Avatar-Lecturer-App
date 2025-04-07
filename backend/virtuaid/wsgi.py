"""
WSGI config for VirtuAId project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'virtuaid.settings')

application = get_wsgi_application() 