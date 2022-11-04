import fs from 'fs'
import { StudentProfile } from "dt-types";


export class StudentList {
	private readonly students: StudentProfile[]
	private readonly path: string
	constructor(filePath?: string) {
		if (!filePath) {
			console.log('path for students, searching in existing directory')
			filePath = process.cwd() + '/students.json'
		}	
		try {
			this.students = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
			this.path = filePath
		} catch (e) {
			console.log(e)
			process.exit(1)
		}
	}

	getStudentByEmail(emailId: string) {
	    return this.students.find(e => e.emailId == emailId)
	}
	 
	getStudentById(id: string): StudentProfile | undefined {
	    return this.students.find(e => e.id == id)
	}

	add(student: StudentProfile) {
		this.students.push(student)
		fs.writeFileSync(this.path, JSON.stringify(this.students, null, '\t'))
	}
}
