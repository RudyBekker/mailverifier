## Requirments

- Docker
- Nodejs

## running the application

- Start Docker and then run docker-compose up -d
- if changes to config -> docker-compose stop; docker-compose rm; docker-compose build; docker-compose up -d

## How to use
- Add your mail verifier details to the .env
- Upload emails to csv folder and then run the script, the validated emails will appear in the folder validated

## CURL Test
curl --request GET \
  --url 'http://localhost:9292/?email=testemail@domain.com' \
  --header 'Accept: application/json' \
  --header 'Authorization: xxxyyy'