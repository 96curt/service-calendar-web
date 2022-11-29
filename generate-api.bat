curl -L "http://localhost:8888/api/schema" --output service-calendar-api.yaml
npx openapi-generator-cli generate -i service-calendar-api.yaml -g typescript-angular -o ./src/openapi/ --additional-properties=ngVersion=14.2.12
