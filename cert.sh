# https://stackoverflow.com/questions/8169999/how-can-i-create-a-self-signed-cert-for-localhost

# 1
openssl req -x509 -out localhost.crt -keyout localhost.key \
  -newkey rsa:2048 -nodes -sha256 -days 365 \
  -subj '/CN=localhost' -extensions EXT -config <( \
   printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")

# 2
open localhost.crt

# 3 MacOS: 
# In Keychain Access, double-click on this new localhost cert. 
# Expand the arrow next to "Trust" and choose to "Always trust"