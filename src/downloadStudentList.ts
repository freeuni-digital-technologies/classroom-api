import fs from 'fs'
import yargs from 'yargs'
import {Authenticator} from "./authenticate";
import {setupGoogleApi} from "./google-api";
import {StudentProfile} from "dt-types";

const argv = yargs.options({
    p: {
        alias:'path',
        describe: 'directory to store students.json',
        type:'string', 
        default: './', 
    },
    c: {
        alias:'class',
        describe: 'class name',
        type:'string', 
        demandOption: true
    }
}).argv


async function getStudentList(className: string, auth: Authenticator, path: string): Promise<StudentProfile[]> {
    return setupGoogleApi(auth, className, path)
        .then(api => api.classroom.getUserProfiles())
}

function main(){
    let path = argv.p
    let className = argv.c
    // path = 'wow'
    if(path[path.length - 1]!='/')
        path += '/'
    path += 'students.json'
    const auth = new Authenticator()
    console.log(path)
    console.log(className)
    getStudentList(className, auth, path)
        .then(profiles => fs.writeFileSync(path, JSON.stringify(profiles, null, '\t')))
}

main()

