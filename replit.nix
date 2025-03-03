
{ pkgs }: {
  deps = [
    pkgs.cowsay
    pkgs.mysql80
    pkgs.python311Packages.mysqlclient
  ];
}
