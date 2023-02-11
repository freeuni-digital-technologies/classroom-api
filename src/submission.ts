import { Attachment, Submission } from "dt-types";
import { ClassroomSubmission } from "./types"
import { StudentList } from "./students";
import { sortByDate } from "dt-utils";


function getTimeStamp(response: ClassroomSubmission): Date {
	const timeStamp = response.submissionHistory!
		.filter(e => e.stateHistory)
		.map(e => e.stateHistory!)
		.filter(Submission.turnedIn)
		.map(e => e.stateTimestamp!)
		.map(t => new Date(t))
		.sort(sortByDate)[0]
	return new Date(timeStamp)
}

export function fromResponse(
	response: ClassroomSubmission,
	studentList: StudentList
) {
	let profile = studentList.getStudentById(response.userId!)! // fetched from students.json
	const submission = new Submission(
		response.id!,
		profile.emailId!,
		profile.emailAddress!, 
		response.state!,
		response.alternateLink!,
		response.late!,
		response.assignedGrade
	)
	if (response.assignmentSubmission?.attachments && response.assignmentSubmission?.attachments[0].driveFile) {
		const attachments = response.assignmentSubmission?.attachments
		const file = attachments![0].driveFile!
		const attachment = new Attachment(file.id!, file.title!)
		const timeStamp = getTimeStamp(response)
		submission.setAttachment(attachment, timeStamp)
	}
	return submission
}