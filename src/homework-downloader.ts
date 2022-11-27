import {GoogleApi} from "dt-types"
import path from 'path'
const {downloadSubmissions} = require('./downloader')
const {program} = require('commander')
const {Authenticator} = require('./authenticate')
const fs = require('fs');
const {setupGoogleApi} = require('classroom-api')

export function getSubject(dataPath: string) {
    if (!fs.existsSync(dataPath + "/subject.json")) {
        throw new Error(`subject.json not found in ${dataPath} directory`);
    }
    return JSON.parse(fs.readFileSync(`${dataPath}/subject.json`).toString()).subject
}

async function main() {
    program.description('Download all homework from the class into the specified folder')
        .requiredOption('-c, --class <string>', 'class name')
        .requiredOption('-h, --hw <string>', 'name of homework in the classroom')
        .requiredOption('-o, --output-path <string>', 'directory to store homework')
        .requiredOption('-d, --data-path <string>', 'path to data directory')

    program.parse()
    const opts = program.opts()
    let pathToStore = opts.outputPath
    let className = opts.class
    let hwName = opts.hw
    let dataPath = opts.dataPath

    // For now, it downloads submissions from all students
    const auth = new Authenticator(path.join(dataPath, 'credentials/token.json'), path.join(dataPath, 'credentials/credentials.json'))
    const googleApi: GoogleApi = await setupGoogleApi(auth, getSubject(dataPath), path.join(dataPath, 'students.json'))

    await downloadSubmissions(googleApi, {hwName, pathToStore})

    console.log(`Querying submissions for class ${className}, homework ${hwName}`)
}


if (require.main === module) {
    main()
        .then(_ => console.log('done'))
}
