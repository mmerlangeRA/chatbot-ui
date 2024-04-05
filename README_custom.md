# Fork

This is fork from https://github.com/mckaywrigley/chatbot-ui/

## change in fonctionnalities

If there is a tool, then attached files are ignored for automatic retrieval : we consider it is up to AI to know what to do with these documents.


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

=> for vps
docker save chatbot-ui:latest > chatbot_ui.tar
scp chatbot_ui.tar debian@54.37.12.141:~/

on debian 
sudo mv ~/chatbot_ui.tar.gz /home/
cd /home
docker load < chatbot_ui.tar

