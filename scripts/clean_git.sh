#!/bin/sh
sudo rm -rf aaronbae.com aaronbae.com.git
git init --bare aaronbae.com.git
sudo chown -R ubuntu aaronbae.com.git
git clone aaronbae.com.git aaronbae.com
cp post-receive aaronbae.com.git/hooks/post-receive