import {GoogleApi} from "dt-types";
import path from "path";

export interface DownloadOptions {
    hwName: string,
    pathToStore: string
}

export function downloadSubmissions(api: GoogleApi, downloadOptions: DownloadOptions): Promise<string[]> {
    return api.classroom.getSubmissions(downloadOptions.hwName)
        .then(submissions => {
                const filteredSubmissions = submissions
                    .filter(element => element.attachment !== undefined)
                    .map(element => {
                        return {
                            emailId: element.emailId,
                            state: element.state,
                            attachmentId: element.attachment!.id,
                            attachmentTitle: element.attachment!.title,
                        }
                    })
                return Promise.all(filteredSubmissions.map(submission => {
                    return api.drive.saveFile(submission.attachmentId, path.join(downloadOptions.pathToStore, submission.attachmentTitle));
                }));
            }
        )
}