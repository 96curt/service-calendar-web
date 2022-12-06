curl -L "http://localhost:8888/api/schema" --output service-calendar-api.yaml
rm -R .\src\openapi\*
npx openapi-generator-cli generate -i service-calendar-api.yaml -g typescript-angular -o ./src/openapi/ --additional-properties=ngVersion=14.2.12 --additional-properties=useSingleRequestParameter=true
