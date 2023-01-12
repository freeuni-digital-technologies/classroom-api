import {classroom_v1, drive_v3} from 'googleapis'
import {Classroom, StudentProfile, Submission} from 'dt-types'
import {fromResponse} from "./submission";
import {Profile} from "./profile";
import {StudentList} from "./students";
import {ClassroomCourseWork} from "./types";

export const downloadError: string = "error saving downloaded file"


export class GoogleClassroom implements Classroom {
    private readonly studentList: StudentList

    constructor(private classroomApi: classroom_v1.Classroom,
                private driveApi: drive_v3.Drive,
                private classroomId: string,
                studentListPath?: string) {
        this.studentList = new StudentList(studentListPath)
    }

    getSubmissions = (name: string): Promise<Submission[]> => {
        return this.findAssignmentId(name)
            .then((assignmentId): Promise<classroom_v1.Schema$StudentSubmission[]> =>
                new Promise((resolve, reject) => {
                    this.classroomApi.courses.courseWork.studentSubmissions.list({
                        courseWorkId: assignmentId,
                        courseId: this.classroomId,
                    }, (err, res) => {
                        if (err) reject(err)
                        resolve(res!.data.studentSubmissions!.filter(response => response.id && response.userId))
                    })
                })
            ).then(async (submissions: classroom_v1.Schema$StudentSubmission[]) => {
                await submissions.map(async response => {
                    if (!this.studentList.getStudentById(response.userId!)) {
                        const studentProfile = await this.getStudentProfile(response.userId!)
                        this.studentList.add(studentProfile)
                    }
                })
                return submissions
                    .filter(response => this.studentList.getStudentById(response.userId!))
                    .map(s => fromResponse(s, this.studentList))
            })
    }

    getUserProfiles = () =>
        this.listCourseWork()
            .then(coursework => coursework[0].title!)
            .then(this.getSubmissionStudents)


    // Returns due date in UTC
    getDueDate(homeworkTitle: string): Promise<Date> {
        return this.findAssignment(homeworkTitle)
            .then((courseWork): Date => {
                if (courseWork.dueDate === undefined || courseWork.dueTime === undefined)
                    throw new Error("Selected homework does not have due date")
                return new Date(Date.UTC(courseWork.dueDate.year!, courseWork.dueDate.month!, courseWork.dueDate.day,
                    courseWork.dueTime.hours, courseWork.dueTime.minutes));
            })
    }

    private findAssignmentId(name: string): Promise<string> {
        return this.findAssignment(name)
            .then(assignment => assignment.id!)
    }

    private findAssignment = (name: string): Promise<ClassroomCourseWork> =>
        this.listCourseWork()
            .then(courseWork => {
                const filtered = courseWork.filter(c => c.title!.includes(name))
                if (filtered && filtered.length)
                    return filtered[0]
                else
                    throw name + ": no such assignment found"
            })

    private getStudentProfile(id: string): Promise<StudentProfile> {
        return new Promise((resolve, reject) => {
            this.classroomApi.userProfiles.get({userId: id}, (err, res) => {
                if (err) {
                    reject(err)
                    return // ff
                }
                resolve(new Profile(res!.data))
            })
        })
    }

    private listCourseWork(): Promise<classroom_v1.Schema$CourseWork[]> {
        return new Promise((resolve, reject) => {
            this.classroomApi.courses.courseWork.list({
                courseId: this.classroomId
            }, (err, res) => {
                if (err) reject('The API returned an error: ' + err);
                resolve(res!.data.courseWork!)
            })
        })
    }

    private getSubmissionStudents = (name: string): Promise<StudentProfile[]> =>
        this.getSubmissions(name)
            .then(submissions => submissions.map(s => s.id!))
            .then(submissions => submissions.map(s => this.getStudentProfile(s)))
            .then(userIdPromises => Promise.all(userIdPromises))


}

