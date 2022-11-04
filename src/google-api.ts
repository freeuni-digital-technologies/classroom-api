import {Authenticator} from "./authenticate";
import {classroom_v1, drive_v3, google} from "googleapis";
import {downloadError, GoogleClassroom} from "./classroom-api";
import fs from "fs";
import path from "path";
import {Drive, GoogleApi, Classroom} from "dt-types";


export class GoogleApis implements GoogleApi {
    public classroom: Classroom
    public drive: Drive
    constructor(
        private classroomApi: classroom_v1.Classroom,
        private driveApi: drive_v3.Drive,
        private classroomId: string,
        studentListPath: string
    ) {
        this.classroom = new GoogleClassroom(classroomApi, driveApi, classroomId, studentListPath)
        this.drive = new GoogleDrive(this.driveApi)
    }

}


export function setupGoogleApi(authenticator: Authenticator, subject: string, studentListPath: string): Promise<GoogleApi> {
    return authenticator.authenticate().then(auth => {
        const classroomApi = google.classroom({version: 'v1', auth})
        const driveApi = google.drive({version: 'v3', auth})
        return findSubjectId(subject, auth, classroomApi)
            .then(classroomId => new GoogleApis(classroomApi, driveApi, classroomId, studentListPath))
    })
}


export class GoogleDrive implements Drive {
    constructor(
        private driveApi: drive_v3.Drive
    ) {
    }

    downloadFile = (id: string, path?: string) => {
        return new Promise((resolve, reject) => {
            this.driveApi.files.get({
                fileId: id,
                alt: 'media'
            }, {responseType: 'stream'}, (err, res) => {
                if (err ||  !res) {
                    if (path) console.log(path)
                    console.log(id + ': Drive API returned an error :' + err)
                    reject(downloadError)
                    return // 😶
                }
                resolve(res!.data)
            })
        })
    }

    saveFile = (id: string, filePath: string): Promise<string> => {
        console.log(id, filePath)
        return this.downloadFile(id, filePath)
            .then((dataStream: any) => {
                return new Promise((resolve, reject) => {
                    const dest = fs.createWriteStream(filePath);
                    dataStream
                        .on('end', () => {
                            console.log('Done downloading file: ' + filePath);
                            dest.close();
                            setTimeout(()=>resolve(filePath), 100) // weird erorrs occur without this timeout
                            // resolve(filePath);
                        })
                        .on('error', (err: any) => {
                            console.error('Error downloading file path=' + filePath + ' id=' + id);
                            reject(err);
                        })
                        .pipe(dest)
                        .on('error', (err: any) => {
                            if (err.code == 'ENOENT') {
                                fs.mkdirSync(path.dirname(filePath), {recursive: true})
                            } else {
                                throw err
                            }
                        })
                    // pipe to write stream
                });
            })
    }
}




function findSubjectId(name: string, auth: string, classroomApi: classroom_v1.Classroom): Promise<string> {
    return listCourses(classroomApi)
        .then(courses => {
            const filtered = courses.filter(c => c.name == name)
            if (filtered && filtered.length)
                return filtered[0].id!
            else
                throw Error("no such course found")
        })
}

function listCourses(classroom: classroom_v1.Classroom)
    : Promise<classroom_v1.Schema$Course[]> {
    return new Promise((resolve, reject) => {
        classroom.courses.list({
            pageSize: 10,
        }, (err, res) => {
            // ამ reject-ს სადღაც ვაიგნორებ (:
            if (err) {
                console.log(err)
                reject('The API returned an error: ' + err)
            }
            const courses = res!.data.courses;
            if (courses && courses.length) {
                resolve(courses)
            } else {
                reject('No courses found.');
            }
        })
    })
}