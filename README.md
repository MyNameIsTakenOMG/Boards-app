# Welcome to Boards !

## Introduction

**Boards** is a personal project that mimics some functionalities of the web application **Monday.com**, which is a cloud-based platform that allows users to create their own applications and projects as well as using it organize and keep track of their work.

![Boards-demo](https://github.com/MyNameIsTakenOMG/project-gifs/blob/main/Boards-demo.gif)
The link of the app : [Demo](https://boards.zhengfangdev.com/login)
**Note** : Using a makeup email address when registering a new account is recommended, please follow email address format `xxx@xxx.xxx`, or you can use a testing account to give it a shot:
Account: `test1@test1.com`
Password: `test123`

## Features

**Boards** is a project management web application which is heavily inspired by **Monday.com** which is one of the best products in the industry. The main functionalities that Boards includes are :

 - Users can create their own projects or be a part of other projects by getting invited by other project creators.
 - In a project,  a user can play multiple different roles. Specifically, a `project creator` generally has the full control over the whole project, a `task manager` is responsible for managing the whole team and makes sure the task will be completed on time, and a `task member` is the one who should stick with the task that he or she has been assigned to and collaborate with other team members to make sure the task could be finished before the deadline.
 - As a project creator, not only can you customize the project by renaming it, adding or removing project stages as well as project tasks, but also you can choose who to be invited over to your project as your `project members` and assign them with tasks or roles if you want.
 - A task manager has the power to modify the details of the task that he or she has been assign to. Also every task manager has the right to choose who should be on the team by picking up them from `project members` .
 - For each task, there is a **'Chatting Room'** or `updates` section where task team members can write `updates` for tracking their work as well as communicate with other team members. Besides, each team member can mention other team members by typing `@`, then choose the team member they want to mention. 
 - By taking advantage of **Algolia Search**, we can easily search projects or users using `full-text` search


## Issues and challenges
- Adding `presence` or user online status feature to the task `updates` section to make it a bit more convenient for communication among task team members. **Possible solution** : by taking advantage of firebase real-time database, we can record the online status for each team members.
- Currently, when searching users and inviting them over to our projects, by default it is going to search the whole `Users` collection which is not very effective and efficient. **Possible solution** : adding filters to users, such as `friends`, `colleagues`, or names of companies and so on. As such, it would be much more faster to find the people that users are looking for. 


# Technologies

 - React.js
 - Google cloud firebase
 - Firebase extension algolia search
 - Material UI
 - Redux toolkit
 - React router
 - JOI
 - React helmet
 - Javascript

## Get Started

This is the part showing how to get a local copy up and running. Please follow the steps:

**Prerequisites**

Please make sure **Node.js** has been downloaded and installed globally. The download link:  [Node.js](https://nodejs.org/en/download/)

**Start the development server**

Run the command: `npm start` to test the site on `localhost:3000`


**Environment variables**

In the `env.example` file, there are several variables that need to be setup first. In order to get all necessary variables, you must go to [firebase](https://firebase.google.com/) to create a project. Then go to the project `settting` to copy the configuration snippet into your firebase config file. 
Besides, when it comes to install and use `algolia search` extension for your firebase project, you must go to `setttings` of your firebase project, then under `service accounts` tab, click `generate new key` to have your service account JSON file which will be used for configuring the installation of the extension.




