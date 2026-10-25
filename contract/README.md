# Genie Contract

OpenAPI 3.1 contract for Genie: maintenance requests from fault to verified repair.

## Linting
```bash
npx @redocly/cli lint contract/openapi.yaml --config contract/redocly.yaml
```

## Running the Prism mock server
Genie's mock runs on port **4711** (Stockwise uses 4710):
```bash
npx @stoplight/prism-cli mock contract/openapi.yaml --port 4711
```
Or from `web/`:
```bash
npm run mock
```
