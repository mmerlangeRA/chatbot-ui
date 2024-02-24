# Fork
This is fork from https://github.com/mckaywrigley/chatbot-ui/

## update 
git fetch upstream
git checkout main
git merge upstream/main

npm update
npm run db-push

## Vercel deploy

https://chatbot-ui-rho-ten-95.vercel.app/

Excellianz


sudo docker build -t chatbot-ui:latest .
sudo docker run -d -p 3000:3000 chatbot-ui:latest
