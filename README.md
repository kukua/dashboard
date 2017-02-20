# Kukua Dashboard

## Usage

```bash
git clone https://github.com/kukua/dashboard.git
cd dashboard/
cp src/js/config.js.example src/js/config.js
chmod 600 src/js/config.js

# Development
npm install
npm start

# Production
docker-compose run --rm api npm install
docker-compose run --rm api npm run build
docker-compose up -d
```

## License

This software is licensed under the [MIT license](https://github.com/kukua/dashboard/blob/master/LICENSE).

© 2017 Kukua BV
