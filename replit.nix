
{ pkgs }: {
  deps = [
    pkgs.libmysqlclient
    pkgs.cowsay
    pkgs.mysql80
    pkgs.python311Packages.mysqlclient
  ];
}
