{ pkgs }: {
  deps = [
    pkgs.pkg-config
    pkgs.mysql80
    pkgs.python311
    pkgs.python311Packages.pip
    pkgs.python311Packages.django_4_2
    pkgs.python311Packages.djangorestframework
    pkgs.python311Packages.django-cors-headers
    pkgs.python311Packages.mysqlclient
    pkgs.python311Packages.django-environ
    pkgs.python311Packages.django-allauth
    pkgs.python311Packages.cryptography
    pkgs.python311Packages.celery
    pkgs.python311Packages.redis
    pkgs.python311Packages.llama-cpp-python
    pkgs.python311Packages.python-dotenv
    pkgs.python311Packages.pytest
    pkgs.python311Packages.pillow
  ];
}
