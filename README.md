#TDAH REST API

This is the documentation of the api used in the TDAH WebApp, the api is structure in two simple parts __Authentication__ and __Patients__ where authentication will be responsable to keep the information of patients organized for every user and keep them secret for each Adivsor's patients. and Patient will store all the data related to every patient.

##API Content
- [Tech Stack](#tech-stack)
- [Authentication](#authentication)
  - [User Data Structure](#user-data-structure)
  - [Creating User](#creating-user)
  - [Activating User](#activating-user)
  - [Request User](#request-user)
  - [Request All Users](#request-all-users)
  - [Login](#login)
  - [Logout](#logout)
  - [Modifying User Data](#modifying-user-data)
  - [Changing Password](#changing-password)
  - [Forgotten Password](#forgotten-password)
- [Patients](#patients)
  - [Patient Data Structure](#patient-data-structure)
  - [Creating New Patient](#creating-new-patient)
  - [Getting Single Patient](#getting-single-patient)
  - [Getting All Patients](#getting-all-patients)
  - [Deleting Patient](#deleting-patient)
  - [Modifing Patient Information](#modifing-patient-information)
-  [Built With](#built-with)
-  [Versioning](#versioning)
-  [Authors](#authors)
-  [License](#license)
-  [Acknowledgments](#acknowledgments)

##Tech Stack
###Node.js & Javascript:
This RESTful API was created enterelly using Javascript using modern Syntax in the Node.js Enviroment version 6+ LTS. And using Express 4 Framework for the server and the database used was the popular noSQL MongoDB with the mongoose ODM 4+. and finally using JSON format for data transfer.

##Authentication
###User Data Structure
Data structure of each user created automatically when sign up.
```
{
  "email": String,
  "password": String,
  "displayName": String,
  "confirmed": Boolean,
  "avatar": String,
  "signupDate": Number,
  "lastLogin": Number,
  "workplace": String,
  "location": String, 
  "tokens": [
    "access": String,
    "token": String
  ]
}
```
###Creating User
For creating a new user just make a POST request in /api/advisor and provide your email, Fullname and password.

```
POST REQUEST: /api/advisor
```
Sending to body:
```
{
  "email": "test@email.com",
  "password": "123abc!",
  "displayName": "Jhon Doe"
  "workplace": "Center for Disease Control and Prevention",
  "location": "Miami, FLorida", 
}
```

Once you send the POST request this new user will hash the password and asign a new token where will able to be used in header for authentication puspsses. At the same time you will receive a email message with an url for validate the account. once you confirme you email the user will toggle the confirmed status to true.

validation to true don't block any feature in the rest api. this may be used in the frontend to control some characteristics.

###Validating User

When you create a new user. this process automatically send to the user email a confirmation email (see in the Creating User section for further information). but if you need you could request a new conformation email in case the user havent receive the email, accidentally remove the email from his inbox or just in the case the previous url expired.

__YOU SHOULD BE LOGGED IN IN ORDER TO REQUEST VERIFICATION EMAIL (HAVE AN AUTH TOKEN)__

```
GET REQUEST: /api/advisor/activation
```

###Request User
you can get the information where you're currently logged in getting the information of your user token.

__REQUIRE AUTH TOKEN__

```
GET REQUEST: /api/advisor/me
```

###Request All Users
you can also request the basic information of all users.

__REQUIRE AUTH TOKEN__
```
GET REQUEST: /api/advisor/all
```

###Login
when the user doesn't have a active auth token (if not logged in) in order to access to the data information of your user you should login using your registered email and password.

Once you logged in successfully the user receive a auth token.

```
POST REQUEST: /api/advisor/login
```
Sending to body:
```
{
  "email": "test@email.com",
  "password": "123abc!",
}
```

###Logout
for logout cases you need to be logged in (having an auth token) when you make a __DELETE__ request to  /api/advisor/logout, the user automatically will remove his auth token losing access for his user data and his patient's. in order to access again to his information the user should login again.

__REQUIRE AUTH TOKEN__

```
DELETE REQUEST: /api/advisor/logout
```

###Modifying User Data
When the user is logged in the user can change his data whenever he wants. for all case the user have to provide his current password in order to apply this changes.
if the user changed his password. the auth token will be removed.

__REQUIRE AUTH TOKEN (provide the current password is mandatory)__

__CAVEAT:__
__YOU CAN CHANGE YOUR EMAIL ADDRESS USING THIS REQUEST. THIS WAS MADE THIS WAY SO THE APP FRONT END CAN DECIDE IF THE USER CAN OR CANNOT CHANGE IT__
```
PATCH REQUEST: /api/advisor/login
```
Sending to body whatever information you'd like to modify:
```
{
  "currentPassword": "123abc!"
  "displayName": "Jimmy Doe",
}
```

__you can also change the pasword with this request but this is not the prefferred way. [Changing Password](#changing-password) and [Forgotten Password](#forgotten-password) are better for this task since they send email notification and verification in order to change the password specifically__

###Changing Password
this is the preferred method to change the user password. once the request is made. the user will receive an email with an URL where authorize the change of password

__REQUIRE AUTH TOKEN__

```
GET REQUEST: /api/advisor/change-password
```
the user receive the following route:

```
PATCH REQUEST: /api/advisor/auth-change-password:emailToken
```
the user have to provide its __Current Password__ in order to change it:
```
{
  "currentPassword": "123abc!",
  "password": "123abc!50"
}
```

Once the password is changed the user token will be removed forcing to login again.

###Forgotten Password
If user want to change its password without an auth token. it can be made using this route passing in its email address.

```
POST REQUEST: /api/advisor/change-password
```
with the following data to body:
```
{
  "email": test@email.com"
}
```
the user receive the following route:

```
PATCH REQUEST: /api/advisor/change-password:emailToken
```

the user have to provide its __Current Password__ in order to change it:
```
{
  "currentPassword": "123abc!",
  "password": "123abc!50"
}
```

once the password was change the user can access using the new one.

##Patients
###User Data Structure
Data structure of each Patient created by an user.
note the _creator property. this will created inmmediatly when an user register a new patient. what this have is the user's id who create the patient.
```
{
  "name": String,
  "lastname": String,
  "avance": Number,
  "avatar": String,
  "age": Number,
  "_creator": "user.ObjectID"
}
```

###Creating New Patient
the user must be loggedin in order to register a new patient.
this create a new patient thats will be global to the patients collection but linked to its user creator

__REQUIRE AUTH TOKEN__

```
POST REQUEST: /api/patients
```
Sending to body:
```
{
  "mame": "Jhon",
  "lastname": "Doe",
  "age": 4,
  "avatar": "anImage.jpeg", (optional)
  "avance": "80", (optional)
}
```
###Getting Single Patient
you can get information of a single patient using the patients' id. this will get all the current data oof this specific patient

__REQUIRE AUTH TOKEN__

```
GET REQUEST: /api/patients/:id
```

###Getting All Patient
request data from all patients the user have

__REQUIRE AUTH TOKEN__

```
GET REQUEST: /api/patients/
```

###Deleting Patient
delete an especific patient using its id

__REQUIRE AUTH TOKEN__

```
DELETE REQUEST: /api/patients/:id
```

###Modifing Patient Information
the user can modify all information it needs of his patients. inclusive, __he can transfer the patient to other using knowing the User id of that user (in front end application)__. 

__REQUIRE AUTH TOKEN__

```
PATCH REQUEST: /api/patients/:id
```
Sending to body:
```
{
  "mame": "Jane",
  "lastname": "Doe",
  "age": 5,
  "avatar": "anImage.jpeg", (optional)
  "avance": "82", (optional)
}
```
## Built With

* [Express.js](http://expressjs.com/) - Server Framework
* [Mongoose ODM](http://mongoosejs.com/) - Database ODM
* [JSON Web Tokens](https://jwt.io/) - for tokenize authentication
* [bcrypt.js](https://www.npmjs.com/package/bcryptjs) - hashing passwords
* [NodeMailer](https://nodemailer.com/about/) - Handle emails
* [Git Flow](https://danielkummer.github.io/git-flow-cheatsheet/) - handle Versioning

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/luigi055/TDAH-REST-API/tags).

##Authors
-  __[Luigi055](https://github.com/luigi055)__
-  __[Osman8a](https://github.com/Osman8a)__

See also the list of [contributors](https://github.com/luigi055/TDAH-REST-API/contributors) who participated in this project.

##License
This project is licensed under the MIT License.

## Acknowledgments

- Osman Ochoa's tesis