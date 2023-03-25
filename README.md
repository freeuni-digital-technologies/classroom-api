# Classroom api
wrapper for classroom in google library. modified from [this example](https://developers.google.com/classroom/quickstart/nodejs) 

## instructions
Get `credentials.json` from Google console or file from the example url (**select web app**). Save it in the project root directory.

For the first run, you'll need to follow the link and authorize the app.


## CLI
- in progress (refactor)

## API
view `classroom-api` for available functions, and `google-apis` for setup.

```typescript
import {GoogleClassroom} from "./classroom-api";

setupGoogleApi(authenticator, subject, studentListPath)
    .then(googleApis => {
        const drive = GoogleDrive(googleApis.drive);
        const classroom = GoogleClassroom(googleApis.classroom, googleApis.drive, googleApis.classromId)
    })
```

### Notes 
When downloading multiple files, it's necessary to throttle the requests on your side, otherwise request limit error will be thrown.


### Mailer 
You are also free to use mailer.ts exported functions `sendEmails` and `sendEmail`
