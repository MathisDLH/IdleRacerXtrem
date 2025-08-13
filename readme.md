To start docker (redis & mysql):

```bash
docker compose up -d
```

To launch the production stack:

```bash
docker compose -f docker-compose.prod.yml up -d
```

Grafana is available at http://localhost:3001 and Prometheus at http://localhost:9090.

For real deployments, store passwords in a `.env` file or use Docker secrets, and test the stack on a staging environment before going to production.
