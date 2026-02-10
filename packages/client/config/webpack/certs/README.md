# Installing Certificates for Webpack Dev Server

To install certificates for webpack, we will need [mkcert](https://github.com/FiloSottile/mkcert) installed.

```bash
# CD into the directory where the certificates are being stored for webpack
cd ~/plugins/freeform/packages/client/config/webpack/certs

# Run mkcert by listing all of your domains that you are using freeform in
mkcert -key-file key.pem -cert-file cert.pem localhost 127.0.0.1 craft-5.ddev.site
```

You're all set to go, now run `npm run dev`.
