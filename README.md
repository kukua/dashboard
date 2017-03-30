# Kukua Dashboard

## Usage

```bash
git clone https://github.com/kukua/dashboard.git
cd dashboard/
cp src/js/config.js.example src/js/config.js
chmod 600 src/js/config.js

# Development
yarn install
npm start

# Staging
docker-compose run --rm api yarn install
docker-compose run --rm api npm run build
docker-compose up -d

# Production
docker-compose run --rm api yarn install
docker-compose run --rm api npm run build-prod
docker-compose up -d
```

## License

This software is licensed under the [MIT license](https://github.com/kukua/dashboard/blob/master/LICENSE).

© 2017 Kukua BV
