# Installing Certificates for the Vite Dev Server

To run the Freeform client dev server over HTTPS, install
[mkcert](https://github.com/FiloSottile/mkcert) and generate certificates in
this directory.

```bash
cd packages/client/config/certs
mkcert -key-file key.pem -cert-file cert.pem localhost 127.0.0.1 craft-5.ddev.site
```

Then run:

```bash
pnpm --filter @ff/client dev
```

If these files are not present, Vite will fall back to HTTP.
